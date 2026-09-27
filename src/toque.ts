/**
 * Efeito de toque de cada respiração: ao tocar na tela, peças soltas animam a partir
 * do dedo (brasas sobem, pétalas caem, a lua corta…). Só enfeite: ficam fora do fluxo,
 * não recebem clique e se apagam sozinhas. O CSS das animações está em style.css (.tq).
 */

const svg = (corpo: string, vb = 24) => `<svg viewBox="0 0 ${vb} ${vb}">${corpo}</svg>`;
const p = (d: string, extra = '') => svg(`<path d="${d}"${extra}/>`);
// pathLength=1: o traço se desenha do começo ao fim, qualquer que seja o tamanho.
const traco = (d: string, largura: number, vb = 100) => svg(`<path d="${d}" pathLength="1" stroke-width="${largura}"/>`, vb);

const F = {
  crescente: p('M12 2a10 10 0 1 0 0 20a12.5 12.5 0 1 1 0-20z'),
  corteLua: traco('M8 70C22 20 78 10 94 44', 5),
  estrela: p('M12 0q2 10 12 12q-10 2-12 12q-2-10-12-12q10-2 12-12z'),
  gota: p('M12 1c4 6 8 10 8 15a8 8 0 0 1-16 0c0-5 4-9 8-15z'),
  anel: svg('<circle cx="50" cy="50" r="46" stroke-width="3"/>', 100),
  brasa: svg('<circle cx="12" cy="12" r="6"/>'),
  chama: p('M12 1c3 5 8 8 8 14a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 2 5 4 4-2-4 0-7 0-10z'),
  raio: p('M14 0 3 14h7l-3 10 13-15h-8l6-9z'),
  faisca: p('M11 0h2l-1 24z'),
  nuvem: svg('<circle cx="12" cy="12" r="11"/>'),
  borboleta: p('M12 11C9 3 1 2 2 9c0 3 4 4 10 2zM12 11c3-8 11-9 10-2 0 3-4 4-10 2zM12 12c-5 1-7 7-3 7 2 0 3-3 3-7zM12 12c5 1 7 7 3 7-2 0-3-3-3-7z'),
  redemoinho: traco('M50 50a8 8 0 1 1 8 8a16 16 0 1 1-16-16a26 26 0 1 1 26 26', 4),
  risco: traco('M5 50H95', 3),
  caco: p('M3 8l7-6 10 3 2 9-9 8-10-5z'),
  petala: p('M12 23C4 17 3 9 8 3l4 3 4-3c5 6 4 14-4 20z'),
  serpente: traco('M5 70C25 20 40 20 50 50S75 80 95 30', 5),
  escama: p('M12 2l6 10-6 10-6-10z'),
  joia: p('M5 8l4-5h6l4 5-7 13zM5 8h14M9 3l3 5 3-5M9 8l3 13 3-13', ' stroke="#fff" stroke-opacity=".5" stroke-width=".6"'),
  nota: p('M9 18a3 3 0 1 1-2-3V3l11-2v14a3 3 0 1 1-2-3V5L9 6z'),
  coracao: p('M12 21C3 14 2 8 6 5c3-2 5 0 6 2 1-2 3-4 6-2 4 3 3 9-6 16z'),
  garras: traco('M15 10L45 90M40 5L70 85M65 0L95 80', 6),
};

type Anim = 'explode' | 'sobe' | 'cai' | 'onda' | 'nevoa' | 'pisca' | 'corte';
type Emissor = {
  forma: string;
  anim: Anim;
  n: number;
  /** Tamanho da peça, em px: [mín, máx]. */
  t: [number, number];
  /** Até onde a peça vai, em px. */
  longe: number;
  dur: number;
  /** Direção em graus (0 = direita, -90 = cima) e abertura do leque; sem, vai pra todo lado. */
  dir?: number;
  leque?: number;
  /** Espaço entre as peças, em ms. */
  passo?: number;
  cor?: 'accent' | 'accent2' | 'as duas';
  classe?: string;
};

const EFEITOS: Record<string, Emissor[]> = {
  lua: [
    { forma: F.corteLua, anim: 'corte', n: 1, t: [130, 150], longe: 0, dur: 650, classe: 'traco' },
    { forma: F.crescente, anim: 'explode', n: 7, t: [8, 16], longe: 80, dur: 900, cor: 'accent' },
    { forma: F.estrela, anim: 'explode', n: 4, t: [6, 10], longe: 60, dur: 800, cor: 'accent2' },
  ],
  agua: [
    { forma: F.anel, anim: 'onda', n: 3, t: [90, 130], longe: 0, dur: 900, passo: 140, classe: 'onda', cor: 'as duas' },
    { forma: F.gota, anim: 'cai', n: 7, t: [6, 11], longe: 60, dur: 900, dir: -90, leque: 140, cor: 'accent2' },
  ],
  chamas: [
    { forma: F.chama, anim: 'sobe', n: 3, t: [30, 46], longe: 60, dur: 800, dir: -90, leque: 40 },
    { forma: F.brasa, anim: 'sobe', n: 12, t: [3, 6], longe: 110, dur: 1200, dir: -90, leque: 90, cor: 'as duas' },
  ],
  trovao: [
    { forma: F.raio, anim: 'pisca', n: 1, t: [60, 80], longe: 0, dur: 600, cor: 'accent' },
    { forma: F.faisca, anim: 'explode', n: 10, t: [10, 18], longe: 90, dur: 450, cor: 'as duas' },
  ],
  nevoa: [{ forma: F.nuvem, anim: 'nevoa', n: 6, t: [40, 80], longe: 60, dur: 1400, passo: 60, cor: 'accent2', classe: 'nevoa' }],
  inseto: [
    { forma: F.borboleta, anim: 'sobe', n: 5, t: [20, 30], longe: 110, dur: 1500, dir: -90, leque: 160, classe: 'bate', cor: 'as duas' },
    { forma: F.estrela, anim: 'explode', n: 5, t: [4, 7], longe: 50, dur: 700, cor: 'accent2' },
  ],
  vento: [
    { forma: F.redemoinho, anim: 'corte', n: 2, t: [70, 100], longe: 0, dur: 700, passo: 90, classe: 'traco', cor: 'as duas' },
    { forma: F.risco, anim: 'explode', n: 5, t: [30, 50], longe: 90, dur: 600, dir: 0, leque: 30, cor: 'accent2' },
  ],
  pedra: [
    { forma: F.anel, anim: 'onda', n: 1, t: [80, 90], longe: 0, dur: 600, classe: 'onda', cor: 'accent2' },
    { forma: F.caco, anim: 'cai', n: 8, t: [7, 14], longe: 70, dur: 1000, dir: -90, leque: 160, cor: 'as duas' },
  ],
  flor: [{ forma: F.petala, anim: 'cai', n: 11, t: [9, 15], longe: 90, dur: 1400, dir: -90, leque: 220, cor: 'as duas' }],
  serpente: [
    { forma: F.serpente, anim: 'corte', n: 1, t: [120, 140], longe: 0, dur: 700, classe: 'traco', cor: 'accent' },
    { forma: F.escama, anim: 'explode', n: 6, t: [6, 10], longe: 60, dur: 800, cor: 'accent2' },
  ],
  som: [
    { forma: F.anel, anim: 'onda', n: 3, t: [70, 120], longe: 0, dur: 700, passo: 110, classe: 'onda', cor: 'accent' },
    { forma: F.joia, anim: 'explode', n: 4, t: [12, 18], longe: 80, dur: 900, cor: 'accent2' },
    { forma: F.nota, anim: 'sobe', n: 3, t: [12, 16], longe: 90, dur: 1100, dir: -90, leque: 100, cor: 'accent' },
  ],
  amor: [
    { forma: F.coracao, anim: 'sobe', n: 7, t: [10, 20], longe: 110, dur: 1300, dir: -90, leque: 110, cor: 'accent' },
    { forma: F.coracao, anim: 'explode', n: 3, t: [6, 9], longe: 50, dur: 700, cor: 'accent2' },
  ],
  besta: [
    { forma: F.garras, anim: 'corte', n: 1, t: [90, 110], longe: 0, dur: 600, classe: 'traco', cor: 'accent' },
    { forma: F.caco, anim: 'explode', n: 5, t: [5, 9], longe: 60, dur: 700, cor: 'accent2' },
  ],
};

const entre = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Escala do efeito pela tela: pensado para o PC, no celular fica pela metade (e com menos peças),
 * senão um toque cobre meia tela.
 */
const escala = () => Math.min(1, Math.max(0.5, Math.min(innerWidth, innerHeight) / 760));

function soltar(x: number, y: number, e: Emissor, i: number, k: number) {
  const el = document.createElement('span');
  el.className = `tq ${e.classe ?? ''}`;
  el.innerHTML = e.forma;
  const ang = ((e.dir ?? entre(0, 360)) + entre(-(e.leque ?? 360) / 2, (e.leque ?? 360) / 2)) * (Math.PI / 180);
  const d = e.longe * k * entre(0.45, 1);
  const cor = e.cor === 'as duas' ? (i % 2 ? 'accent2' : 'accent') : (e.cor ?? 'accent');
  el.style.cssText =
    `left:${x}px;top:${y}px;color:var(--${cor});--anim:${e.anim};--t:${(entre(...e.t) * k).toFixed(0)}px;` +
    `--x:${(Math.cos(ang) * d).toFixed(0)}px;--y:${(Math.sin(ang) * d).toFixed(0)}px;--r:${entre(-200, 200).toFixed(0)}deg;` +
    `--s:${entre(0.8, 1.2).toFixed(2)};--dur:${(e.dur * entre(0.85, 1.15)).toFixed(0)}ms;--atraso:${(e.passo ?? 0) * i}ms`;
  // Só a animação da própria peça encerra (a do traço e a das asas também disparam o evento).
  el.addEventListener('animationend', (ev) => ev.target === el && el.remove());
  setTimeout(() => el.remove(), e.dur * 1.5 + (e.passo ?? 0) * i + 200); // garantia, se a animação não rodar
  document.body.append(el);
}

export function ligarToques() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  addEventListener(
    'pointerdown',
    (ev) => {
      const efeito = EFEITOS[document.documentElement.dataset.theme ?? ''];
      if (!efeito || document.querySelectorAll('.tq').length > 120) return; // toques em rajada não acumulam
      const k = escala();
      for (const e of efeito) for (let i = 0, n = Math.max(1, Math.round(e.n * k)); i < n; i++) soltar(ev.clientX, ev.clientY, e, i, k);
    },
    { passive: true },
  );
}
