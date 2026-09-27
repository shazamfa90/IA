import { execFile, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

// yt-dlp e ffmpeg baixados direto das releases na primeira vez, pro bot/bin (fora do git).
// Link fixo de release não passa pela API do GitHub, que limita downloads; e não depender
// do npm install: lá, um download que falha deixa o bot sem ffmpeg e ninguém percebe.
const WIN = process.platform === 'win32';
const ARQUIVO =
  WIN ? 'yt-dlp.exe'
  : process.platform === 'darwin' ? 'yt-dlp_macos'
  : process.arch === 'arm64' ? 'yt-dlp_linux_aarch64'
  : 'yt-dlp_linux';
const PASTA = fileURLToPath(new URL('./bin/', import.meta.url));
export const YTDLP = PASTA + (WIN ? 'yt-dlp.exe' : 'yt-dlp');
export const FFMPEG = PASTA + (WIN ? 'ffmpeg.exe' : 'ffmpeg');
const EXTRA = process.env.YTDLP_ARGS?.split(' ').filter(Boolean) ?? [];

async function baixar(nome, url, destino, gz = false) {
  console.log(`Baixando o ${nome} (só na primeira vez)…`);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Não consegui baixar o ${nome} (${r.status}). Confira a internet e ligue de novo.`);
  const dados = Buffer.from(await r.arrayBuffer());
  await mkdir(PASTA, { recursive: true });
  await writeFile(destino, gz ? gunzipSync(dados) : dados, { mode: 0o755 });
}

/** Baixa o que faltar; o yt-dlp já existente se atualiza (o YouTube muda e ele acompanha). */
export async function prepararProgramas() {
  if (!existsSync(FFMPEG)) {
    // O mesmo build que o pacote ffmpeg-static usa.
    const url = `https://github.com/eugeneware/ffmpeg-static/releases/download/b6.1.1/ffmpeg-${process.platform}-${process.arch}.gz`;
    await baixar('ffmpeg', url, FFMPEG, true);
  }
  if (!existsSync(YTDLP)) return baixar('yt-dlp', `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${ARQUIVO}`, YTDLP);
  await new Promise((ok) => execFile(YTDLP, ['-U'], () => ok())); // sem internet, segue com o que tem
}

/** Os links das faixas de uma playlist (YouTube e o que mais o yt-dlp listar), sem baixar nada. */
export function listarPlaylist(alvo) {
  return new Promise((ok, falha) =>
    execFile(
      YTDLP,
      ['--flat-playlist', '--print', 'url', '--playlist-end', '300', '--js-runtimes', 'node', '--no-warnings', ...EXTRA, alvo],
      { maxBuffer: 4 << 20 },
      (e, stdout, stderr) => {
        const itens = stdout.split('\n').map((l) => l.trim()).filter(Boolean);
        if (itens.length) ok(itens);
        else falha(new Error(stderr.trim().split('\n').at(-1)?.replace(/^ERROR:\s*/, '') || e?.message || 'Playlist vazia.'));
      },
    ),
  );
}

/**
 * yt-dlp → ffmpeg → Ogg/Opus, o formato que o Discord toca sem recodificar.
 * `falhou` rejeita se o yt-dlp não achar ou não puder baixar o áudio.
 */
export function fluxo(alvo) {
  // --js-runtimes node: o YouTube exige um motor de JavaScript, e o Node que roda o bot serve.
  const yt = spawn(YTDLP, ['-f', 'bestaudio/best', '--no-playlist', '--playlist-items', '1', '--js-runtimes', 'node', '--no-warnings', '-q', '-o', '-', ...EXTRA, alvo], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const ff = spawn(FFMPEG, ['-loglevel', 'error', '-i', 'pipe:0', '-vn', '-c:a', 'libopus', '-b:a', '128k', '-f', 'ogg', 'pipe:1'], {
    stdio: ['pipe', 'pipe', 'ignore'],
  });
  yt.stdout.pipe(ff.stdin);
  ff.stdin.on('error', () => {}); // trocar de música mata o ffmpeg no meio: EPIPE esperado

  let erro = '';
  yt.stderr.on('data', (d) => (erro += d));
  const falhou = new Promise((_, rejeita) => {
    // Sem estes, um programa que não abre (antivírus, arquivo corrompido) derrubaria o bot calado.
    yt.on('error', (e) => rejeita(new Error(`Não consegui abrir o yt-dlp (${e.code ?? e.message}). O antivírus bloqueou bot/bin?`)));
    ff.on('error', (e) => rejeita(new Error(`Não consegui abrir o ffmpeg (${e.code ?? e.message}).`)));
    yt.on('close', (code) => {
      if (code) rejeita(new Error(erro.trim().split('\n').at(-1)?.replace(/^ERROR:\s*/, '') || `yt-dlp saiu com ${code}`));
    });
  });
  falhou.catch(() => {}); // quem não esperar por ela não derruba o processo

  return { saida: ff.stdout, falhou, matar: () => (yt.kill(), ff.kill()) };
}
