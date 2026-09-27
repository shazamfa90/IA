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
const GUIA = 'https://github.com/shazamfa90/IA/blob/HEAD/bot/README.md';

export default function Musica({ state, setState, tocando, setTocando, avisar }: Props) {
  const repetir = state.repetirMusica ?? true;
  const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
  const tocandoPlaylist = (state.playlists ?? []).some((p) => p.id === tocando);

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

  const tocar = async (m: Trilha, playlist: boolean) => {
    if (await mandar(m.nome, comandoTocar(m.nome, m.link, repetir, playlist))) setTocando(m.id);
  };

  // Pular só existe com playlist tocando: numa trilha avulsa não há próxima.
  const controles = ['Pausar', 'Continuar', ...(tocandoPlaylist ? ['Pular'] : []), 'Parar'];

  return (
    <>
      <h1>Música</h1>

      <section>
        <h2>Controle</h2>
        <div className="controles">
          {controles.map((rotulo) => (
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
              // Vale já pro que está tocando; o próximo leva a escolha junto no comando.
              if (state.musicWebhookUrl) mandar(repetir ? 'Repetir desligado' : 'Repetir ligado', repetir ? 'repetir não' : 'repetir sim');
            }}
          >
            🔁 Repetir {repetir ? 'ligado' : 'desligado'}
          </button>
        </div>
        <p className="hint">Repetir recomeça a trilha, ou a playlist inteira, quando acaba.</p>
      </section>

      <Lista
        titulo="Trilhas"
        itens={state.musicas ?? []}
        tocando={tocando}
        exemplo="Combate, Taverna, Tensão…"
        exemploLink="https://youtube.com/… ou demon slayer ost"
        dica="YouTube, Spotify (vira busca no YouTube), link direto de áudio ou só o nome da música."
        onTocar={(m) => tocar(m, false)}
        onMudar={(musicas) => set({ musicas })}
      />

      <Lista
        titulo="Playlists"
        itens={state.playlists ?? []}
        tocando={tocando}
        exemplo="Batalhas, Exploração…"
        exemploLink="https://youtube.com/playlist?list=… ou link do Spotify"
        dica="Toca a lista inteira em sequência, e Pular vai pra próxima. YouTube: a playlist toda. Spotify: álbum inteiro, playlist até 30 músicas."
        onTocar={(m) => tocar(m, true)}
        onMudar={(playlists) => set({ playlists })}
      />

      <section>
        <h2>Canal do bot</h2>
        <p className="hint">
          Quem toca é o bot da mesa, rodando no seu PC durante a sessão. Ele entra no canal de voz onde estiver a mesa.
          Como criar e ligar: <a href={GUIA} target="_blank" rel="noreferrer">passo a passo</a>.
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

/** Trilhas e playlists: a mesma lista, cada uma com o seu "salvar". */
function Lista({
  titulo,
  itens,
  tocando,
  exemplo,
  exemploLink,
  dica,
  onTocar,
  onMudar,
}: {
  titulo: string;
  itens: Trilha[];
  tocando: string | null;
  exemplo: string;
  exemploLink: string;
  dica: string;
  onTocar: (m: Trilha) => void;
  onMudar: (itens: Trilha[]) => void;
}) {
  const [nome, setNome] = useState('');
  const [link, setLink] = useState('');

  return (
    <section>
      <h2>{titulo}</h2>
      {itens.length === 0 && <p className="hint">Nenhuma ainda. Salve a primeira aqui embaixo.</p>}
      {itens.map((m) => (
        <div key={m.id} className={tocando === m.id ? 'row on' : 'row'}>
          <button className="pick" aria-pressed={tocando === m.id} onClick={() => onTocar(m)}>
            <strong>{tocando === m.id ? `▶ ${m.nome}` : m.nome}</strong>
            <small>{m.link}</small>
          </button>
          <button className="icon" title="Apagar" onClick={() => onMudar(itens.filter((x) => x.id !== m.id))}>✕</button>
        </div>
      ))}
      <form
        className="salvar"
        onSubmit={(e) => {
          e.preventDefault();
          const l = link.trim();
          if (!l) return;
          onMudar([...itens, { id: uid(), nome: nome.trim() || l, link: l }]);
          setNome('');
          setLink('');
        }}
      >
        <label className="field wide">
          <span>Nome</span>
          <input placeholder={exemplo} value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label className="field wide">
          <span>Link{titulo === 'Trilhas' ? ' ou busca' : ''}</span>
          <input placeholder={exemploLink} value={link} onChange={(e) => setLink(e.target.value)} />
        </label>
        <button className="roll compact" disabled={!link.trim()}>Salvar</button>
      </form>
      <p className="hint">{dica}</p>
    </section>
  );
}
