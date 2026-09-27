import { useState } from 'react';
import { LIVRO } from './livro.ts';
import { blocos, type Corpo } from './texto.ts';

// "Classe de Resistência" acha "resistencia": busca sem acento nem caixa,
// e pelo capítulo também ("água" traz as formas da Respiração da Água).
const limpo = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const TUDO = LIVRO.flatMap((c) => c.verbetes.map((v) => ({ cap: c.titulo, ...v, chave: limpo(`${c.titulo}\n${v.nome}\n${v.texto}`) })));

// Rolagens em destaque: é o que se procura com os olhos na mesa.
function Dados({ s }: { s: string }) {
  const partes = s.split(/(\b\d*d(?:\d+|%)\b)/);
  return <>{partes.map((x, i) => (i % 2 ? <b key={i} className="d">{x}</b> : x))}</>;
}

function Corpo({ c }: { c: Corpo }) {
  if (c.tipo === 'texto') return <Dados s={c.texto} />;
  if (c.tipo === 'lista') {
    return (
      <ul>
        {c.itens.map((x, i) => (
          <li key={i}><Dados s={x} /></li>
        ))}
      </ul>
    );
  }
  return (
    <>
      {c.intro && <span className="intro"><Dados s={c.intro} /></span>}
      <span className="pontos">
        {c.itens.map((x, i) => (
          <span key={i}><Dados s={x} /></span>
        ))}
      </span>
      {c.nota && <span className="nota"><Dados s={c.nota} /></span>}
    </>
  );
}

/** O texto do verbete com forma: tópicos, listas e etiquetas (as regras estão em texto.ts). */
function Texto({ texto }: { texto: string }) {
  return (
    <div className="texto">
      {blocos(texto).map((b, i) => (
        <div key={i} className={`bloco ${b.tipo}`}>
          {b.rotulo && <strong>{b.rotulo}</strong>}
          <Corpo c={b.corpo} />
        </div>
      ))}
    </div>
  );
}

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
                  <Texto texto={v.texto} />
                </details>
              ))}
            </details>
          ))}

        {q && <p className="hint">{achados.length ? `${achados.length} resultado${achados.length > 1 ? 's' : ''}` : `Nada com “${busca.trim()}”.`}</p>}
        {achados.map((v, i) => (
          <article key={i} className="verbete">
            <small>{v.cap}</small>
            <h3>{v.nome}</h3>
            <Texto texto={v.texto} />
          </article>
        ))}
      </div>
    </>
  );
}
