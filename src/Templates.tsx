import { useState } from 'react';
import type { Field, FieldType, Template } from './store.ts';
import { EXAMPLE, decodeTemplate, encodeTemplate, slug, uid, unknownTargets } from './store.ts';
import ImageField from './ImageField.tsx';
import Foto from './Foto.tsx';

const conta = (n: number, um: string, muitos = `${um}s`) => `${n} ${n === 1 ? um : muitos}`;

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
  /** Renomear passa pelo App: ele também move os valores já preenchidos nas fichas. */
  onRenameField: (templateId: string, sectionId: string, fieldId: string, label: string) => void;
};

export default function Templates({ templates, onSet, inUse, onRenameField }: Props) {
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
        onRename={(sectionId, fieldId, label) => onRenameField(current.id, sectionId, fieldId, label)}
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
            <Foto src={t.image} nome={t.name} />
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
  onRename,
  notice,
}: {
  t: Template;
  onChange: (t: Template) => void;
  onBack: () => void;
  onShare: () => void;
  onRename: (sectionId: string, fieldId: string, label: string) => void;
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
        <ImageField
          label="Imagem do sistema"
          value={t.image ?? ''}
          onChange={(image) => onChange({ ...t, image })}
          hint="Vai junto no link que você manda pros jogadores. Sem ela, a lista mostra as iniciais do nome."
        />
      </section>

      {t.sections.map((sec) => (
        <section key={sec.id}>
          <div className="bar">
            <input className="flat" value={sec.title} onChange={(e) => patchSection(sec.id, { title: e.target.value })} />
            <button className="icon" title="Apagar seção" onClick={() => setSections(t.sections.filter((s) => s.id !== sec.id))}>✕</button>
          </div>

          {/* key por posição, não por id: o id muda a cada tecla ao renomear,
              e uma key nova remontaria o input, roubando o foco de quem digita. */}
          {sec.fields.map((f, i) => (
            <div key={i} className="edit">
              <input
                className="flat grow"
                value={f.label}
                onChange={(e) => onRename(sec.id, f.id, e.target.value)}
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
            <input
              className="flat mono grow"
              placeholder="preencher: @forca @destreza…"
              value={r.assign ?? ''}
              onChange={(e) => onChange({ ...t, rolls: t.rolls.map((x) => (x.id === r.id ? { ...x, assign: e.target.value } : x)) })}
            />
            {unknownTargets(r.assign, t).length > 0 && (
              <p className="hint err break">
                Não existe neste sistema: {unknownTargets(r.assign, t).map((id) => `@${id}`).join(', ')}
              </p>
            )}
          </div>
        ))}
        <button className="add" onClick={() => onChange({ ...t, rolls: [...t.rolls, { id: uid(), label: 'Nova rolagem', notation: 'd20' }] })}>
          + rolagem
        </button>
      </section>
    </>
  );
}
