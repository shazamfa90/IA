import { useState } from 'react';
import type { Character, Profile, Template } from './store.ts';
import { encodeFicha, newCharacter, uid } from './store.ts';
import Foto from './Foto.tsx';

type Props = {
  characters: Character[];
  profileId: string;
  profiles: Profile[];
  templates: Template[];
  currentId: string | null;
  onPick: (id: string) => void;
  onSet: (characters: Character[], currentId?: string) => void;
  /** Link de ficha ou de sistema colado à mão. Devolve se deu certo. */
  onImport: (link: string) => boolean;
};

export default function Characters({ characters, profileId, profiles, templates, currentId, onPick, onSet, onImport }: Props) {
  const [aviso, setAviso] = useState('');
  const [link, setLink] = useState('');
  const outros = profiles.filter((p) => p.id !== profileId);
  const nome = (c: Character) => c.name || 'Sem nome';

  function create(templateId: string) {
    const c = newCharacter(templateId, profileId);
    onSet([...characters, c]);
    onPick(c.id); // criar leva direto pra ficha nova
  }

  function duplicate(c: Character) {
    const copy = { ...c, id: uid(), name: `${nome(c)} (cópia)`, values: { ...c.values }, messageId: undefined };
    onSet([...characters, copy], copy.id);
  }

  function remove(c: Character) {
    if (!confirm(`Apagar "${nome(c)}"? Não dá pra desfazer.`)) return;
    const rest = characters.filter((x) => x.id !== c.id);
    onSet(rest, currentId === c.id ? rest[0]?.id : undefined);
  }

  async function enviar(c: Character) {
    const t = templates.find((t) => t.id === c.templateId);
    if (!t) return setAviso(`O sistema de "${nome(c)}" foi apagado, e sem ele a ficha não abre do outro lado.`);
    const url = `${location.origin}${location.pathname}#f=${encodeFicha(t, c)}`;
    try {
      await navigator.clipboard.writeText(url);
      setAviso(`Link de "${nome(c)}" copiado. Quem abrir recebe uma cópia da ficha, com o sistema junto.`);
    } catch {
      setAviso(url); // clipboard bloqueado (http, permissão): mostra pra copiar na mão
    }
  }

  // Mesmo aparelho: a ficha muda de dono, não é copiada — continua a mesma,
  // inclusive a mensagem dela no canal do mestre.
  function passar(c: Character, destino: string) {
    const p = profiles.find((p) => p.id === destino);
    if (!p) return;
    onSet(characters.map((x) => (x.id === c.id ? { ...x, profileId: p.id } : x)));
    setAviso(`"${nome(c)}" agora é do perfil ${p.name}.`);
  }

  return (
    <>
      <h1>Personagens</h1>
      <section>
        {characters.map((c) => {
          const t = templates.find((t) => t.id === c.templateId);
          return (
            <div key={c.id} className={c.id === currentId ? 'row on' : 'row'}>
              <Foto src={c.avatarUrl} nome={nome(c)} />
              <button className="pick" onClick={() => onPick(c.id)}>
                <strong>{nome(c)}</strong>
                <small>{t?.name ?? 'sistema apagado'}</small>
              </button>
              <button className="icon" title="Duplicar" onClick={() => duplicate(c)}>⧉</button>
              <button className="icon" title="Enviar link da ficha" onClick={() => enviar(c)}>↗</button>
              {outros.length > 0 && (
                <select
                  className="icon mover"
                  title="Passar para outro perfil"
                  aria-label="Passar para outro perfil"
                  value=""
                  onChange={(e) => passar(c, e.target.value)}
                >
                  <option value="">⇄</option>
                  {outros.map((p) => (
                    <option key={p.id} value={p.id}>Passar para {p.name}</option>
                  ))}
                </select>
              )}
              <button className="icon" title="Apagar" onClick={() => remove(c)}>✕</button>
            </div>
          );
        })}
        {characters.length === 0 && <p className="hint">Nenhum personagem. Crie um abaixo.</p>}
        {aviso && <p className="hint break">{aviso}</p>}
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

      <section>
        <h2>Importar</h2>
        <div className="avulsa">
          <input
            type="url"
            inputMode="url"
            placeholder="cole o link da ficha ou do sistema"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button className="roll compact" disabled={!link.trim()} onClick={() => onImport(link) && setLink('')}>
            Importar
          </button>
        </div>
        <p className="hint">
          O ↗ de cada ficha copia um link com ela e o sistema dela. Quem abrir o link, ou colar aqui, recebe uma cópia no
          perfil em uso — em qualquer aparelho.
        </p>
      </section>
    </>
  );
}
