import { appendFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { Client, Events, GatewayIntentBits, PermissionsBitField } from 'discord.js';
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
import { PERMS_TEXTO, PERMS_VOZ, buscaDoSpotify, canalMaisCheio, faltam, idDoWebhook, lerComando, paraYtdlp } from './comando.js';
import { fluxo, prepararProgramas } from './audio.js';

// Primeira vez: pergunta no terminal e guarda no .env, sem ninguém precisar editar arquivo.
// Acrescenta no fim: no .env, a última linha de cada nome é a que vale.
if (!process.env.DISCORD_TOKEN || !idDoWebhook(process.env.WEBHOOK_URL)) {
  const rl = createInterface({ input: process.stdin });
  const linhas = rl[Symbol.asyncIterator]();
  const perguntar = async (texto) => (process.stdout.write(texto), ((await linhas.next()).value ?? '').trim());
  const novos = {};
  if (!process.env.DISCORD_TOKEN) novos.DISCORD_TOKEN = await perguntar('Token do bot (Developer Portal → Bot → Reset Token): ');
  if (!idDoWebhook(process.env.WEBHOOK_URL)) novos.WEBHOOK_URL = await perguntar('Webhook do canal de música (o mesmo do app): ');
  rl.close();
  await appendFile(new URL('./.env', import.meta.url), Object.entries(novos).map(([k, v]) => `\n${k}=${v}`).join('') + '\n');
  Object.assign(process.env, novos);
}
const { DISCORD_TOKEN } = process.env;
const webhookId = idDoWebhook(process.env.WEBHOOK_URL);
if (!DISCORD_TOKEN || !webhookId) {
  console.error('Token ou webhook faltando. Apague o arquivo .env e rode de novo.');
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

/** A trilha atual. Com `repetir`, recomeça quando acaba, até o mestre trocar ou parar. */
let atual = null;

player.on(AudioPlayerStatus.Playing, () => atual && (atual.inicio ||= Date.now()));
player.on(AudioPlayerStatus.Idle, () => {
  // Música de fundo não acaba no meio da cena. Menos de 5 s tocando é erro, não fim: não repete.
  if (atual?.repetir && atual.inicio && Date.now() - atual.inicio > 5000) tocar(atual.alvo, true).catch((e) => console.error(e.message));
});
player.on('error', (e) => console.error('Áudio:', e.message));

async function tocar(alvo, repetir) {
  atual?.matar();
  const { saida, falhou, matar } = fluxo(alvo);
  atual = { alvo, repetir, matar, inicio: 0 };
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
  const html = await fetch(alvo, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    signal: AbortSignal.timeout(15_000),
  }).then((r) => r.text(), () => { throw new Error('O Spotify não respondeu.'); });
  const busca = buscaDoSpotify(html);
  if (!busca) throw new Error('Não consegui ler esse link do Spotify.');
  return paraYtdlp(busca);
}

async function executar({ acao, alvo, repetir }, msg) {
  if (acao === 'repetir') {
    if (atual) atual.repetir = repetir; // sem nada tocando, vale a partir da próxima trilha (o app manda junto)
  } else if (acao === 'pausar') {
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
    const voz = msg.guild.channels.cache.get(canal);
    const semVoz = faltam(voz.permissionsFor(msg.guild.members.me), PERMS_VOZ);
    if (semVoz.length) throw new Error(`No canal de voz "${voz.name}" o bot não tem: ${semVoz.join(', ')}.`);
    const conexao = joinVoiceChannel({
      channelId: canal,
      guildId: msg.guildId,
      adapterCreator: msg.guild.voiceAdapterCreator,
      selfDeaf: true,
    });
    if (!conexao.listenerCount('error')) conexao.on('error', (e) => console.error('Voz:', e.message));
    conexao.subscribe(player);
    await entersState(conexao, VoiceConnectionStatus.Ready, 20_000).catch(() => {
      conexao.destroy(); // meia conexão atrapalharia a próxima tentativa
      throw new Error('Não consegui entrar no canal de voz. O bot tem as permissões Conectar e Falar?');
    });
    await tocar(await resolver(alvo), repetir);
  }
}

client.on(Events.MessageCreate, async (msg) => {
  if (msg.webhookId !== webhookId) return; // só o app manda: jogador digitando "parar" não conta
  const cmd = lerComando(msg.content);
  if (!cmd) return;
  console.log(`→ ${cmd.acao}${cmd.alvo ? ` ${cmd.alvo}` : ''}${cmd.repetir ? ' (repetir)' : ''}`);
  // ⏳ na hora: a mesa vê que o bot recebeu, mesmo antes de a música começar.
  const espera = cmd.acao === 'tocar' ? await msg.react('⏳').catch(() => null) : null;
  try {
    await executar(cmd, msg);
    await msg.react('✅').catch(() => {});
  } catch (e) {
    console.error(`${cmd.acao}:`, e.message);
    await msg.reply(`⚠️ ${e.message}`).catch(() => {});
  }
  await espera?.users.remove(client.user.id).catch(() => {});
});

const PERMISSOES = new PermissionsBitField(['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AddReactions', 'Connect', 'Speak']);

// Ao ligar, confere o que impediria o bot de ouvir o app: sem isso ele fica mudo e ninguém sabe por quê.
client.once(Events.ClientReady, async (c) => {
  console.log(`Pronto como ${c.user.tag}.`);
  const [, id, token] = process.env.WEBHOOK_URL.match(/webhooks\/(\d+)\/([\w-]+)/) ?? [];
  const hook = await c.fetchWebhook(id, token).catch(() => null);
  if (!hook) return console.log('\n⚠️ Esse webhook não existe mais. Apague o arquivo .env e ligue de novo com o webhook do app.\n');
  const guild = c.guilds.cache.get(hook.guildId);
  if (!guild) {
    console.log('\n⚠️ O bot não está no servidor do webhook. Abra este link e escolha o servidor da mesa:');
    console.log(`https://discord.com/oauth2/authorize?client_id=${c.user.id}&scope=bot&permissions=${PERMISSOES.bitfield}\n`);
    return;
  }
  const canal = guild.channels.cache.get(hook.channelId);
  const sem = faltam(canal?.permissionsFor(guild.members.me), PERMS_TEXTO);
  if (sem.length) {
    console.log(`\n⚠️ No canal #${canal?.name}, onde o app escreve, o bot não tem: ${sem.join(', ')}.`);
    console.log(`   Sem "Ver canal" ele não recebe nada. No Discord: editar #${canal?.name} → Permissões → adicione "${c.user.username}" e permita isso.\n`);
    return;
  }
  console.log(`Ouvindo #${canal.name}. Entre num canal de voz e toque uma trilha no app.`);
});

// Um erro solto não derruba o bot no meio da sessão: aparece na janela e ele segue.
process.on('unhandledRejection', (e) => console.error('Erro:', e?.message ?? e));
process.on('uncaughtException', (e) => console.error('Erro:', e?.message ?? e));

process.on('SIGINT', () => {
  for (const g of client.guilds.cache.keys()) parar(g);
  client.destroy();
  process.exit(0);
});

await prepararProgramas();
await client.login(DISCORD_TOKEN).catch((e) => {
  console.error(
    /intent/i.test(e.message)
      ? 'O Discord recusou: ative "Message Content Intent" em Bot → Privileged Gateway Intents.'
      : `O Discord recusou o login: ${e.message.replace(/\.$/, '')}. Token errado? Apague o arquivo .env e rode de novo.`,
  );
  process.exit(1);
});
