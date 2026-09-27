import { useState } from 'react';
import { postComando } from './discord.ts';
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

  // Manda pelo webhook e copia o comando também: se o bot não atender o
  // webhook, o mestre cola no canal e pronto. Devolve se deu certo.
  async function mandar(rotulo: string, comando: string): Promise<boolean> {
    let copiou = true;
    try {
      await navigator.clipboard.writeText(comando);
    } catch {
      copiou = false;
    }
    const cola = copiou ? 'Comando copiado: é só colar no Discord.' : 'Copie o comando e cole no Discord.';
    if (!state.musicWebhookUrl) {
      avisar(rotulo, comando, `Sem webhook de música. ${cola}`);
      return true;
    }
    try {
      await postComando(state.musicWebhookUrl, comando);
      avisar(rotulo, comando, 'Enviado ao canal. Comando copiado também.');
      return true;
    } catch (e) {
      avisar(rotulo, comando, `não enviou: ${(e as Error).message} ${cola}`, true);
      return false;
    }
  }

  const tocar = async (m: Trilha) => {
    if (await mandar(m.nome, `${prefixo}play ${m.link} --now`)) setTocando(m.id);
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
                if ((await mandar(rotulo, prefixo + cmd)) && cmd === 'stop') setTocando(null);
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
        <h2>Canal do bot</h2>
        <p className="hint">
          Webhook do canal onde o bot de música lê comandos (<em>Editar canal → Integrações → Webhooks</em>). Fica só
          neste aparelho. Trate como senha: quem tiver a URL escreve no canal.
        </p>
        <label className="field wide">
          <span>URL do webhook</span>
          <input
            type="password"
            placeholder="https://discord.com/api/webhooks/..."
            value={state.musicWebhookUrl ?? ''}
            onChange={(e) => set({ musicWebhookUrl: e.target.value.trim() || undefined })}
          />
        </label>
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
