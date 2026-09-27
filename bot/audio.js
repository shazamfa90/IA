import { execFile, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

// yt-dlp baixado direto da release (o link fixo não passa pela API do GitHub,
// que limita downloads). Fica em bot/bin, fora do git.
const ARQUIVO =
  process.platform === 'win32' ? 'yt-dlp.exe'
  : process.platform === 'darwin' ? 'yt-dlp_macos'
  : process.arch === 'arm64' ? 'yt-dlp_linux_aarch64'
  : 'yt-dlp_linux';
const PASTA = fileURLToPath(new URL('./bin/', import.meta.url));
export const YTDLP = PASTA + (process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
const EXTRA = process.env.YTDLP_ARGS?.split(' ').filter(Boolean) ?? [];

/** Baixa o yt-dlp na primeira vez; nas outras, atualiza (o YouTube muda e ele acompanha). */
export async function prepararYtdlp() {
  if (!existsSync(YTDLP)) {
    console.log('Baixando o yt-dlp (só na primeira vez)…');
    const r = await fetch(`https://github.com/yt-dlp/yt-dlp/releases/latest/download/${ARQUIVO}`);
    if (!r.ok) throw new Error(`Não consegui baixar o yt-dlp (${r.status}).`);
    await mkdir(PASTA, { recursive: true });
    await writeFile(YTDLP, Buffer.from(await r.arrayBuffer()), { mode: 0o755 });
    return;
  }
  await new Promise((ok) => execFile(YTDLP, ['-U'], () => ok())); // sem internet, segue com o que tem
}

/**
 * yt-dlp → ffmpeg → Ogg/Opus, o formato que o Discord toca sem recodificar.
 * `falhou` rejeita se o yt-dlp não achar ou não puder baixar o áudio.
 */
export function fluxo(alvo) {
  const yt = spawn(YTDLP, ['-f', 'bestaudio/best', '--no-playlist', '--playlist-items', '1', '--no-warnings', '-q', '-o', '-', ...EXTRA, alvo], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const ff = spawn(ffmpeg, ['-loglevel', 'error', '-i', 'pipe:0', '-vn', '-c:a', 'libopus', '-b:a', '128k', '-f', 'ogg', 'pipe:1'], {
    stdio: ['pipe', 'pipe', 'ignore'],
  });
  yt.stdout.pipe(ff.stdin);
  ff.stdin.on('error', () => {}); // trocar de música mata o ffmpeg no meio: EPIPE esperado

  let erro = '';
  yt.stderr.on('data', (d) => (erro += d));
  const falhou = new Promise((_, rejeita) =>
    yt.on('close', (code) => {
      if (code) rejeita(new Error(erro.trim().split('\n').at(-1)?.replace(/^ERROR:\s*/, '') || `yt-dlp saiu com ${code}`));
    }),
  );
  falhou.catch(() => {}); // quem não esperar por ela não derruba o processo

  return { saida: ff.stdout, falhou, matar: () => (yt.kill(), ff.kill()) };
}
