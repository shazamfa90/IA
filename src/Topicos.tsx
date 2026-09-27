import { blocos, frases, type Corpo } from './texto.ts';

// Rolagens em destaque: é o que se procura com os olhos na mesa.
function Dados({ s }: { s: string }) {
  const partes = s.split(/(\b\d*d(?:\d+|%)\b)/);
  return <>{partes.map((x, i) => (i % 2 ? <b key={i} className="d">{x}</b> : x))}</>;
}

function Corpo({ c }: { c: Corpo }) {
  if (c.tipo === 'texto') return <Dados s={c.texto} />;
  if (c.tipo === 'lista') {
    // Nomes curtos (Água, Besta, Lua…) cabem lado a lado; um por linha só quando tem detalhe.
    const curtos = c.itens.reduce((n, x) => n + x.length, 0) / c.itens.length <= 16;
    if (curtos) return <Corpo c={{ tipo: 'pontos', itens: c.itens }} />;
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

/**
 * O texto com forma: tópicos, listas e etiquetas (as regras estão em texto.ts).
 * `paragrafo`: explicação do ⓘ, escrita num parágrafo só; vira uma frase por linha antes.
 */
export default function Texto({ texto, paragrafo = false }: { texto: string; paragrafo?: boolean }) {
  return (
    <div className="texto">
      {blocos(paragrafo ? frases(texto) : texto, paragrafo).map((b, i) => (
        <div key={i} className={`bloco ${b.tipo}`}>
          {b.rotulo && <strong>{b.rotulo}</strong>}
          <Corpo c={b.corpo} />
        </div>
      ))}
    </div>
  );
}
