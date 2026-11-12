import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INTEGRADAS, TIPOS, ativas, auxiliares, chamar, conversar, escolherModelo, folegoDe, listarModelos, pesquisar, pronta, type Conexao } from './ia.ts';

const real = globalThis.fetch;
/** Troca o fetch por um de mentira durante o teste. Devolve as chamadas feitas. */
function falso(responder: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const chamadas: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = (async (url: any, init?: RequestInit) => {
    chamadas.push({ url: String(url), init });
    return responder(String(url), init);
  }) as typeof fetch;
  return chamadas;
}
const sse = (...pedacos: string[]) =>
  new Response(pedacos.map((p) => `data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\n\n`).join('') + 'data: [DONE]\n\n', {
    headers: { 'content-type': 'text/event-stream' },
  });
const erro = (status: number, message = '') => new Response(JSON.stringify({ error: { message } }), { status });

const gemini: Conexao = { tipo: 'gemini', chave: 'k1', modelo: 'gemini-flash-latest' };
const groq: Conexao = { tipo: 'groq', chave: 'k2', modelo: 'openai/gpt-oss-120b' };
const oi = [{ role: 'user' as const, content: 'oi' }];

test('escolhe o melhor modelo da lista do serviço', () => {
  assert.equal(
    escolherModelo('gemini', ['gemini-3.6-flash', 'gemini-3.8-flash-tts', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-live', 'gemini-embedding-001']),
    'gemini-3.8-flash',
  );
  assert.equal(escolherModelo('groq', ['whisper-large-v3', 'llama-3.3-70b-versatile', 'openai/gpt-oss-120b']), 'openai/gpt-oss-120b');
  assert.equal(escolherModelo('openrouter', ['google/gemma-4-31b-it:free', 'openrouter/free', 'openai/gpt-5']), 'openrouter/free');
  assert.equal(escolherModelo('groq', ['modelo-novo-que-ninguem-previu']), 'modelo-novo-que-ninguem-previu');
  assert.equal(escolherModelo('mistral', []), 'mistral-small-latest');
});

test('conexão pronta: precisa de modelo e de chave (ou de endereço próprio)', () => {
  assert.equal(pronta(gemini), true);
  assert.equal(pronta({ ...gemini, chave: ' ' }), false);
  assert.equal(pronta({ ...gemini, modelo: '' }), false);
  assert.equal(pronta({ tipo: 'outro', chave: '', modelo: 'llama3', url: 'http://localhost:11434/v1' }), true);
  assert.equal(pronta({ tipo: 'outro', chave: 'x', modelo: 'llama3' }), false);
});

test('lê a resposta em pedaços e manda a chave no cabeçalho', async () => {
  const chamadas = falso(() => sse('A chuva ', 'cai.'));
  const vistos: string[] = [];
  const texto = await chamar(gemini, oi, { onTexto: (t) => vistos.push(t) });
  assert.equal(texto, 'A chuva cai.');
  assert.deepEqual(vistos, ['A chuva ', 'A chuva cai.']);
  assert.equal(chamadas[0].url, 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
  assert.equal((chamadas[0].init?.headers as Record<string, string>).Authorization, 'Bearer k1');
  const corpo = JSON.parse(String(chamadas[0].init?.body));
  assert.equal(corpo.model, 'gemini-flash-latest');
  assert.equal(corpo.stream, true);
  globalThis.fetch = real;
});

test('serviço que responde de uma vez só também funciona', async () => {
  falso(() => new Response(JSON.stringify({ choices: [{ message: { content: 'Tudo de uma vez.' } }] }), { headers: { 'content-type': 'application/json' } }));
  assert.equal(await chamar(groq, oi), 'Tudo de uma vez.');
  globalThis.fetch = real;
});

test('cota esgotada na primeira: a segunda responde', async () => {
  const chamadas = falso((url) => (url.includes('googleapis') ? erro(429) : sse('Do Groq.')));
  const { texto, por } = await conversar([gemini, groq], oi);
  assert.equal(texto, 'Do Groq.');
  assert.equal(por.tipo, 'groq');
  assert.equal(chamadas.length, 2);
  globalThis.fetch = real;
});

test('todas falharam: o erro diz o que houve em cada uma', async () => {
  falso((url) => (url.includes('googleapis') ? erro(429) : erro(401)));
  await assert.rejects(conversar([gemini, groq], oi, { espera: 1 }), /Google Gemini: limite de uso atingido por agora · Groq: a chave foi recusada/);
  falso(() => {
    throw new TypeError('fetch failed');
  });
  await assert.rejects(conversar([gemini], oi), /sem conexão/);
  await assert.rejects(conversar([{ ...gemini, chave: '' }], oi), /Nenhuma IA ligada/);
  globalThis.fetch = real;
});

test('integradas: prontas sem chave, não mandam Authorization, e vêm depois das chaves do jogador', async () => {
  assert.ok(INTEGRADAS.length >= 1);
  assert.ok(INTEGRADAS.every(pronta));
  assert.ok(!TIPOS.some((t) => INTEGRADAS.some((i) => i.tipo === t)), 'integrada não aparece na lista de chaves');
  const cfg = { conexoes: [gemini, { ...groq, chave: '' }], pesquisar: true, integradas: true, equipe: true };
  assert.deepEqual(ativas(cfg).map((c) => c.tipo), ['gemini', ...INTEGRADAS.map((c) => c.tipo)]);
  assert.deepEqual(ativas({ ...cfg, integradas: false }).map((c) => c.tipo), ['gemini']);

  const chamadas = falso(() => sse('Sem chave.'));
  const { texto } = await conversar(ativas({ conexoes: [], pesquisar: true, integradas: true, equipe: true }), oi);
  assert.equal(texto, 'Sem chave.');
  assert.equal(chamadas[0].url, 'https://api.llm7.io/v1/chat/completions');
  // Sem chave não há o que mandar: um Authorization vazio só daria motivo pra recusa.
  assert.deepEqual(Object.keys(chamadas[0].init?.headers as object), ['Content-Type']);
  globalThis.fetch = real;
});

test('todos recusaram por pressa: espera e tenta mais uma rodada', async () => {
  let n = 0;
  const chamadas = falso(() => (++n <= 2 ? erro(429) : sse('Agora foi.')));
  const { texto, por } = await conversar([gemini, groq], oi, { espera: 1 });
  assert.equal(texto, 'Agora foi.');
  assert.equal(por.tipo, 'gemini');
  assert.equal(chamadas.length, 3);
  // Cota do dia esgotada: o serviço manda voltar em uma hora, então esperar segundos não adianta.
  const esgotada = falso(() => new Response(JSON.stringify({ error: { message: 'Daily token quota exceeded.' } }), { status: 429, headers: { 'retry-after': '3600' } }));
  await assert.rejects(conversar([gemini], oi, { espera: 1 }), /limite de uso/);
  assert.equal(esgotada.length, 1);
  // Falha que não é pressa não ganha segunda rodada.
  const outras = falso(() => erro(401));
  await assert.rejects(conversar([gemini, groq], oi, { espera: 1 }));
  assert.equal(outras.length, 2);
  globalThis.fetch = real;
});

test('cancelar para tudo, sem tentar a próxima', async () => {
  const chamadas = falso(() => {
    throw Object.assign(new Error('parou'), { name: 'AbortError' });
  });
  await assert.rejects(conversar([gemini, groq], oi), { name: 'AbortError' });
  assert.equal(chamadas.length, 1);
  globalThis.fetch = real;
});

test('erro no meio do stream vira falha, não texto', async () => {
  falso(() => new Response('data: {"error":{"code":429,"message":"rate"}}\n\n', { headers: { 'content-type': 'text/event-stream' } }));
  await assert.rejects(chamar(gemini, oi), /limite de uso/);
  globalThis.fetch = real;
});

test('chave errada é reconhecida no formato de cada serviço', async () => {
  const corpo = (status: number, json: unknown) => () => new Response(JSON.stringify(json), { status });
  // Gemini: 400, e só o texto diz que é a chave.
  falso(corpo(400, { error: { code: 400, message: 'Please pass a valid API key', status: 'INVALID_ARGUMENT' } }));
  await assert.rejects(listarModelos(gemini), /chave foi recusada/);
  // Cerebras e Mistral: 401 sem o campo "error".
  falso(corpo(401, { message: 'Wrong API Key', code: 'wrong_api_key' }));
  await assert.rejects(chamar(groq, oi), /chave foi recusada/);
  falso(corpo(401, { detail: 'Invalid API Key' }));
  await assert.rejects(chamar(groq, oi), /chave foi recusada/);
  // Um 400 qualquer continua sendo um 400, com o motivo à mostra.
  falso(corpo(400, { error: { message: 'context too long' } }));
  await assert.rejects(chamar(groq, oi), /erro 400: context too long/);
  globalThis.fetch = real;
});

test('OpenRouter: a lista de modelos é pública, então a chave é conferida à parte', async () => {
  const openrouter: Conexao = { tipo: 'openrouter', chave: 'errada', modelo: '' };
  const chamadas = falso((url) => (url.endsWith('/key') ? erro(401, 'Missing Authentication header') : new Response(JSON.stringify({ data: [{ id: 'openrouter/free' }] }))));
  await assert.rejects(listarModelos(openrouter), /chave foi recusada/);
  assert.equal(chamadas.length, 1);
  falso(() => new Response(JSON.stringify({ data: [{ id: 'openrouter/free' }] })));
  assert.deepEqual(await listarModelos(openrouter), ['openrouter/free']);
  globalThis.fetch = real;
});

test('lista de modelos: tira o prefixo, o que não conversa, e ordena pela versão', async () => {
  falso(() => new Response(JSON.stringify({ data: [{ id: 'models/gemini-3.6-flash' }, { id: 'models/gemini-embedding-001' }, { id: 'models/gemini-3.8-flash' }] })));
  assert.deepEqual(await listarModelos(gemini), ['gemini-3.8-flash', 'gemini-3.6-flash']);
  falso(() => erro(401));
  await assert.rejects(listarModelos(gemini), /chave foi recusada/);
  globalThis.fetch = real;
});

/** Uma Wikipédia de mentira: `busca` diz que verbetes cada termo acha; `artigos`, o texto de cada um. */
function wikipedia(busca: (lingua: string, termo: string) => string[], artigos: Record<string, string>) {
  return falso((url) => {
    const u = new URL(url);
    const lingua = u.hostname.split('.')[0];
    const termo = u.searchParams.get('srsearch');
    if (termo !== null) return new Response(JSON.stringify({ query: { search: busca(lingua, termo).map((title) => ({ title, snippet: `${title} é um verbete` })) } }));
    const titulo = u.searchParams.get('titles') ?? '';
    return new Response(JSON.stringify({ query: { pages: { 1: { title: titulo, extract: artigos[titulo] ?? '' } } } }));
  });
}

const KIMETSU = [
  'Kimetsu no Yaiba é uma série de mangá escrita e ilustrada por Koyoharu Gotouge, publicada entre 2016 e 2020 na revista Weekly Shonen Jump.',
  'O mangá vendeu mais de 150 milhões de cópias e a adaptação para anime bateu recordes de bilheteria no Japão em 2020.',
  'Os caçadores de demônios usam técnicas de respiração que aumentam a força e a resistência do corpo, ao custo de exaustão e de encurtar a própria vida.',
  'Os demônios só morrem expostos à luz do sol ou decapitados por lâminas forjadas com minério que absorve a luz solar.',
  'Referências',
  'Este parágrafo de rodapé fala de respiração e demônios mas vem depois das referências e não deve entrar de jeito nenhum.',
].join('\n');

test('pesquisa: um verbete por ângulo, com a abertura e os parágrafos que têm a ver', async () => {
  const chamadas = wikipedia((_, termo) => (termo.includes('Kimetsu') ? ['Kimetsu no Yaiba'] : termo.includes('Taish') ? ['Período Taishō'] : []), {
    'Kimetsu no Yaiba': KIMETSU,
    'Período Taishō': 'O período Taishō foi uma era da história do Japão entre 1912 e 1926, marcada pela abertura ao Ocidente e pela convivência do antigo com o moderno.',
  });
  const { texto, fontes } = await pesquisar(['Kimetsu no Yaiba', 'Período Taishō'], 'caçadores de demônios respiração');
  assert.deepEqual(fontes, ['Kimetsu no Yaiba', 'Período Taishō']);
  assert.ok(texto.startsWith('Kimetsu no Yaiba: Kimetsu no Yaiba é uma série de mangá'));
  assert.ok(texto.includes('técnicas de respiração'), 'o parágrafo sobre o assunto entra');
  assert.ok(texto.includes('Período Taishō: O período Taishō foi uma era'));
  assert.ok(!texto.includes('rodapé'), 'nada depois de Referências');
  assert.ok(chamadas[0].url.includes('origin=*'));
  // O parágrafo que fala do assunto vem antes do que fala de vendas.
  assert.ok(texto.indexOf('técnicas de respiração') < (texto.indexOf('150 milhões') + 1 || Infinity));
  globalThis.fetch = real;
});

test('pesquisa: verbete que só esbarra no termo fica de fora; sem português, vai o inglês', async () => {
  wikipedia((lingua, termo) => (termo === 'Oni' ? (lingua === 'pt' ? ['Lista de episódios de um anime'] : ['Oni']) : []), {
    'Lista de episódios de um anime': 'Esta é a lista de episódios de um anime qualquer, com datas de exibição e títulos em japonês e em português para consulta.',
    Oni: 'An oni is a kind of yokai, demon, orc, ogre, or troll in Japanese folklore, typically portrayed as a hulking figure with horns.',
  });
  const { texto, fontes } = await pesquisar(['Oni'], 'folclore japonês');
  assert.deepEqual(fontes, ['Oni']);
  assert.ok(texto.includes('Japanese folklore'));
  globalThis.fetch = real;
});

test('pesquisa: o mesmo verbete não entra duas vezes; sem sinal, volta vazio', async () => {
  wikipedia(() => ['Kimetsu no Yaiba'], { 'Kimetsu no Yaiba': KIMETSU });
  assert.deepEqual((await pesquisar(['Kimetsu no Yaiba', 'Yaiba Kimetsu respiração'], '')).fontes, ['Kimetsu no Yaiba']);
  falso(() => {
    throw new TypeError('offline');
  });
  assert.deepEqual(await pesquisar(['qualquer coisa']), { texto: '', fontes: [] });
  assert.deepEqual(await pesquisar([' ']), { texto: '', fontes: [] });
  globalThis.fetch = real;
});

test('raciocínio: vai ligado; modelo que recusa o parâmetro é chamado de novo sem ele', async () => {
  const corpos: any[] = [];
  const responder = (aceita: boolean) =>
    falso((_, init) => {
      const corpo = JSON.parse(String(init?.body));
      corpos.push(corpo);
      return 'reasoning_effort' in corpo && !aceita ? erro(400, 'reasoning_effort is not supported with this model') : sse('ok');
    });
  responder(true);
  await chamar(gemini, oi);
  assert.equal(corpos[0].reasoning_effort, 'medium');
  await chamar(gemini, oi, { raciocinio: 'low' });
  assert.equal(corpos[1].reasoning_effort, 'low');

  const llama: Conexao = { tipo: 'groq', chave: 'k', modelo: 'llama-sem-raciocinio' };
  corpos.length = 0;
  const chamadas = responder(false);
  assert.equal(await chamar(llama, oi), 'ok');
  assert.equal(chamadas.length, 2);
  assert.ok(!('reasoning_effort' in corpos[1]));
  // Daí em diante nem tenta: uma chamada só.
  assert.equal(await chamar(llama, oi), 'ok');
  assert.equal(chamadas.length, 3);
  // Quem não tem o parâmetro (integrada) nunca o manda.
  corpos.length = 0;
  await chamar(INTEGRADAS[0], oi);
  assert.ok(!('reasoning_effort' in corpos[0]) && !('reasoning' in corpos[0]));
  globalThis.fetch = real;
});

test('equipe: a segunda IA faz o bastidor, a que narra fica por último, a integrada fica de fora', () => {
  const cfg = { conexoes: [gemini, groq], pesquisar: true, integradas: true, equipe: true };
  assert.deepEqual(auxiliares(cfg).map((c) => c.tipo), ['groq', 'gemini']);
  assert.deepEqual(auxiliares({ ...cfg, conexoes: [gemini] }).map((c) => c.tipo), ['gemini']);
  assert.deepEqual(auxiliares({ ...cfg, conexoes: [] }), []);
  assert.deepEqual(auxiliares({ ...cfg, equipe: false }), []);
  assert.ok(folegoDe(gemini) > folegoDe(groq));
  assert.equal(folegoDe(undefined), folegoDe(INTEGRADAS[0]));
});

test('cada IA recebe as mensagens montadas pra ela', async () => {
  const chamadas = falso((url) => (url.includes('googleapis') ? erro(429) : sse('ok')));
  await conversar([gemini, groq], (c) => [{ role: 'user', content: `para ${c.tipo}` }], { espera: 1 });
  assert.equal(JSON.parse(String(chamadas[0].init?.body)).messages[0].content, 'para gemini');
  assert.equal(JSON.parse(String(chamadas[1].init?.body)).messages[0].content, 'para groq');
  globalThis.fetch = real;
});
