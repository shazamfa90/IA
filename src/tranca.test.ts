import { test } from 'node:test';
import assert from 'node:assert/strict';
import { derivar, senhaCerta } from './tranca.ts';

test('senha: a conta é estável e só a senha exata passa', async () => {
  const guardado = await derivar('abre-te sésamo');
  assert.match(guardado, /^[0-9a-f]{64}$/);
  assert.equal(await derivar('abre-te sésamo'), guardado);
  assert.equal(await senhaCerta('abre-te sésamo', guardado), true);
  assert.equal(await senhaCerta('  abre-te sésamo \n', guardado), true); // espaço sobrando do teclado do celular
  assert.equal(await senhaCerta('Abre-te sésamo', guardado), false);
  assert.equal(await senhaCerta('', guardado), false);
});

test('senha: chute não abre o Mestre IA', async () => {
  for (const chute of ['', '1234', 'senha', 'mestre', 'admin']) assert.equal(await senhaCerta(chute), false);
});
