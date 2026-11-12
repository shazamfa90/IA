import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chamar, conversar, escolherModelo, listarModelos, pesquisar, pronta, type Conexao } from './ia.ts';

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
  await assert.rejects(conversar([gemini, groq], oi), /Google Gemini: a cota grátis acabou por agora · Groq: a chave foi recusada/);
  falso(() => {
    throw new TypeError('fetch failed');
  });
  await assert.rejects(conversar([gemini], oi), /sem conexão/);
  await assert.rejects(conversar([{ ...gemini, chave: '' }], oi), /Nenhuma IA ligada/);
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
  await assert.rejects(chamar(gemini, oi), /cota grátis/);
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

test('pesquisa: português primeiro, inglês se não achar, vazio se cair', async () => {
  const pagina = (title: string, extract: string, index: number) => ({ title, extract, index });
  const chamadas = falso((url) =>
    url.includes('pt.wikipedia')
      ? new Response(JSON.stringify({ batchcomplete: '' }))
      : new Response(JSON.stringify({ query: { pages: { 2: pagina('B', 'segundo', 2), 1: pagina('A', 'primeiro\n texto', 1) } } })),
  );
  assert.equal(await pesquisar('demon slayer'), 'A: primeiro texto\nB: segundo');
  assert.ok(chamadas[0].url.includes('origin=*'));
  assert.ok(chamadas[0].url.includes('gsrsearch=demon+slayer'));
  falso(() => {
    throw new TypeError('offline');
  });
  assert.equal(await pesquisar('qualquer'), '');
  globalThis.fetch = real;
});
