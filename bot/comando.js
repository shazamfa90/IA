// A parte do bot que não fala com o Discord: dá pra testar sem token nenhum.

/**
 * O app escreve "🎵 **Combate**\ntocar 🔁 <https://…>": vale a última linha.
 * "playlist <link> #5" toca a lista em sequência a partir da faixa 5; "listar <link>" só
 * escreve as faixas na mensagem, pro app mostrar; "pular" vai pra próxima.
 * 🔁 = repetir quando acabar (a trilha, ou a playlist toda). "repetir sim|não" muda a atual.
 */
export function lerComando(content) {
  const linha = content.trim().split('\n').at(-1).trim();
  const m = linha.match(/^(tocar|playlist|listar|pausar|continuar|pular|parar|repetir)(?:\s+(.+))?$/i);
  if (!m) return null;
  const acao = m[1].toLowerCase();
  let alvo = m[2]?.trim();
  if (acao === 'repetir') return /^(sim|não|nao)$/i.test(alvo ?? '') ? { acao, repetir: /^sim$/i.test(alvo) } : null;
  const toca = acao === 'tocar' || acao === 'playlist';
  const repetir = toca && Boolean(alvo?.startsWith('🔁'));
  if (repetir) alvo = alvo.slice(2).trim();
  let faixa;
  if (acao === 'playlist') [, alvo, faixa] = alvo?.match(/^(.*?)(?:\s+#(\d+))?$/) ?? [];
  alvo = alvo?.replace(/^<(.+)>$/, '$1'); // <link> só evita a prévia no Discord
  if (acao === 'playlist') return alvo ? { acao, alvo, repetir, faixa: Math.max(1, Number(faixa ?? 1)) } : null;
  if (acao === 'tocar' || acao === 'listar') return alvo ? { acao, alvo, ...(toca && { repetir }) } : null;
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

/** A página "embed" do Spotify traz nome e artista de cada faixa num pedido só. */
export function embedDoSpotify(link) {
  const m = link.match(/open\.spotify\.com\/(?:[\w-]+\/)?(playlist|album)\/(\w+)/i);
  return m && `https://open.spotify.com/embed/${m[1].toLowerCase()}/${m[2]}`;
}

/** As faixas da página embed: { alvo: busca no YouTube, titulo: pra mostrar }. Playlist: até 50. */
export function faixasDoSpotify(html) {
  const json = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s)?.[1];
  const procura = (o) => {
    if (!o || typeof o !== 'object') return null;
    if (Array.isArray(o.trackList)) return o.trackList;
    for (const v of Object.values(o)) {
      const achou = procura(v);
      if (achou) return achou;
    }
    return null;
  };
  let lista;
  try {
    lista = procura(JSON.parse(json ?? 'null')) ?? [];
  } catch {
    lista = [];
  }
  return lista.map((f) => ({ alvo: `${f.title} ${f.subtitle ?? ''}`.trim(), titulo: f.subtitle ? `${f.title} — ${f.subtitle}` : f.title }));
}

/**
 * A lista que o bot escreve na mensagem do app (e que o app lê de volta pelo webhook):
 * "1. Título" por linha; o rodapé diz qual toca, "▶ 3/12". Cabe o que couber em 3900 caracteres.
 */
export function embedDaLista(itens, atual) {
  const linhas = [];
  let tamanho = 0;
  for (const [i, f] of itens.entries()) {
    const linha = `${i + 1}. ${f.titulo.replace(/\s+/g, ' ').slice(0, 90)}`;
    if (tamanho + linha.length > 3900) {
      linhas.push(`… e mais ${itens.length - i}`);
      break;
    }
    linhas.push(linha);
    tamanho += linha.length + 1;
  }
  const rodape = atual == null ? `${itens.length} faixas` : `▶ ${atual + 1}/${itens.length}`;
  return { description: linhas.join('\n'), footer: { text: rodape } };
}

/** O que vai pro yt-dlp: link direto, ou a primeira busca do YouTube. */
export const paraYtdlp = (alvo) => (/^https?:\/\//i.test(alvo) ? alvo : `ytsearch1:${alvo}`);
