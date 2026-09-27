/**
 * Rolagem compatível com a notação do Rollem, e o que os outros ramos de RPG usam:
 *   4d6kh3, d20+5, 2d8-1, 6#4d6kh3, d20+@forca   (d20: D&D, Tormenta, Pathfinder)
 *   d%  (= d100: Call of Cthulhu, porcentagem)      4dF (Fate: −1, 0, +1 por dado)
 *   d6! (explode: tirou o máximo, rola de novo e soma — Savage Worlds, Shadowrun)
 *   5d10>=6 (conta sucessos: dados ≥ 6 — Vampiro, Storyteller, Year Zero)
 */

export type Roll = { total: number; detail: string };

const MAX_DICE = 500;
const MAX_SIDES = 10000;

const TERM = /^(\d*)d(\d+|%|f)(!)?(?:(kh|kl|dh|dl)(\d*))?(?:(>=|<=|>|<)(\d+))?$/i;
/** Explosão encadeada tem teto: um d2! poderia rolar para sempre. */
const MAX_EXPLOSOES = 100;

const passa: Record<string, (v: number, alvo: number) => boolean> = {
  '>=': (v, a) => v >= a,
  '<=': (v, a) => v <= a,
  '>': (v, a) => v > a,
  '<': (v, a) => v < a,
};

const d = (sides: number) => Math.floor(Math.random() * sides) + 1;

/**
 * Troca @campo pelo valor da ficha. Campo vazio ou não-numérico vira 0.
 * @{campo} faz o mesmo quando vem colado em outra coisa: "@{forca}d10" é uma parada de Força d10.
 */
export function resolve(notation: string, values: Record<string, unknown> = {}): string {
  return (
    notation
      .replace(/@\{([\w.-]+)\}|@([\w.-]+)/g, (_, chave, solto) => {
        const id = chave ?? solto;
        const n = Number(values[id]);
        return String(Number.isFinite(n) ? n : 0);
      })
      // Modificador negativo geraria "d20+-3": aritmética certa, leitura ruim,
      // e é isto que a mesa vê no Discord.
      .replace(/\+\s*-/g, '-')
      .replace(/-\s*-/g, '+')
  );
}

function rollTerm(term: string): { value: number; detail: string } {
  const m = TERM.exec(term);
  if (!m) {
    const n = Number(term);
    if (!Number.isFinite(n)) throw new Error(`Termo inválido: "${term}"`);
    return { value: n, detail: term };
  }

  const count = m[1] === '' ? 1 : Number(m[1]);
  const fate = m[2].toLowerCase() === 'f';
  const sides = fate ? 3 : m[2] === '%' ? 100 : Number(m[2]);
  const explode = Boolean(m[3]);
  const mode = m[4]?.toLowerCase();
  const keep = m[5] === '' || m[5] === undefined ? 1 : Number(m[5]);
  const cmp = m[6];
  const alvo = Number(m[7]);

  // Parada vazia é legítima (atributo 0 em Vampiro, Year Zero): zero dados, zero sucessos.
  if (count === 0) return { value: 0, detail: '[]' };
  if (count < 0 || count > MAX_DICE) throw new Error(`Quantidade de dados fora do limite (0-${MAX_DICE})`);
  if (sides < 2 || sides > MAX_SIDES) throw new Error(`Lados fora do limite (2-${MAX_SIDES})`);
  if (explode && fate) throw new Error('Dado Fate não explode');

  // Fate: cada dado vale −1, 0 ou +1.
  const um = () => (fate ? d(3) - 2 : d(sides));
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    let v = um();
    rolls.push(v);
    // Explodiu: o dado extra entra na lista, como na mesa (e também pode explodir).
    for (let extra = 0; explode && v === sides && extra < MAX_EXPLOSOES; extra++) rolls.push((v = um()));
  }
  const face = (v: number) => (fate ? (v > 0 ? '+' : v < 0 ? '−' : '0') : String(v));

  // kh/kl mantêm N dados; dh/dl descartam N.
  let kept = new Set(rolls.map((_, i) => i));
  if (mode) {
    const n = rolls.length;
    const keepCount = mode[0] === 'k' ? Math.min(keep, n) : Math.max(n - keep, 0);
    const highest = mode === 'kh' || mode === 'dl';
    const order = rolls.map((_, i) => i).sort((a, b) => (highest ? rolls[b] - rolls[a] : rolls[a] - rolls[b]));
    kept = new Set(order.slice(0, keepCount));
  }

  if (cmp) {
    // Parada de sucessos: o valor é quantos dados passaram, não a soma.
    const ok = (i: number) => kept.has(i) && passa[cmp](rolls[i], alvo);
    const value = rolls.filter((_, i) => ok(i)).length;
    const detail = `[${rolls.map((v, i) => (!kept.has(i) ? `~~${v}~~` : ok(i) ? `${v}✓` : `${v}`)).join(', ')}] ${value} sucesso${value === 1 ? '' : 's'}`;
    return { value, detail };
  }

  const value = [...kept].reduce((sum, i) => sum + rolls[i], 0);
  const detail = `[${rolls.map((v, i) => (kept.has(i) ? face(v) : `~~${face(v)}~~`)).join(', ')}]`;
  return { value, detail };
}

/** Rola uma expressão já resolvida. Lança Error com mensagem legível se a notação for inválida. */
export function rollOnce(expr: string): Roll {
  const clean = expr.replace(/\s+/g, '');
  if (!clean) throw new Error('Notação vazia');

  // Divide em termos mantendo o sinal de cada um.
  const parts = clean.match(/[+-]?[^+-]+/g);
  if (!parts) throw new Error(`Notação inválida: "${expr}"`);

  let total = 0;
  const details: string[] = [];
  for (const part of parts) {
    const sign = part[0] === '-' ? -1 : 1;
    const body = part.replace(/^[+-]/, '');
    const { value, detail } = rollTerm(body);
    total += sign * value;
    details.push(`${details.length === 0 ? (sign < 0 ? '-' : '') : sign < 0 ? ' - ' : ' + '}${detail}`);
  }
  return { total, detail: details.join('') };
}

/** Rola a notação completa, incluindo o prefixo de repetição `N#`. */
export function roll(notation: string, values: Record<string, unknown> = {}): Roll[] {
  const expr = resolve(notation, values);
  const repeat = /^(\d+)#(.+)$/.exec(expr.trim());
  if (!repeat) return [rollOnce(expr)];

  const times = Number(repeat[1]);
  if (times < 1 || times > 100) throw new Error('Repetições fora do limite (1-100)');
  return Array.from({ length: times }, () => rollOnce(repeat[2]));
}
