import { useEffect, useState } from 'react';
import { dicaDeImagem } from './imageHint.ts';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Texto abaixo do campo quando não há erro. */
  hint?: string;
};

/**
 * Campo de imagem com prévia. A prévia é o próprio teste: se o navegador
 * carrega a imagem, o Discord também carrega. Quando falha, mostramos por quê
 * — o Discord aceitaria a URL calado e trocaria pelo avatar padrão.
 */
export default function ImageField({ label, value, onChange, hint }: Props) {
  const [estado, setEstado] = useState<'vazio' | 'carregando' | 'ok' | 'erro'>('vazio');

  useEffect(() => {
    setEstado(value.trim() ? 'carregando' : 'vazio');
  }, [value]);

  return (
    <>
      <div className="capa-edit">
        <div className={`capa grande previa ${estado}`}>
          {estado === 'vazio' ? (
            '?'
          ) : (
            <img
              src={value}
              alt=""
              referrerPolicy="no-referrer" // alguns hosts recusam a imagem quando sabem a origem
              onLoad={() => setEstado('ok')}
              onError={() => setEstado('erro')}
            />
          )}
        </div>
        <label className="field wide">
          <span>{label}</span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      </div>

      {estado === 'erro' ? (
        <p className="hint err break">{dicaDeImagem(value)}</p>
      ) : estado === 'ok' ? (
        <p className="hint">Imagem carregou. É assim que ela vai aparecer.</p>
      ) : (
        hint && <p className="hint">{hint}</p>
      )}
    </>
  );
}
