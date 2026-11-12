import { useEffect, useRef, useState } from 'react';
import { INTEGRADAS, PROVEDORES, TIPOS, ativas, auxiliares, carregarIA, conversar, escolherModelo, folegoDe, listarModelos, pesquisar, pronta, salvarIA, type ConfigIA, type Conexao, type Tipo } from './ia.ts';
import { destrancado, lembrar, senhaCerta } from './tranca.ts';
import { apagarCampanha, listarCampanhas, pedirPermanencia, salvarCampanha } from './banco.ts';
import {
  aplicar,
  aplicarCapitulo,
  atualizar,
  camposDoStatus,
  comPesquisa,
  contexto,
  exportarCampanha,
  extrairStatus,
  importarCampanha,
  lerAuxiliar,
  lerBuscas,
  novaCampanha,
  pedidoAuxiliar,
  pedidoBuscas,
  pedidoCapitulo,
  pedidoDossie,
  pedidoLeis,
  pedidoRefazer,
  precisaCondensar,
  relembrar,
  separar,
  type Campanha,
  type Memoria,
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

/** Lista de anotações que o jogador pode apagar uma a uma. */
function Itens({ itens, onTirar }: { itens: string[]; onTirar: (i: number) => void }) {
  return (
    <ul className="lista itens">
      {itens.map((texto, i) => (
        <li key={i}>
          <span>{texto}</span>
          <button type="button" aria-label={`Apagar: ${texto.slice(0, 40)}`} onClick={() => onTirar(i)}>✕</button>
        </li>
      ))}
    </ul>
  );
}

/** A fala do mestre como o jogador lê: narração, e o status num cartão. Bastidores ficam de fora. */
function FalaDoMestre({ bruto, por }: { bruto: string; por?: string }) {
  const { narrativa, status } = extrairStatus(separar(bruto).visivel);
  return (
    <article className="fala mestre">
      <Narracao texto={narrativa} />
      <Status status={status} />
      {por && <small className="por">narrado por {por}</small>}
    </article>
  );
}

// --- Ligar a IA ----------------------------------------------------------

function LigarIA({ ia, setIa }: { ia: ConfigIA; setIa: (c: ConfigIA) => void }) {
  const [modelos, setModelos] = useState<Partial<Record<Tipo, string[]>>>({});
  const [aviso, setAviso] = useState<Partial<Record<Tipo, string>>>({});
  const [testando, setTestando] = useState<Tipo | null>(null);

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
  const equipe = auxiliares({ ...ia, equipe: true });
  return (
    <section>
      <h2>IA do mestre</h2>
      <div className="ajuste">
        <span>
          IA integrada
          <small>
            Já vem ligada, sem conta e sem chave: {INTEGRADAS.map((c) => PROVEDORES[c.tipo].nome).join(' e ')}. Serve pra
            experimentar na hora: sem chave, o serviço libera só umas poucas falas por dia.
          </small>
        </span>
        <button type="button" role="switch" aria-checked={ia.integradas} aria-label="IA integrada" className="chave" onClick={() => setIa({ ...ia, integradas: !ia.integradas })} />
      </div>
      <div className="ajuste">
        <span>
          Equipe de IAs
          <small>
            {equipe.length > 1
              ? `${PROVEDORES[equipe[equipe.length - 1].tipo].nome} narra; ${PROVEDORES[equipe[0].tipo].nome} confere cada fala e cuida da memória. As duas dividem o trabalho e a cota.`
              : equipe.length === 1
                ? `${PROVEDORES[equipe[0].tipo].nome} narra e também confere a própria fala numa segunda passada. Ligue outra IA pra dividir o trabalho.`
                : 'Uma segunda IA confere cada fala (agência, segredos, contradições) e cuida da memória. Entra em ação quando houver uma chave ligada.'}
          </small>
        </span>
        <button type="button" role="switch" aria-checked={ia.equipe} aria-label="Equipe de IAs" className="chave" onClick={() => setIa({ ...ia, equipe: !ia.equipe })} />
      </div>
      <h2 className="sub">Para jogar de verdade, sem parar</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Cole a chave <strong>grátis</strong> de um serviço maior (é só entrar com uma conta, sem cartão): ele passa a
        narrar primeiro, com um modelo bem melhor que o da integrada. Cada serviço tem uma cota por dia, e a do Gemini
        sozinha já dá pra horas de jogo. Com <strong>dois ou três</strong> ligados, quando a cota de um acaba o app
        passa sozinho pro próximo — na prática, não dá pra esgotar jogando.
      </p>
      {TIPOS.map((tipo) => {
        const info = PROVEDORES[tipo];
        const c = de(tipo);
        const ordem = prontas.findIndex((p) => p.tipo === tipo);
        const lista = modelos[tipo];
        return (
          <details key={tipo} className="ligacao">
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
          <small>Antes de criar o mundo, o mestre pesquisa o tema por vários ângulos e guarda só o que serve. Pode consultar de novo durante o jogo.</small>
        </span>
        <button type="button" role="switch" aria-checked={ia.pesquisar} aria-label="Pesquisar na Wikipédia" className="chave" onClick={() => setIa({ ...ia, pesquisar: !ia.pesquisar })} />
      </div>
      <p className="hint">
        As chaves ficam só neste aparelho. O que você escreve na aventura vai direto do seu navegador para o serviço
        que estiver narrando, que gera a resposta; o app não tem servidor no meio.
      </p>
    </section>
  );
}

// --- A tela --------------------------------------------------------------

/** A porta: sem a senha, nada do Mestre IA aparece. */
function Senha({ onAbrir }: { onAbrir: () => void }) {
  const [senha, setSenha] = useState('');
  const [estado, setEstado] = useState<'' | 'conferindo' | 'errou'>('');

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEstado('conferindo');
    if (await senhaCerta(senha).catch(() => false)) onAbrir();
    else setEstado('errou');
  }

  return (
    <>
      <h1>Mestre IA</h1>
      <form onSubmit={entrar}>
        <section>
          <h2>Área trancada</h2>
          <label className="field wide">
            <span>Senha do Mestre IA</span>
            <input type="password" autoComplete="current-password" value={senha} onChange={(e) => (setSenha(e.target.value), setEstado(''))} />
          </label>
          {estado === 'errou' && <p className="hint err" role="alert">Senha errada.</p>}
          <button type="submit" className="roll compact" style={{ marginTop: 14 }} disabled={!senha || estado === 'conferindo'}>
            {estado === 'conferindo' ? 'Conferindo…' : 'Entrar'}
          </button>
          <p className="hint">Depois de entrar, este aparelho fica destrancado até você tocar em "Trancar".</p>
        </section>
      </form>
    </>
  );
}

export default function MestreIA() {
  const [aberto, setAberto] = useState(destrancado);
  if (!aberto) return <Senha onAbrir={() => (lembrar(true), setAberto(true))} />;
  return <Mestre onTrancar={() => (lembrar(false), setAberto(false))} />;
}

function Mestre({ onTrancar }: { onTrancar: () => void }) {
  const [campanhas, setCampanhas] = useState<Campanha[] | null>(null);
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [ia, setIaEstado] = useState<ConfigIA>(carregarIA);
  const [tema, setTema] = useState('');
  const [aviso, setAviso] = useState('');
  const [painel, setPainel] = useState<'conversa' | 'memoria'>('conversa');
  const [spoilers, setSpoilers] = useState(false);
  const [lembrete, setLembrete] = useState('');

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
  const narradores = ativas(ia);
  const ligada = narradores.length > 0;
  const aberta = campanhas?.find((c) => c.id === abertaId) ?? null;

  useEffect(() => {
    listarCampanhas()
      .then((cs) => setCampanhas(cs.map(atualizar)))
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

  /**
   * Pede a próxima fala do mestre para a aventura como ela está (a fala do jogador já entrou).
   * Quem narra é a primeira IA da fila; a segunda confere a fala e cuida da memória.
   */
  async function rodar(c: Campanha) {
    const ctl = new AbortController();
    parar.current = ctl;
    setErro('');
    setParcial('');
    const sinal = ctl.signal;
    const ajudantes = auxiliares(ia);
    // Sem equipe (só a integrada, ou equipe desligada), o trabalho de bastidor fica com quem narra.
    const bastidor = ajudantes.length ? ajudantes : narradores;
    const folego = folegoDe(narradores[0]);
    const nome = (con: Conexao) => PROVEDORES[con.tipo].nome;

    const narrar = (extra?: string) =>
      conversar(narradores, (con) => contexto(c, { extra, folego: folegoDe(con) }), {
        sinal,
        onTexto: (t) => {
          const visivel = separar(t).visivel;
          setParcial(visivel);
          // Enquanto só chegou o bloco de raciocínio, não há o que mostrar: diz o que está havendo.
          setOcupado(visivel || !t ? 'O mestre está narrando…' : 'O mestre raciocina sobre a sua ação…');
        },
      });
    /** Chamada de bastidor: se falhar, o jogo segue sem ela. Só o "parar" interrompe. */
    const nosBastidores = async (mensagens: Parameters<typeof conversar>[1]): Promise<string> => {
      try {
        return (await conversar(bastidor, mensagens, { sinal, temperatura: 0.3, raciocinio: 'low' })).texto;
      } catch (e) {
        if (cancelou(e)) throw e;
        return '';
      }
    };

    try {
      // Antes da primeira cena: a pesquisa do tema e as leis do universo, feitas uma vez só.
      if (!c.mem.leis) {
        let dossie = '';
        if (ia.pesquisar) {
          // Com equipe, uma IA planeja as buscas (um ângulo do tema em cada) e depois separa
          // do material achado o que serve. Sem equipe, busca o tema direto: sai mais barato.
          let buscas = [c.tema.split('\n')[0].slice(0, 80)];
          if (ajudantes.length) {
            setOcupado('Planejando a pesquisa do tema…');
            const plano = await nosBastidores(pedidoBuscas(c.tema));
            if (plano) buscas = lerBuscas(plano, c.tema);
          }
          setOcupado(`Pesquisando: ${buscas.join(' · ')}…`);
          const achado = await pesquisar(buscas, c.tema, sinal, 3200);
          dossie = achado.texto.slice(0, 1800);
          if (achado.texto && ajudantes.length) {
            setOcupado('Separando o que serve ao tema…');
            const filtrado = separar(await nosBastidores(pedidoDossie(c.tema, achado.texto))).visivel.trim();
            if (filtrado) dossie = /^NADA\b/i.test(filtrado) ? '' : filtrado;
          }
          if (dossie) {
            c = {
              ...c,
              mem: comPesquisa(c.mem, 'Dossiê do tema', dossie),
              msgs: [...c.msgs, { de: 'nota', texto: `🔎 Pesquisa do tema. Fontes: ${achado.fontes.join(', ')}.`, t: Date.now() }],
            };
            gravar(c);
          }
        }
        setOcupado('O mestre está criando o mundo…');
        const leis = await conversar(narradores, pedidoLeis(c.tema, dossie), { sinal, temperatura: 1 });
        c = { ...c, mem: { ...c.mem, leis: separar(leis.texto).visivel } };
        gravar(c);
      }

      setOcupado('O mestre está narrando…');
      let resposta = await narrar();
      let r = separar(resposta.texto);
      // O mestre pode pedir uma consulta em vez de narrar: à própria memória, ou a uma enciclopédia.
      for (let consultas = 0; consultas < 2 && !r.visivel && (r.lembrar || r.pesquisa); consultas++) {
        let recado: string;
        if (r.lembrar) {
          setOcupado('O mestre puxa pela memória…');
          recado = `[Do arquivo da campanha, sobre "${r.lembrar}":\n${relembrar(c, r.lembrar)}\nNarre agora.]`;
        } else {
          setOcupado('O mestre consulta os livros…');
          const termos = r.pesquisa.split(/[;|]/).map((t) => t.trim()).filter(Boolean).slice(0, 3);
          const achado = ia.pesquisar ? await pesquisar(termos, c.tema, sinal) : { texto: '', fontes: [] };
          c = { ...c, mem: comPesquisa(c.mem, termos.join('; '), achado.texto || 'Nada encontrado. Siga com o que já está na memória.') };
          gravar(c);
          recado = '[Pesquisa anotada na memória, em PESQUISAS. Narre agora, sem pedir outra consulta.]';
        }
        resposta = await narrar(recado);
        r = separar(resposta.texto);
      }
      if (!r.visivel) throw new Error('O mestre respondeu em branco.');

      // A segunda IA relê a fala contra as regras e a memória. Erro grave volta pro narrador,
      // uma vez só; se ela aprovar, as anotações dela completam as do mestre.
      let anotacoes = '';
      let conferido = '';
      if (ajudantes.length) {
        setOcupado('A segunda IA confere a cena…');
        try {
          const aux = await conversar(ajudantes, pedidoAuxiliar(c, resposta.texto), { sinal, temperatura: 0.2, raciocinio: 'low' });
          const parecer = lerAuxiliar(aux.texto);
          conferido = nome(aux.por);
          if (parecer.refazer) {
            setParcial('');
            setOcupado(`A revisão pediu um ajuste (${parecer.motivos[0].slice(0, 90)}). Reescrevendo…`);
            const nova = await narrar(pedidoRefazer(parecer.motivos));
            if (separar(nova.texto).visivel) {
              resposta = nova;
              r = separar(nova.texto);
            }
          } else anotacoes = parecer.anotacoes;
        } catch (e) {
          if (cancelou(e)) throw e; // a revisão falhou (cota, sinal): a fala do mestre vale como veio
        }
      }

      const turno = c.msgs.length;
      const quem = nome(resposta.por);
      c = {
        ...c,
        desfazer: { mem: c.mem, resumidoAte: c.resumidoAte },
        mem: aplicar(aplicar(c.mem, r.bastidores, extrairStatus(r.visivel).status, turno), anotacoes, '', turno),
        msgs: [...c.msgs, { de: 'mestre', texto: r.limpo, t: Date.now(), por: conferido && conferido !== quem ? `${quem} · conferido por ${conferido}` : quem }],
        jogada: Date.now(),
      };
      gravar(c);
      setParcial('');

      // A conversa passou do que a IA que narra aguenta inteira: o trecho mais antigo vira
      // capítulo. Falhar aqui não é grave: nada foi perdido, e a próxima rodada tenta de novo.
      if (precisaCondensar(c, folego) && c.msgs.length - condensou.current >= 4) {
        setOcupado('Fechando um capítulo na memória…');
        condensou.current = c.msgs.length;
        const { mensagens, ate } = pedidoCapitulo(c, folego);
        const capitulo = await nosBastidores(mensagens);
        if (capitulo) gravar(aplicarCapitulo(c, capitulo, ate));
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
    const pedido = prompt('Pesquisar o quê na Wikipédia? Pode pôr mais de um assunto, separados por ponto e vírgula. O resultado aparece pra você e entra na memória do mestre.')?.trim();
    if (!pedido) return;
    const termos = pedido.split(';').map((t) => t.trim()).filter(Boolean).slice(0, 4);
    setOcupado('Pesquisando…');
    try {
      const achado = await pesquisar(termos, aberta.tema);
      const nota = achado.texto ? `🔎 ${termos.join(' · ')}\n\n${achado.texto}` : `🔎 ${termos.join(' · ')}\n\nNada encontrado. Tente o nome do assunto como ele apareceria numa enciclopédia.`;
      gravar({
        ...aberta,
        mem: achado.texto ? comPesquisa(aberta.mem, termos.join('; '), achado.texto) : aberta.mem,
        msgs: [...aberta.msgs, { de: 'nota', texto: nota, t: Date.now() }],
      });
    } finally {
      setOcupado('');
    }
  }

  /** O jogador corrige a memória do mestre: tira o que está errado, fixa o que não pode ser esquecido. */
  const mudarMemoria = (patch: Partial<Memoria>) => aberta && gravar({ ...aberta, mem: { ...aberta.mem, ...patch } });

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

              <h2 className="sub">Nunca esquecer</h2>
              <p className="hint" style={{ marginTop: 0 }}>O que você anotar aqui vai na frente do mestre em toda fala, pra sempre.</p>
              {m.fixos.length > 0 && <Itens itens={m.fixos} onTirar={(i) => mudarMemoria({ fixos: m.fixos.filter((_, j) => j !== i) })} />}
              <form
                className="anotar"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!lembrete.trim()) return;
                  mudarMemoria({ fixos: [...m.fixos, lembrete.trim()] });
                  setLembrete('');
                }}
              >
                <input value={lembrete} placeholder="Ex.: Mirta me deve um favor" aria-label="Anotar lembrança" onChange={(e) => setLembrete(e.target.value)} />
                <button type="submit" className="add" disabled={!lembrete.trim()}>Anotar</button>
              </form>

              <h2 className="sub">Pendências</h2>
              {m.pendencias.length ? (
                <Itens itens={m.pendencias} onTirar={(i) => mudarMemoria({ pendencias: m.pendencias.filter((_, j) => j !== i) })} />
              ) : (
                <p className="hint" style={{ marginTop: 0 }}>Promessas, dívidas, prazos e missões em aberto aparecem aqui.</p>
              )}

              <h2 className="sub">Fatos vividos</h2>
              {m.fatos.length ? (
                <Itens itens={m.fatos} onTirar={(i) => mudarMemoria({ fatos: m.fatos.filter((_, j) => j !== i) })} />
              ) : (
                <p className="hint" style={{ marginTop: 0 }}>Nada anotado ainda.</p>
              )}
              <p className="hint">O ✕ apaga uma anotação errada: o mestre deixa de contar com ela.</p>

              {(m.resumo || m.capitulos.length > 0) && (
                <>
                  <h2 className="sub">A história até aqui</h2>
                  {m.resumo && <p className="prosa">{m.resumo}</p>}
                  {m.capitulos.map((cap, i) => (
                    <details key={i} className="capitulo">
                      <summary>Capítulo {i + 1}</summary>
                      <p className="prosa">{cap}</p>
                    </details>
                  ))}
                </>
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
              <p className="hint">
                Memória de longo prazo: {m.arquivo.length} {m.arquivo.length === 1 ? 'anotação antiga' : 'anotações antigas'}, {m.capitulos.length}{' '}
                {m.capitulos.length === 1 ? 'capítulo' : 'capítulos'} e todas as {aberta.msgs.length} falas ficam guardados. A cada fala, o que tem a
                ver com a cena volta pra frente do mestre.
              </p>
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
                {aberta.msgs.length} falas guardadas; as mais recentes (até {aberta.msgs.length - aberta.resumidoAte}, conforme a IA que
                narra) vão inteiras para o mestre, e as anteriores viram capítulo e lembrança.
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
                <FalaDoMestre key={i} bruto={msg.texto} por={msg.por} />
              ) : (
                <article key={i} className={msg.de === 'nota' ? 'fala achado' : 'fala jogador'}>{msg.texto}</article>
              ),
            )}

            {parcial && <FalaDoMestre bruto={parcial} />}
            {ocupado && <p className="hint digitando" role="status">{ocupado}</p>}
            {erro && <p className="hint err break" role="alert">Não deu: {erro}</p>}
            {erro.includes('limite de uso') && (
              <p className="hint">
                {ia.conexoes.some(pronta)
                  ? 'Todas as IAs ligadas estão no limite agora. Espere alguns minutos e toque em "Tentar de novo".'
                  : 'A IA integrada, sem chave, libera poucas falas por dia, e as de hoje acabaram. Para continuar agora e não parar mais, volte (←) e cole uma chave grátis do Gemini em "IA do mestre".'}
              </p>
            )}
            {!ligada && <p className="hint err">Nenhuma IA ligada. Volte (←) e ligue a IA integrada em "IA do mestre".</p>}

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
        {!ligada && <p className="hint">Antes, ligue a IA integrada logo abaixo, em "IA do mestre".</p>}
        {ligada && !ia.conexoes.some(pronta) && (
          <p className="hint">Usando a IA integrada, que libera poucas falas por dia. Para jogar sem parar, cole uma chave grátis em "IA do mestre", logo abaixo.</p>
        )}
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

      <section>
        <h2>Acesso</h2>
        <p className="hint" style={{ marginTop: 0 }}>Este aparelho está destrancado. Trancar pede a senha de novo na próxima vez; as aventuras continuam guardadas.</p>
        <button className="add" onClick={() => (parar.current?.abort(), onTrancar())}>Trancar</button>
      </section>
    </>
  );
}
