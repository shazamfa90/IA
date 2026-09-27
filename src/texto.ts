/**
 * Dá forma ao texto corrido do fichário, sem reescrever os verbetes:
 *   "Rótulo: resto"          → tópico com o rótulo em negrito
 *   "• Nome — resto"         → item de lista (seguidos viram uma lista só)
 *   "a · b · c"              → etiquetas lado a lado (tabelas curtas: CR, XP, patentes)
 *   "Rótulo: a, b (x), c, d" → lista com marcadores, quando são vários itens curtos
 * As explicações do ⓘ vêm num parágrafo só: `frases` quebra uma frase por linha antes.
 * Rolagens como 1d10 ganham destaque na hora de mostrar (Livro.tsx).
 */

/** O que vem depois do rótulo: texto, etiquetas (com uma nota final opcional) ou lista. */
export type Corpo = { tipo: 'texto'; texto: string } | { tipo: 'pontos'; intro?: string; itens: string[]; nota?: string } | { tipo: 'lista'; itens: string[] };
export type Bloco = { tipo: 'topico' | 'item' | 'p'; rotulo?: string; corpo: Corpo };

/** Vírgulas fora de parênteses: "A (x, y), B" são dois itens, não três. */
function porVirgula(s: string): string[] {
  const itens: string[] = [];
  let fundo = 0;
  let atual = '';
  for (const ch of s) {
    if (ch === '(') fundo++;
    if (ch === ')') fundo = Math.max(0, fundo - 1);
    if (ch === ',' && fundo === 0) {
      itens.push(atual.trim());
      atual = '';
    } else atual += ch;
  }
  itens.push(atual.trim());
  return itens.filter(Boolean);
}

/** Uma frase por linha: corta depois de ". " seguido de maiúscula ou número, fora de parênteses. */
export function frases(texto: string): string {
  let fundo = 0;
  let out = '';
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (ch === '(') fundo++;
    if (ch === ')') fundo = Math.max(0, fundo - 1);
    out += ch;
    if (fundo === 0 && /[.!?]/.test(ch) && texto[i + 1] === ' ' && /[\p{Lu}\d+−-]/u.test(texto[i + 2] ?? '')) {
      out += '\n';
      i++;
    }
  }
  return out;
}

/** "Oiran ou Sozo" no fim de uma lista são dois itens. */
function ultimoPar(itens: string[]): string[] {
  const fim = itens[itens.length - 1];
  const m = fim.match(/^([^()]+?|.*?\)) (?:e|ou) (.+)$/);
  return m && m[1].length <= 60 && m[2].length <= 60 ? [...itens.slice(0, -1), m[1], m[2]] : itens;
}

// "d20 + For" continua minúsculo: é notação de dado, não começo de frase.
const maiuscula = (x: string) => (/^\d*d(\d|%)/.test(x) ? x : x[0].toUpperCase() + x.slice(1));
const equilibrado = (x: string) => x.split('(').length === x.split(')').length;

/** `soltaEmLista`: sem rótulo, vira lista só quando todo item é "Nome (detalhe)", como as raças. */
function corpo(s: string, temRotulo: boolean, soltaEmLista = false): Corpo {
  const pontos = s.split(' · ');
  if (pontos.length >= 3) {
    // A última etiqueta pode trazer uma frase depois: "… · P+3 20. Desvantagem em Furtividade."
    const ultima = pontos.pop()!;
    const corte = ultima.search(/\.\s+\S/);
    const nota = corte > 0 ? ultima.slice(corte + 1).trim() : undefined;
    const fim = (corte > 0 ? ultima.slice(0, corte) : ultima).replace(/\.$/, '');
    // E a primeira pode vir depois de frases: "… decapitado. Regenera por turno: nível 1–5 1d10 · …".
    const antes = pontos[0].lastIndexOf('. ');
    const intro = antes > 0 ? pontos[0].slice(0, antes + 1) : undefined;
    if (intro) pontos[0] = pontos[0].slice(antes + 2);
    return { tipo: 'pontos', intro, itens: [...pontos, fim].map((x) => x.trim()), nota };
  }
  if ((temRotulo || soltaEmLista) && /\.$/.test(s) && !/\.\s/.test(s.slice(0, -1))) {
    // Uma frase só, feita de vários itens curtos separados por vírgula: vira lista.
    const itens = ultimoPar(porVirgula(s.slice(0, -1)).map((x) => x.replace(/^(e|ou)\s+/, '')));
    const soNumero = itens.some((x) => !/\p{L}/u.test(x)); // "4, 6, 8, 10 ou 12" lê melhor corrido
    const nomeDetalhe = itens.every((x) => /^[^()]+ \(.+\)$/.test(x));
    if (itens.length >= 4 && !soNumero && itens.every((x) => x.length <= 70) && (temRotulo || nomeDetalhe)) return { tipo: 'lista', itens: itens.map(maiuscula) };
  }
  return { tipo: 'texto', texto: s };
}

/**
 * `explicacao`: o texto do ⓘ, mais curto e direto. Lá o rótulo só vale se for curto (até 5 palavras,
 * sem vírgula: "Sem uniforme", não "Aqui o atributo já é o modificador") e uma frase sem rótulo
 * vira lista quando todo item é "Nome (detalhe)".
 */
export function blocos(texto: string, explicacao = false): Bloco[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linha): Bloco => {
      const item = linha.match(/^[•·-]\s+(.*)$/);
      if (item) {
        const [, resto] = item;
        const m = resto.match(/^(.{2,40}?) — (.*)$/);
        return m ? { tipo: 'item', rotulo: m[1], corpo: corpo(m[2], false) } : { tipo: 'item', corpo: corpo(resto, false) };
      }
      // Rótulo curto antes de dois-pontos; frase longa com ":" no meio fica como texto.
      const m = linha.match(/^([^:]{1,60}):\s+(.+)$/);
      const rotuloBom = m && !/[.!?]\s/.test(m[1]) && equilibrado(m[1]) && (!explicacao || (!m[1].includes(',') && m[1].split(' ').length <= 5));
      if (m && rotuloBom) return { tipo: 'topico', rotulo: m[1], corpo: corpo(maiuscula(m[2]), true) };
      return { tipo: 'p', corpo: corpo(linha, false, explicacao) };
    });
}
