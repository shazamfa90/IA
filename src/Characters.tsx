import type { Character, Template } from './store.ts';
import { newCharacter, uid } from './store.ts';
import Foto from './Foto.tsx';

type Props = {
  characters: Character[];
  profileId: string;
  templates: Template[];
  currentId: string | null;
  onPick: (id: string) => void;
  onSet: (characters: Character[], currentId?: string) => void;
};

export default function Characters({ characters, profileId, templates, currentId, onPick, onSet }: Props) {
  function create(templateId: string) {
    const c = newCharacter(templateId, profileId);
    onSet([...characters, c]);
    onPick(c.id); // criar leva direto pra ficha nova
  }

  function duplicate(c: Character) {
    const copy = { ...c, id: uid(), name: `${c.name || 'Sem nome'} (cópia)`, values: { ...c.values } };
    onSet([...characters, copy], copy.id);
  }

  function remove(c: Character) {
    if (!confirm(`Apagar "${c.name || 'Sem nome'}"? Não dá pra desfazer.`)) return;
    const rest = characters.filter((x) => x.id !== c.id);
    onSet(rest, currentId === c.id ? rest[0]?.id : undefined);
  }

  return (
    <>
      <h1>Personagens</h1>
      <section>
        {characters.map((c) => {
          const t = templates.find((t) => t.id === c.templateId);
          return (
            <div key={c.id} className={c.id === currentId ? 'row on' : 'row'}>
              <Foto src={c.avatarUrl} nome={c.name || 'Sem nome'} />
              <button className="pick" onClick={() => onPick(c.id)}>
                <strong>{c.name || 'Sem nome'}</strong>
                <small>{t?.name ?? 'sistema apagado'}</small>
              </button>
              <button className="icon" title="Duplicar" onClick={() => duplicate(c)}>⧉</button>
              <button className="icon" title="Apagar" onClick={() => remove(c)}>✕</button>
            </div>
          );
        })}
        {characters.length === 0 && <p className="hint">Nenhum personagem. Crie um abaixo.</p>}
      </section>

      <section>
        <h2>Novo personagem</h2>
        <div className="grid">
          {templates.map((t) => (
            <button key={t.id} className="roll" onClick={() => create(t.id)}>
              {t.name}
              <small>criar ficha</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
