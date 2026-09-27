import { useState } from 'react';
import { uid, type Musica as Trilha, type State } from './store.ts';

type Props = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  /** Id da trilha tocando: fica no App pra não se perder ao trocar de aba. */
  tocando: string | null;
  setTocando: (id: string | null) => void;
  avisar: (label: string, notation: string, text: string, error?: boolean) => void;
};

// Comandos do Jockie Music (prefixo padrão "m!"). Tocar usa --now: troca na hora, sem fila.
// O app só copia: o Jockie ignora webhook e entra no canal de voz de quem
// mandou o comando, então o comando tem que sair da conta do mestre.
const CONTROLES = [
  ['Pausar', 'pause'],
  ['Continuar', 'resume'],
  ['Parar', 'stop'],
] as const;

export default function Musica({ state, setState, tocando, setTocando, avisar }: Props) {
  const [nome, setNome] = useState('');
  const [link, setLink] = useState('');
  const musicas = state.musicas ?? [];
  const prefixo = state.prefixoMusica ?? 'm!';
  const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));

  // Devolve se copiou. Sem permissão de área de transferência, o aviso mostra o comando pra copiar à mão.
  async function copiar(rotulo: string, comando: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(comando);
      avisar(rotulo, comando, 'Copiado. Cole no canal do Jockie, com você num canal de voz.');
      return true;
    } catch {
      avisar(rotulo, comando, 'Não deu pra copiar sozinho: copie o comando acima e cole no Discord.', true);
      return false;
    }
  }

  const tocar = async (m: Trilha) => {
    if (await copiar(m.nome, `${prefixo}play ${m.link} --now`)) setTocando(m.id);
  };

  return (
    <>
      <h1>Música</h1>

      <section>
        <h2>Trilhas</h2>
        {musicas.length === 0 && <p className="hint">Nenhuma trilha ainda. Salve a primeira aqui embaixo.</p>}
        {musicas.map((m) => (
          <div key={m.id} className={tocando === m.id ? 'row on' : 'row'}>
            <button className="pick" aria-pressed={tocando === m.id} onClick={() => tocar(m)}>
              <strong>{tocando === m.id ? `▶ ${m.nome}` : m.nome}</strong>
              <small>{m.link}</small>
            </button>
            <button
              className="icon"
              title="Apagar"
              onClick={() => set({ musicas: musicas.filter((x) => x.id !== m.id) })}
            >✕</button>
          </div>
        ))}
        <div className="controles">
          {CONTROLES.map(([rotulo, cmd]) => (
            <button
              key={cmd}
              className="add"
              onClick={async () => {
                if ((await copiar(rotulo, prefixo + cmd)) && cmd === 'stop') setTocando(null);
              }}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Salvar trilha</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const l = link.trim();
            if (!l) return;
            set({ musicas: [...musicas, { id: uid(), nome: nome.trim() || l, link: l }] });
            setNome('');
            setLink('');
          }}
        >
          <label className="field wide">
            <span>Nome</span>
            <input placeholder="Combate, Taverna, Tensão…" value={nome} onChange={(e) => setNome(e.target.value)} />
          </label>
          <label className="field wide">
            <span>Link ou busca</span>
            <input
              placeholder="https://youtube.com/… ou demon slayer ost"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
          <button className="roll compact" disabled={!link.trim()}>Salvar</button>
        </form>
      </section>

      <section>
        <h2>Como toca</h2>
        <p className="hint">
          Tocar numa trilha copia o comando. Cole no canal do Jockie Music e envie, estando num canal de voz: ele entra
          onde você está. Não dá pra mandar pelo app, porque o Jockie não obedece webhook.
        </p>
        <label className="field">
          <span>Prefixo do bot</span>
          <input type="text" value={prefixo} onChange={(e) => set({ prefixoMusica: e.target.value })} />
        </label>
        <p className="hint">
          Tocar manda <code>{prefixo}play link --now</code>, que troca a música na hora em vez de pôr na fila.
        </p>
      </section>
    </>
  );
}
