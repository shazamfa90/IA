/**
 * Por que uma imagem não carregou.
 *
 * O Discord aceita qualquer URL de avatar sem reclamar e mostra o avatar
 * padrão quando não consegue buscar a imagem — silenciosamente. Quem cola um
 * link de página (um pin do Pinterest, por exemplo) nunca descobre o motivo.
 * Estas dicas existem pra dizer, na hora, o que fazer.
 */
export function dicaDeImagem(url: string): string {
  const u = url.trim();
  if (!u) return '';

  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return 'Isso não parece um endereço. Cole a URL inteira, começando com https://';
  }

  if (parsed.protocol === 'http:') {
    return 'Endereço http:// é bloqueado numa página https. Procure a mesma imagem em https://';
  }
  if (parsed.protocol !== 'https:') {
    return 'Use um endereço https:// — outros esquemas não funcionam como avatar no Discord.';
  }

  const host = parsed.hostname.replace(/^www\./, '');
  const COPIAR = 'clique com o botão direito na imagem → "Copiar endereço da imagem"';

  if (/(^|\.)pinterest\.[a-z.]+$/.test(host) || host === 'pin.it') {
    return `Esse é o link da página do pin, não da imagem. Abra o pin, ${COPIAR} — a boa começa com i.pinimg.com`;
  }
  if (host === 'imgur.com') {
    return `Esse é o link da página do Imgur. Abra a imagem, ${COPIAR} — a boa começa com i.imgur.com`;
  }
  if (host === 'drive.google.com' || host === 'docs.google.com') {
    return 'O Google Drive não serve a imagem direto. Use outro lugar, ou hospede a imagem num serviço de imagens.';
  }
  if (/(^|\.)google\.[a-z.]+$/.test(host)) {
    return `Esse é um link de resultado de busca. Abra a imagem em tamanho real e ${COPIAR}`;
  }
  if (/(^|\.)(instagram|facebook|x|twitter)\.com$/.test(host)) {
    return 'Essas redes bloqueiam o uso da imagem fora do site. Hospede a imagem em outro lugar.';
  }
  if (host.endsWith('discordapp.com') || host.endsWith('discordapp.net')) {
    return 'Links de anexo do Discord expiram depois de algumas horas e o avatar some. Prefira outro endereço.';
  }

  return `O endereço não devolveu uma imagem. Confira se ele termina em .jpg, .png, .gif ou .webp — se não, ${COPIAR}`;
}
