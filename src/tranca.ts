/**
 * A senha do Mestre IA. Aqui fica só o resultado de uma conta lenta feita sobre ela
 * (PBKDF2), nunca a senha: o repositório e o site são públicos.
 *
 * É uma tranca de tela, não um cofre: o app roda inteiro no navegador, então quem souber
 * mexer nele por dentro passa da tela. O que ela protege é o uso — e mesmo quem passar não
 * encontra nada, porque as aventuras e as chaves moram no aparelho do dono, não no site.
 */
const SAL = 'ficha-rpg/mestre-ia';
const VOLTAS = 200000;
const SENHA = '9556b38e675aefe3de43c740f42fa2419f631886ae64bac7f15c3752e48fc0c6';
const ABERTO = 'ficha-rpg-mestre-aberto';

/** A conta lenta: 200 mil voltas tornam caro testar senhas em massa contra o valor guardado. */
export async function derivar(senha: string): Promise<string> {
  const te = new TextEncoder();
  const chave = await crypto.subtle.importKey('raw', te.encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: te.encode(SAL), iterations: VOLTAS, hash: 'SHA-256' }, chave, 256);
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('');
}

export const senhaCerta = async (senha: string, esperado = SENHA) => (await derivar(senha.trim())) === esperado;

/** Destrancado fica lembrado no aparelho, até alguém tocar em "Trancar". */
export function destrancado(): boolean {
  try {
    return localStorage.getItem(ABERTO) === SENHA;
  } catch {
    return false;
  }
}

export function lembrar(aberto: boolean) {
  try {
    if (aberto) localStorage.setItem(ABERTO, SENHA);
    else localStorage.removeItem(ABERTO);
  } catch {
    // sem armazenamento: pede a senha de novo na próxima vez
  }
}
