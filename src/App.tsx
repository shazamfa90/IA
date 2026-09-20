import { useEffect, useRef, useState } from 'react';
import { resolve, roll } from './dice.ts';
import { postRoll } from './discord.ts';
import { pushSheet, sheetSignature } from './liveSheet.ts';
import ImageField from './ImageField.tsx';
import Sheet from './Sheet.tsx';
import Characters from './Characters.tsx';
import Templates from './Templates.tsx';
import {
  DEFAULT_GM_WEBHOOK,
  DEFAULT_WEBHOOK,
  THEMES,
  decodeTemplate,
  load,
  newCharacter,
  migrateValues,
  newProfile,
  renameField,
  save,
  type Character,
  type Profile,
  type State,
} from './store.ts';

const TABS = [
  ['ficha', 'Ficha'],
  ['personagens', 'Personagens'],
  ['sistemas', 'Sistemas'],
  ['sessao', 'Perfil'],
] as const;
type Tab = (typeof TABS)[number][0];

type Part = { detail: string; total: number };
type Result = { id: number; label: string; notation: string; text?: string; parts?: Part[]; error?: boolean };

let seq = 0;
const result = (r: Omit<Result, 'id'>): Result => ({ ...r, id: ++seq });

export default function App() {
  const [state, setState] = useState<State>(load);
  const [tab, setTab] = useState<Tab>('ficha');
  const [last, setLast] = useState<Result | null>(null);

  useEffect(() => save(state), [state]);

  const profile = state.profiles.find((p) => p.id === state.currentProfileId) ?? state.profiles[0];

  // Tema e cor vivem no <html>, então valem pra página inteira sem prop drilling.
  useEffect(() => {
    document.documentElement.dataset.theme = profile.theme;
    document.documentElement.style.setProperty('--accent', profile.accent);
  }, [profile.theme, profile.accent]);

  // Link de ficha compartilhado pelo mestre: #t=<template>
  useEffect(() => {
    const code = location.hash.startsWith('#t=') ? location.hash.slice(3) : '';
    if (!code) return;
    history.replaceState(null, '', location.pathname); // não reimporta no refresh
    try {
      const t = decodeTemplate(code);
      setState((s) => ({ ...s, templates: [...s.templates, t] }));
      setTab('sistemas');
      setLast(result({ label: 'Sistema importado', notation: t.name, text: 'Crie um personagem em Personagens.' }));
    } catch {
      setLast(result({ label: 'Link inválido', notation: '', text: 'Peça o link de novo pro mestre.', error: true }));
    }
  }, []);

  const mine = state.characters.filter((c) => c.profileId === profile.id);
  // Cai na primeira ficha do perfil: trocar de perfil, apagar um, ou abrir com
  // um currentId de outro perfil salvo nunca deve mostrar a tela vazia à toa.
  const character = mine.find((c) => c.id === state.currentId) ?? mine[0] ?? null;
  const template = character ? state.templates.find((t) => t.id === character.templateId) ?? null : null;

  // Edita a ficha que está aberta, não `currentId`: ele pode estar defasado
  // e apontar pra ficha de outro perfil.
  const patchCharacter = (patch: Partial<Character>) =>
    setState((s) => ({
      ...s,
      characters: s.characters.map((c) => (c.id === character?.id ? { ...c, ...patch } : c)),
    }));

  // --- ficha viva no canal do mestre -------------------------------------
  // Guarda o que já foi enviado por personagem: salvar o messageId muda o
  // objeto e reentra neste efeito, o que sem esta trava viraria laço infinito.
  const enviado = useRef<Record<string, string>>({});
  const [erroFicha, setErroFicha] = useState('');

  useEffect(() => {
    if (!state.gmWebhookUrl || !character || !template || !character.name.trim()) return;
    const sig = sheetSignature(template, character);
    if (enviado.current[character.id] === sig) return;

    // Espera a digitação parar: o Discord limita requisições por webhook.
    const timer = setTimeout(async () => {
      try {
        const id = await pushSheet(state.gmWebhookUrl, template, character);
        enviado.current[character.id] = sig;
        setErroFicha('');
        if (id !== character.messageId) patchCharacter({ messageId: id });
      } catch (e) {
        setErroFicha((e as Error).message); // sem assinatura gravada: tenta de novo na próxima edição
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [state.gmWebhookUrl, character, template]);

  async function doRoll(label: string, notation: string) {
    // A mesa vê a notação já resolvida (d20+4), não a da ficha (d20+@forca).
    const values = character?.values ?? {};
    const expr = resolve(notation, values);
    let rolls;
    try {
      rolls = roll(notation, values);
    } catch (e) {
      setLast(result({ label, notation: expr, text: (e as Error).message, error: true }));
      return;
    }

    const parts = rolls.map((r) => ({ detail: r.detail.replace(/~~(\d+)~~/g, '$1̶'), total: r.total }));
    setLast(result({ label, notation: expr, parts }));

    if (!state.webhookUrl || !character) return;
    try {
      await postRoll(state.webhookUrl, character, label, expr, rolls);
    } catch (e) {
      setLast(result({ label, notation: expr, parts, text: `não postou: ${(e as Error).message}`, error: true }));
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
                const c = newCharacter(templateId, profile.id);
                return { ...s, characters: [...s.characters, c], currentId: c.id };
              })
            }
          />
        ))}

      {tab === 'personagens' && (
        <Characters
          characters={mine}
          profileId={profile.id}
          templates={state.templates}
          currentId={state.currentId}
          onPick={(id) => {
            setState((s) => ({ ...s, currentId: id }));
            setTab('ficha');
          }}
          // `mine` só traz as fichas deste perfil: recoloca as dos outros ao salvar.
          onSet={(characters, currentId) =>
            setState((s) => ({
              ...s,
              characters: [...s.characters.filter((c) => c.profileId !== profile.id), ...characters],
              currentId: currentId === undefined ? s.currentId : currentId ?? null,
            }))
          }
        />
      )}

      {tab === 'sistemas' && (
        <Templates
          templates={state.templates}
          onSet={(templates) => setState((s) => ({ ...s, templates }))}
          inUse={(id) => state.characters.filter((c) => c.templateId === id).length}
          // O @id segue o rótulo; as fichas deste sistema levam o valor junto.
          onRenameField={(templateId, sectionId, fieldId, label) =>
            setState((s) => {
              const alvo = s.templates.find((t) => t.id === templateId);
              if (!alvo) return s;
              const { template, oldId, newId } = renameField(alvo, sectionId, fieldId, label);
              return {
                ...s,
                templates: s.templates.map((t) => (t.id === templateId ? template : t)),
                characters: s.characters.map((c) =>
                  c.templateId === templateId ? { ...c, values: migrateValues(c.values, oldId, newId) } : c,
                ),
              };
            })
          }
        />
      )}

      {tab === 'sessao' && (
        <Sessao
          state={state}
          setState={setState}
          profile={profile}
          character={character}
          patchCharacter={patchCharacter}
          erroFicha={erroFicha}
        />
      )}

      {last && (
        // key: remonta a cada rolagem pra animação tocar de novo.
        <aside key={last.id} className={last.error ? 'result err' : 'result'} onClick={() => setLast(null)}>
          <strong>{last.label}</strong> {last.notation && <code>{last.notation}</code>}
          <div>
            {last.parts?.map((p, i) => (
              <span key={i}>
                {i > 0 && '   '}
                {p.detail} = <span className="total">{p.total}</span>
              </span>
            ))}
            {last.parts && last.text && '  —  '}
            {last.text}
          </div>
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
  profile,
  character,
  patchCharacter,
  erroFicha,
}: {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  profile: Profile;
  character: Character | null;
  patchCharacter: (patch: Partial<Character>) => void;
  erroFicha: string;
}) {
  const patchProfile = (patch: Partial<Profile>) =>
    setState((s) => ({ ...s, profiles: s.profiles.map((p) => (p.id === profile.id ? { ...p, ...patch } : p)) }));

  const switchTo = (id: string) => setState((s) => ({ ...s, currentProfileId: id }));

  function addProfile() {
    const p = newProfile(`Jogador ${state.profiles.length + 1}`);
    setState((s) => ({ ...s, profiles: [...s.profiles, p], currentProfileId: p.id, currentId: null }));
  }

  function removeProfile() {
    const n = state.characters.filter((c) => c.profileId === profile.id).length;
    if (!confirm(`Apagar o perfil "${profile.name}" e ${n === 1 ? 'a ficha dele' : `as ${n} fichas dele`}?`)) return;
    setState((s) => {
      const rest = s.profiles.filter((p) => p.id !== profile.id);
      return {
        ...s,
        profiles: rest,
        currentProfileId: rest[0].id,
        characters: s.characters.filter((c) => c.profileId !== profile.id),
        currentId: null,
      };
    });
  }

  return (
    <>
      <h1>Perfil</h1>
      <section>
        <h2>Quem está usando</h2>
        <div className="grid">
          {state.profiles.map((p) => (
            <button key={p.id} className="roll" onClick={() => switchTo(p.id)}>
              {p.name}
              <small>{p.id === profile.id ? 'em uso' : `${state.characters.filter((c) => c.profileId === p.id).length} fichas`}</small>
            </button>
          ))}
        </div>
        <label className="field wide">
          <span>Nome do perfil</span>
          <input value={profile.name} onChange={(e) => patchProfile({ name: e.target.value })} />
        </label>
        <div className="grid">
          <button className="add" onClick={addProfile}>+ novo perfil</button>
          {state.profiles.length > 1 && (
            <button className="add" onClick={removeProfile}>Apagar este perfil</button>
          )}
        </div>
        <p className="hint">
          Perfis são deste aparelho: separam as fichas e a aparência de cada pessoa, sem senha e sem servidor.
        </p>
      </section>

      <section>
        <h2>Aparência</h2>
        <div className="temas">
          {THEMES.map((t) => (
            <button
              key={t}
              title={t}
              aria-label={`Tema ${t}`}
              aria-pressed={profile.theme === t}
              data-theme={t}
              className={profile.theme === t ? 'tema on' : 'tema'}
              onClick={() => patchProfile({ theme: t })}
            >
              <i style={{ background: 'var(--bg)' }} />
              <i style={{ background: 'var(--card)' }} />
              <i style={{ background: 'var(--accent)' }} />
            </button>
          ))}
        </div>
        <label className="field">
          <span>Cor de destaque</span>
          <input type="color" value={profile.accent} onChange={(e) => patchProfile({ accent: e.target.value })} />
        </label>
      </section>

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
        {DEFAULT_WEBHOOK &&
          (state.webhookUrl === DEFAULT_WEBHOOK ? (
            <p className="hint">Usando o canal padrão da mesa. Só mexa aqui pra apontar pra outro canal.</p>
          ) : (
            <button className="add" onClick={() => setState((s) => ({ ...s, webhookUrl: DEFAULT_WEBHOOK }))}>
              Voltar pro canal padrão da mesa
            </button>
          ))}
        <p className="hint">
          Trate como senha: quem tiver essa URL posta no canal com qualquer nome. Fica só neste aparelho.
        </p>
      </section>

      <section>
        <h2>Ficha viva</h2>
        <p className="hint">
          Num canal só do mestre, cada personagem ocupa uma mensagem que se reescreve sozinha conforme a ficha muda —
          assim o mestre acompanha a mesa sem pedir print. Atualiza alguns segundos depois de você parar de digitar.
        </p>
        <label className="field wide">
          <span>Webhook do canal do mestre</span>
          <input
            type="password"
            placeholder="deixe vazio pra desligar"
            value={state.gmWebhookUrl}
            onChange={(e) => setState((s) => ({ ...s, gmWebhookUrl: e.target.value }))}
          />
        </label>
        {erroFicha && <p className="hint err">{erroFicha}</p>}
        {DEFAULT_GM_WEBHOOK && state.gmWebhookUrl !== DEFAULT_GM_WEBHOOK && (
          <button className="add" onClick={() => setState((s) => ({ ...s, gmWebhookUrl: DEFAULT_GM_WEBHOOK }))}>
            Voltar pro canal do mestre da mesa
          </button>
        )}
      </section>

      <section>
        <h2>Aparência no canal</h2>
        {character ? (
          <ImageField
            label={`Avatar de ${character.name || 'personagem sem nome'}`}
            value={character.avatarUrl}
            onChange={(avatarUrl) => patchCharacter({ avatarUrl })}
            hint="Serve qualquer endereço direto de imagem — .jpg, .png, .gif ou .webp, de qualquer site. O que não serve é link de página: de um pin do Pinterest, por exemplo, copie o endereço da imagem, não o do pin."
          />
        ) : (
          <p className="hint">Abra uma ficha pra definir o avatar dela.</p>
        )}
      </section>
    </>
  );
}
