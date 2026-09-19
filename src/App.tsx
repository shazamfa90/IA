import { useEffect, useState } from 'react';
import { resolve, roll } from './dice.ts';
import { postRoll } from './discord.ts';
import Sheet from './Sheet.tsx';
import Characters from './Characters.tsx';
import Templates from './Templates.tsx';
import { decodeTemplate, load, newCharacter, save, type Character, type State } from './store.ts';

const TABS = [
  ['ficha', 'Ficha'],
  ['personagens', 'Personagens'],
  ['sistemas', 'Sistemas'],
  ['sessao', 'Sessão'],
] as const;
type Tab = (typeof TABS)[number][0];

type Result = { label: string; notation: string; text: string; error?: boolean };

export default function App() {
  const [state, setState] = useState<State>(load);
  const [tab, setTab] = useState<Tab>('ficha');
  const [last, setLast] = useState<Result | null>(null);

  useEffect(() => save(state), [state]);

  // Link de ficha compartilhado pelo mestre: #t=<template>
  useEffect(() => {
    const code = location.hash.startsWith('#t=') ? location.hash.slice(3) : '';
    if (!code) return;
    history.replaceState(null, '', location.pathname); // não reimporta no refresh
    try {
      const t = decodeTemplate(code);
      setState((s) => ({ ...s, templates: [...s.templates, t] }));
      setTab('sistemas');
      setLast({ label: 'Sistema importado', notation: t.name, text: 'Crie um personagem em Personagens.' });
    } catch {
      setLast({ label: 'Link inválido', notation: '', text: 'Peça o link de novo pro mestre.', error: true });
    }
  }, []);

  const character = state.characters.find((c) => c.id === state.currentId) ?? null;
  const template = character ? state.templates.find((t) => t.id === character.templateId) ?? null : null;

  const patchCharacter = (patch: Partial<Character>) =>
    setState((s) => ({
      ...s,
      characters: s.characters.map((c) => (c.id === s.currentId ? { ...c, ...patch } : c)),
    }));

  async function doRoll(label: string, notation: string) {
    // A mesa vê a notação já resolvida (d20+4), não a da ficha (d20+@forca).
    const values = character?.values ?? {};
    const expr = resolve(notation, values);
    let rolls;
    try {
      rolls = roll(notation, values);
    } catch (e) {
      setLast({ label, notation: expr, text: (e as Error).message, error: true });
      return;
    }

    const text = rolls.map((r) => `${r.detail.replace(/~~(\d+)~~/g, '$1̶')} = ${r.total}`).join('   ');
    setLast({ label, notation: expr, text });

    if (!state.webhookUrl || !character) return;
    try {
      await postRoll(state.webhookUrl, character, label, expr, rolls);
    } catch (e) {
      setLast({ label, notation: expr, text: `${text}  —  não postou: ${(e as Error).message}`, error: true });
    }
  }

  return (
    <main>
      <nav>
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? 'tab on' : 'tab'}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'ficha' &&
        (character && template ? (
          <Sheet template={template} character={character} onChange={patchCharacter} onRoll={doRoll} />
        ) : (
          <Empty
            templates={state.templates}
            onCreate={(templateId) =>
              setState((s) => {
                const c = newCharacter(templateId);
                return { ...s, characters: [...s.characters, c], currentId: c.id };
              })
            }
          />
        ))}

      {tab === 'personagens' && (
        <Characters
          characters={state.characters}
          templates={state.templates}
          currentId={state.currentId}
          onPick={(id) => {
            setState((s) => ({ ...s, currentId: id }));
            setTab('ficha');
          }}
          onSet={(characters, currentId) =>
            setState((s) => ({ ...s, characters, currentId: currentId === undefined ? s.currentId : currentId ?? null }))
          }
        />
      )}

      {tab === 'sistemas' && (
        <Templates
          templates={state.templates}
          onSet={(templates) => setState((s) => ({ ...s, templates }))}
          inUse={(id) => state.characters.filter((c) => c.templateId === id).length}
        />
      )}

      {tab === 'sessao' && (
        <Sessao state={state} setState={setState} character={character} patchCharacter={patchCharacter} />
      )}

      {last && (
        <aside className={last.error ? 'result err' : 'result'} onClick={() => setLast(null)}>
          <strong>{last.label}</strong> {last.notation && <code>{last.notation}</code>}
          <div>{last.text}</div>
        </aside>
      )}
    </main>
  );
}

function Empty({ templates, onCreate }: { templates: State['templates']; onCreate: (id: string) => void }) {
  return (
    <>
      <h1>Nenhuma ficha aberta</h1>
      <section>
        <h2>Criar personagem</h2>
        {templates.length === 0 && <p className="hint">Crie um sistema na aba Sistemas primeiro.</p>}
        <div className="grid">
          {templates.map((t) => (
            <button key={t.id} className="roll" onClick={() => onCreate(t.id)}>
              {t.name}<small>criar ficha</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function Sessao({
  state,
  setState,
  character,
  patchCharacter,
}: {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  character: Character | null;
  patchCharacter: (patch: Partial<Character>) => void;
}) {
  return (
    <>
      <h1>Sessão</h1>
      <section>
        <h2>Canal do Discord</h2>
        <p className="hint">
          No Discord: <em>Editar canal → Integrações → Webhooks → Novo webhook → Copiar URL</em>. Vale pra mesa toda —
          cada jogador cola a mesma URL.
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
        <p className="hint">
          Trate como senha: quem tiver essa URL posta no canal com qualquer nome. Fica só neste aparelho.
        </p>
      </section>

      <section>
        <h2>Aparência no canal</h2>
        {character ? (
          <label className="field wide">
            <span>Avatar de {character.name || 'personagem sem nome'} (URL de imagem)</span>
            <input
              placeholder="https://..."
              value={character.avatarUrl}
              onChange={(e) => patchCharacter({ avatarUrl: e.target.value })}
            />
          </label>
        ) : (
          <p className="hint">Abra uma ficha pra definir o avatar dela.</p>
        )}
      </section>
    </>
  );
}
