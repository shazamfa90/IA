import { useState } from 'react';
import type { Field, FieldType, Template } from './store.ts';
import { EXAMPLE, decodeTemplate, encodeTemplate, slug, uid } from './store.ts';

const conta = (n: number, um: string, muitos = `${um}s`) => `${n} ${n === 1 ? um : muitos}`;

const iniciais = (nome: string) =>
  nome.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?';

/** Capa do sistema. Sem imagem, ou se a URL falhar, mostra as iniciais do nome. */
function Capa({ t, grande }: { t: Template; grande?: boolean }) {
  const [quebrou, setQuebrou] = useState(false);
  const cls = grande ? 'capa grande' : 'capa';
  if (!t.image || quebrou) return <div className={cls}>{iniciais(t.name)}</div>;
  return <img className={cls} src={t.image} alt="" onError={() => setQuebrou(true)} />;
}

const TYPES: { v: FieldType; label: string }[] = [
  { v: 'number', label: 'Número' },
  { v: 'text', label: 'Texto' },
  { v: 'textarea', label: 'Texto longo' },
  { v: 'check', label: 'Marcador' },
];

type Props = {
  templates: Template[];
  onSet: (templates: Template[]) => void;
  inUse: (templateId: string) => number;
};

export default function Templates({ templates, onSet, inUse }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [link, setLink] = useState('');

  const current = templates.find((t) => t.id === editing);
  const update = (t: Template) => onSet(templates.map((x) => (x.id === t.id ? t : x)));

  function importLink() {
    try {
      const code = link.trim().split('#t=').pop() ?? '';
      const t = decodeTemplate(code);
      onSet([...templates, t]);
      setLink('');
      setNotice(`"${t.name}" importado.`);
    } catch {
      setNotice('Link inválido. Cole o link inteiro que o mestre enviou.');
    }
  }

  async function share(t: Template) {
    const url = `${location.origin}${location.pathname}#t=${encodeTemplate(t)}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Link copiado. Mande pros jogadores.');
    } catch {
      setNotice(url); // clipboard bloqueado (http, permissão): mostra pra copiar na mão
    }
  }

  function remove(t: Template) {
    const n = inUse(t.id);
    if (n > 0) return setNotice(`"${t.name}" está em uso por ${conta(n, 'personagem', 'personagens')}. Apague as fichas primeiro.`);
    if (!confirm(`Apagar o sistema "${t.name}"?`)) return;
    onSet(templates.filter((x) => x.id !== t.id));
    if (editing === t.id) setEditing(null);
  }

  if (current) {
    return (
      <Editor
        t={current}
        onChange={update}
        onBack={() => setEditing(null)}
        onShare={() => share(current)}
        notice={notice}
      />
    );
  }

  return (
    <>
      <h1>Sistemas</h1>
      <section>
        {templates.map((t) => (
          <div key={t.id} className="row">
            <Capa t={t} />
            <button className="pick" onClick={() => setEditing(t.id)}>
              <strong>{t.name}</strong>
              <small>{conta(t.sections.reduce((n, s) => n + s.fields.length, 0), 'campo')} · {conta(t.rolls.length, 'rolagem', 'rolagens')}</small>
            </button>
            <button className="icon" title="Compartilhar" onClick={() => share(t)}>↗</button>
            <button className="icon" title="Apagar" onClick={() => remove(t)}>✕</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Adicionar</h2>
        <div className="grid">
          <button
            className="roll"
            onClick={() => {
              const t = { id: uid(), name: 'Novo sistema', sections: [], rolls: [] };
              onSet([...templates, t]);
              setEditing(t.id);
            }}
          >
            Do zero<small>ficha em branco</small>
          </button>
          <button className="roll" onClick={() => onSet([...templates, EXAMPLE()])}>
            Exemplo d20<small>pra usar de base</small>
          </button>
        </div>
        <form className="avulsa" onSubmit={(e) => { e.preventDefault(); importLink(); }}>
          <input placeholder="Cole o link do mestre" value={link} onChange={(e) => setLink(e.target.value)} />
          <button className="roll compact">Importar</button>
        </form>
        {notice && <p className="hint break">{notice}</p>}
      </section>
    </>
  );
}

function Editor({
  t,
  onChange,
  onBack,
  onShare,
  notice,
}: {
  t: Template;
  onChange: (t: Template) => void;
  onBack: () => void;
  onShare: () => void;
  notice: string;
}) {
  const refs = t.sections.flatMap((s) => s.fields).map((f) => f.id);

  const setSections = (sections: Template['sections']) => onChange({ ...t, sections });
  const patchSection = (id: string, patch: Partial<Template['sections'][0]>) =>
    setSections(t.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  function addField(sectionId: string) {
    const f: Field = { id: slug('Campo', refs), label: 'Campo', type: 'number' };
    patchSection(sectionId, { fields: [...(t.sections.find((s) => s.id === sectionId)?.fields ?? []), f] });
  }

  return (
    <>
      <div className="bar">
        <button className="icon" onClick={onBack}>←</button>
        <input className="name flat" value={t.name} onChange={(e) => onChange({ ...t, name: e.target.value })} />
        <button className="icon" title="Compartilhar" onClick={onShare}>↗</button>
      </div>
      {notice && <p className="hint break">{notice}</p>}

      <section>
        <h2>Capa</h2>
        <div className="capa-edit">
          <Capa t={t} grande />
          <label className="field wide">
            <span>Imagem do sistema (URL)</span>
            <input
              type="url"
              inputMode="url"
              placeholder="https://..."
              value={t.image ?? ''}
              onChange={(e) => onChange({ ...t, image: e.target.value })}
            />
          </label>
        </div>
        <p className="hint">Vai junto no link que você manda pros jogadores.</p>
      </section>

      {t.sections.map((sec) => (
        <section key={sec.id}>
          <div className="bar">
            <input className="flat" value={sec.title} onChange={(e) => patchSection(sec.id, { title: e.target.value })} />
            <button className="icon" title="Apagar seção" onClick={() => setSections(t.sections.filter((s) => s.id !== sec.id))}>✕</button>
          </div>

          {sec.fields.map((f) => (
            <div key={f.id} className="edit">
              <input
                className="flat grow"
                value={f.label}
                onChange={(e) =>
                  patchSection(sec.id, {
                    fields: sec.fields.map((x) => (x.id === f.id ? { ...x, label: e.target.value } : x)),
                  })
                }
              />
              <select
                value={f.type}
                onChange={(e) =>
                  patchSection(sec.id, {
                    fields: sec.fields.map((x) => (x.id === f.id ? { ...x, type: e.target.value as FieldType } : x)),
                  })
                }
              >
                {TYPES.map((o) => (
                  <option key={o.v} value={o.v}>{o.label}</option>
                ))}
              </select>
              <code className="ref">@{f.id}</code>
              <button
                className="icon"
                title="Apagar campo"
                onClick={() => patchSection(sec.id, { fields: sec.fields.filter((x) => x.id !== f.id) })}
              >✕</button>
            </div>
          ))}

          <button className="add" onClick={() => addField(sec.id)}>+ campo</button>
        </section>
      ))}

      <button className="add wide" onClick={() => setSections([...t.sections, { id: uid(), title: 'Nova seção', fields: [] }])}>
        + seção
      </button>

      <section>
        <h2>Rolagens</h2>
        {refs.length > 0 && (
          <p className="hint break">
            Campos disponíveis: {refs.map((r) => <code key={r}>@{r}</code>).reduce((a, b) => <>{a} {b}</>)}
          </p>
        )}
        {t.rolls.map((r) => (
          <div key={r.id} className="edit">
            <input
              className="flat grow"
              value={r.label}
              onChange={(e) => onChange({ ...t, rolls: t.rolls.map((x) => (x.id === r.id ? { ...x, label: e.target.value } : x)) })}
            />
            <input
              className="flat mono grow"
              value={r.notation}
              onChange={(e) => onChange({ ...t, rolls: t.rolls.map((x) => (x.id === r.id ? { ...x, notation: e.target.value } : x)) })}
            />
            <button className="icon" title="Apagar" onClick={() => onChange({ ...t, rolls: t.rolls.filter((x) => x.id !== r.id) })}>✕</button>
          </div>
        ))}
        <button className="add" onClick={() => onChange({ ...t, rolls: [...t.rolls, { id: uid(), label: 'Nova rolagem', notation: 'd20' }] })}>
          + rolagem
        </button>
      </section>
    </>
  );
}
