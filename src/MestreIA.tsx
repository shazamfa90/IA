import { useEffect, useRef, useState } from 'react';
import { PROVEDORES, TIPOS, carregarIA, conversar, escolherModelo, listarModelos, pesquisar, pronta, salvarIA, type ConfigIA, type Conexao, type Tipo } from './ia.ts';
import { apagarCampanha, listarCampanhas, pedirPermanencia, salvarCampanha } from './banco.ts';
import {
  aplicar,
  aplicarCondensado,
  camposDoStatus,
  comPesquisa,
  contexto,
  exportarCampanha,
  extrairStatus,
  importarCampanha,
  novaCampanha,
  pedidoCondensar,
  pedidoLeis,
  precisaCondensar,
  separar,
  type Campanha,
} from './mestre.ts';

const IDEIAS = ['Fantasia sombria', 'Cyberpunk', 'Horror cósmico', 'Faroeste fantástico', 'Kimetsu no Yaiba', 'Piratas e mares malditos'];
const cancelou = (e: unknown) => (e as Error)?.name === 'AbortError';
const quando = (t: number) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

/** **negrito** e *itálico*, que é o que os modelos usam na narração. O resto é texto puro. */
function Trecho({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/).map((p, i) =>
        p.startsWith('**') && p.length > 4 ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith('*') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p,
      )}
    </>
  );
}

function Narracao({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/\n{2,}/).map((par, i) => {
        const linhas = par.replace(/^#+\s*/, '').split('\n');
        return (
          <p key={i}>
            {linhas.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                <Trecho texto={l} />
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function Status({ status }: { status: string }) {
  const campos = camposDoStatus(status);
  if (!campos.length) return null;
  return (
    <div className="status">
      <h3>Status do personagem</h3>
      <dl>
        {campos.map(([nome, valor], i) => (
          <div key={i}>
            {nome && <dt>{nome}</dt>}
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A fala do mestre como o jogador lê: narração, e o status num cartão. Bastidores ficam de fora. */
function FalaDoMestre({ bruto }: { bruto: string }) {
  const { narrativa, status } = extrairStatus(separar(bruto).visivel);
  return (
    <article className="fala mestre">
      <Narracao texto={narrativa} />
      <Status status={status} />
    </article>
  );
}

// --- Ligar a IA ----------------------------------------------------------

function LigarIA({ ia, setIa }: { ia: ConfigIA; setIa: (c: ConfigIA) => void }) {
  const [modelos, setModelos] = useState<Partial<Record<Tipo, string[]>>>({});
  const [aviso, setAviso] = useState<Partial<Record<Tipo, string>>>({});
  const [testando, setTestando] = useState<Tipo | null>(null);
  // Quem ainda não ligou nada já encontra o primeiro serviço aberto. Decidido uma vez só:
  // se acompanhasse o estado, o cartão fecharia na cara de quem acabou de ligar.
  const [primeiraVez] = useState(() => !ia.conexoes.some(pronta));

  const de = (tipo: Tipo): Conexao => ia.conexoes.find((c) => c.tipo === tipo) ?? { tipo, chave: '', modelo: '' };
  function mudar(tipo: Tipo, patch: Partial<Conexao>) {
    const nova = { ...de(tipo), ...patch };
    const outras = ia.conexoes.filter((c) => c.tipo !== tipo);
    const posicao = ia.conexoes.findIndex((c) => c.tipo === tipo);
    const vazia = !nova.chave.trim() && !nova.url?.trim();
    const conexoes = vazia ? outras : posicao < 0 ? [...outras, nova] : ia.conexoes.map((c) => (c.tipo === tipo ? nova : c));
    setIa({ ...ia, conexoes });
  }

  async function conectar(tipo: Tipo) {
    const c = de(tipo);
    setTestando(tipo);
    setAviso((a) => ({ ...a, [tipo]: '' }));
    try {
      const ids = await listarModelos(c);
      setModelos((m) => ({ ...m, [tipo]: ids }));
      const modelo = ids.includes(c.modelo) ? c.modelo : escolherModelo(tipo, ids);
      mudar(tipo, { modelo });
      setAviso((a) => ({ ...a, [tipo]: `Ligada. Modelo: ${modelo}` }));
    } catch (e) {
      const recusada = /recusada/.test((e as Error).message);
      const padrao = c.modelo || PROVEDORES[tipo].padrao;
      // Sem a lista dá pra seguir com o modelo padrão; com a chave recusada, não.
      if (!recusada && padrao) mudar(tipo, { modelo: padrao });
      setAviso((a) => ({
        ...a,
        [tipo]: recusada
          ? 'A chave foi recusada. Confira se copiou inteira.'
          : `Não deu pra ler a lista de modelos (${(e as Error).message}).${padrao ? ` Fica o modelo ${padrao}.` : ' Escreva o nome do modelo.'}`,
      }));
    } finally {
      setTestando(null);
    }
  }

  const prontas = ia.conexoes.filter(pronta);
  return (
    <section>
      <h2>Ligar a IA</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        O mestre usa um serviço de IA com <strong>plano grátis</strong>. Você pega uma chave no site do serviço (é só
        entrar com uma conta, sem cartão), cola aqui e pronto. Nenhum plano grátis é infinito: cada um tem uma cota por
        dia. Ligue <strong>dois ou três</strong> e, quando a cota de um acabar, o app passa sozinho pro próximo.
      </p>
      {TIPOS.map((tipo) => {
        const info = PROVEDORES[tipo];
        const c = de(tipo);
        const ordem = prontas.findIndex((p) => p.tipo === tipo);
        const lista = modelos[tipo];
        return (
          <details key={tipo} className="ligacao" open={tipo === 'gemini' && primeiraVez}>
            <summary>
              {info.nome}
              <small>{ordem >= 0 ? `${ordem + 1}ª · ligada` : 'desligada'}</small>
            </summary>
            <p className="hint">{info.dica}</p>
            {info.chaves && (
              <a className="add" href={info.chaves} target="_blank" rel="noopener noreferrer">
                Pegar chave grátis ↗
              </a>
            )}
            {tipo === 'outro' && (
              <label className="field wide">
                <span>Endereço da API</span>
                <input type="url" inputMode="url" placeholder="http://localhost:11434/v1" value={c.url ?? ''} onChange={(e) => mudar(tipo, { url: e.target.value })} />
              </label>
            )}
            <label className="field wide">
              <span>Chave{tipo === 'outro' ? ' (se o serviço pedir)' : ''}</span>
              <input type="password" autoComplete="off" placeholder="cole a chave aqui" value={c.chave} onChange={(e) => mudar(tipo, { chave: e.target.value })} />
            </label>
            {(c.modelo || tipo === 'outro') && (
              <label className="field wide">
                <span>Modelo</span>
                {lista?.length ? (
                  <select value={c.modelo} onChange={(e) => mudar(tipo, { modelo: e.target.value })}>
                    {[...new Set([c.modelo, ...lista])].filter(Boolean).map((id) => (
                      <option key={id}>{id}</option>
                    ))}
                  </select>
                ) : (
                  <input value={c.modelo} placeholder="nome do modelo" onChange={(e) => mudar(tipo, { modelo: e.target.value })} />
                )}
              </label>
            )}
            <div className="controles">
              <button className="add" disabled={testando === tipo || (!c.chave.trim() && !c.url?.trim())} onClick={() => conectar(tipo)}>
                {testando === tipo ? 'Testando…' : ordem >= 0 ? 'Testar de novo' : 'Ligar'}
              </button>
              {ordem > 0 && (
                <button className="add" onClick={() => setIa({ ...ia, conexoes: [c, ...ia.conexoes.filter((x) => x.tipo !== tipo)] })}>
                  Usar primeiro
                </button>
              )}
              {(c.chave || c.url) && (
                <button className="add" onClick={() => (mudar(tipo, { chave: '', url: '', modelo: '' }), setAviso((a) => ({ ...a, [tipo]: '' })))}>
                  Desligar
                </button>
              )}
            </div>
            {aviso[tipo] && <p className="hint break" role="status">{aviso[tipo]}</p>}
          </details>
        );
      })}
      <div className="ajuste">
        <span>
          Pesquisar na Wikipédia
          <small>O mestre consulta o tema antes de criar o mundo, e pode consultar durante o jogo.</small>
        </span>
        <button type="button" role="switch" aria-checked={ia.pesquisar} aria-label="Pesquisar na Wikipédia" className="chave" onClick={() => setIa({ ...ia, pesquisar: !ia.pesquisar })} />
      </div>
      <p className="hint">
        As chaves ficam só neste aparelho. O que você escreve na aventura vai direto do seu navegador para o serviço
        ligado, que gera a resposta; o app não tem servidor no meio.
      </p>
    </section>
  );
}

// --- A tela --------------------------------------------------------------

export default function MestreIA() {
  const [campanhas, setCampanhas] = useState<Campanha[] | null>(null);
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [ia, setIaEstado] = useState<ConfigIA>(carregarIA);
  const [tema, setTema] = useState('');
  const [aviso, setAviso] = useState('');
  const [painel, setPainel] = useState<'conversa' | 'memoria'>('conversa');
  const [spoilers, setSpoilers] = useState(false);

  const [texto, setTexto] = useState('');
  const [ocupado, setOcupado] = useState('');
  const [parcial, setParcial] = useState('');
  const [erro, setErro] = useState('');
  const parar = useRef<AbortController | null>(null);
  /** Quantas mensagens havia na última condensação: evita repetir o pedido a cada turno se ela não encolher nada. */
  const condensou = useRef(0);
  const caixa = useRef<HTMLTextAreaElement>(null);
  const arquivo = useRef<HTMLInputElement>(null);

  const setIa = (c: ConfigIA) => (setIaEstado(c), salvarIA(c));
  const ligada = ia.conexoes.some(pronta);
  const aberta = campanhas?.find((c) => c.id === abertaId) ?? null;

  useEffect(() => {
    listarCampanhas()
      .then(setCampanhas)
      .catch(() => {
        setCampanhas([]);
        setAviso('Este navegador não deixou abrir o armazenamento (aba anônima?). Dá pra jogar, mas a aventura some ao fechar.');
      });
  }, []);

  /** Tudo que muda numa aventura passa por aqui: vai pra tela e pro banco do aparelho. */
  function gravar(c: Campanha) {
    setCampanhas((cs) => {
      const outras = (cs ?? []).filter((x) => x.id !== c.id);
      return [c, ...outras];
    });
    salvarCampanha(c).catch(() => setAviso('Não deu pra gravar no aparelho: sem espaço ou armazenamento bloqueado. Exporte a aventura pra não perder.'));
  }

  // Acompanha a conversa: desce quando chega fala nova, e durante a resposta só se o jogador já estava no fim.
  // A caixa de escrever é a última coisa da página: ir ao fim da página mostra a fala inteira acima dela.
  const falas = aberta?.msgs.length ?? 0;
  const aoFim = () => scrollTo(0, document.documentElement.scrollHeight);
  useEffect(() => {
    if (abertaId && painel === 'conversa') aoFim();
  }, [abertaId, falas, painel, ocupado]);
  useEffect(() => {
    if (parcial && innerHeight + scrollY >= document.documentElement.scrollHeight - 200) aoFim();
  }, [parcial]);

  /** Pede a próxima fala do mestre para a aventura como ela está (a fala do jogador já entrou). */
  async function rodar(c: Campanha) {
    const ctl = new AbortController();
    parar.current = ctl;
    setErro('');
    setParcial('');
    const pedir = (extra?: string) =>
      conversar(ia.conexoes, contexto(c, extra), { sinal: ctl.signal, onTexto: (t) => setParcial(separar(t).visivel) });
    try {
      // Antes da primeira cena: as leis do universo, escritas uma vez e seguidas até o fim.
      if (!c.mem.leis) {
        let referencia = '';
        if (ia.pesquisar) {
          setOcupado('Pesquisando o tema…');
          referencia = await pesquisar(c.tema.slice(0, 120), ctl.signal);
        }
        setOcupado('O mestre está criando o mundo…');
        const leis = await conversar(ia.conexoes, pedidoLeis(c.tema, referencia), { sinal: ctl.signal, temperatura: 1 });
        c = { ...c, mem: { ...c.mem, leis: separar(leis.texto).visivel } };
        gravar(c);
      }

      setOcupado('O mestre está narrando…');
      let r = separar((await pedir()).texto);
      if (r.pesquisa && !r.visivel) {
        setOcupado('O mestre consulta os livros…');
        const achado = ia.pesquisar ? await pesquisar(r.pesquisa, ctl.signal) : '';
        c = { ...c, mem: comPesquisa(c.mem, r.pesquisa, achado || 'Nada encontrado. Siga com o que já está na memória.') };
        gravar(c);
        setOcupado('O mestre está narrando…');
        r = separar((await pedir('[Pesquisa anotada na memória. Narre agora, sem pedir outra pesquisa.]')).texto);
      }
      if (!r.visivel) throw new Error('O mestre respondeu em branco.');

      c = {
        ...c,
        desfazer: { mem: c.mem, resumidoAte: c.resumidoAte },
        mem: aplicar(c.mem, r.bastidores, extrairStatus(r.visivel).status),
        msgs: [...c.msgs, { de: 'mestre', texto: r.limpo, t: Date.now() }],
        jogada: Date.now(),
      };
      gravar(c);
      setParcial('');

      // Memória longa: o que ficou velho na conversa vira resumo. Falhar aqui não é grave:
      // nada foi perdido, e a próxima rodada tenta de novo.
      if (precisaCondensar(c) && c.msgs.length - condensou.current >= 6) {
        setOcupado('O mestre organiza as anotações…');
        condensou.current = c.msgs.length;
        try {
          const { mensagens, ate } = pedidoCondensar(c);
          const { texto: condensado } = await conversar(ia.conexoes, mensagens, { sinal: ctl.signal, temperatura: 0.3 });
          gravar(aplicarCondensado(c, condensado, ate));
        } catch {
          // segue o jogo
        }
      }
    } catch (e) {
      if (!cancelou(e)) setErro((e as Error).message);
    } finally {
      setOcupado('');
      setParcial('');
    }
  }

  function comecar() {
    if (!tema.trim()) return;
    const c = novaCampanha(tema);
    setTema('');
    gravar(c);
    setAbertaId(c.id);
    setPainel('conversa');
    setSpoilers(false);
    pedirPermanencia();
    rodar(c);
  }

  function enviar() {
    if (!aberta || ocupado || !texto.trim()) return;
    const c = { ...aberta, msgs: [...aberta.msgs, { de: 'jogador' as const, texto: texto.trim(), t: Date.now() }], jogada: Date.now() };
    setTexto('');
    if (caixa.current) caixa.current.style.height = '';
    gravar(c);
    rodar(c);
  }

  /** Joga fora a última fala do mestre, devolve a memória ao que era, e pede outra. */
  function refazer() {
    if (!aberta || ocupado || aberta.msgs.at(-1)?.de !== 'mestre') return;
    const c = {
      ...aberta,
      msgs: aberta.msgs.slice(0, -1),
      mem: aberta.desfazer?.mem ?? aberta.mem,
      resumidoAte: aberta.desfazer?.resumidoAte ?? aberta.resumidoAte,
      desfazer: undefined,
    };
    gravar(c);
    rodar(c);
  }

  /** A fala que o mestre não respondeu volta pra caixa de texto, pra reescrever. */
  function editarUltima() {
    if (!aberta) return;
    const i = aberta.msgs.map((m) => m.de).lastIndexOf('jogador');
    if (i < 0) return;
    setTexto(aberta.msgs[i].texto);
    gravar({ ...aberta, msgs: aberta.msgs.filter((_, j) => j !== i) });
    setErro('');
  }

  async function pesquisarAgora() {
    if (!aberta || ocupado) return;
    const termo = prompt('Pesquisar o quê na Wikipédia? O resultado aparece pra você e entra na memória do mestre.')?.trim();
    if (!termo) return;
    setOcupado('Pesquisando…');
    try {
      const achado = await pesquisar(termo);
      const nota = achado ? `🔎 ${termo}\n\n${achado}` : `🔎 ${termo}\n\nNada encontrado. Tente outras palavras.`;
      gravar({
        ...aberta,
        mem: achado ? comPesquisa(aberta.mem, termo, achado) : aberta.mem,
        msgs: [...aberta.msgs, { de: 'nota', texto: nota, t: Date.now() }],
      });
    } finally {
      setOcupado('');
    }
  }

  function baixar(c: Campanha) {
    const url = URL.createObjectURL(new Blob([exportarCampanha(c)], { type: 'application/json' }));
    Object.assign(document.createElement('a'), { href: url, download: `aventura-${c.nome.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40)}.json` }).click();
    URL.revokeObjectURL(url);
  }

  async function importar(f: File) {
    try {
      const c = importarCampanha(await f.text());
      gravar(c);
      setAviso(`Aventura "${c.nome}" importada.`);
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  function apagar(c: Campanha) {
    if (!confirm(`Apagar a aventura "${c.nome}"? A história e a memória do mestre somem deste aparelho.`)) return;
    setCampanhas((cs) => (cs ?? []).filter((x) => x.id !== c.id));
    apagarCampanha(c.id).catch(() => {});
    if (abertaId === c.id) setAbertaId(null);
  }

  // ----- Aventura aberta -----
  if (aberta) {
    const m = aberta.mem;
    const ultima = aberta.msgs.filter((x) => x.de !== 'nota').at(-1);
    const semResposta = !ocupado && ultima?.de !== 'mestre';
    return (
      <div className="chat">
        <header className="chat-topo">
          <button className="add" aria-label="Voltar para as aventuras" onClick={() => (parar.current?.abort(), setAbertaId(null), setErro(''))}>
            ←
          </button>
          <h1>{aberta.nome}</h1>
          <button className="add" aria-pressed={painel === 'memoria'} onClick={() => setPainel(painel === 'memoria' ? 'conversa' : 'memoria')}>
            Memória
          </button>
        </header>

        {painel === 'memoria' ? (
          <>
            <section>
              <h2>O que seu personagem sabe</h2>
              {m.status ? <Status status={m.status} /> : <p className="hint">O status aparece depois da primeira fala do mestre.</p>}
              {m.tempo && <p className="hint">Agora: <strong>{m.tempo}</strong></p>}
              {m.resumo && (
                <>
                  <h2 className="sub">A história até aqui</h2>
                  <p className="prosa">{m.resumo}</p>
                </>
              )}
              <h2 className="sub">Fatos vividos</h2>
              {m.fatos.length ? (
                <ul className="lista">
                  {m.fatos.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              ) : (
                <p className="hint">Nada anotado ainda.</p>
              )}
              {m.pesquisas.length > 0 && (
                <>
                  <h2 className="sub">Pesquisas guardadas</h2>
                  <ul className="lista">
                    {m.pesquisas.map((p, i) => (
                      <li key={i}>{p.termo}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section>
              <h2>Bastidores do mestre</h2>
              <p className="hint" style={{ marginTop: 0 }}>
                As leis do mundo, os segredos e o que cada NPC quer. É a memória que o mestre relê a cada fala — e é
                spoiler puro: abrir estraga as surpresas.
              </p>
              <button className="add" aria-pressed={spoilers} onClick={() => (spoilers || confirm('Ver os segredos do mestre? Isto revela a trama.')) && setSpoilers(!spoilers)}>
                {spoilers ? 'Esconder' : 'Ver mesmo assim'}
              </button>
              {spoilers && (
                <>
                  <h2 className="sub">Leis do universo e tramas</h2>
                  <p className="prosa">{m.leis || 'Ainda não escritas.'}</p>
                  <h2 className="sub">Personagem (ficha fixa)</h2>
                  <p className="prosa">{m.personagem || 'Ainda não criado.'}</p>
                  <h2 className="sub">Segredos</h2>
                  <ul className="lista">{m.segredos.length ? m.segredos.map((s, i) => <li key={i}>{s}</li>) : <li>Nenhum anotado.</li>}</ul>
                  <h2 className="sub">NPCs</h2>
                  <ul className="lista">
                    {Object.keys(m.npcs).length ? Object.entries(m.npcs).map(([n, nota]) => <li key={n}><strong>{n}</strong>: {nota}</li>) : <li>Nenhum anotado.</li>}
                  </ul>
                </>
              )}
            </section>

            <section>
              <h2>Esta aventura</h2>
              <label className="field wide">
                <span>Nome</span>
                <input value={aberta.nome} onChange={(e) => gravar({ ...aberta, nome: e.target.value })} />
              </label>
              <p className="hint break">Tema: {aberta.tema}</p>
              <p className="hint">
                {aberta.msgs.length} falas guardadas; as {aberta.msgs.length - aberta.resumidoAte} mais recentes vão inteiras
                para o mestre, e as anteriores vão como resumo.
              </p>
              <div className="controles">
                <button className="add" onClick={() => baixar(aberta)}>Exportar</button>
                <button className="add" onClick={() => apagar(aberta)}>Apagar</button>
              </div>
              <p className="hint">O arquivo exportado leva a história e a memória inteira (segredos incluídos) pra outro aparelho.</p>
            </section>
          </>
        ) : (
          <>
            {aberta.msgs.map((msg, i) =>
              msg.de === 'mestre' ? (
                <FalaDoMestre key={i} bruto={msg.texto} />
              ) : (
                <article key={i} className={msg.de === 'nota' ? 'fala achado' : 'fala jogador'}>{msg.texto}</article>
              ),
            )}

            {parcial && <FalaDoMestre bruto={parcial} />}
            {ocupado && <p className="hint digitando" role="status">{ocupado}</p>}
            {erro && <p className="hint err break" role="alert">Não deu: {erro}</p>}
            {!ligada && <p className="hint err">Nenhuma IA ligada. Volte (←) e cole uma chave em "Ligar a IA".</p>}

            {!ocupado && (semResposta || ultima?.de === 'mestre') && (
              <div className="controles acoes">
                {semResposta && <button className="add" disabled={!ligada} onClick={() => rodar(aberta)}>Tentar de novo</button>}
                {semResposta && ultima?.de === 'jogador' && <button className="add" onClick={editarUltima}>Reescrever minha fala</button>}
                {ultima?.de === 'mestre' && <button className="add" onClick={refazer}>↻ Outra versão</button>}
              </div>
            )}

            <form
              className="escrever"
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
            >
              <button type="button" aria-label="Pesquisar na Wikipédia" title="Pesquisar na Wikipédia" disabled={!!ocupado} onClick={pesquisarAgora}>
                🔎
              </button>
              <textarea
                ref={caixa}
                rows={1}
                value={texto}
                placeholder="O que você faz?"
                aria-label="Sua ação"
                onChange={(e) => {
                  setTexto(e.target.value);
                  e.target.style.height = '';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                // No PC, Enter envia e Shift+Enter quebra linha. No celular o Enter é do teclado: quebra linha.
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !matchMedia('(pointer: coarse)').matches) {
                    e.preventDefault();
                    enviar();
                  }
                }}
              />
              {ocupado ? (
                <button type="button" className="enviar" aria-label="Parar" title="Parar" onClick={() => parar.current?.abort()}>
                  ■
                </button>
              ) : (
                <button type="submit" className="enviar" aria-label="Enviar" disabled={!texto.trim() || !ligada}>
                  ➤
                </button>
              )}
            </form>
          </>
        )}
      </div>
    );
  }

  // ----- Lista de aventuras -----
  return (
    <>
      <h1>Mestre IA</h1>
      <p className="hint" style={{ marginTop: 0 }}>
        Um mestre de RPG narrativo que conduz a aventura só pra você: mundo com leis próprias, NPCs com objetivos,
        segredos que só aparecem na hora certa — e memória que continua de onde parou.
      </p>
      {aviso && <p className="hint break" role="status">{aviso}</p>}

      <section>
        <h2>Nova aventura</h2>
        <label className="field wide">
          <span>Universo ou tema</span>
          <textarea value={tema} placeholder="Ex.: samurais caçando demônios no Japão feudal; ou o nome de uma obra, pra usar só a atmosfera dela" onChange={(e) => setTema(e.target.value)} />
        </label>
        <div className="ideias">
          {IDEIAS.map((i) => (
            <button key={i} type="button" onClick={() => setTema(i)}>{i}</button>
          ))}
        </div>
        <button className="roll compact" style={{ marginTop: 14 }} disabled={!tema.trim() || !ligada} onClick={comecar}>
          Começar aventura
        </button>
        {!ligada && <p className="hint">Antes, ligue uma IA logo abaixo: leva um minuto e é grátis.</p>}
      </section>

      <section>
        <h2>Aventuras</h2>
        {campanhas === null && <p className="hint">Abrindo…</p>}
        {campanhas?.length === 0 && <p className="hint" style={{ marginTop: 0 }}>Nenhuma ainda. As aventuras ficam guardadas neste aparelho.</p>}
        <div className="grid">
          {campanhas?.map((c) => (
            <button key={c.id} className="roll" onClick={() => (setAbertaId(c.id), setPainel('conversa'), setSpoilers(false), setErro(''))}>
              {c.nome}
              <small>{c.msgs.length} falas · {quando(c.jogada)}</small>
            </button>
          ))}
        </div>
        <button className="add" onClick={() => arquivo.current?.click()}>Importar aventura</button>
        <input
          ref={arquivo}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importar(f);
            e.target.value = '';
          }}
        />
      </section>

      <LigarIA ia={ia} setIa={setIa} />
    </>
  );
}
