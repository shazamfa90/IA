import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sheetEmbed, sheetSignature } from './liveSheet.ts';
import type { Character, Template } from './store.ts';

const tpl = (fields: Template['sections'][0]['fields']): Template => ({
  id: 't', name: 'Sistema', sections: [{ id: 's', title: 'Bloco', fields }], rolls: [],
});
const ch = (values: Character['values'], extra: Partial<Character> = {}): Character => ({
  id: 'c', profileId: 'p', templateId: 't', name: 'Thorin', avatarUrl: '', values, ...extra,
});

test('campo vazio vira travessão: o Discord recusa valor em branco', () => {
  const e = sheetEmbed(tpl([
    { id: 'a', label: 'Força', type: 'number' },
    { id: 'b', label: 'Notas', type: 'textarea' },
  ]), ch({}));
  assert.ok(e.fields.every((f) => f.value.length > 0), 'nenhum valor pode sair vazio');
  assert.equal(e.fields[0].value, '—');
});

test('marcador vira Sim/travessão, não true/false', () => {
  const t = tpl([{ id: 'i', label: 'Inspiração', type: 'check' }]);
  assert.equal(sheetEmbed(t, ch({ i: true })).fields[0].value, 'Sim');
  assert.equal(sheetEmbed(t, ch({ i: false })).fields[0].value, '—');
});

test('respeita os tetos do Discord', () => {
  const muitos = Array.from({ length: 40 }, (_, i) => ({ id: `f${i}`, label: `Campo ${i}`, type: 'number' as const }));
  const e = sheetEmbed(tpl(muitos), ch({}));
  assert.equal(e.fields.length, 25);
  assert.match(e.footer.text, /\+15 campos/);

  const longo = sheetEmbed(
    tpl([{ id: 'n', label: 'x'.repeat(400), type: 'textarea' }]),
    ch({ n: 'y'.repeat(3000) }),
  );
  assert.ok(longo.fields[0].name.length <= 256);
  assert.ok(longo.fields[0].value.length <= 1024);
  assert.ok(longo.title.length <= 256);
});

test('sem avatar não manda thumbnail com url vazia', () => {
  assert.equal(sheetEmbed(tpl([]), ch({})).thumbnail, undefined);
  assert.deepEqual(sheetEmbed(tpl([]), ch({}, { avatarUrl: 'http://x/a.png' })).thumbnail, { url: 'http://x/a.png' });
});

test('personagem sem nome ainda rende título válido', () => {
  assert.equal(sheetEmbed(tpl([]), ch({}, { name: '' })).title, 'Sem nome');
});

test('assinatura muda com o que aparece, e só com isso', () => {
  const t = tpl([{ id: 'a', label: 'Força', type: 'number' }]);
  const antes = sheetSignature(t, ch({ a: '3' }));
  assert.equal(antes, sheetSignature(t, ch({ a: '3' })), 'mesmo conteúdo, mesma assinatura');
  assert.notEqual(antes, sheetSignature(t, ch({ a: '4' })), 'valor mudou');
  assert.notEqual(antes, sheetSignature(t, ch({ a: '3' }, { name: 'Outro' })), 'nome mudou');
  // messageId não aparece na mensagem: guardá-lo não pode disparar outro envio
  assert.equal(antes, sheetSignature(t, ch({ a: '3' }, { messageId: '123' })));
});
