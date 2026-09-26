import { useState } from 'react';
import { LIVRO } from './livro.ts';

// "Classe de Resistência" acha "resistencia": busca sem acento nem caixa,
// e pelo capítulo também ("água" traz as formas da Respiração da Água).
const limpo = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const TUDO = LIVRO.flatMap((c) => c.verbetes.map((v) => ({ cap: c.titulo, ...v, chave: limpo(`${c.titulo}\n${v.nome}\n${v.texto}`) })));

export default function Livro() {
  const [busca, setBusca] = useState('');
  const q = limpo(busca.trim());
  // Quem tem a palavra no nome aparece antes de quem só cita no texto.
  const achados = q
    ? TUDO.filter((v) => v.chave.includes(q)).sort((a, b) => +!limpo(a.nome).includes(q) - +!limpo(b.nome).includes(q))
    : [];

  return (
    <>
      <h1>Livro</h1>
      <p className="hint">
        Fichário do <strong>Hashira Handbook 1.0</strong> (Natan, 2023): as regras resumidas para consultar na mesa. O
        livro continua sendo a fonte, com as descrições completas.
      </p>
      <input
        type="search"
        className="busca"
        placeholder="Buscar: katana, CR, fadiga, Água…"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="livro">
        {!q &&
          LIVRO.map((c) => (
            <details key={c.titulo} className="cap">
              <summary>
                {c.titulo}
                <small>{c.verbetes.length}</small>
              </summary>
              {c.intro && <p className="hint">{c.intro}</p>}
              {c.verbetes.map((v, i) => (
                <details key={i} className="verbete">
                  <summary>{v.nome}</summary>
                  <p>{v.texto}</p>
                </details>
              ))}
            </details>
          ))}

        {q && <p className="hint">{achados.length ? `${achados.length} resultado${achados.length > 1 ? 's' : ''}` : `Nada com “${busca.trim()}”.`}</p>}
        {achados.map((v, i) => (
          <article key={i} className="verbete">
            <small>{v.cap}</small>
            <h3>{v.nome}</h3>
            <p>{v.texto}</p>
          </article>
        ))}
      </div>
    </>
  );
}
