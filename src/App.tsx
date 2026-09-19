import { useEffect, useState } from 'react';
import { roll } from './dice.ts';
import { postRoll } from './discord.ts';
import { load, save, EXAMPLE, type State, type Template } from './store.ts';

type Result = { label: string; notation: string; text: string; error?: boolean };

export default function App() {
  const [state, setState] = useState<State>(load);
  const [tab, setTab] = useState<'ficha' | 'template' | 'sessao'>('ficha');
  const [last, setLast] = useState<Result | null>(null);

  useEffect(() => save(state), [state]);

  const setValue = (id: string, v: string | boolean) =>
    setState((s) => ({ ...s, character: { ...s.character, values: { ...s.character.values, [id]: v } } }));

  async function doRoll(label: string, notation: string) {
    let rolls;
    try {
      rolls = roll(notation, state.character.values);
    } catch (e) {
      setLast({ label, notation, text: (e as Error).message, error: true });
      return;
    }

    const text = rolls.map((r) => `${r.detail.replace(/~~(\d+)~~/g, '$1̶')} = ${r.total}`).join('   ');
    setLast({ label, notation, text });

    if (!state.webhookUrl) return;
    try {
      await postRoll(state.webhookUrl, state.character, label, notation, rolls);
    } catch (e) {
      setLast({ label, notation, text: `${text}  —  não postou: ${(e as Error).message}`, error: true });
    }
  }

  return (
    <main>
      <nav>
        {(['ficha', 'template', 'sessao'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'tab on' : 'tab'}>
            {t === 'sessao' ? 'sessão' : t}
          </button>
        ))}
      </nav>

      {tab === 'ficha' && (
        <Ficha state={state} setState={setState} setValue={setValue} onRoll={doRoll} />
      )}
      {tab === 'template' && <TemplateEditor state={state} setState={setState} />}
      {tab === 'sessao' && <Sessao state={state} setState={setState} />}

      {last && (
        <aside className={last.error ? 'result err' : 'result'}>
          <strong>{last.label}</strong> <code>{last.notation}</code>
          <div>{last.text}</div>
        </aside>
      )}
    </main>
  );
}

function Ficha({
  state,
  setState,
  setValue,
  onRoll,
}: {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  setValue: (id: string, v: string | boolean) => void;
  onRoll: (label: string, notation: string) => void;
}) {
  const { template, character } = state;
  return (
    <>
      <h1>{template.name}</h1>
      <input
        className="name"
        placeholder="Nome do personagem"
        value={character.name}
        onChange={(e) => setState((s) => ({ ...s, character: { ...s.character, name: e.target.value } }))}
      />

      {template.sections.map((sec) => (
        <section key={sec.title}>
          <h2>{sec.title}</h2>
          {sec.fields.map((f) => (
            <label key={f.id} className={f.type === 'textarea' ? 'field wide' : 'field'}>
              <span>{f.label}</span>
              {f.type === 'textarea' ? (
                <textarea value={String(character.values[f.id] ?? '')} onChange={(e) => setValue(f.id, e.target.value)} />
              ) : f.type === 'check' ? (
                <input type="checkbox" checked={!!character.values[f.id]} onChange={(e) => setValue(f.id, e.target.checked)} />
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
        <div className="rolls">
          {template.rolls.map((r) => (
            <button key={r.label} className="roll" onClick={() => onRoll(r.label, r.notation)}>
              {r.label}
              <small>{r.notation}</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function TemplateEditor({ state, setState }: { state: State; setState: React.Dispatch<React.SetStateAction<State>> }) {
  const [draft, setDraft] = useState(() => JSON.stringify(state.template, null, 2));
  const [error, setError] = useState('');

  function apply() {
    try {
      const t = JSON.parse(draft) as Template;
      if (!t.name || !Array.isArray(t.sections) || !Array.isArray(t.rolls)) {
        throw new Error('Precisa ter "name", "sections" e "rolls".');
      }
      setState((s) => ({ ...s, template: t }));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <h1>Template</h1>
      <p className="hint">
        Define as seções, os campos e os botões de rolagem. Em <code>notation</code>, <code>@id</code> lê o campo com
        aquele <code>id</code> — ex.: <code>d20+@forca</code>.
      </p>
      <textarea className="json" value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} />
      {error && <p className="err">{error}</p>}
      <div className="rolls">
        <button className="roll" onClick={apply}>Aplicar</button>
        <button className="roll" onClick={() => setDraft(JSON.stringify(EXAMPLE, null, 2))}>Restaurar exemplo</button>
      </div>
    </>
  );
}

function Sessao({ state, setState }: { state: State; setState: React.Dispatch<React.SetStateAction<State>> }) {
  return (
    <>
      <h1>Sessão</h1>
      <p className="hint">
        No Discord: <em>Editar canal → Integrações → Webhooks → Novo webhook → Copiar URL</em>. As rolagens aparecem no
        canal com o nome e o avatar do personagem.
      </p>
      <label className="field wide">
        <span>URL do webhook</span>
        <input
          type="password"
          placeholder="https://discord.com/api/webhooks/..."
          value={state.webhookUrl}
          onChange={(e) => setState((s) => ({ ...s, webhookUrl: e.target.value }))}
        />
      </label>
      <label className="field wide">
        <span>Avatar do personagem (URL)</span>
        <input
          placeholder="https://..."
          value={state.character.avatarUrl}
          onChange={(e) => setState((s) => ({ ...s, character: { ...s.character, avatarUrl: e.target.value } }))}
        />
      </label>
      <p className="hint">
        Quem tiver essa URL posta no canal como se fosse a ficha. Trate como senha: ela fica só neste aparelho, mas não
        a coloque em print nem em repositório.
      </p>
    </>
  );
}
