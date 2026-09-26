import { useState } from 'react';
import type { Character, Template } from './store.ts';
import { explicar, formatMod, modifierOf } from './store.ts';
import Foto from './Foto.tsx';

type Props = {
  template: Template;
  character: Character;
  onChange: (patch: Partial<Character>) => void;
  onRoll: (label: string, notation: string, assign?: string) => void;
};

export default function Sheet({ template, character, onChange, onRoll }: Props) {
  const [avulsa, setAvulsa] = useState('');
  // Uma explicação aberta por vez: a do campo ou da rolagem cujo ⓘ foi tocado.
  const [aberto, setAberto] = useState<string | null>(null);
  const alterna = (id: string) => setAberto((a) => (a === id ? null : id));

  const setValue = (id: string, v: string | boolean) =>
    onChange({ values: { ...character.values, [id]: v } });

  return (
    <>
      <div className="cabeca">
        <Foto src={character.avatarUrl} nome={character.name || 'Sem nome'} grande />
        <div className="cabeca-txt">
          <input
            className="name"
            placeholder="Nome do personagem"
            value={character.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
          <p className="hint sys">{template.name}</p>
        </div>
      </div>

      {/* No PC largo: campos em colunas à esquerda, rolagens fixas à direita. */}
      <div className="ficha">
        <div className="campos">
          {template.sections.map((sec) => (
            <section key={sec.id}>
              <h2>{sec.title}</h2>
              {sec.fields.length === 0 && <p className="hint">Nenhum campo ainda.</p>}
              {sec.fields.map((f) => (
                <label key={f.id} className={f.type === 'textarea' ? 'field wide' : 'field'}>
                  <span className="rotulo">
                    {f.label}
                    {f.desc && <Info aberto={aberto === f.id} onClick={() => alterna(f.id)} nome={f.label} />}
                  </span>
                  {f.type === 'textarea' ? (
                    <textarea
                      value={String(character.values[f.id] ?? '')}
                      onChange={(e) => setValue(f.id, e.target.value)}
                    />
                  ) : f.type === 'attr' ? (
                    <span className="attr">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={String(character.values[f.id] ?? '')}
                        onChange={(e) => setValue(f.id, e.target.value)}
                      />
                      <b className="mod" title="modificador">
                        {(() => {
                          const m = modifierOf(character.values[f.id], template.modRule);
                          return m === null ? '—' : formatMod(m);
                        })()}
                      </b>
                    </span>
                  ) : f.type === 'check' ? (
                    <input
                      type="checkbox"
                      checked={!!character.values[f.id]}
                      onChange={(e) => setValue(f.id, e.target.checked)}
                    />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      inputMode={f.type === 'number' ? 'numeric' : undefined}
                      value={String(character.values[f.id] ?? '')}
                      onChange={(e) => setValue(f.id, e.target.value)}
                    />
                  )}
                  {aberto === f.id && <p className="desc">{f.desc}</p>}
                </label>
              ))}
            </section>
          ))}
        </div>

        <section className="rolagens">
          <h2>Rolagens</h2>
          {template.rolls.length === 0 && <p className="hint">Nenhuma rolagem neste sistema ainda.</p>}
          <div className="grid">
            {template.rolls.map((r) => (
              <div key={r.id} className={aberto === r.id ? 'rolagem aberta' : 'rolagem'}>
                <button className="roll" onClick={() => onRoll(r.label, r.notation, r.assign)}>
                  <span>{r.label}</span>
                  <small>{r.notation}</small>
                </button>
                <Info aberto={aberto === r.id} onClick={() => alterna(r.id)} nome={r.label} />
                {aberto === r.id && (
                  <div className="desc">
                    {r.desc && <p>{r.desc}</p>}
                    <p>
                      <strong>Conta:</strong> <code>{explicar(r.notation, template, character.values)}</code>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            className="avulsa"
            onSubmit={(e) => {
              e.preventDefault();
              if (!avulsa.trim()) return;
              onRoll('Avulsa', avulsa.trim());
            }}
          >
            <input placeholder="Rolagem avulsa: 2d6+1" value={avulsa} onChange={(e) => setAvulsa(e.target.value)} />
            <button className="roll compact">Rolar</button>
          </form>
        </section>
      </div>
    </>
  );
}

/** O ⓘ: mostra e esconde a explicação ao lado do que ele explica. */
function Info({ aberto, onClick, nome }: { aberto: boolean; onClick: () => void; nome: string }) {
  return (
    <button
      type="button"
      className={aberto ? 'info on' : 'info'}
      aria-expanded={aberto}
      aria-label={`Explicar ${nome}`}
      title="O que é isto?"
      onClick={(e) => {
        e.preventDefault(); // dentro do <label>, o clique iria para o campo
        onClick();
      }}
    >
      i
    </button>
  );
}
