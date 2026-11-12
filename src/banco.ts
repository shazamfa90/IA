/**
 * Onde as aventuras moram: IndexedDB, o banco do próprio navegador. Uma campanha longa
 * passa fácil do que cabe no localStorage, e aqui ela continua no aparelho entre sessões,
 * sem conta e sem servidor.
 */
import type { Campanha } from './mestre.ts';

const NOME = 'ficha-rpg-mestre';
const LOJA = 'campanhas';

let aberto: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  aberto ??= new Promise((ok, erro) => {
    const pedido = indexedDB.open(NOME, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA, { keyPath: 'id' });
    pedido.onsuccess = () => ok(pedido.result);
    pedido.onerror = () => erro(pedido.error);
  });
  // Falhou (aba anônima, banco bloqueado): a próxima tentativa abre de novo em vez de repetir o erro.
  aberto.catch(() => (aberto = null));
  return aberto;
}

async function operar<T>(modo: IDBTransactionMode, f: (loja: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await abrir();
  return new Promise((ok, erro) => {
    const t = db.transaction(LOJA, modo);
    const pedido = f(t.objectStore(LOJA));
    // Só vale quando a transação fecha: é aí que o dado está de fato gravado.
    t.oncomplete = () => ok(pedido.result);
    t.onerror = t.onabort = () => erro(t.error ?? pedido.error);
  });
}

/** Todas as aventuras do aparelho, a jogada por último primeiro. */
export const listarCampanhas = async (): Promise<Campanha[]> =>
  (await operar<Campanha[]>('readonly', (l) => l.getAll())).sort((a, b) => b.jogada - a.jogada);

export const salvarCampanha = (c: Campanha) => operar('readwrite', (l) => l.put(c)).then(() => {});
export const apagarCampanha = (id: string) => operar('readwrite', (l) => l.delete(id)).then(() => {});

/** Pede ao navegador pra não apagar os dados quando faltar espaço. Ele pode negar; não é erro. */
export const pedirPermanencia = () => navigator.storage?.persist?.().catch(() => false);
