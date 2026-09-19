import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slug, encodeTemplate, decodeTemplate, EXAMPLE, load } from './store.ts';

test('slug tira acento e espaço', () => {
  assert.equal(slug('Força'), 'forca');
  assert.equal(slug('Força de Vontade'), 'forcadevontade');
  assert.equal(slug('Pontos de Vida'), 'pontosdevida');
  assert.equal(slug('%%%'), 'campo');
});

test('slug desempata id repetido', () => {
  assert.equal(slug('Força', ['forca']), 'forca2');
  assert.equal(slug('Força', ['forca', 'forca2']), 'forca3');
});

test('link do template sobrevive a acento', () => {
  const t = EXAMPLE();
  const back = decodeTemplate(encodeTemplate(t));
  assert.equal(back.name, t.name);
  assert.deepEqual(back.sections, t.sections);
  assert.deepEqual(back.rolls, t.rolls);
  assert.equal(back.sections[0].fields[0].label, 'Força');
  assert.equal(back.sections[1].fields[2].label, 'Inspiração');
});

test('link recebe id novo pra não sobrescrever sistema salvo', () => {
  const t = EXAMPLE();
  assert.notEqual(decodeTemplate(encodeTemplate(t)).id, t.id);
});

test('link é seguro em URL', () => {
  assert.doesNotMatch(encodeTemplate(EXAMPLE()), /[+/=]/);
});

test('link corrompido dá erro, não tela branca', () => {
  assert.throws(() => decodeTemplate(encodeTemplate({ name: '', sections: [], rolls: [] } as never)), /inválido/);
  assert.throws(() => decodeTemplate('nao-e-base64-valido!!'));
});

// localStorage não existe no node: stub mínimo só pra exercitar a migração.
function withStorage(raw: string | null, fn: () => void) {
  const store = new Map(raw === null ? [] : [['ficha-rpg', raw]]);
  (globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
  };
  try { fn(); } finally { delete (globalThis as any).localStorage; }
}

test('migra a ficha do formato antigo sem perder valores', () => {
  const old = JSON.stringify({
    template: { name: 'Antigo', sections: [{ title: 'A', fields: [{ id: 'forca', label: 'Força', type: 'number' }] }], rolls: [{ label: 'T', notation: 'd20+@forca' }] },
    character: { name: 'Thorin', avatarUrl: 'http://x', values: { forca: '4' } },
    webhookUrl: 'https://discord.com/api/webhooks/1/abc',
  });
  withStorage(old, () => {
    const s = load();
    assert.equal(s.templates.length, 1);
    assert.equal(s.templates[0].name, 'Antigo');
    assert.equal(s.templates[0].sections[0].fields[0].label, 'Força');
    assert.equal(s.characters[0].name, 'Thorin');
    assert.equal(s.characters[0].values.forca, '4');
    assert.equal(s.characters[0].templateId, s.templates[0].id);
    assert.equal(s.currentId, s.characters[0].id);
    assert.equal(s.webhookUrl, 'https://discord.com/api/webhooks/1/abc');
  });
});

test('storage vazio ou corrompido cai no estado inicial', () => {
  withStorage(null, () => assert.equal(load().templates.length, 1));
  withStorage('{{{', () => assert.ok(load().currentId));
  withStorage('{"templates":[]}', () => assert.equal(load().templates.length, 1));
});
