import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOLEGO_PADRAO,
  aplicar,
  aplicarCapitulo,
  atualizar,
  camposDoStatus,
  comPesquisa,
  contexto,
  exportarCampanha,
  extrairStatus,
  importarCampanha,
  lembrar,
  lerAuxiliar,
  lerBloco,
  lerBuscas,
  memoriaEmTexto,
  memoriaVazia,
  novaCampanha,
  ordenar,
  pedidoAuxiliar,
  pedidoCapitulo,
  pedidoRefazer,
  precisaCondensar,
  relembrar,
  separar,
  sistema,
  type Campanha,
  type Msg,
} from './mestre.ts';

const RESPOSTA = `<<<RACIOCINIO
Ação: Kael aceita o anel. Memória: Mirta quer se livrar dele. Resultado: ele pega; a besta arma.
>>>
A chuva bate no telhado de zinco. Um clique metálico vem de trás da parede.

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

// --- o que o jogador vê ---------------------------------------------------

test('o jogador não vê o raciocínio nem os bastidores', () => {
  const r = separar(RESPOSTA);
  assert.ok(r.visivel.startsWith('A chuva bate'));
  assert.ok(r.visivel.includes('STATUS DO PERSONAGEM'));
  for (const segredo of ['amaldiçoado', 'BASTIDORES', 'RACIOCINIO', 'ele pega', '>>>', '<<<']) assert.ok(!r.visivel.includes(segredo), segredo);
  assert.ok(r.bastidores.includes('O anel é amaldiçoado'));
  assert.ok(r.raciocinio.includes('Resultado: ele pega'));
});

test('o histórico guarda os bastidores, não o raciocínio', () => {
  const { limpo } = separar(RESPOSTA);
  assert.ok(limpo.includes('<<<BASTIDORES') && limpo.includes('O anel é amaldiçoado'));
  assert.ok(!limpo.includes('RACIOCINIO') && !limpo.includes('ele pega'));
  assert.deepEqual(separar(limpo).visivel, separar(RESPOSTA).visivel);
});

test('enquanto a resposta chega, bloco pela metade não aparece', () => {
  const ate = (trecho: string) => RESPOSTA.slice(0, RESPOSTA.indexOf(trecho) + trecho.length);
  // No começo só há raciocínio: nada na tela.
  for (const parcial of ['<', '<<<', '<<<RACIO', ate('Kael aceita o an'), ate('a besta arma.')]) assert.equal(separar(parcial).visivel, '', parcial);
  // Depois, a narração aparece e o bloco final some conforme chega.
  for (const parcial of [ate('━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n<'), ate('<<<BAST'), ate('O anel é amal'), ate('Mirta | quer')]) {
    const { visivel } = separar(parcial);
    assert.ok(visivel.startsWith('A chuva bate') && visivel.endsWith('━'), `…${parcial.slice(-20)}`);
    assert.ok(!visivel.includes('<') && !visivel.includes('amal'));
  }
});

test('rascunho <think>, acento no nome do bloco e cerca de código somem', () => {
  const r = separar('<think>ele vai cair na armadilha</think><<<RACIOCÍNIO\nplano\n>>>A porta range.\n```\n<<<BASTIDORES\nSECRETO: armadilha no corredor\n>>>\n```');
  assert.equal(r.visivel, 'A porta range.');
  assert.equal(r.bastidores, 'SECRETO: armadilha no corredor');
  assert.equal(r.raciocinio, 'plano');
  assert.equal(separar('<think>planejando a emb').visivel, '');
});

test('consultas: pesquisar fora e lembrar da própria campanha', () => {
  const p = separar('[[PESQUISAR: Período Taishō; Oni]]');
  assert.equal(p.pesquisa, 'Período Taishō; Oni');
  assert.equal(p.visivel, '');
  const l = separar('<<<RACIOCINIO\npreciso da ficha\n>>>\n[[LEMBRAR: o ferreiro Dorn]]');
  assert.equal(l.lembrar, 'o ferreiro Dorn');
  assert.equal(l.visivel, '');
  assert.equal(separar('[[LEMBRAR: o fer').visivel, '');
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

test('status sem régua de fechamento; campos espaçados; sem status', () => {
  const { narrativa, status } = extrairStatus('Uma figura inspeciona uma caixa.\n\n━━━ STATUS DO PERSONAGEM ━━━\n• Nome: Lia\n• Condição: Vigilante\n\n\n\nO que você faz, Lia?');
  assert.deepEqual(camposDoStatus(status), [['Nome', 'Lia'], ['Condição', 'Vigilante']]);
  assert.equal(narrativa, 'Uma figura inspeciona uma caixa.\n\nO que você faz, Lia?');
  assert.equal(camposDoStatus(extrairStatus('━━━ STATUS DO PERSONAGEM ━━━\n• Nome: Lia\n\n• Condição: Ferida\n━━━━━━━━').status).length, 2);
  assert.deepEqual(camposDoStatus(extrairStatus('Cena.\n\n**━━━ STATUS DO PERSONAGEM ━━━**\n- **Nome:** Ana').status), [['Nome', 'Ana']]);
  assert.deepEqual(extrairStatus('Só narração.'), { narrativa: 'Só narração.', status: '' });
});

// --- anotar ---------------------------------------------------------------

test('bastidores viram memória; o status mostrado fica guardado', () => {
  const { visivel, bastidores } = separar(RESPOSTA);
  const mem = aplicar(memoriaVazia(), bastidores, extrairStatus(visivel).status, 7);
  assert.equal(mem.tempo, 'Dia 1, noite, chuva forte');
  assert.deepEqual(mem.fatos, ['Kael aceitou o anel de prata da velha Mirta']);
  assert.equal(mem.segredos.length, 2);
  assert.equal(mem.npcs.Mirta, 'quer se livrar do anel; sabe da maldição; vê Kael como um tolo útil');
  assert.equal(mem.vistos.Mirta, 7);
  assert.ok(mem.status.includes('Anel de prata - Nenhum efeito aparente'));
  assert.equal(aplicar(mem, 'TEMPO: dia 2').status, mem.status); // fala sem status não apaga o último
});

test('fato repetido não duplica; versão mais completa substitui; número novo vale', () => {
  let mem = aplicar(memoriaVazia(), 'FATO: Chegou ao cais à noite.');
  mem = aplicar(mem, 'FATO: Chegou ao cais à noite.\nFATO: Chegou ao cais à noite e foi reconhecida pelo estivador.');
  assert.deepEqual(mem.fatos, ['Chegou ao cais à noite e foi reconhecida pelo estivador.']);
  mem = aplicar(mem, 'FATO: Kael deve 10 moedas ao ferreiro Dorn');
  mem = aplicar(mem, 'FATO: Kael deve 50 moedas ao ferreiro Dorn');
  assert.deepEqual(mem.fatos.slice(1), ['Kael deve 50 moedas ao ferreiro Dorn']);
  // Assuntos diferentes não se confundem.
  mem = aplicar(mem, 'FATO: Kael perdeu a espada no rio');
  assert.equal(mem.fatos.length, 3);
});

test('NPC: mesmo nome substitui, sem ligar pra maiúscula; ESQUECER apaga', () => {
  let mem = aplicar(memoriaVazia(), 'SECRETO: besta armada atrás da parede falsa\nNPC: Mirta | desconfiada', '', 2);
  mem = aplicar(mem, 'NPC: mirta | agora aliada, sente gratidão\nESQUECER: besta armada atrás da parede', '', 5);
  assert.deepEqual(mem.npcs, { Mirta: 'agora aliada, sente gratidão' });
  assert.equal(mem.vistos.Mirta, 5);
  assert.deepEqual(mem.segredos, []);
  assert.deepEqual(aplicar(mem, 'ESQUECER: Mirta').npcs, {});
});

test('pendência abre e fecha; segredo revelado vira fato que o personagem sabe', () => {
  let mem = aplicar(memoriaVazia(), 'PENDENTE: pagar 50 moedas ao ferreiro Dorn até a lua cheia\nPENDENTE: achar o irmão de Mirta\nSECRETO: O anel marca o portador como oferenda ao demônio do poço');
  mem = aplicar(mem, 'RESOLVIDO: pagou as moedas ao ferreiro Dorn\nREVELADO: o anel marca o portador como oferenda');
  assert.deepEqual(mem.pendencias, ['achar o irmão de Mirta']);
  assert.ok(mem.arquivo[0].startsWith('Resolvido: pagar 50 moedas ao ferreiro Dorn'));
  assert.deepEqual(mem.segredos, []);
  assert.deepEqual(mem.fatos, ['Descobriu: O anel marca o portador como oferenda ao demônio do poço']);
});

test('memória cheia: o mais antigo desce pro arquivo, nada se perde', () => {
  let mem = memoriaVazia();
  for (let i = 1; i <= 55; i++) mem = aplicar(mem, `FATO: acontecimento número ${i} na vila ${'abcdefghij'[i % 10]}${i}`);
  assert.ok(mem.fatos.length <= 40);
  assert.equal(mem.fatos.at(-1)?.includes('número 55'), true);
  assert.equal(mem.fatos.length + mem.arquivo.length, 55);
  assert.ok(mem.arquivo[0].startsWith('Fato: acontecimento número 1 '));
});

test('bloco tolera negrito, plural, acento, lista embaixo da chave e linha sem novidade', () => {
  const itens = lerBloco(`**SECRETOS:**
- o prefeito é o mandante
- a ponte vai cair
FATO: Nenhum
TEMPO: (sem mudanças)
SECRETO: Ainda não há segredos.
PENDÊNCIA: devolver o mapa
- **NPC:** Dorn — guarda, quer propina`);
  assert.deepEqual(itens, [
    ['SECRETO', 'o prefeito é o mandante'],
    ['SECRETO', 'a ponte vai cair'],
    ['PENDENTE', 'devolver o mapa'],
    ['NPC', 'Dorn — guarda, quer propina'],
  ]);
  const mem = aplicar(memoriaVazia(), 'FATO: Nenhum guarda viu Lia entrar no armazém\nNPC: Estivador velho, desconfiado; teme Blackwood');
  assert.deepEqual(mem.fatos, ['Nenhum guarda viu Lia entrar no armazém']);
  assert.deepEqual(mem.npcs, { 'Estivador velho': 'desconfiado; teme Blackwood' });
});

// --- lembrar --------------------------------------------------------------

/** Uma campanha longa: 30 cenas já fora de vista, cada uma num lugar, e uma delas com o ferreiro. */
function longa(): Campanha {
  const lugares = ['mercado', 'templo', 'porto', 'floresta', 'mina', 'torre'];
  const msgs: Msg[] = [];
  for (let i = 0; i < 30; i++) {
    msgs.push(msg('jogador', `Sigo para o ${lugares[i % 6]} e observo o movimento com atenção redobrada.`));
    msgs.push(
      msg(
        'mestre',
        i === 4
          ? 'O ferreiro Dorn limpa as mãos no avental e baixa a voz: a espada que você trouxe foi forjada em Vaelor, e só lá alguém a conserta.\n\nO que você faz?'
          : `O ${lugares[i % 6]} está cheio de gente apressada e o vento traz cheiro de chuva sobre as barracas e os telhados.\n\nO que você faz?`,
      ),
    );
  }
  const c = campanha(msgs);
  c.resumidoAte = 56;
  return c;
}

test('lembra de uma cena antiga quando o assunto volta, e só dela', () => {
  const c = longa();
  const achados = lembrar(c, 'Pergunto ao viajante se ele conhece o ferreiro Dorn e a espada de Vaelor');
  assert.ok(achados[0].includes('forjada em Vaelor'), achados[0]);
  assert.ok(achados[0].startsWith('[cena antiga, fala 10]'));
  assert.deepEqual(lembrar(c, 'Abro a janela e respiro fundo'), []);
  // O que ainda está na conversa inteira não é lembrança.
  assert.deepEqual(lembrar(c, 'o ferreiro Dorn e a espada de Vaelor', 8), []);
});

test('a lembrança entra na memória que o mestre lê nesta cena', () => {
  const c = longa();
  assert.ok(memoriaEmTexto(c, 'Mostro a espada de Vaelor ao ferreiro').includes('LEMBRANÇAS ANTIGAS QUE VÊM AO CASO'));
  assert.ok(!memoriaEmTexto(c, 'Durmo.').includes('LEMBRANÇAS ANTIGAS'));
});

test('ordenar: palavra rara pesa mais; exige mais que uma palavra comum em comum', () => {
  const trechos = ['A cidade tem muitas pontes e mercados.', 'O dragão Ysmir dorme sob a ponte velha da cidade.', 'A cidade acorda cedo.'].map((texto) => ({ texto, rotulo: '' }));
  assert.equal(ordenar(trechos, 'onde dorme o dragão Ysmir?')[0].texto, trechos[1].texto);
  assert.deepEqual(ordenar(trechos, 'a cidade'), []);
});

test('muitos NPCs: os da cena vão inteiros, os outros só de nome', () => {
  const c = campanha([msg('jogador', 'oi')]);
  for (let i = 0; i < 30; i++) c.mem = aplicar(c.mem, `NPC: Personagem${i} | ${'descrição comprida do que quer e sente. '.repeat(4)}`, '', 0);
  c.mem = aplicar(c.mem, 'NPC: Mirta | velha do santuário; sente culpa pelo anel', '', 0);
  c.msgs = Array.from({ length: 40 }, () => msg('jogador', 'sigo'));
  const texto = memoriaEmTexto(c, 'Volto ao santuário e chamo por Mirta');
  assert.ok(texto.includes('- Mirta: velha do santuário; sente culpa pelo anel'));
  assert.ok(texto.includes('Outros conhecidos'));
  assert.ok(!texto.includes('- Personagem3: descrição comprida'));
  assert.ok(relembrar(c, 'Personagem3').startsWith('[ficha de NPC] Personagem3: descrição comprida'));
});

test('o que o jogador fixou vai sempre; dos capítulos, os dois últimos', () => {
  const c = campanha();
  c.mem.fixos = ['Mirta me deve um favor'];
  c.mem.capitulos = ['Cap. um: a chegada.', 'Cap. dois: o anel.', 'Cap. três: o poço.'];
  const texto = memoriaEmTexto(c);
  assert.ok(texto.includes('NUNCA ESQUECER:\n- Mirta me deve um favor'));
  assert.ok(texto.includes('Capítulo 2: Cap. dois') && texto.includes('Capítulo 3: Cap. três'));
  assert.ok(!texto.includes('Cap. um'));
});

test('pesquisas: a mesma substitui, as três últimas ficam, as antigas descem pro arquivo', () => {
  let mem = memoriaVazia();
  for (const t of ['a', 'b', 'c', 'd', 'D']) mem = comPesquisa(mem, t, `texto ${t}`);
  assert.deepEqual(mem.pesquisas.map((p) => p.termo), ['b', 'c', 'D']);
  assert.deepEqual(mem.arquivo, ['Pesquisa (a): texto a']);
});

// --- o que vai para o modelo ----------------------------------------------

test('o prompt leva o tema, as regras, o raciocínio, a memória e a conferência', () => {
  const c = campanha();
  c.mem = aplicar(memoriaVazia(), 'SECRETO: o anel é amaldiçoado\nPERSONAGEM: Kael, humano, ex-soldado\nPENDENTE: devolver o mapa');
  c.mem.leis = 'Magia cobra sangue.';
  const s = sistema(c);
  for (const trecho of [
    'Universo ou Tema: Fantasia sombria',
    'SISTEMA DE ANTI-ONISCIÊNCIA',
    'NPCs REALISTAS E COM EMOÇÕES',
    '<<<RACIOCINIO',
    '<<<BASTIDORES',
    '[[LEMBRAR:',
    'Magia cobra sangue.',
    '- o anel é amaldiçoado',
    '- devolver o mapa',
    'Kael, humano, ex-soldado',
  ])
    assert.ok(s.includes(trecho), trecho);
  assert.ok(!s.includes('[TEMA]'));
  assert.ok(s.trimEnd().endsWith('Escreva sempre em português do Brasil.'));
  assert.ok(s.indexOf('ANTES DE ENVIAR, CONFIRA') > s.indexOf('MEMÓRIA DO MESTRE'));
});

test('contexto começa pelo jogador, alterna papéis e pula as notas', () => {
  assert.deepEqual(contexto(campanha([msg('nota', 'pesquisa do tema')])).map((m) => m.role), ['system', 'user']);
  const c = campanha([msg('mestre', 'Intro'), msg('jogador', 'Kael'), msg('nota', 'pesquisa'), msg('jogador', 'humano'), msg('mestre', 'Cena 1')]);
  const ctx = contexto(c);
  assert.deepEqual(ctx.map((m) => m.role), ['system', 'user', 'assistant', 'user', 'assistant', 'user']);
  assert.ok(ctx[1].content.includes('INÍCIO'));
  assert.equal(ctx[3].content, 'Kael\n\nhumano');
  // A última coisa que o modelo lê é o lembrete de raciocinar antes de narrar; o recado extra vem antes dele.
  const fim = contexto(c, { extra: 'narre agora' }).at(-1)!;
  assert.equal(fim.role, 'user');
  assert.ok(fim.content.startsWith('narre agora\n\n[Lembrete do aplicativo: comece a resposta pelo bloco <<<RACIOCINIO'));
  const comJogador = contexto(campanha([msg('mestre', 'Intro'), msg('jogador', 'Abro a porta')])).at(-1)!;
  assert.ok(comJogador.content.startsWith('Abro a porta\n\n[Lembrete do aplicativo'));
});

test('IA de contexto grande recebe mais conversa inteira que a apertada', () => {
  const turno = 'x'.repeat(3000);
  const c = campanha(Array.from({ length: 40 }, (_, i) => msg(i % 2 ? 'mestre' : 'jogador', turno)));
  const letras = (folego: number) => contexto(c, { folego }).slice(1).reduce((n, m) => n + m.content.length, 0);
  assert.ok(letras(8000) <= 17000, `${letras(8000)}`);
  assert.ok(letras(48000) > 80000, `${letras(48000)}`);
  // O que já virou capítulo não vai inteiro nem pra maior.
  c.resumidoAte = 36;
  assert.ok(letras(48000) < 13500);
});

// --- capítulos ------------------------------------------------------------

test('capítulo: fecha quando a conversa passa do fôlego e guarda o trecho recente', () => {
  const turno = 'x'.repeat(1500);
  assert.equal(precisaCondensar(campanha([msg('mestre', turno), msg('jogador', 'oi')])), false);
  const msgs = Array.from({ length: 12 }, (_, i) => msg(i % 2 ? 'jogador' : 'mestre', `${i}:${turno}`));
  const c = campanha(msgs);
  assert.ok(msgs.length * 1500 > FOLEGO_PADRAO);
  assert.equal(precisaCondensar(c), true);
  assert.equal(precisaCondensar(c, 48000), false); // a mesma conversa cabe inteira numa IA maior

  const { ate, mensagens } = pedidoCapitulo(c);
  assert.ok(ate > 0 && ate < msgs.length - 2, `corte em ${ate}`);
  assert.equal(msgs[ate].de, 'jogador');
  assert.ok(mensagens[1].content.includes('0:xxx'));
  assert.ok(!mensagens[1].content.includes(`${msgs.length - 1}:xxx`));
});

test('capítulo fechado: resumo entra, fatos e segredos ficam como estavam', () => {
  const c = campanha([msg('mestre', 'a'), msg('jogador', 'b'), msg('mestre', 'c'), msg('jogador', 'd')]);
  c.mem = aplicar(memoriaVazia(), 'FATO: f1 aconteceu\nSECRETO: s1 escondido\nNPC: Mirta | velha');
  const nova = aplicarCapitulo(c, 'CAPÍTULO: Kael chegou à vila\ne aceitou o anel.\nRESUMO: Um ex-soldado numa vila amaldiçoada.\nPENDENTE: descobrir o que há no poço', 2);
  assert.equal(nova.resumidoAte, 2);
  assert.deepEqual(nova.mem.capitulos, ['Kael chegou à vila\ne aceitou o anel.']);
  assert.equal(nova.mem.resumo, 'Um ex-soldado numa vila amaldiçoada.');
  assert.deepEqual(nova.mem.pendencias, ['descobrir o que há no poço']);
  assert.deepEqual(nova.mem.fatos, ['f1 aconteceu']);
  assert.deepEqual(nova.mem.segredos, ['s1 escondido']);
  assert.equal(aplicarCapitulo(c, 'Desculpe, não entendi.', 2), c);
});

// --- a equipe -------------------------------------------------------------

test('o auxiliar recebe a memória, a ação e a fala; e o narrador, o motivo da devolução', () => {
  const c = campanha([msg('jogador', 'Pego o anel da mão dela.')]);
  c.mem = aplicar(memoriaVazia(), 'SECRETO: o anel é amaldiçoado');
  const [sistemaAux, pedido] = pedidoAuxiliar(c, RESPOSTA);
  assert.ok(sistemaAux.content.includes('REVISOR e ARQUIVISTA'));
  for (const trecho of ['- o anel é amaldiçoado', 'Pego o anel da mão dela.', 'clique metálico', 'Há uma besta armada']) assert.ok(pedido.content.includes(trecho), trecho);
  assert.ok(!pedido.content.includes('ele pega'), 'raciocínio não vai pro revisor');
  assert.ok(pedidoRefazer(['AGÊNCIA: o mestre falou pelo jogador']).includes('- AGÊNCIA: o mestre falou pelo jogador'));
});

test('parecer do auxiliar: aprova e anota, ou devolve com motivo', () => {
  const ok = lerAuxiliar('VEREDITO: OK\nFATO: Kael ouviu um clique atrás da parede do santuário\nPENDENTE: descobrir a origem do clique');
  assert.equal(ok.refazer, false);
  const mem = aplicar(memoriaVazia(), ok.anotacoes);
  assert.deepEqual(mem.fatos, ['Kael ouviu um clique atrás da parede do santuário']);
  assert.deepEqual(mem.pendencias, ['descobrir a origem do clique']);

  const volta = lerAuxiliar('**VEREDITO:** REFAZER\nMOTIVO: AGÊNCIA — a narração escreveu a fala de Kael; devolva a decisão ao jogador');
  assert.equal(volta.refazer, true);
  assert.equal(volta.motivos.length, 1);
  assert.equal(lerAuxiliar('VEREDITO: REFAZER').refazer, false); // sem motivo não há o que corrigir
  assert.equal(lerAuxiliar('não sei').refazer, false);
});

test('plano de pesquisa: uma busca por ângulo; sem plano, o próprio tema', () => {
  assert.deepEqual(lerBuscas('BUSCA: Kimetsu no Yaiba\nBUSCA: "Período Taishō"\n- BUSCA: Oni (folclore)\nBUSCA: Kimetsu no Yaiba', 'tema'), ['Kimetsu no Yaiba', 'Período Taishō', 'Oni (folclore)']);
  assert.deepEqual(lerBuscas('Claro! Aqui vão algumas ideias.', 'Piratas e mares malditos\nsegunda linha'), ['Piratas e mares malditos']);
});

// --- guardar --------------------------------------------------------------

test('aventura exportada volta inteira, com id novo', () => {
  const c = campanha([msg('mestre', separar(RESPOSTA).limpo), msg('jogador', 'abro a porta')]);
  c.mem = aplicar(memoriaVazia(), separar(RESPOSTA).bastidores);
  c.mem.fixos = ['não esquecer'];
  c.resumidoAte = 1;
  const volta = importarCampanha(exportarCampanha(c));
  assert.notEqual(volta.id, c.id);
  assert.deepEqual(volta.msgs, c.msgs);
  assert.deepEqual(volta.mem, c.mem);
  assert.equal(volta.resumidoAte, 1);
  assert.throws(() => importarCampanha('{"oi":1}'), /não é uma aventura/);
  assert.throws(() => importarCampanha('lixo'), /não deu pra ler/);
});

test('aventura salva pela versão antiga do app ganha os campos novos da memória', () => {
  const antiga = { ...campanha(), mem: { leis: 'L', personagem: 'P', tempo: '', status: '', resumo: 'R', fatos: ['f'], segredos: ['s'], npcs: { Mirta: 'velha' }, pesquisas: [] } } as unknown as Campanha;
  const nova = atualizar(antiga);
  assert.deepEqual(nova.mem.fatos, ['f']);
  assert.deepEqual([nova.mem.pendencias, nova.mem.capitulos, nova.mem.fixos, nova.mem.arquivo, nova.mem.vistos], [[], [], [], [], {}]);
  assert.ok(memoriaEmTexto(nova).includes('- Mirta: velha'));
  assert.deepEqual(aplicar(nova.mem, 'PENDENTE: achar o mapa').pendencias, ['achar o mapa']);
});
