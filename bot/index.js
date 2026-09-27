import { Client, Events, GatewayIntentBits } from 'discord.js';
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
} from '@discordjs/voice';
import { buscaDoSpotify, canalMaisCheio, idDoWebhook, lerComando, paraYtdlp } from './comando.js';
import { fluxo, prepararYtdlp } from './audio.js';

const { DISCORD_TOKEN } = process.env;
const webhookId = idDoWebhook(process.env.WEBHOOK_URL);
if (!DISCORD_TOKEN || !webhookId) {
  console.error('Falta DISCORD_TOKEN ou WEBHOOK_URL. Copie .env.example para .env e preencha.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });

/** A trilha atual: repete quando acaba, até o mestre trocar ou parar. */
let atual = null;

player.on(AudioPlayerStatus.Playing, () => atual && (atual.inicio ||= Date.now()));
player.on(AudioPlayerStatus.Idle, () => {
  // Música de fundo não acaba no meio da cena. Menos de 5 s tocando é erro, não fim: não repete.
  if (atual?.inicio && Date.now() - atual.inicio > 5000) tocar(atual.alvo).catch((e) => console.error(e.message));
});
player.on('error', (e) => console.error('Áudio:', e.message));

async function tocar(alvo) {
  atual?.matar();
  const { saida, falhou, matar } = fluxo(alvo);
  atual = { alvo, matar, inicio: 0 };
  player.play(createAudioResource(saida, { inputType: StreamType.OggOpus }));
  try {
    await Promise.race([entersState(player, AudioPlayerStatus.Playing, 30_000), falhou]);
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('A música demorou demais pra começar.');
    throw e;
  }
}

function parar(guildId) {
  atual?.matar();
  atual = null;
  player.stop(true);
  getVoiceConnection(guildId)?.destroy();
}

async function resolver(alvo) {
  if (!/^https?:\/\/open\.spotify\.com\//i.test(alvo)) return paraYtdlp(alvo);
  const html = await fetch(alvo, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }).then((r) => r.text());
  const busca = buscaDoSpotify(html);
  if (!busca) throw new Error('Não consegui ler esse link do Spotify.');
  return paraYtdlp(busca);
}

async function executar({ acao, alvo }, msg) {
  if (acao === 'pausar') {
    if (!player.pause()) throw new Error('Nada tocando.');
  } else if (acao === 'continuar') {
    if (!player.unpause()) throw new Error('Nada pausado.');
  } else if (acao === 'parar') {
    parar(msg.guildId);
  } else {
    const estados = [...msg.guild.voiceStates.cache.values()].map((v) => ({
      canal: v.channelId,
      bot: v.id === client.user.id || Boolean(v.member?.user.bot),
    }));
    const canal = canalMaisCheio(estados);
    if (!canal) throw new Error('Ninguém num canal de voz. Entre num e toque de novo.');
    const conexao = joinVoiceChannel({
      channelId: canal,
      guildId: msg.guildId,
      adapterCreator: msg.guild.voiceAdapterCreator,
      selfDeaf: true,
    });
    conexao.subscribe(player);
    await entersState(conexao, VoiceConnectionStatus.Ready, 20_000).catch(() => {
      conexao.destroy(); // meia conexão atrapalharia a próxima tentativa
      throw new Error('Não consegui entrar no canal de voz. O bot tem as permissões Conectar e Falar?');
    });
    await tocar(await resolver(alvo));
  }
}

client.on(Events.MessageCreate, async (msg) => {
  if (msg.webhookId !== webhookId) return; // só o app manda: jogador digitando "parar" não conta
  const cmd = lerComando(msg.content);
  if (!cmd) return;
  try {
    await executar(cmd, msg);
    await msg.react('✅').catch(() => {});
  } catch (e) {
    console.error(`${cmd.acao}:`, e.message);
    await msg.reply(`⚠️ ${e.message}`).catch(() => {});
  }
});

client.once(Events.ClientReady, (c) => console.log(`Pronto como ${c.user.tag}. Toque uma trilha no app.`));

process.on('SIGINT', () => {
  for (const g of client.guilds.cache.keys()) parar(g);
  client.destroy();
  process.exit(0);
});

await prepararYtdlp();
await client.login(DISCORD_TOKEN).catch((e) => {
  console.error(
    /intent/i.test(e.message)
      ? 'O Discord recusou: ative "Message Content Intent" em Bot → Privileged Gateway Intents.'
      : `O Discord recusou o login: ${e.message.replace(/\.$/, '')}. O token está certo?`,
  );
  process.exit(1);
});
