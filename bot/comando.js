// A parte do bot que não fala com o Discord: dá pra testar sem token nenhum.

/**
 * O app escreve "🎵 **Combate**\ntocar 🔁 <https://…>": vale a última linha.
 * "playlist <link>" toca a lista inteira em sequência; "pular" vai pra próxima.
 * 🔁 = repetir quando acabar (a trilha, ou a playlist toda). "repetir sim|não" muda a atual.
 */
export function lerComando(content) {
  const linha = content.trim().split('\n').at(-1).trim();
  const m = linha.match(/^(tocar|playlist|pausar|continuar|pular|parar|repetir)(?:\s+(.+))?$/i);
  if (!m) return null;
  const acao = m[1].toLowerCase();
  let alvo = m[2]?.trim();
  if (acao === 'repetir') return /^(sim|não|nao)$/i.test(alvo ?? '') ? { acao, repetir: /^sim$/i.test(alvo) } : null;
  const toca = acao === 'tocar' || acao === 'playlist';
  const repetir = toca && Boolean(alvo?.startsWith('🔁'));
  if (repetir) alvo = alvo.slice(2).trim();
  alvo = alvo?.replace(/^<(.+)>$/, '$1'); // <link> só evita a prévia no Discord
  if (toca) return alvo ? { acao, alvo, repetir } : null;
  return { acao, alvo };
}

export const idDoWebhook = (url) => url?.match(/\/api\/webhooks\/(\d+)\//)?.[1];

// Com os nomes que o Discord mostra em português, pra pessoa achar na tela de permissões.
const NOMES = {
  ViewChannel: 'Ver canal',
  ReadMessageHistory: 'Ver histórico de mensagens',
  SendMessages: 'Enviar mensagens',
  AddReactions: 'Adicionar reações',
  Connect: 'Conectar',
  Speak: 'Falar',
};
export const PERMS_TEXTO = ['ViewChannel', 'ReadMessageHistory', 'SendMessages', 'AddReactions'];
export const PERMS_VOZ = ['ViewChannel', 'Connect', 'Speak'];

/** As permissões que faltam, pelo nome do Discord em português. `perms` é o que permissionsFor devolve. */
export const faltam = (perms, lista) => lista.filter((p) => !perms?.has(p)).map((p) => NOMES[p]);

/** O canal de voz onde está a mesa: o que tiver mais gente (sem contar bots). */
export function canalMaisCheio(estados) {
  const conta = new Map();
  for (const { canal, bot } of estados) if (canal && !bot) conta.set(canal, (conta.get(canal) ?? 0) + 1);
  return [...conta].sort((a, b) => b[1] - a[1])[0]?.[0];
}

const entidades = { amp: '&', quot: '"', lt: '<', gt: '>', '#39': "'", '#x27': "'" };
const meta = (html, nome) =>
  html
    .match(new RegExp(`<meta (?:property|name)="${nome}" content="([^"]*)"`))?.[1]
    ?.replace(/&(amp|quot|lt|gt|#39|#x27);/g, (_, e) => entidades[e]);

/** Spotify não deixa tocar fora dele: vira busca no YouTube por "música artista". */
export function buscaDoSpotify(html) {
  const titulo = meta(html, 'og:title');
  return titulo ? [titulo, meta(html, 'music:musician_description')].filter(Boolean).join(' ') : null;
}

/** As faixas de uma playlist ou álbum do Spotify, pela página pública (playlist mostra até 30). */
export const faixasDoSpotify = (html) =>
  [...html.matchAll(/<meta name="music:song" content="([^"]+)"/g)].map((m) => m[1]);

/** O que vai pro yt-dlp: link direto, ou a primeira busca do YouTube. */
export const paraYtdlp = (alvo) => (/^https?:\/\//i.test(alvo) ? alvo : `ytsearch1:${alvo}`);
