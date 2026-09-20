import Foto from './Foto.tsx';

/** Quantas imagens o perfil guarda. Passando disso, a mais antiga sai. */
const MAX = 8;

type Props = {
  /** Imagem em uso agora. */
  value: string;
  slots: string[];
  onChange: (v: string) => void;
  onSlots: (s: string[]) => void;
};

/**
 * Slots de imagem: guarda os avatares que a pessoa usa e troca entre eles num
 * toque, em vez de colar a URL de novo toda vez.
 */
export default function Slots({ value, slots, onChange, onSlots }: Props) {
  const atual = value.trim();
  const novo = Boolean(atual) && !slots.includes(atual);
  const guardar = (lista: string[]) => onSlots(lista.slice(-MAX));

  // Trocar guarda antes o que estava em uso: senão o primeiro toque num slot
  // apaga uma URL que deu trabalho pra achar, e não tem como voltar.
  const usar = (url: string) => {
    if (novo) guardar([...slots, atual]);
    onChange(url);
  };

  return (
    <div className="slots">
      {slots.map((url) => (
        <div key={url} className={url === atual ? 'slot on' : 'slot'}>
          <button onClick={() => usar(url)} title="Usar esta imagem" aria-label="Usar esta imagem">
            <Foto src={url} nome="?" />
          </button>
          <button
            className="x"
            onClick={() => onSlots(slots.filter((u) => u !== url))}
            title="Tirar do slot"
            aria-label="Tirar do slot"
          >
            ×
          </button>
        </div>
      ))}
      {novo && (
        <button className="slot novo" onClick={() => guardar([...slots, atual])} title="Guardar esta imagem num slot">
          +
        </button>
      )}
    </div>
  );
}
