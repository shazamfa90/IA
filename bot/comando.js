// A parte do bot que não fala com o Discord: dá pra testar sem token nenhum.

/** O app escreve "🎵 **Combate**\ntocar <https://…>": vale a última linha. */
export function lerComando(content) {
  const linha = content.trim().split('\n').at(-1).trim();
  const m = linha.match(/^(tocar|pausar|continuar|parar)(?:\s+(.+))?$/i);
  if (!m) return null;
  const acao = m[1].toLowerCase();
  const alvo = m[2]?.trim().replace(/^<(.+)>$/, '$1'); // <link> só evita a prévia no Discord
  if (acao === 'tocar' && !alvo) return null;
  return { acao, alvo };
}

export const idDoWebhook = (url) => url?.match(/\/api\/webhooks\/(\d+)\//)?.[1];

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

/** O que vai pro yt-dlp: link direto, ou a primeira busca do YouTube. */
export const paraYtdlp = (alvo) => (/^https?:\/\//i.test(alvo) ? alvo : `ytsearch1:${alvo}`);
