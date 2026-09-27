import { useEffect, useState } from 'react';
import { comandoListar, comandoTocar, lerLista, lerMensagem, postComando } from './discord.ts';
import { uid, type Musica as Trilha, type State } from './store.ts';

/** O que está tocando. Playlist: a faixa, e a mensagem onde o bot marca "▶ 3/12" quando avança. */
export type Tocando = { id: string; faixa?: number; msg?: string };

type Props = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  /** Fica no App pra não se perder ao trocar de aba. */
  tocando: Tocando | null;
  setTocando: (t: Tocando | null) => void;
  avisar: (label: string, notation: string, text: string, error?: boolean) => void;
};

// O que o bot da mesa (pasta bot/ do repositório) entende. Bot de terceiros,
// como o Jockie, ignora webhook: por isso a mesa tem o próprio.
const GUIA = 'https://github.com/shazamfa90/IA/blob/HEAD/bot/README.md';

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Musica({ state, setState, tocando, setTocando, avisar }: Props) {
  const [aberta, setAberta] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<string | null>(null);
  const repetir = state.repetirMusica ?? true;
  const url = state.musicWebhookUrl;
  const playlists = state.playlists ?? [];
  const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
  const tocandoPlaylist = playlists.some((p) => p.id === tocando?.id);
  const guardarFaixas = (id: string, faixas: string[]) =>
    setState((s) => ({ ...s, playlists: (s.playlists ?? []).map((p) => (p.id === id ? { ...p, faixas } : p)) }));

  /** Devolve o id da mensagem se o Discord aceitou; o bot marca ✅ nela quando começa a tocar. */
  async function mandar(rotulo: string, comando: string): Promise<string | null> {
    if (!url) {
      avisar(rotulo, '', 'Cole o webhook em "Canal do bot", aqui embaixo.', true);
      return null;
    }
    try {
      const id = await postComando(url, comando);
      avisar(rotulo, '', 'Enviado ao bot da mesa.');
      return id;
    } catch (e) {
      avisar(rotulo, '', `não enviou: ${(e as Error).message}`, true);
      return null;
    }
  }

  /** Espera o bot escrever a lista na mensagem (ele edita pelo mesmo webhook). */
  async function esperarLista(msg: string) {
    for (let i = 0; i < 30; i++) {
      await espera(1500);
      const lista = await lerMensagem(url!, msg).then(lerLista, () => null);
      if (lista) return lista;
    }
    return null;
  }

  async function listar(p: Trilha) {
    setCarregando(p.id);
    const msg = await mandar(`Faixas de ${p.nome}`, comandoListar(p.nome, p.link));
    const lista = msg && (await esperarLista(msg));
    setCarregando(null);
    if (lista) guardarFaixas(p.id, lista.faixas);
    else if (msg) avisar(p.nome, '', 'O bot não respondeu com a lista. Ele está ligado no PC?', true);
  }

  async function tocarFaixa(p: Trilha, n: number) {
    const nome = p.faixas?.[n] ? `${p.nome} · ${n + 1}. ${p.faixas[n]}` : p.nome;
    const msg = await mandar(nome, comandoTocar(nome, p.link, repetir, true, n + 1));
    if (!msg) return;
    setTocando({ id: p.id, faixa: n, msg });
    if (!p.faixas) {
      const lista = await esperarLista(msg); // a mensagem da playlist também traz a lista
      if (lista) guardarFaixas(p.id, lista.faixas);
    }
  }

  // Com playlist tocando, o bot avança sozinho e marca "▶ N" na mensagem: o app acompanha.
  useEffect(() => {
    if (!url || !tocando?.msg) return;
    const t = setInterval(async () => {
      const lista = await lerMensagem(url, tocando.msg!).then(lerLista, () => null);
      if (lista?.atual != null && lista.atual !== tocando.faixa) setTocando({ ...tocando, faixa: lista.atual });
    }, 5000);
    return () => clearInterval(t);
  }, [url, tocando]);

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
              if (url) mandar(repetir ? 'Repetir desligado' : 'Repetir ligado', repetir ? 'repetir não' : 'repetir sim');
            }}
          >
            🔁 Repetir {repetir ? 'ligado' : 'desligado'}
          </button>
        </div>
        <p className="hint">Repetir recomeça a trilha, ou a playlist inteira, quando acaba.</p>
      </section>

      <section>
        <h2>Trilhas</h2>
        {(state.musicas ?? []).length === 0 && <p className="hint">Nenhuma ainda. Salve a primeira aqui embaixo.</p>}
        {(state.musicas ?? []).map((m) => (
          <Linha
            key={m.id}
            m={m}
            on={tocando?.id === m.id}
            onToque={async () => {
              if (await mandar(m.nome, comandoTocar(m.nome, m.link, repetir))) setTocando({ id: m.id });
            }}
            onApagar={() => set({ musicas: (state.musicas ?? []).filter((x) => x.id !== m.id) })}
          />
        ))}
        <Salvar
          exemplo="Combate, Taverna, Tensão…"
          rotuloLink="Link ou busca"
          exemploLink="https://youtube.com/… ou demon slayer ost"
          onSalvar={(m) => set({ musicas: [...(state.musicas ?? []), m] })}
        />
        <p className="hint">YouTube, Spotify (vira busca no YouTube), link direto de áudio ou só o nome da música.</p>
      </section>

      <section>
        <h2>Playlists</h2>
        {playlists.length === 0 && <p className="hint">Nenhuma ainda. Salve a primeira aqui embaixo.</p>}
        {playlists.map((p) => (
          <div key={p.id}>
            <Linha
              m={p}
              on={tocando?.id === p.id}
              aberta={aberta === p.id}
              detalhe={p.faixas ? `${p.faixas.length} faixas` : p.link}
              onToque={() => {
                const abrir = aberta !== p.id;
                setAberta(abrir ? p.id : null);
                if (abrir && !p.faixas) listar(p);
              }}
              onApagar={() => set({ playlists: playlists.filter((x) => x.id !== p.id) })}
            />
            {aberta === p.id && (
              <div className="faixas">
                {carregando === p.id && <p className="hint">Pedindo a lista ao bot… ele precisa estar ligado.</p>}
                {p.faixas?.map((f, n) => {
                  const on = tocando?.id === p.id && tocando.faixa === n;
                  return (
                    <button key={n} className={on ? 'faixa on' : 'faixa'} aria-pressed={on} onClick={() => tocarFaixa(p, n)}>
                      <span>{on ? '▶' : n + 1}</span>
                      {f}
                    </button>
                  );
                })}
                {!p.faixas && carregando !== p.id && (
                  <button className="add" onClick={() => tocarFaixa(p, 0)}>▶ Tocar do começo</button>
                )}
                {p.faixas && (
                  <button className="add" disabled={carregando === p.id} onClick={() => listar(p)}>
                    Atualizar lista
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        <Salvar
          exemplo="Batalhas, Exploração…"
          rotuloLink="Link"
          exemploLink="https://youtube.com/playlist?list=… ou link do Spotify"
          onSalvar={(m) => set({ playlists: [...playlists, m] })}
        />
        <p className="hint">
          Toque numa playlist pra ver as faixas; toque numa faixa pra tocar a partir dela. Depois ela segue em sequência, e
          Pular vai pra próxima. YouTube: até 300 faixas. Spotify: álbum inteiro, playlist até 50.
        </p>
      </section>

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
            value={url ?? ''}
            onChange={(e) => set({ musicWebhookUrl: e.target.value.trim() || undefined })}
          />
        </label>
        <p className="hint">Fica só neste aparelho. Trate como senha: quem tiver a URL comanda a música.</p>
      </section>
    </>
  );
}

function Linha({
  m,
  on,
  aberta,
  detalhe,
  onToque,
  onApagar,
}: {
  m: Trilha;
  on: boolean;
  /** Só playlists abrem; trilhas não passam isto. */
  aberta?: boolean;
  detalhe?: string;
  onToque: () => void;
  onApagar: () => void;
}) {
  const seta = aberta === undefined ? '' : aberta ? '▾ ' : '▸ ';
  return (
    <div className={on ? 'row on' : 'row'}>
      <button className="pick" aria-pressed={aberta === undefined ? on : undefined} aria-expanded={aberta} onClick={onToque}>
        <strong>{seta}{on ? `▶ ${m.nome}` : m.nome}</strong>
        <small>{detalhe ?? m.link}</small>
      </button>
      <button className="icon" title="Apagar" onClick={onApagar}>✕</button>
    </div>
  );
}

function Salvar({
  exemplo,
  rotuloLink,
  exemploLink,
  onSalvar,
}: {
  exemplo: string;
  rotuloLink: string;
  exemploLink: string;
  onSalvar: (m: Trilha) => void;
}) {
  const [nome, setNome] = useState('');
  const [link, setLink] = useState('');
  return (
    <form
      className="salvar"
      onSubmit={(e) => {
        e.preventDefault();
        const l = link.trim();
        if (!l) return;
        onSalvar({ id: uid(), nome: nome.trim() || l, link: l });
        setNome('');
        setLink('');
      }}
    >
      <label className="field wide">
        <span>Nome</span>
        <input placeholder={exemplo} value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <label className="field wide">
        <span>{rotuloLink}</span>
        <input placeholder={exemploLink} value={link} onChange={(e) => setLink(e.target.value)} />
      </label>
      <button className="roll compact" disabled={!link.trim()}>Salvar</button>
    </form>
  );
}
