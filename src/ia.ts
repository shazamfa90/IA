/**
 * A conversa com os modelos de linguagem e a pesquisa.
 *
 * O app já vem com uma IA integrada: um serviço gratuito que aceita uso sem conta e sem
 * chave, então o mestre funciona na hora. Serve pra experimentar: usa um modelo pequeno e
 * a cota diária sem chave acaba em poucas falas (medido: ~25 mil tokens, umas cinco falas).
 * IA grátis sem limite nenhum não existe em serviço hospedado; o que chega perto é
 * somar cotas: quem cola chaves grátis de serviços maiores ganha narração melhor e, quando a
 * cota de um acaba, `conversar` passa sozinho pro próximo, terminando na integrada.
 * Tudo sai direto do navegador do jogador para o serviço: o app não tem servidor, e as
 * chaves ficam só neste aparelho.
 */
import type { Chat } from './mestre.ts';
import { ordenar, palavras } from './memoria.ts';

export type Tipo = 'gemini' | 'groq' | 'openrouter' | 'cerebras' | 'mistral' | 'outro' | 'llm7';

type Info = {
  nome: string;
  /** Endereço da API no formato OpenAI, que todos estes serviços falam. */
  url: string;
  /** Onde se pega a chave grátis. */
  chaves: string;
  /** Onde conferir a chave, quando a lista de modelos é pública e aceitaria qualquer uma. */
  confere?: string;
  /** Modelo usado quando a lista do serviço não pôde ser lida. */
  padrao: string;
  /** Preferência entre os modelos que o serviço listar, do melhor pro aceitável. */
  prefere: RegExp[];
  dica: string;
  /** Integrada: funciona sem chave, com o modelo fixo de `padrao`. */
  semChave?: boolean;
  /**
   * Quanto de conversa recente (em letras) esta IA recebe inteira. Quem tem contexto grande
   * e cota folgada lê mais falas palavra por palavra; as apertadas recebem menos e contam
   * com o resumo e as lembranças.
   */
  folego: number;
  /** O que mandar junto no pedido pra ligar o raciocínio do modelo, no nível pedido. */
  raciocinio?: (nivel: 'medium' | 'low') => Record<string, unknown>;
};

const esforco = (nivel: 'medium' | 'low') => ({ reasoning_effort: nivel });

export const PROVEDORES: Record<Tipo, Info> = {
  gemini: {
    nome: 'Google Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai',
    chaves: 'https://aistudio.google.com/apikey',
    padrao: 'gemini-flash-latest',
    prefere: [/^gemini-[\d.]+-flash$/, /^gemini-flash-latest$/, /^gemini-[\d.]+-flash-lite$/, /^gemini-.*flash/],
    dica: 'A cota grátis mais folgada e a melhor narração. Comece por esta.',
    folego: 48000,
    raciocinio: esforco,
  },
  groq: {
    nome: 'Groq',
    url: 'https://api.groq.com/openai/v1',
    chaves: 'https://console.groq.com/keys',
    padrao: 'openai/gpt-oss-120b',
    prefere: [/gpt-oss-120b/, /llama.*70b/, /qwen/, /gpt-oss/, /llama/],
    dica: 'Muito rápido: ótimo auxiliar (revisão e memória) e boa reserva de narrador.',
    folego: 9000, // o plano grátis conta poucos tokens por minuto
    raciocinio: esforco,
  },
  openrouter: {
    nome: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1',
    chaves: 'https://openrouter.ai/settings/keys',
    padrao: 'openrouter/free',
    confere: '/key',
    prefere: [/^openrouter\/free$/, /:free$/],
    dica: 'Escolhe sozinho um modelo grátis disponível. Cota diária pequena.',
    folego: 24000,
    raciocinio: (nivel) => ({ reasoning: { effort: nivel } }),
  },
  cerebras: {
    nome: 'Cerebras',
    url: 'https://api.cerebras.ai/v1',
    chaves: 'https://cloud.cerebras.ai',
    padrao: 'gpt-oss-120b',
    prefere: [/gpt-oss-120b/, /llama.*70b/, /qwen/, /llama/],
    dica: 'Rápido e com cota diária generosa.',
    folego: 24000,
    raciocinio: esforco,
  },
  mistral: {
    nome: 'Mistral',
    url: 'https://api.mistral.ai/v1',
    chaves: 'https://console.mistral.ai/api-keys',
    padrao: 'mistral-small-latest',
    prefere: [/^mistral-medium-latest$/, /^mistral-small-latest$/, /^mistral-large-latest$/, /-latest$/],
    dica: 'Plano grátis de experimentação, bom em português.',
    folego: 24000,
  },
  outro: {
    nome: 'Outro (compatível com OpenAI)',
    url: '',
    chaves: '',
    padrao: '',
    prefere: [],
    dica: 'Qualquer serviço ou programa que fale o formato OpenAI — por exemplo o Ollama rodando no seu PC.',
    folego: 16000,
  },
  llm7: {
    nome: 'Mistral Nemo (LLM7)',
    url: 'https://api.llm7.io/v1',
    chaves: '',
    padrao: 'mistral-Nemo-Instruct-2407',
    prefere: [],
    dica: 'Integrada, sem chave. Responde em uns 15 segundos; sem chave, libera poucas falas por dia.',
    semChave: true,
    folego: 8000,
  },
};

/** Os serviços que pedem uma chave do jogador, na ordem em que aparecem na tela. */
export const TIPOS = (Object.keys(PROVEDORES) as Tipo[]).filter((t) => !PROVEDORES[t].semChave);

/**
 * As IAs que já vêm ligadas, na ordem em que são tentadas. Só entra aqui serviço que aceita
 * uso anônimo vindo de um site; os que pedem verificação anti-robô no navegador ficam de fora.
 */
export const INTEGRADAS: Conexao[] = (Object.keys(PROVEDORES) as Tipo[])
  .filter((t) => PROVEDORES[t].semChave)
  .map((tipo) => ({ tipo, chave: '', modelo: PROVEDORES[tipo].padrao }));

export type Conexao = { tipo: Tipo; chave: string; modelo: string; /** Só no tipo "outro". */ url?: string };
/** A ordem é a prioridade: a primeira responde; as outras entram quando ela falha. */
export type ConfigIA = {
  conexoes: Conexao[];
  pesquisar: boolean;
  /** Usar as IAs sem chave. */
  integradas: boolean;
  /** Uma segunda IA revisa cada fala e cuida da memória. */
  equipe: boolean;
};

const KEY = 'ficha-rpg-ia';

export function carregarIA(): ConfigIA {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? '');
    return {
      conexoes: Array.isArray(c?.conexoes) ? c.conexoes : [],
      pesquisar: c?.pesquisar !== false,
      integradas: c?.integradas !== false,
      equipe: c?.equipe !== false,
    };
  } catch {
    return { conexoes: [], pesquisar: true, integradas: true, equipe: true };
  }
}

export const salvarIA = (c: ConfigIA) => localStorage.setItem(KEY, JSON.stringify(c));

/** Pronta pra uso: tem modelo, e tem chave (ou é integrada, ou um endereço próprio, que pode não pedir). */
export const pronta = (c: Conexao) =>
  !!c.modelo.trim() && (PROVEDORES[c.tipo].semChave || (c.tipo === 'outro' ? !!c.url?.trim() : !!c.chave.trim()));

/** Quem responde, em ordem: as chaves do jogador (modelos melhores) e depois as integradas. */
export const ativas = (cfg: ConfigIA): Conexao[] => [...cfg.conexoes.filter(pronta), ...(cfg.integradas ? INTEGRADAS : [])];

/**
 * Quem faz o trabalho de bastidor (revisar, arquivar, planejar pesquisa), em ordem. É a
 * fila das chaves do jogador girada: a segunda IA vem primeiro e a que narra fica por último.
 * Assim as duas trabalham ao mesmo tempo na mesma fala e nenhuma cota carrega tudo sozinha.
 * A integrada fica de fora: a cota dela sem chave é pequena demais pra gastar com bastidor.
 */
export function auxiliares(cfg: ConfigIA): Conexao[] {
  const [narrador, ...resto] = cfg.conexoes.filter(pronta);
  return cfg.equipe && narrador ? [...resto, narrador] : [];
}

/** Quanto de conversa recente a IA que narra aguenta: é ela que dita o tamanho do capítulo. */
export const folegoDe = (c: Conexao | undefined): number => (c ? PROVEDORES[c.tipo].folego : PROVEDORES.llm7.folego);

const base = (c: Conexao) => (c.tipo === 'outro' ? (c.url ?? '') : PROVEDORES[c.tipo].url).trim().replace(/\/+$/, '');
const cabecalhos = (c: Conexao): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(c.chave.trim() ? { Authorization: `Bearer ${c.chave.trim()}` } : {}),
});

export class ErroIA extends Error {
  status: number;
  /** Em quantos segundos o serviço disse pra voltar (cabeçalho Retry-After), se disse. */
  depois: number;
  constructor(status: number, detalhe = '', depois = 0) {
    super(explicar(status, detalhe));
    this.status = status;
    this.depois = depois;
  }
}

/** Chave errada não vem sempre como 401: o Gemini, por exemplo, responde 400 e diz no texto. */
const CHAVE_RUIM = /api[ _-]?key|authentication|unauthorized/i;

function explicar(status: number, detalhe: string): string {
  if (status === 429) return 'limite de uso atingido por agora';
  if (status === 401 || status === 403 || (status === 400 && CHAVE_RUIM.test(detalhe))) return 'a chave foi recusada';
  if (status === 404) return 'o modelo escolhido não existe mais: escolha outro';
  if (status === 0) return detalhe || 'sem conexão com o serviço';
  return `erro ${status}${detalhe ? `: ${detalhe.slice(0, 160)}` : ''}`;
}

async function erroDe(res: Response): Promise<ErroIA> {
  let detalhe = '';
  try {
    const j = await res.json();
    // Cada serviço põe o motivo num lugar: error.message, error, message ou detail.
    const e = (Array.isArray(j) ? j[0] : j) ?? {};
    const achado = e.error?.message ?? e.error ?? e.message ?? e.detail;
    detalhe = typeof achado === 'string' ? achado : '';
  } catch {
    // corpo sem JSON: o número do erro já diz o bastante
  }
  return new ErroIA(res.status, detalhe, Number(res.headers.get('retry-after')) || 0);
}

const NAO_CONVERSA = /embed|whisper|tts|guard|image|imagen|audio|live|rerank|moderat|veo|transcri|speech|lyria|robotics|computer|aqa|ocr|vision-only/i;

/** Maior versão primeiro: "gemini-3.8-flash" antes de "gemini-3.6-flash". */
const porVersao = (a: string, b: string) => b.localeCompare(a, undefined, { numeric: true });

/**
 * Dos modelos que o serviço oferece, o melhor para narrar. Os nomes mudam de poucos em
 * poucos meses; escolher pela lista evita o app parar quando um modelo é aposentado.
 */
export function escolherModelo(tipo: Tipo, ids: string[]): string {
  const conversam = ids.filter((id) => !NAO_CONVERSA.test(id));
  for (const padrao of PROVEDORES[tipo].prefere) {
    const achados = conversam.filter((id) => padrao.test(id)).sort(porVersao);
    if (achados.length) return achados[0];
  }
  return conversam[0] ?? PROVEDORES[tipo].padrao;
}

/** Os modelos de conversa do serviço. Também serve de teste da chave. */
export async function listarModelos(c: Conexao, sinal?: AbortSignal): Promise<string[]> {
  let res: Response;
  try {
    const confere = c.tipo === 'outro' ? undefined : PROVEDORES[c.tipo].confere;
    if (confere) {
      const chave = await fetch(base(c) + confere, { headers: cabecalhos(c), signal: sinal });
      if (!chave.ok) throw await erroDe(chave);
    }
    res = await fetch(`${base(c)}/models`, { headers: cabecalhos(c), signal: sinal });
  } catch (e) {
    if ((e as Error).name === 'AbortError' || e instanceof ErroIA) throw e;
    throw new ErroIA(0);
  }
  if (!res.ok) throw await erroDe(res);
  const j = await res.json();
  const dados: any[] = Array.isArray(j) ? j : (j?.data ?? j?.models ?? []);
  return dados
    .map((m) => String(m?.id ?? m?.name ?? '').replace(/^models\//, ''))
    .filter((id) => id && !NAO_CONVERSA.test(id))
    .sort(porVersao);
}

type Opcoes = {
  /** Chamado a cada pedaço que chega, com o texto inteiro até ali. */
  onTexto?: (texto: string) => void;
  sinal?: AbortSignal;
  temperatura?: number;
  /** Quanto o modelo raciocina antes de responder. Narrar pede mais; bastidor, menos. */
  raciocinio?: 'medium' | 'low';
  /** Quanto esperar antes da segunda rodada, quando todos recusaram por pressa. */
  espera?: number;
};

/** Conexões cujo modelo recusou o pedido de raciocínio: daí em diante vão sem ele. */
const semRaciocinio = new Set<string>();

/** Uma chamada a um serviço, lendo a resposta conforme ela chega. */
export async function chamar(c: Conexao, mensagens: Chat[], o: Opcoes = {}): Promise<string> {
  const marca = `${c.tipo}/${c.modelo}`;
  const pedir = async (extras: Record<string, unknown>) => {
    try {
      return await fetch(`${base(c)}/chat/completions`, {
        method: 'POST',
        headers: cabecalhos(c),
        body: JSON.stringify({ model: c.modelo.trim(), messages: mensagens, temperature: o.temperatura ?? 0.9, stream: true, ...extras }),
        signal: o.sinal,
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      throw new ErroIA(0);
    }
  };
  // Raciocínio sempre ligado onde o serviço aceita. Nem todo modelo aceita o parâmetro: se o
  // pedido voltar como inválido, repete sem ele e não tenta mais com este modelo.
  const extras = semRaciocinio.has(marca) ? {} : (PROVEDORES[c.tipo].raciocinio?.(o.raciocinio ?? 'medium') ?? {});
  let res = await pedir(extras);
  if ((res.status === 400 || res.status === 422) && Object.keys(extras).length) {
    const erro = await erroDe(res);
    if (/recusada/.test(erro.message)) throw erro; // chave errada também vem como 400
    semRaciocinio.add(marca);
    res = await pedir({});
  }
  if (!res.ok) throw await erroDe(res);

  // Serviço que ignora o "stream" responde de uma vez só.
  if (!res.body || !(res.headers.get('content-type') ?? '').includes('event-stream')) {
    const j = await res.json();
    const texto = String(j?.choices?.[0]?.message?.content ?? '');
    o.onTexto?.(texto);
    return texto;
  }

  const leitor = res.body.getReader();
  const dec = new TextDecoder();
  let resto = '';
  let texto = '';
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    resto += dec.decode(value, { stream: true });
    const linhas = resto.split('\n');
    resto = linhas.pop() ?? '';
    for (const linha of linhas) {
      const dado = linha.trim().replace(/^data:\s*/, '');
      if (!dado.startsWith('{')) continue; // comentários, linhas vazias e o [DONE]
      let j: any;
      try {
        j = JSON.parse(dado);
      } catch {
        continue;
      }
      if (j.error) throw new ErroIA(Number(j.error.code) || 500, j.error.message ?? '');
      const parte = j.choices?.[0]?.delta?.content;
      if (typeof parte === 'string' && parte) {
        texto += parte;
        o.onTexto?.(texto);
      }
    }
  }
  return texto;
}

/**
 * Pergunta às conexões em ordem até uma responder. Cota esgotada, chave recusada, serviço
 * fora do ar: passa pra próxima. Só para de vez se o jogador cancelar ou se nenhuma servir.
 */
export async function conversar(
  conexoes: Conexao[],
  /** As mensagens, ou como montá-las pra cada IA: cada uma recebe o tanto de conversa que aguenta. */
  mensagens: Chat[] | ((c: Conexao) => Chat[]),
  o: Opcoes = {},
): Promise<{ texto: string; por: Conexao }> {
  const prontas = conexoes.filter(pronta);
  if (!prontas.length) throw new Error('Nenhuma IA ligada. Ligue a IA integrada ou cole uma chave em "IA do mestre".');
  let falhas: string[] = [];
  // Duas rodadas: serviço grátis recusa quem pede rápido demais, e uns segundos depois aceita.
  // Cota do dia esgotada (o serviço manda voltar daqui a muito tempo) não melhora esperando.
  for (let rodada = 0; rodada < 2; rodada++) {
    falhas = [];
    let apressado = false;
    for (const c of prontas) {
      try {
        o.onTexto?.('');
        const texto = await chamar(c, typeof mensagens === 'function' ? mensagens(c) : mensagens, o);
        if (texto.trim()) return { texto, por: c };
        falhas.push(`${PROVEDORES[c.tipo].nome}: resposta vazia`);
      } catch (e) {
        if ((e as Error).name === 'AbortError') throw e;
        apressado ||= (e as ErroIA).status === 429 && !((e as ErroIA).depois > 20);
        falhas.push(`${PROVEDORES[c.tipo].nome}: ${(e as Error).message}`);
      }
    }
    if (!apressado || rodada) break;
    await esperar(o.espera ?? 6000, o.sinal);
  }
  throw new Error(falhas.join(' · '));
}

/** Pausa que o "parar" interrompe. */
function esperar(ms: number, sinal?: AbortSignal): Promise<void> {
  return new Promise((ok, erro) => {
    const parou = () => (clearTimeout(t), erro(Object.assign(new Error('parou'), { name: 'AbortError' })));
    const t = setTimeout(() => (sinal?.removeEventListener('abort', parou), ok()), ms);
    if (sinal?.aborted) parou();
    else sinal?.addEventListener('abort', parou, { once: true });
  });
}

// --- Pesquisa ------------------------------------------------------------

async function wiki(lingua: string, params: Record<string, string>, sinal?: AbortSignal): Promise<any> {
  // origin=* é o que libera a consulta direto do navegador.
  const q = new URLSearchParams({ action: 'query', format: 'json', origin: '*', ...params });
  const res = await fetch(`https://${lingua}.wikipedia.org/w/api.php?${q}`, { signal: sinal });
  return res.ok ? res.json() : null;
}

const semTags = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#0?39;/g, "'");
/** Daqui pra baixo o verbete é bibliografia e lista de links: não ajuda a narrar. */
const RODAPE = /\n(Referências|Notas|Ver também|Ligações externas|Bibliografia|References|Notes|See also|External links|Further reading)\s*\n/;

/** Os verbetes que a busca devolve pro termo e que de fato falam dele. */
async function acharVerbetes(lingua: string, termo: string, sinal?: AbortSignal): Promise<string[]> {
  const j = await wiki(lingua, { list: 'search', srsearch: termo, srlimit: '4', srprop: 'snippet' }, sinal);
  const alvo = new Set(palavras(termo));
  return ((j?.query?.search ?? []) as any[])
    // A busca devolve também o que só esbarra no termo. Fica quem tem palavra do termo no
    // título, ou pelo menos duas no resumo.
    .filter((h) => {
      const noTitulo = palavras(h.title).filter((p) => alvo.has(p)).length;
      const noResumo = new Set(palavras(semTags(h.snippet ?? '')).filter((p) => alvo.has(p))).size;
      return noTitulo > 0 || noResumo >= Math.min(2, alvo.size);
    })
    .map((h) => String(h.title));
}

/** O texto corrido de um verbete, em parágrafos, sem o rodapé. */
async function lerVerbete(lingua: string, titulo: string, sinal?: AbortSignal): Promise<string[]> {
  const j = await wiki(lingua, { titles: titulo, prop: 'extracts', explaintext: '1', exsectionformat: 'plain', redirects: '1' }, sinal);
  const pagina: any = Object.values(j?.query?.pages ?? {})[0];
  const texto = String(pagina?.extract ?? '').split(RODAPE)[0];
  return texto
    .split(/\n+/)
    .map((p) => p.trim().replace(/\s+/g, ' '))
    .filter((p) => p.length >= 80);
}

export type Pesquisa = { texto: string; fontes: string[] };

/**
 * Pesquisa na Wikipédia: de graça, sem chave e sem limite prático.
 *
 * Cada termo é um ângulo do assunto e ganha o próprio verbete, primeiro em português e,
 * se não houver, em inglês. De cada verbete entram a abertura (que diz o que a coisa é) e
 * os parágrafos que mais têm a ver com o termo e com o assunto geral — não só o começo do
 * artigo, que costuma falar de autor e data. O espaço é dividido entre os termos, pra um
 * verbete comprido não engolir os outros. Devolve vazio quando não acha ou não há sinal:
 * pesquisa nunca trava a mesa.
 */
export async function pesquisar(termos: string[], assunto = '', sinal?: AbortSignal, orcamento = 1800): Promise<Pesquisa> {
  const pedidos = [...new Set(termos.map((t) => t.trim()).filter(Boolean))].slice(0, 5);
  if (!pedidos.length) return { texto: '', fontes: [] };
  const usados = new Set<string>();
  const porTermo = Math.max(500, Math.floor(orcamento / pedidos.length));

  const achar = async (termo: string): Promise<{ titulo: string; texto: string } | null> => {
    for (const lingua of ['pt', 'en']) {
      try {
        for (const titulo of await acharVerbetes(lingua, termo, sinal)) {
          if (usados.has(titulo.toLowerCase())) continue;
          const paragrafos = await lerVerbete(lingua, titulo, sinal);
          if (!paragrafos.length) continue;
          usados.add(titulo.toLowerCase());
          const [abertura, ...resto] = paragrafos;
          const melhores = ordenar(resto.map((texto) => ({ texto, rotulo: titulo })), `${termo} ${assunto}`).map((t) => t.texto);
          const escolhidos = [abertura.slice(0, 300)];
          let gasto = escolhidos[0].length;
          for (const p of melhores) {
            const corte = p.slice(0, 420);
            if (gasto + corte.length > porTermo) break;
            escolhidos.push(corte);
            gasto += corte.length;
          }
          return { titulo, texto: escolhidos.join(' […] ') };
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') throw e;
      }
    }
    return null;
  };

  // Um termo de cada vez: o mesmo verbete não entra duas vezes, e a Wikipédia não vê rajada.
  const achados: { titulo: string; texto: string }[] = [];
  for (const termo of pedidos) {
    const a = await achar(termo);
    if (a) achados.push(a);
  }
  return { texto: achados.map((a) => `${a.titulo}: ${a.texto}`).join('\n\n'), fontes: achados.map((a) => a.titulo) };
}
