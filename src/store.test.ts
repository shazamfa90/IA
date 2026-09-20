import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slug, encodeTemplate, decodeTemplate, EXAMPLE, load, renameField, migrateValues, parseAssign, applyRoll, unknownTargets, filledTargets } from './store.ts';

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
    webhookUrl: 'https://discord.example/webhook',
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
    assert.equal(s.webhookUrl, 'https://discord.example/webhook');
    // a migração tem que dar um perfil dono, senão a ficha some da lista
    assert.equal(s.profiles.length, 1);
    assert.equal(s.characters[0].profileId, s.profiles[0].id);
    assert.equal(s.currentProfileId, s.profiles[0].id);
  });
});

test('estado sem perfis adota todas as fichas num perfil só', () => {
  const semPerfil = JSON.stringify({
    templates: [{ id: 't1', name: 'X', sections: [], rolls: [] }],
    characters: [
      { id: 'c1', templateId: 't1', name: 'Um', avatarUrl: '', values: {} },
      { id: 'c2', templateId: 't1', name: 'Dois', avatarUrl: '', values: {} },
    ],
    currentId: 'c2',
    webhookUrl: '',
  });
  withStorage(semPerfil, () => {
    const s = load();
    assert.equal(s.profiles.length, 1);
    assert.equal(s.characters.length, 2, 'nenhuma ficha pode se perder na adoção');
    assert.ok(s.characters.every((c) => c.profileId === s.profiles[0].id));
    assert.equal(s.currentId, 'c2');
  });
});

test('perfil atual apagado cai no primeiro em vez de abrir vazio', () => {
  const orfao = JSON.stringify({
    profiles: [{ id: 'p1', name: 'A', theme: 'escuro', accent: '#fff' }],
    currentProfileId: 'p-que-nao-existe',
    templates: [{ id: 't1', name: 'X', sections: [], rolls: [] }],
    characters: [],
    currentId: null,
    webhookUrl: '',
  });
  withStorage(orfao, () => assert.equal(load().currentProfileId, 'p1'));
});

test('storage vazio ou corrompido cai no estado inicial', () => {
  withStorage(null, () => assert.equal(load().templates.length, 1));
  withStorage('{{{', () => assert.ok(load().currentId));
  withStorage('{"templates":[]}', () => assert.equal(load().templates.length, 1));
  withStorage(null, () => assert.equal(load().profiles.length, 1));
});

// --- renomear campo: o @id acompanha o rótulo -----------------------------

const tpl = () => ({
  id: 't',
  name: 'Sistema',
  sections: [{ id: 's', title: 'Atributos', fields: [{ id: 'campo', label: 'Campo', type: 'number' as const }] }],
  rolls: [{ id: 'r', label: 'Teste', notation: 'd20+@campo' }],
});

test('campo novo renomeado ganha o @id do rótulo', () => {
  const { template, newId } = renameField(tpl(), 's', 'campo', 'Destreza');
  assert.equal(newId, 'destreza');
  assert.equal(template.sections[0].fields[0].id, 'destreza');
  assert.equal(template.sections[0].fields[0].label, 'Destreza');
});

test('minúsculo, sem acento, ç vira c', () => {
  const casos: [string, string][] = [
    ['Destreza', 'destreza'],
    ['Força', 'forca'],
    ['Coração', 'coracao'],
    ['CONSTITUIÇÃO', 'constituicao'],
    ['Pontos de Vida', 'pontosdevida'],
    ['Ação Heróica', 'acaoheroica'],
  ];
  for (const [rotulo, esperado] of casos) {
    assert.equal(renameField(tpl(), 's', 'campo', rotulo).newId, esperado, rotulo);
  }
});

test('a rolagem acompanha o id novo, senão apontaria pro nada', () => {
  const { template } = renameField(tpl(), 's', 'campo', 'Destreza');
  assert.equal(template.rolls[0].notation, 'd20+@destreza');
});

test('@forca não engole o começo de @forcadevontade', () => {
  const t = {
    id: 't', name: 'S',
    sections: [{ id: 's', title: 'A', fields: [
      { id: 'forca', label: 'Força', type: 'number' as const },
      { id: 'forcadevontade', label: 'Força de Vontade', type: 'number' as const },
    ] }],
    rolls: [{ id: 'r', label: 'T', notation: 'd20+@forca+@forcadevontade' }],
  };
  const { template } = renameField(t, 's', 'forca', 'Vigor');
  assert.equal(template.rolls[0].notation, 'd20+@vigor+@forcadevontade');
});

test('rótulos iguais não colidem em um id só', () => {
  const t = {
    id: 't', name: 'S',
    sections: [{ id: 's', title: 'A', fields: [
      { id: 'forca', label: 'Força', type: 'number' as const },
      { id: 'campo', label: 'Campo', type: 'number' as const },
    ] }],
    rolls: [],
  };
  assert.equal(renameField(t, 's', 'campo', 'Força').newId, 'forca2');
});

test('valor já preenchido acompanha a renomeação', () => {
  assert.deepEqual(migrateValues({ campo: '4', pv: '10' }, 'campo', 'destreza'), { destreza: '4', pv: '10' });
  assert.deepEqual(migrateValues({ pv: '10' }, 'campo', 'destreza'), { pv: '10' }, 'campo sem valor não inventa chave');
  assert.deepEqual(migrateValues({ campo: '4' }, 'campo', 'campo'), { campo: '4' }, 'id igual não mexe em nada');
});

test('renomear preserva a ordem dos campos na ficha', () => {
  const v = migrateValues({ a: '1', campo: '2', z: '3' }, 'campo', 'destreza');
  assert.deepEqual(Object.keys(v), ['a', 'destreza', 'z']);
});

// --- rolagem que preenche a ficha ----------------------------------------

test('destinos são lidos na ordem escrita', () => {
  assert.deepEqual(parseAssign('@forca @destreza @constituicao'), ['forca', 'destreza', 'constituicao']);
  assert.deepEqual(parseAssign('@forca, @destreza'), ['forca', 'destreza'], 'vírgula é só enfeite');
  assert.deepEqual(parseAssign(''), []);
  assert.deepEqual(parseAssign(undefined), []);
});

test('os totais caem nos campos, em ordem', () => {
  assert.deepEqual(applyRoll({}, ['forca', 'destreza'], [14, 9]), { forca: '14', destreza: '9' });
});

test('sobra de qualquer lado não inventa nem apaga campo', () => {
  assert.deepEqual(applyRoll({}, ['a', 'b', 'c'], [1, 2]), { a: '1', b: '2' }, 'dados a menos: c fica intocado');
  assert.deepEqual(applyRoll({}, ['a'], [1, 2, 3]), { a: '1' }, 'dados a mais são descartados');
});

test('preencher não mexe no resto da ficha', () => {
  assert.deepEqual(applyRoll({ pv: '10', forca: '3' }, ['forca'], [18]), { pv: '10', forca: '18' });
});

test('destino que não existe é apontado antes de a mesa usar', () => {
  const t = { id: 't', name: 'S', sections: [{ id: 's', title: 'A', fields: [{ id: 'forca', label: 'F', type: 'number' as const }] }], rolls: [] };
  assert.deepEqual(unknownTargets('@forca @destreza', t), ['destreza']);
  assert.deepEqual(unknownTargets('@forca', t), []);
  assert.deepEqual(unknownTargets(undefined, t), []);
});

test('avisa quais destinos já têm valor, pra não apagar ficha em uso', () => {
  assert.deepEqual(filledTargets({ forca: '3', destreza: '' }, ['forca', 'destreza']), ['forca']);
  assert.deepEqual(filledTargets({ forca: '   ' }, ['forca']), [], 'só espaço não conta como preenchido');
  assert.deepEqual(filledTargets({}, ['forca']), []);
});

test('renomear campo leva o destino junto, senão o preenchimento quebra', () => {
  const t = {
    id: 't', name: 'S',
    sections: [{ id: 's', title: 'A', fields: [{ id: 'forca', label: 'Força', type: 'number' as const }] }],
    rolls: [{ id: 'r', label: 'Atributos', notation: '6#4d6kh3', assign: '@forca @outro' }],
  };
  const { template } = renameField(t, 's', 'forca', 'Vigor');
  assert.equal(template.rolls[0].assign, '@vigor @outro');
});
