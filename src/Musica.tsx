import { useState } from 'react';
import { comandoTocar, postComando } from './discord.ts';
import { uid, type Musica as Trilha, type State } from './store.ts';

type Props = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  /** Id da trilha tocando: fica no App pra não se perder ao trocar de aba. */
  tocando: string | null;
  setTocando: (id: string | null) => void;
  avisar: (label: string, notation: string, text: string, error?: boolean) => void;
};

// O que o bot da mesa (pasta bot/ do repositório) entende. Bot de terceiros,
// como o Jockie, ignora webhook: por isso a mesa tem o próprio.
const CONTROLES = ['Pausar', 'Continuar', 'Parar'] as const;

const GUIA = 'https://github.com/shazamfa90/IA/blob/HEAD/bot/README.md';

export default function Musica({ state, setState, tocando, setTocando, avisar }: Props) {
  const [nome, setNome] = useState('');
  const [link, setLink] = useState('');
  const musicas = state.musicas ?? [];
  const repetir = state.repetirMusica ?? true;
  const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));

  /** Devolve se o Discord aceitou; o bot marca ✅ na mensagem quando começa a tocar. */
  async function mandar(rotulo: string, comando: string): Promise<boolean> {
    if (!state.musicWebhookUrl) {
      avisar(rotulo, '', 'Cole o webhook em "Canal do bot", aqui embaixo.', true);
      return false;
    }
    try {
      await postComando(state.musicWebhookUrl, comando);
      avisar(rotulo, '', 'Enviado ao bot da mesa.');
      return true;
    } catch (e) {
      avisar(rotulo, '', `não enviou: ${(e as Error).message}`, true);
      return false;
    }
  }

  const tocar = async (m: Trilha) => {
    if (await mandar(m.nome, comandoTocar(m.nome, m.link, repetir))) setTocando(m.id);
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
          {CONTROLES.map((rotulo) => (
            <button
              key={rotulo}
              className="add"
              onClick={async () => {
                if ((await mandar(rotulo, rotulo.toLowerCase())) && rotulo === 'Parar') setTocando(null);
              }}
            >
              {rotulo}
            </button>
          ))}
          <button
            className={repetir ? 'add on' : 'add'}
            aria-pressed={repetir}
            onClick={() => {
              set({ repetirMusica: !repetir });
              // Vale já pra trilha que está tocando; a próxima leva a escolha junto no comando.
              if (state.musicWebhookUrl) mandar(repetir ? 'Repetir desligado' : 'Repetir ligado', repetir ? 'repetir não' : 'repetir sim');
            }}
          >
            🔁 Repetir {repetir ? 'ligado' : 'desligado'}
          </button>
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
        <p className="hint">YouTube, Spotify (vira busca no YouTube), link direto de áudio ou só o nome da música.</p>
      </section>

      <section>
        <h2>Canal do bot</h2>
        <p className="hint">
          Quem toca é o bot da mesa, rodando no seu PC durante a sessão. Ele entra no canal de voz onde estiver a mesa e
          repete a trilha até você trocar. Como criar e ligar:{' '}
          <a href={GUIA} target="_blank" rel="noreferrer">passo a passo</a>.
        </p>
        <label className="field wide">
          <span>Webhook do canal do bot</span>
          <input
            type="password"
            placeholder="https://discord.com/api/webhooks/..."
            value={state.musicWebhookUrl ?? ''}
            onChange={(e) => set({ musicWebhookUrl: e.target.value.trim() || undefined })}
          />
        </label>
        <p className="hint">Fica só neste aparelho. Trate como senha: quem tiver a URL comanda a música.</p>
      </section>
    </>
  );
}
