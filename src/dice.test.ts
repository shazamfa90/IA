import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roll, rollOnce, resolve } from './dice.ts';

const range = (n: number, lo: number, hi: number) => n >= lo && n <= hi;

test('constante e soma', () => {
  assert.equal(rollOnce('5').total, 5);
  assert.equal(rollOnce('2+3').total, 5);
  assert.equal(rollOnce('10-4').total, 6);
});

test('d20+5 fica na faixa', () => {
  for (let i = 0; i < 200; i++) assert.ok(range(rollOnce('d20+5').total, 6, 25));
});

test('4d6kh3 descarta o menor e fica na faixa', () => {
  for (let i = 0; i < 200; i++) {
    const r = rollOnce('4d6kh3');
    assert.ok(range(r.total, 3, 18), `total ${r.total}`);
    assert.match(r.detail, /~~\d+~~/); // exatamente um dado riscado
    assert.equal((r.detail.match(/~~/g) ?? []).length, 2);
  }
});

test('kl mantém os menores', () => {
  for (let i = 0; i < 200; i++) assert.ok(range(rollOnce('4d6kl1').total, 1, 6));
});

test('dl1 descarta um: mesma faixa de 4d6kh3', () => {
  for (let i = 0; i < 200; i++) assert.ok(range(rollOnce('4d6dl1').total, 3, 18));
});

test('@campo vira valor da ficha, campo ausente vira 0', () => {
  assert.equal(resolve('d20+@forca', { forca: 3 }), 'd20+3');
  assert.equal(resolve('d20+@nada', {}), 'd20+0');
  for (let i = 0; i < 100; i++) assert.ok(range(roll('d20+@forca', { forca: 3 })[0].total, 4, 23));
});

test('6#4d6kh3 devolve 6 rolagens', () => {
  const rs = roll('6#4d6kh3');
  assert.equal(rs.length, 6);
  for (const r of rs) assert.ok(range(r.total, 3, 18));
});

test('notação inválida lança erro legível', () => {
  assert.throws(() => rollOnce('banana'), /Termo inválido/);
  assert.throws(() => rollOnce(''), /vazia/);
  assert.throws(() => rollOnce('9999d6'), /fora do limite/);
  assert.throws(() => rollOnce('d1'), /Lados fora do limite/);
});

test('a rolagem soma o modificador, não o valor do atributo', () => {
  // Força 12 em d20 vale +1: d20+@forca tem que dar 2..21, não 13..32.
  const vals = { forca: '1', 'forca.mod': '1', 'forca.valor': '12' };
  assert.equal(resolve('d20+@forca.mod', vals), 'd20+1');
  assert.equal(resolve('d20+@forca', vals), 'd20+1', 'o padrão é o modificador');
  assert.equal(resolve('d20+@forca.valor', vals), 'd20+12', 'o atributo cheio, quando alguém quiser');
  for (let i = 0; i < 200; i++) {
    const t = roll('d20+@forca.mod', vals)[0].total;
    assert.ok(t >= 2 && t <= 21, `total ${t}`);
  }
});

test('modificador negativo entra como subtração', () => {
  assert.equal(resolve('d20+@forca.mod', { 'forca.mod': '-2' }), 'd20-2', 'nada de "d20+-2" na cara da mesa');
  assert.equal(resolve('d20-@forca.mod', { 'forca.mod': '-2' }), 'd20+2', 'menos com menos dá mais');
  assert.equal(resolve('d20+@forca.mod', { 'forca.mod': '2' }), 'd20+2', 'positivo segue igual');
  for (let i = 0; i < 100; i++) {
    const t = roll('d20+@forca.mod', { 'forca.mod': '-2' })[0].total;
    assert.ok(t >= -1 && t <= 18, `total ${t}`);
  }
});

// --- outros ramos de RPG ------------------------------------------------------

test('d% é d100 (Call of Cthulhu)', () => {
  for (let i = 0; i < 300; i++) assert.ok(range(rollOnce('d%').total, 1, 100));
});

test('4dF: cada dado −1, 0 ou +1 (Fate)', () => {
  const vistos = new Set<number>();
  for (let i = 0; i < 300; i++) {
    const r = rollOnce('4dF+2');
    assert.ok(range(r.total, -2, 6), `total ${r.total}`);
    assert.match(r.detail, /^\[[+0−](, [+0−]){3}\] \+ 2$/);
    vistos.add(r.total);
  }
  assert.ok(vistos.size > 4, 'sai de tudo um pouco');
});

test('d6! explode: tirou 6, rola de novo e soma', () => {
  let explodiu = false;
  for (let i = 0; i < 500; i++) {
    const r = rollOnce('d6!');
    const dados = r.detail.slice(1, -1).split(', ').map(Number);
    assert.equal(r.total, dados.reduce((a, b) => a + b, 0));
    // todo dado antes do último é 6; o último não é
    dados.slice(0, -1).forEach((v) => assert.equal(v, 6));
    assert.notEqual(dados.at(-1), 6);
    if (dados.length > 1) explodiu = true;
  }
  assert.ok(explodiu, 'em 500 rolagens algum 6 aparece');
});

test('d2! tem teto: não roda para sempre', () => {
  for (let i = 0; i < 50; i++) assert.ok(rollOnce('d2!').detail.split(', ').length <= 101);
});

test('5d10>=6 conta sucessos (Vampiro, Storyteller)', () => {
  for (let i = 0; i < 300; i++) {
    const r = rollOnce('5d10>=6');
    const dados = [...r.detail.matchAll(/(\d+)(✓?)/g)].slice(0, 5);
    const sucessos = dados.filter(([, v]) => Number(v) >= 6).length;
    assert.equal(r.total, sucessos, r.detail);
    dados.forEach(([, v, marca]) => assert.equal(Boolean(marca), Number(v) >= 6));
    assert.match(r.detail, /\d+ sucessos?$/);
  }
});

test('sucessos com modificador e alvo vindo da ficha', () => {
  for (let i = 0; i < 100; i++) assert.ok(range(roll('3d6>=@alvo+1', { alvo: 5 })[0].total, 1, 4));
  for (let i = 0; i < 100; i++) assert.ok(range(rollOnce('6d6<=2').total, 0, 6));
});

test('explosão com sucessos (Shadowrun, Year Zero)', () => {
  for (let i = 0; i < 100; i++) assert.ok(rollOnce('4d6!>=5').total >= 0);
});

test('dado Fate não explode', () => {
  assert.throws(() => rollOnce('4dF!'), /Fate/);
});

test('@{campo} colado no dado: parada vinda da ficha', () => {
  assert.equal(resolve('@{forca}d10>=6+@{briga}d10>=6', { forca: 3, briga: 2 }), '3d10>=6+2d10>=6');
  for (let i = 0; i < 100; i++) assert.ok(range(roll('@{forca}d10>=6+@{briga}d10>=6', { forca: 3, briga: 2 })[0].total, 0, 5));
  assert.equal(resolve('d@{agilidade}!', { agilidade: 8 }), 'd8!', 'Savage Worlds: o tipo de dado vem da ficha');
});

test('parada vazia vale zero, sem erro', () => {
  assert.deepEqual(rollOnce('0d10>=6'), { total: 0, detail: '[]' });
  assert.equal(roll('@{nada}d10>=6+2', {})[0].total, 2);
});
