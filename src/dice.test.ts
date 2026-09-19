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
