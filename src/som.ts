/**
 * Som de dados rolando, gerado na hora (Web Audio): alguns estalos curtos de ruído,
 * como o dado batendo na mesa. Nada pra baixar, e funciona offline.
 */
let ctx: AudioContext | undefined;

export function somDeDados(duracaoMs: number) {
  const Contexto = globalThis.AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Contexto) return;
  ctx ??= new Contexto();
  ctx.resume?.();
  const agora = ctx.currentTime;
  const batidas = Math.max(3, Math.min(9, Math.round(duracaoMs / 220)));
  const ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
  const amostras = ruido.getChannelData(0);
  for (let i = 0; i < amostras.length; i++) amostras[i] = (Math.random() * 2 - 1) * (1 - i / amostras.length);
  for (let i = 0; i < batidas; i++) {
    // As batidas ficam mais espaçadas e mais fracas: o dado perdendo força.
    const t = agora + (duracaoMs / 1000) * (i / batidas) ** 0.8;
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruido;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.value = 1800 + Math.random() * 2200;
    const volume = ctx.createGain();
    volume.gain.value = 0.5 * (1 - i / (batidas + 1));
    fonte.connect(filtro).connect(volume).connect(ctx.destination);
    fonte.start(t);
  }
}
