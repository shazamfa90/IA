import { useState } from 'react';
import type { Character, Template } from './store.ts';
import Foto from './Foto.tsx';

type Props = {
  template: Template;
  character: Character;
  onChange: (patch: Partial<Character>) => void;
  onRoll: (label: string, notation: string, assign?: string) => void;
};

export default function Sheet({ template, character, onChange, onRoll }: Props) {
  const [avulsa, setAvulsa] = useState('');

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

      {template.sections.map((sec) => (
        <section key={sec.id}>
          <h2>{sec.title}</h2>
          {sec.fields.length === 0 && <p className="hint">Nenhum campo ainda.</p>}
          {sec.fields.map((f) => (
            <label key={f.id} className={f.type === 'textarea' ? 'field wide' : 'field'}>
              <span>{f.label}</span>
              {f.type === 'textarea' ? (
                <textarea
                  value={String(character.values[f.id] ?? '')}
                  onChange={(e) => setValue(f.id, e.target.value)}
                />
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
            </label>
          ))}
        </section>
      ))}

      <section>
        <h2>Rolagens</h2>
        {template.rolls.length === 0 && <p className="hint">Nenhuma rolagem neste sistema ainda.</p>}
        <div className="grid">
          {template.rolls.map((r) => (
            <button key={r.id} className="roll" onClick={() => onRoll(r.label, r.notation, r.assign)}>
              {r.label}
              <small>{r.notation}</small>
            </button>
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
    </>
  );
}
