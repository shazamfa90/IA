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
  // Força 12 em d20 vale +1: d20+@forca.mod tem que dar 2..21, não 13..32.
  const vals = { forca: '12', 'forca.mod': '1' };
  assert.equal(resolve('d20+@forca.mod', vals), 'd20+1');
  assert.equal(resolve('d20+@forca', vals), 'd20+12', 'o valor cheio continua acessível');
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
