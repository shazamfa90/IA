/**
 * Ler o que os modelos escrevem: separar o que é do jogador do que é só do mestre, achar
 * o status, e entender as linhas "CHAVE: valor" dos blocos de anotação.
 */

const PESQUISAR = /\[\[\s*PESQUISAR\s*:\s*([^\]\n]+)\]\]/i;
const LEMBRAR = /\[\[\s*LEMBRAR\s*:\s*([^\]\n]+)\]\]/i;

export type Lido = {
  /** O que o jogador lê: narração e status. */
  visivel: string;
  /** As anotações de memória desta fala. */
  bastidores: string;
  /** O raciocínio do mestre sobre a ação, antes de narrar. Nunca aparece nem é guardado. */
  raciocinio: string;
  /** Termos que o mestre pediu pra pesquisar fora ("a; b; c"), se pediu. */
  pesquisa: string;
  /** O que o mestre pediu pra relembrar da própria campanha, se pediu. */
  lembrar: string;
  /** O que fica guardado e volta ao modelo como histórico: narração, status e bastidores. */
  limpo: string;
};

/**
 * Separa o que o jogador lê do que é só do mestre. Serve também no meio da resposta,
 * enquanto ela chega: um bloco ainda aberto some inteiro, para segredo nenhum piscar na tela.
 */
export function separar(bruto: string): Lido {
  // Modelos que "pensam alto" mandam o rascunho entre <think>: não é narração.
  let texto = bruto.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '');
  const pesquisa = texto.match(PESQUISAR)?.[1].trim() ?? '';
  const lembrar = texto.match(LEMBRAR)?.[1].trim() ?? '';
  texto = texto.replace(PESQUISAR, '').replace(LEMBRAR, '');

  let raciocinio = '';
  let bastidores = '';
  // Blocos fechados saem um a um; o que sobrar aberto no fim ainda está chegando.
  texto = texto.replace(/<<<\s*([A-Za-zÀ-ú]+)\b([\s\S]*?)>>>/g, (_, nome: string, dentro: string) => {
    if (/^BASTIDORES$/i.test(nome)) bastidores += `${dentro}\n`;
    else if (/^RACIOC/i.test(nome)) raciocinio += `${dentro}\n`;
    return '';
  });
  const aberto = texto.match(/<<<\s*([A-Za-zÀ-ú]*)([\s\S]*)$/);
  if (aberto) {
    if (/^BASTIDORES$/i.test(aberto[1])) bastidores += aberto[2];
    else if (/^RACIOC/i.test(aberto[1])) raciocinio += aberto[2];
    texto = texto.slice(0, aberto.index);
  }
  const visivel = texto
    .replace(/\[\[\s*[PL][A-Z]*\s*:?[^\]]*$/i, '') // [[PESQUISAR ou [[LEMBRAR pela metade
    .replace(/```\w*\s*```/g, '') // cerca de código que ficou vazia em volta de um bloco
    .replace(/\s*(```\w*|<{1,2}|\[{1,2})\s*$/, '')
    .trim();
  bastidores = bastidores.trim();
  // O raciocínio fica de fora do histórico: já cumpriu o papel e só gastaria contexto.
  const limpo = bastidores ? `${visivel}\n\n<<<BASTIDORES\n${bastidores}\n>>>` : visivel;
  return { visivel, bastidores, raciocinio: raciocinio.trim(), pesquisa, lembrar, limpo };
}

/** Narração e bloco de status, separados para a tela desenhar o status como cartão. */
export function extrairStatus(visivel: string): { narrativa: string; status: string } {
  const linhas = visivel.split('\n');
  const inicio = linhas.findIndex((l) => /STATUS DO PERSONAGEM/i.test(l));
  if (inicio < 0) return { narrativa: visivel.trim(), status: '' };
  // Fecha na próxima régua (linha só de traços). Sem régua, na linha em branco depois dos
  // campos — a não ser que o que vem depois dela ainda seja campo (modelo que espaça a lista).
  const regua = (l: string) => /^[\s━─═—_*-]{6,}$/.test(l);
  const campo = (l: string) => /^\s*[•*·-]\s*\S/.test(l);
  let fim = linhas.length - 1;
  let viuCampo = false;
  for (let i = inicio + 1; i < linhas.length; i++) {
    if (regua(linhas[i])) {
      fim = i;
      break;
    }
    const proxima = linhas.slice(i).find((l) => l.trim()) ?? '';
    if (linhas[i].trim()) viuCampo = true;
    else if (viuCampo && !campo(proxima) && !regua(proxima)) {
      fim = i;
      break;
    }
  }
  const status = linhas
    .slice(inicio + 1, fim + 1)
    .filter((l) => !/^[\s━─═—_*`-]*$/.test(l))
    .map((l) => l.trim())
    .join('\n');
  const narrativa = [...linhas.slice(0, inicio), ...linhas.slice(fim + 1)]
    .join('\n')
    .replace(/\n[\s_*-]{3,}\s*(?=\n|$)/g, '\n') // régua de markdown que separava o status
    .replace(/\s*```\s*$/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { narrativa, status };
}

/** "• Campo: valor" vira par; linha sem dois-pontos continua o valor anterior. */
export function camposDoStatus(status: string): [string, string][] {
  const campos: [string, string][] = [];
  for (const l of status.split('\n')) {
    const limpa = l.replace(/^[\s•*·-]+/, '').replace(/\*\*/g, '').trim();
    if (!limpa) continue;
    const i = limpa.indexOf(':');
    if (i > 0 && i < 40) campos.push([limpa.slice(0, i).trim(), limpa.slice(i + 1).trim()]);
    else if (campos.length) campos[campos.length - 1][1] += ` ${limpa}`;
    else campos.push(['', limpa]);
  }
  return campos;
}

export const semAcento = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');

const CHAVES = [
  'PERSONAGEM', 'TEMPO', 'FATO', 'SECRETO', 'NPC', 'PENDENTE', 'RESOLVIDO', 'REVELADO', 'ESQUECER',
  'RESUMO', 'CAPITULO', 'VEREDITO', 'MOTIVO', 'BUSCA',
] as const;
export type Chave = (typeof CHAVES)[number];
const APELIDO: Record<string, Chave> = {
  FATOS: 'FATO', SECRETOS: 'SECRETO', SEGREDO: 'SECRETO', SEGREDOS: 'SECRETO', NPCS: 'NPC',
  PENDENCIA: 'PENDENTE', PENDENCIAS: 'PENDENTE', PENDENTES: 'PENDENTE', MISSAO: 'PENDENTE',
  RESOLVIDA: 'RESOLVIDO', REVELADA: 'REVELADO', VEREDICTO: 'VEREDITO', MOTIVOS: 'MOTIVO', BUSCAS: 'BUSCA',
};
/** Texto corrido: a linha seguinte continua o parágrafo, em vez de virar outro item. */
const CORRIDO: readonly Chave[] = ['RESUMO', 'CAPITULO'];
/** "Nenhum.", "(sem mudanças)", "Ainda não há segredos.": o modelo preencheu a linha sem ter o que dizer. */
const VAZIO = /^[\s([]*((ainda\s+)?(não há|nenhuma?|nada|sem)(?=[\s.)\]]|$)[^,;:|]{0,20}|n\/a|—|-|\.{3}|…)?[\s)\].]*$/i;

/**
 * Lê as linhas "CHAVE: valor" de um bloco. Aceita o que os modelos costumam variar:
 * negrito, marcador na frente, plural, acento, e a chave sozinha com os itens em lista embaixo.
 */
export function lerBloco(bloco: string): [Chave, string][] {
  const itens: [Chave, string][] = [];
  let atual: Chave | null = null;
  for (const bruta of bloco.split('\n')) {
    const linha = bruta.replace(/\*\*/g, '').trim();
    if (!linha) continue;
    const m = linha.match(/^[\s•*·#-]*([A-Za-zÀ-ú]+)\s*:\s*(.*)$/);
    const nome = semAcento(m?.[1] ?? '').toUpperCase();
    const chave = (CHAVES as readonly string[]).includes(nome) ? (nome as Chave) : APELIDO[nome];
    if (m && chave) {
      atual = chave;
      if (!VAZIO.test(m[2])) itens.push([chave, m[2].trim()]);
    } else if (atual) {
      const item = linha.replace(/^[\s•*·-]+/, '').trim();
      const ultimo = itens[itens.length - 1];
      if (CORRIDO.includes(atual) && ultimo?.[0] === atual) ultimo[1] += `\n${item}`;
      else if (!VAZIO.test(item)) itens.push([atual, item]);
    }
  }
  return itens;
}

/** Os valores de uma chave, na ordem em que apareceram. */
export const valores = (itens: [Chave, string][], chave: Chave) => itens.filter(([k]) => k === chave).map(([, v]) => v);
