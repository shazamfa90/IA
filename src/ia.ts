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
};

export const PROVEDORES: Record<Tipo, Info> = {
  gemini: {
    nome: 'Google Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai',
    chaves: 'https://aistudio.google.com/apikey',
    padrao: 'gemini-flash-latest',
    prefere: [/^gemini-[\d.]+-flash$/, /^gemini-flash-latest$/, /^gemini-[\d.]+-flash-lite$/, /^gemini-.*flash/],
    dica: 'A cota grátis mais folgada e a melhor narração. Comece por esta.',
  },
  groq: {
    nome: 'Groq',
    url: 'https://api.groq.com/openai/v1',
    chaves: 'https://console.groq.com/keys',
    padrao: 'openai/gpt-oss-120b',
    prefere: [/gpt-oss-120b/, /llama.*70b/, /qwen/, /gpt-oss/, /llama/],
    dica: 'Muito rápido. Boa reserva para quando a primeira cota acabar.',
  },
  openrouter: {
    nome: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1',
    chaves: 'https://openrouter.ai/settings/keys',
    padrao: 'openrouter/free',
    confere: '/key',
    prefere: [/^openrouter\/free$/, /:free$/],
    dica: 'Escolhe sozinho um modelo grátis disponível. Cota diária pequena.',
  },
  cerebras: {
    nome: 'Cerebras',
    url: 'https://api.cerebras.ai/v1',
    chaves: 'https://cloud.cerebras.ai',
    padrao: 'gpt-oss-120b',
    prefere: [/gpt-oss-120b/, /llama.*70b/, /qwen/, /llama/],
    dica: 'Rápido e com cota diária generosa.',
  },
  mistral: {
    nome: 'Mistral',
    url: 'https://api.mistral.ai/v1',
    chaves: 'https://console.mistral.ai/api-keys',
    padrao: 'mistral-small-latest',
    prefere: [/^mistral-medium-latest$/, /^mistral-small-latest$/, /^mistral-large-latest$/, /-latest$/],
    dica: 'Plano grátis de experimentação, bom em português.',
  },
  outro: {
    nome: 'Outro (compatível com OpenAI)',
    url: '',
    chaves: '',
    padrao: '',
    prefere: [],
    dica: 'Qualquer serviço ou programa que fale o formato OpenAI — por exemplo o Ollama rodando no seu PC.',
  },
  llm7: {
    nome: 'Mistral Nemo (LLM7)',
    url: 'https://api.llm7.io/v1',
    chaves: '',
    padrao: 'mistral-Nemo-Instruct-2407',
    prefere: [],
    dica: 'Integrada, sem chave. Responde em uns 15 segundos; sem chave, libera poucas falas por dia.',
    semChave: true,
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
export type ConfigIA = { conexoes: Conexao[]; pesquisar: boolean; /** Usar as IAs sem chave. */ integradas: boolean };

const KEY = 'ficha-rpg-ia';

export function carregarIA(): ConfigIA {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? '');
    return { conexoes: Array.isArray(c?.conexoes) ? c.conexoes : [], pesquisar: c?.pesquisar !== false, integradas: c?.integradas !== false };
  } catch {
    return { conexoes: [], pesquisar: true, integradas: true };
  }
}

export const salvarIA = (c: ConfigIA) => localStorage.setItem(KEY, JSON.stringify(c));

/** Pronta pra uso: tem modelo, e tem chave (ou é integrada, ou um endereço próprio, que pode não pedir). */
export const pronta = (c: Conexao) =>
  !!c.modelo.trim() && (PROVEDORES[c.tipo].semChave || (c.tipo === 'outro' ? !!c.url?.trim() : !!c.chave.trim()));

/** Quem responde, em ordem: as chaves do jogador (modelos melhores) e depois as integradas. */
export const ativas = (cfg: ConfigIA): Conexao[] => [...cfg.conexoes.filter(pronta), ...(cfg.integradas ? INTEGRADAS : [])];

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
  /** Quanto esperar antes da segunda rodada, quando todos recusaram por pressa. */
  espera?: number;
};

/** Uma chamada a um serviço, lendo a resposta conforme ela chega. */
export async function chamar(c: Conexao, mensagens: Chat[], o: Opcoes = {}): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${base(c)}/chat/completions`, {
      method: 'POST',
      headers: cabecalhos(c),
      body: JSON.stringify({ model: c.modelo.trim(), messages: mensagens, temperature: o.temperatura ?? 0.9, stream: true }),
      signal: o.sinal,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ErroIA(0);
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
export async function conversar(conexoes: Conexao[], mensagens: Chat[], o: Opcoes = {}): Promise<{ texto: string; por: Conexao }> {
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
        const texto = await chamar(c, mensagens, o);
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

async function wikipedia(lingua: string, termo: string, sinal?: AbortSignal): Promise<string> {
  const q = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: termo,
    gsrlimit: '3',
    prop: 'extracts',
    exintro: '1',
    explaintext: '1',
    exlimit: '3',
    exchars: '700',
    format: 'json',
    origin: '*', // é o que libera a consulta direto do navegador
  });
  const res = await fetch(`https://${lingua}.wikipedia.org/w/api.php?${q}`, { signal: sinal });
  if (!res.ok) return '';
  const paginas: any[] = Object.values((await res.json())?.query?.pages ?? {});
  return paginas
    .sort((a, b) => a.index - b.index)
    .filter((p) => p.extract?.trim())
    .map((p) => `${p.title}: ${p.extract.trim().replace(/\s+/g, ' ')}`)
    .join('\n');
}

/**
 * Pesquisa na Wikipédia, em português e depois em inglês. É de graça, sem chave e sem
 * limite prático. Devolve '' quando não acha ou não há sinal: pesquisa nunca trava a mesa.
 */
export async function pesquisar(termo: string, sinal?: AbortSignal): Promise<string> {
  for (const lingua of ['pt', 'en']) {
    try {
      const achado = await wikipedia(lingua, termo, sinal);
      if (achado) return achado;
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
    }
  }
  return '';
}
