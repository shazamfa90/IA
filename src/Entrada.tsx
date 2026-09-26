import { useState } from 'react';
import { senhaDoMestre, type Role } from './store.ts';

/** Tela de entrada: mestre com senha, player direto. A escolha fica salva. */
export default function Entrada({ onEntrar }: { onEntrar: (r: Role) => void }) {
  const [senha, setSenha] = useState<string | null>(null); // null: ainda escolhendo o papel
  const [errou, setErrou] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (await senhaDoMestre(senha ?? '')) onEntrar('mestre');
    else setErrou(true);
  }

  return (
    <main className="entrada">
      <h1>Quem está entrando?</h1>
      {senha === null ? (
        <div className="grid">
          <button className="roll papel" onClick={() => setSenha('')}>
            Mestre<small>cria os sistemas e acompanha a mesa</small>
          </button>
          <button className="roll papel" onClick={() => onEntrar('player')}>
            Player<small>preenche a ficha e rola</small>
          </button>
        </div>
      ) : (
        <form onSubmit={entrar}>
          <section>
            <label className="field wide">
              <span>Senha do mestre</span>
              <input
                type="password"
                autoFocus
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErrou(false);
                }}
              />
            </label>
            {errou && <p className="hint err">Senha errada.</p>}
            <div className="grid">
              <button type="submit" className="roll compact">Entrar</button>
              <button type="button" className="add" onClick={() => setSenha(null)}>Voltar</button>
            </div>
          </section>
        </form>
      )}
    </main>
  );
}
