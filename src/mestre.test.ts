import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LIMITE_CONVERSA,
  TETO_CONVERSA,
  aplicar,
  aplicarCondensado,
  camposDoStatus,
  comPesquisa,
  contexto,
  exportarCampanha,
  extrairStatus,
  importarCampanha,
  lerBloco,
  memoriaVazia,
  novaCampanha,
  pedidoCondensar,
  precisaCondensar,
  separar,
  sistema,
  type Campanha,
  type Msg,
} from './mestre.ts';

const RESPOSTA = `A chuva bate no telhado de zinco. Um clique metálico vem de trás da parede.

O que você faz?

━━━ STATUS DO PERSONAGEM ━━━
• Nome: Kael
• Condição: Ileso, cansado
• Inventário: Anel de prata - Nenhum efeito aparente
━━━━━━━━━━━━━━━━━━━━━━━━━━

<<<BASTIDORES
TEMPO: Dia 1, noite, chuva forte
FATO: Kael aceitou o anel de prata da velha Mirta
SECRETO: O anel é amaldiçoado: drena a sorte de quem o usa
SECRETO: Há uma besta armada atrás da parede falsa
NPC: Mirta | quer se livrar do anel; sabe da maldição; vê Kael como um tolo útil
>>>`;

const msg = (de: Msg['de'], texto: string): Msg => ({ de, texto, t: 0 });
const campanha = (msgs: Msg[] = []): Campanha => ({ ...novaCampanha('Fantasia sombria', 1), msgs });

test('o jogador não vê os bastidores', () => {
  const { visivel, bastidores } = separar(RESPOSTA);
  assert.ok(visivel.includes('clique metálico'));
  assert.ok(visivel.includes('STATUS DO PERSONAGEM'));
  assert.ok(!visivel.includes('amaldiçoado'));
  assert.ok(!visivel.includes('BASTIDORES'));
  assert.ok(!visivel.includes('>>>'));
  assert.ok(bastidores.includes('O anel é amaldiçoado'));
});

test('enquanto a resposta chega, o bloco pela metade não aparece', () => {
  const ate = (trecho: string) => RESPOSTA.slice(0, RESPOSTA.indexOf(trecho) + trecho.length);
  for (const parcial of [ate('<'), ate('<<<'), ate('<<<BAST'), ate('O anel é amal'), ate('Mirta | quer')]) {
    const { visivel } = separar(parcial);
    assert.ok(!visivel.includes('<'), `vazou marcador em: …${parcial.slice(-20)}`);
    assert.ok(!visivel.includes('amal'), 'vazou segredo');
    assert.ok(visivel.endsWith('━'), 'cortou além do bloco');
  }
});

test('rascunho <think> e cerca de código em volta do bloco somem', () => {
  const { visivel, bastidores } = separar('<think>ele vai cair na armadilha</think>A porta range.\n```\n<<<BASTIDORES\nSECRETO: armadilha no corredor\n>>>\n```');
  assert.equal(visivel, 'A porta range.');
  assert.equal(bastidores, 'SECRETO: armadilha no corredor');
  assert.equal(separar('<think>planejando a emb').visivel, '');
});

test('pedido de pesquisa é lido e não aparece', () => {
  const r = separar('[[PESQUISAR: respirações Kimetsu no Yaiba]]');
  assert.equal(r.pesquisa, 'respirações Kimetsu no Yaiba');
  assert.equal(r.visivel, '');
  assert.equal(separar('[[PESQUISAR: resp').visivel, '');
  assert.equal(separar('Você entra na taverna.').pesquisa, '');
});

test('status sai da narração e vira campos', () => {
  const { narrativa, status } = extrairStatus(separar(RESPOSTA).visivel);
  assert.ok(narrativa.endsWith('O que você faz?'));
  assert.ok(!narrativa.includes('━'));
  assert.deepEqual(camposDoStatus(status), [
    ['Nome', 'Kael'],
    ['Condição', 'Ileso, cansado'],
    ['Inventário', 'Anel de prata - Nenhum efeito aparente'],
  ]);
});

test('status sem régua de fechamento vai até o fim; sem status, narração intacta', () => {
  const { narrativa, status } = extrairStatus('Cena.\n\n**━━━ STATUS DO PERSONAGEM ━━━**\n- **Nome:** Ana\n- Condição: Ferida');
  assert.equal(narrativa, 'Cena.');
  assert.deepEqual(camposDoStatus(status), [['Nome', 'Ana'], ['Condição', 'Ferida']]);
  assert.deepEqual(extrairStatus('Só narração.'), { narrativa: 'Só narração.', status: '' });
});

test('bastidores viram memória; o status mostrado fica guardado', () => {
  const { visivel, bastidores } = separar(RESPOSTA);
  const mem = aplicar(memoriaVazia(), bastidores, extrairStatus(visivel).status);
  assert.equal(mem.tempo, 'Dia 1, noite, chuva forte');
  assert.deepEqual(mem.fatos, ['Kael aceitou o anel de prata da velha Mirta']);
  assert.equal(mem.segredos.length, 2);
  assert.equal(mem.npcs.Mirta, 'quer se livrar do anel; sabe da maldição; vê Kael como um tolo útil');
  assert.ok(mem.status.includes('Anel de prata - Nenhum efeito aparente'));
});

test('memória acumula, NPC é substituído, repetido não duplica, ESQUECER apaga', () => {
  let mem = aplicar(memoriaVazia(), 'FATO: deve 10 moedas ao ferreiro\nSECRETO: besta atrás da parede\nNPC: Mirta | desconfiada');
  mem = aplicar(mem, 'FATO: deve 10 moedas ao ferreiro\nFATO: perna esquerda ferida\nNPC: Mirta | agora aliada\nESQUECER: besta atrás da parede');
  assert.deepEqual(mem.fatos, ['deve 10 moedas ao ferreiro', 'perna esquerda ferida']);
  assert.deepEqual(mem.segredos, []);
  assert.deepEqual(mem.npcs, { Mirta: 'agora aliada' });
  // Mensagem sem status não apaga o último que o jogador viu.
  assert.equal(aplicar({ ...mem, status: 'Nome: Kael' }, 'TEMPO: dia 2').status, 'Nome: Kael');
});

test('bloco tolera negrito, plural, lista embaixo da chave e linha sem novidade', () => {
  const itens = lerBloco(`**SECRETOS:**
- o prefeito é o mandante
- a ponte vai cair
FATO: Nenhum
TEMPO: (sem mudanças)
- **NPC:** Dorn — guarda, quer propina`);
  assert.deepEqual(itens, [
    ['SECRETO', 'o prefeito é o mandante'],
    ['SECRETO', 'a ponte vai cair'],
    ['NPC', 'Dorn — guarda, quer propina'],
  ]);
  assert.deepEqual(aplicar(memoriaVazia(), '- **NPC:** Dorn — guarda, quer propina').npcs, { Dorn: 'guarda, quer propina' });
});

test('o prompt leva o tema, as regras e a memória secreta', () => {
  const c = campanha();
  c.mem = aplicar(memoriaVazia(), 'SECRETO: o anel é amaldiçoado\nPERSONAGEM: Kael, humano, ex-soldado');
  c.mem.leis = 'Magia cobra sangue.';
  const s = sistema(c);
  assert.ok(s.includes('Universo ou Tema: Fantasia sombria'));
  assert.ok(!s.includes('[TEMA]'));
  assert.ok(s.includes('SISTEMA DE ANTI-ONISCIÊNCIA'));
  assert.ok(s.includes('STATUS DO PERSONAGEM'));
  assert.ok(s.includes('<<<BASTIDORES'));
  assert.ok(s.includes('Magia cobra sangue.'));
  assert.ok(s.includes('- o anel é amaldiçoado'));
  assert.ok(s.includes('Kael, humano, ex-soldado'));
});

test('contexto começa pelo jogador, alterna papéis e pula as notas', () => {
  assert.deepEqual(contexto(campanha()).map((m) => m.role), ['system', 'user']);
  const c = campanha([msg('mestre', 'Intro'), msg('jogador', 'Kael'), msg('nota', 'pesquisa'), msg('jogador', 'humano'), msg('mestre', 'Cena 1')]);
  const ctx = contexto(c);
  assert.deepEqual(ctx.map((m) => m.role), ['system', 'user', 'assistant', 'user', 'assistant']);
  assert.ok(ctx[1].content.includes('INÍCIO'));
  assert.equal(ctx[3].content, 'Kael\n\nhumano');
  assert.equal(contexto(c, 'narre agora').at(-1)?.content, 'narre agora');
});

test('contexto só leva o que ainda não foi resumido', () => {
  const c = campanha([msg('mestre', 'velho'), msg('jogador', 'velho também'), msg('mestre', 'novo'), msg('jogador', 'ataco')]);
  c.resumidoAte = 2;
  const ctx = contexto(c);
  assert.ok(!ctx.some((m) => m.content === 'velho'));
  assert.ok(ctx[1].content.includes('continua'));
  assert.equal(ctx.at(-1)?.content, 'ataco');
});

test('contexto tem teto mesmo se a condensação nunca funcionar', () => {
  const turno = 'x'.repeat(4000);
  const c = campanha(Array.from({ length: 40 }, (_, i) => msg(i % 2 ? 'mestre' : 'jogador', turno)));
  const letras = contexto(c).slice(1).reduce((n, m) => n + m.content.length, 0);
  assert.ok(letras <= TETO_CONVERSA + 200, `${letras} letras`);
  assert.ok(letras > TETO_CONVERSA / 2);
});

test('condensar: avisa quando passa do limite e guarda o trecho recente', () => {
  const turno = 'x'.repeat(1500);
  const curta = campanha([msg('mestre', turno), msg('jogador', 'oi')]);
  assert.equal(precisaCondensar(curta), false);

  const msgs = Array.from({ length: 12 }, (_, i) => msg(i % 2 ? 'jogador' : 'mestre', `${i}:${turno}`));
  const longa = campanha(msgs);
  assert.ok(msgs.length * 1500 > LIMITE_CONVERSA);
  assert.equal(precisaCondensar(longa), true);

  const { ate, mensagens } = pedidoCondensar(longa);
  assert.ok(ate > 0 && ate < msgs.length - 2, `corte em ${ate}`);
  assert.equal(msgs[ate].de, 'jogador');
  assert.ok(mensagens[1].content.includes('0:xxx'));
  assert.ok(!mensagens[1].content.includes(`${msgs.length - 1}:xxx`));
});

test('condensado troca as anotações; resposta sem resumo não mexe em nada', () => {
  const c = campanha([msg('mestre', 'a'), msg('jogador', 'b'), msg('mestre', 'c'), msg('jogador', 'd')]);
  c.mem = aplicar(memoriaVazia(), 'FATO: f1\nFATO: f2\nSECRETO: s1\nNPC: Mirta | velha');
  const nova = aplicarCondensado(c, 'RESUMO: Kael chegou à vila\ne aceitou o anel.\nFATO: f1 e f2 juntos\nNPC: Mirta | sumiu', 2);
  assert.equal(nova.resumidoAte, 2);
  assert.equal(nova.mem.resumo, 'Kael chegou à vila\ne aceitou o anel.');
  assert.deepEqual(nova.mem.fatos, ['f1 e f2 juntos']);
  assert.deepEqual(nova.mem.segredos, ['s1']); // lista que não voltou: fica a antiga
  assert.deepEqual(nova.mem.npcs, { Mirta: 'sumiu' });
  assert.equal(aplicarCondensado(c, 'Desculpe, não entendi.', 2), c);
});

test('pesquisas: a mesma busca substitui, e só as últimas ficam', () => {
  let mem = memoriaVazia();
  for (const t of ['a', 'b', 'c', 'd', 'e', 'B']) mem = comPesquisa(mem, t, `texto ${t}`);
  assert.deepEqual(mem.pesquisas.map((p) => p.termo), ['c', 'd', 'e', 'B']);
});

test('aventura exportada volta inteira, com id novo', () => {
  const c = campanha([msg('mestre', RESPOSTA), msg('jogador', 'abro a porta')]);
  c.mem = aplicar(memoriaVazia(), separar(RESPOSTA).bastidores);
  c.resumidoAte = 1;
  const volta = importarCampanha(exportarCampanha(c));
  assert.notEqual(volta.id, c.id);
  assert.equal(volta.tema, c.tema);
  assert.deepEqual(volta.msgs, c.msgs);
  assert.deepEqual(volta.mem, c.mem);
  assert.equal(volta.resumidoAte, 1);
  assert.throws(() => importarCampanha('{"oi":1}'), /não é uma aventura/);
  assert.throws(() => importarCampanha('lixo'), /não deu pra ler/);
});
