/** Rolagem compatível com a notação do Rollem: 4d6kh3, d20+5, 2d8-1, 6#4d6kh3, d20+@forca */

export type Roll = { total: number; detail: string };

const MAX_DICE = 500;
const MAX_SIDES = 10000;

const TERM = /^(\d*)d(\d+)(?:(kh|kl|dh|dl)(\d*))?$/i;

const d = (sides: number) => Math.floor(Math.random() * sides) + 1;

/** Troca @campo pelo valor da ficha. Campo vazio ou não-numérico vira 0. */
export function resolve(notation: string, values: Record<string, unknown> = {}): string {
  return (
    notation
      .replace(/@([\w.-]+)/g, (_, id) => {
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
  const sides = Number(m[2]);
  const mode = m[3]?.toLowerCase();
  const keep = m[4] === '' || m[4] === undefined ? 1 : Number(m[4]);

  if (count < 1 || count > MAX_DICE) throw new Error(`Quantidade de dados fora do limite (1-${MAX_DICE})`);
  if (sides < 2 || sides > MAX_SIDES) throw new Error(`Lados fora do limite (2-${MAX_SIDES})`);

  const rolls = Array.from({ length: count }, () => d(sides));
  if (!mode) return { value: rolls.reduce((a, b) => a + b, 0), detail: `[${rolls.join(', ')}]` };

  // kh/kl mantêm N dados; dh/dl descartam N.
  const keepCount = mode[0] === 'k' ? Math.min(keep, count) : Math.max(count - keep, 0);
  const highest = mode === 'kh' || mode === 'dl';

  const order = rolls.map((v, i) => i).sort((a, b) => (highest ? rolls[b] - rolls[a] : rolls[a] - rolls[b]));
  const kept = new Set(order.slice(0, keepCount));

  const value = [...kept].reduce((sum, i) => sum + rolls[i], 0);
  const detail = `[${rolls.map((v, i) => (kept.has(i) ? `${v}` : `~~${v}~~`)).join(', ')}]`;
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
