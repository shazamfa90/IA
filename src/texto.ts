/**
 * Dá forma ao texto corrido do fichário, sem reescrever os verbetes:
 *   "Rótulo: resto"          → tópico com o rótulo em negrito
 *   "• Nome — resto"         → item de lista (seguidos viram uma lista só)
 *   "a · b · c"              → etiquetas lado a lado (tabelas curtas: CR, XP, patentes)
 *   "Rótulo: a, b (x), c, d" → lista com marcadores, quando são vários itens curtos
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

function corpo(s: string, temRotulo: boolean): Corpo {
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
  if (temRotulo && /\.$/.test(s) && !/\.\s/.test(s.slice(0, -1))) {
    // Uma frase só, feita de vários itens curtos separados por vírgula: vira lista.
    const itens = porVirgula(s.slice(0, -1)).map((x) => x.replace(/^(e|ou)\s+/, ''));
    if (itens.length >= 4 && itens.every((x) => x.length <= 70)) return { tipo: 'lista', itens: itens.map((x) => x[0].toUpperCase() + x.slice(1)) };
  }
  return { tipo: 'texto', texto: s };
}

export function blocos(texto: string): Bloco[] {
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
      if (m && !/[.!?]\s/.test(m[1])) return { tipo: 'topico', rotulo: m[1], corpo: corpo(m[2][0].toUpperCase() + m[2].slice(1), true) };
      return { tipo: 'p', corpo: corpo(linha, false) };
    });
}
