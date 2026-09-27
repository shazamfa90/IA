import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HASHIRA, atualizaHashira } from './hashira.ts';
import { comandoListar, comandoTocar, lerLista } from './discord.ts';
import { embedDaLista, lerComando } from '../bot/comando.js';
import { slug, encodeTemplate, decodeTemplate, EXAMPLE, load, renameField, migrateValues, parseAssign, applyRoll, unknownTargets, filledTargets, modifierOf, formatMod, withMods, encodeFicha, decodeFicha, addFicha, newCharacter, sha256, senhaDoMestre, tintaSobre, explicar, type State, type Template } from './store.ts';

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

// --- atributo x modificador ----------------------------------------------

test('em d20, 12 vale +1 — o atributo não é o modificador', () => {
  const casos: [number, number][] = [[3, -4], [8, -1], [10, 0], [11, 0], [12, 1], [14, 2], [16, 3], [18, 4], [20, 5]];
  for (const [attr, mod] of casos) assert.equal(modifierOf(attr, 'd20'), mod, `${attr}`);
});

test('outras regras de sistema', () => {
  assert.equal(modifierOf(13, 'metade'), 6);
  assert.equal(modifierOf(4, 'nenhum'), 4, 'sistemas em que o valor já é o modificador');
  assert.equal(modifierOf(12), 1, 'sem regra declarada, vale d20');
});

test('campo vazio não tem modificador, e zero não é vazio', () => {
  assert.equal(modifierOf('', 'd20'), null);
  assert.equal(modifierOf('   ', 'd20'), null);
  assert.equal(modifierOf(undefined, 'd20'), null);
  assert.equal(modifierOf('abc', 'd20'), null);
  assert.equal(modifierOf(0, 'd20'), -5, '0 é um valor válido, não vazio');
});

test('o sinal aparece só no positivo', () => {
  assert.equal(formatMod(3), '+3');
  assert.equal(formatMod(0), '0');
  assert.equal(formatMod(-2), '-2');
});

test('na rolagem, @forca é o modificador — é o que o mestre escreve sem pensar', () => {
  const v = withMods(EXAMPLE(), { forca: '16', pv: '30' });
  assert.equal(v.forca, '3', 'd20+@forca soma +3, não +16');
  assert.equal(v['forca.mod'], '3', 'apelido explícito do mesmo valor');
  assert.equal(v['forca.valor'], '16', 'o atributo cheio continua alcançável');
});

test('a ficha em si não é tocada: a conversão só vale na hora de rolar', () => {
  const values = { forca: '16' };
  withMods(EXAMPLE(), values);
  assert.equal(values.forca, '16');
});

test('campo comum não vira modificador', () => {
  const v = withMods(EXAMPLE(), { pv: '30' });
  assert.equal(v.pv, '30');
  assert.equal(v['pv.mod'], undefined);
  assert.equal(v['pv.valor'], undefined);
});

test('atributo em branco rola como 0, não NaN', () => {
  const v = withMods(EXAMPLE(), {});
  assert.equal(v.forca, '0');
  assert.equal(v['forca.mod'], '0');
});

// --- sistema com tema e ficha próprios -----------------------------------

test('Hashira: base 5e, tema próprio e capa', () => {
  const t = HASHIRA();
  assert.equal(t.modRule, 'd20', 'o livro adapta a 5e: modificador (valor-10)/2');
  assert.equal(t.theme, 'nichirin');
  assert.ok(t.image);
});

test('Hashira: os seis atributos da 5e, todos do tipo Atributo', () => {
  const attrs = HASHIRA().sections.flatMap((s) => s.fields).filter((f) => f.type === 'attr');
  assert.deepEqual(attrs.map((f) => f.id), ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma']);
});

test('Hashira: campos do livro que não são de 5e genérica', () => {
  const ids = HASHIRA().sections.flatMap((s) => s.fields).map((f) => f.id);
  for (const id of ['raca', 'classe', 'energia', 'energiamax', 'concentracao', 'continua', 'tecnicas']) {
    assert.ok(ids.includes(id), id);
  }
});

test('Hashira: rolar atributos preenche os seis, e só eles', () => {
  const t = HASHIRA();
  const r = t.rolls.find((r) => r.label === 'Rolar atributos')!;
  assert.equal(r.notation, '6#4d6kh3', 'seis atributos, seis rolagens');
  assert.deepEqual(parseAssign(r.assign), ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma']);
  assert.deepEqual(unknownTargets(r.assign, t), [], 'nenhum destino aponta pro vazio');
});

test('Hashira: toda rolagem aponta só pra campos que existem', () => {
  const t = HASHIRA();
  const existem = new Set(t.sections.flatMap((s) => s.fields).map((f) => f.id));
  for (const r of t.rolls) {
    for (const [, id] of r.notation.matchAll(/@([\w]+)(?:\.\w+)?/g)) {
      assert.ok(existem.has(id), `${r.label} aponta pra @${id}, que não existe`);
    }
  }
});

test('Hashira: a rolagem soma o modificador, não o atributo', () => {
  const t = HASHIRA();
  const v = withMods(t, { forca: '16', prof: '3' });
  assert.equal(v.forca, '3', 'Força 16 vale +3 na 5e');
  assert.equal(v.prof, '3', 'proficiência é número comum: entra cheia');
});

test('Hashira: tudo na ficha tem explicação no ⓘ', () => {
  const t = HASHIRA();
  for (const f of t.sections.flatMap((s) => s.fields)) assert.ok(f.desc, `campo ${f.id} sem explicação`);
  for (const r of t.rolls) assert.ok(r.desc, `rolagem ${r.label} sem explicação`);
});

test('Hashira: katana é 1d6 (1d8 a duas mãos) com Destreza, e o CR tem nome certo', () => {
  const t = HASHIRA();
  const nota = (label: string) => t.rolls.find((r) => r.label === label)?.notation;
  assert.equal(nota('Dano da katana (uma mão)'), '1d6+@destreza');
  assert.equal(nota('Dano da katana (duas mãos)'), '1d8+@destreza');
  assert.equal(t.sections.flatMap((s) => s.fields).find((f) => f.id === 'ca')?.label, 'Classe de Resistência (CR)');
});

test('explicar: a conta com o nome e o valor de cada campo', () => {
  const t = HASHIRA();
  assert.equal(explicar('d20+@destreza+@prof', t, { destreza: '16', prof: '2' }), 'd20 + Destreza (+3) + Bônus de proficiência (2)');
  assert.equal(explicar('d20+@forca', t, {}), 'd20 + Força (0)', 'atributo vazio soma zero');
  assert.equal(explicar('6#4d6kh3', t, {}), '6 × 4d6kh3');
  assert.equal(explicar('d20+@forca.valor', t, { forca: '15' }), 'd20 + Força (15)');
});

test('Hashira antigo ganha explicações sem perder o que o mestre mexeu', () => {
  const v1: Template = {
    id: 'velho',
    name: 'Hashira Handbook',
    sections: [
      { id: 's1', title: 'Combate', fields: [{ id: 'ca', label: 'Classe de armadura', type: 'number' }, { id: 'pv', label: 'Vida', type: 'number' }] },
      { id: 's2', title: 'Casa do mestre', fields: [{ id: 'honra', label: 'Honra', type: 'number' }] },
    ],
    rolls: [
      { id: 'r1', label: 'Dano da katana', notation: '1d8+@forca' },
      { id: 'r2', label: 'Golpe da casa', notation: 'd20+@honra' },
    ],
  };
  const t = atualizaHashira(v1);
  const campos = t.sections.flatMap((s) => s.fields);
  assert.equal(t.id, 'velho', 'as fichas continuam apontando pro mesmo sistema');
  assert.equal(t.livro, 'hashira');
  assert.equal(campos.find((f) => f.id === 'ca')?.label, 'Classe de Resistência (CR)');
  assert.equal(campos.find((f) => f.id === 'pv')?.label, 'Vida', 'rótulo renomeado pelo mestre fica');
  assert.ok(campos.find((f) => f.id === 'pv')?.desc);
  assert.ok(campos.some((f) => f.id === 'honra'), 'campo da casa fica');
  assert.ok(campos.some((f) => f.id === 'forca'), 'o que faltava entra');
  assert.equal(new Set(campos.map((f) => f.id)).size, campos.length, 'nenhum campo duplicado');
  assert.ok(!t.rolls.some((r) => r.notation === '1d8+@forca'), 'katana errada sai');
  assert.ok(t.rolls.some((r) => r.label === 'Golpe da casa'), 'rolagem da casa fica');
  assert.equal(atualizaHashira(t), t, 'rodar de novo não mexe');
  assert.equal(atualizaHashira(EXAMPLE()).livro, undefined, 'outro sistema não vira Hashira');
});

test('Hashira: cada sistema importado é uma cópia independente', () => {
  assert.notEqual(HASHIRA().id, HASHIRA().id);
});

// --- link de ficha ---------------------------------------------------------

const perfil = (id: string) => ({ id, name: id, theme: 'escuro' as const, accent: '#fff' });
const aparelho = (templates: Template[] = []): State => ({
  profiles: [perfil('ana'), perfil('bia')],
  currentProfileId: 'bia',
  templates,
  characters: [],
  currentId: null,
  webhookUrl: '',
  gmWebhookUrl: '',
});
function tanjiro() {
  const t = HASHIRA();
  const c = { ...newCharacter(t.id, 'ana', 'Tanjiro'), avatarUrl: 'https://i.imgur.com/a.png', values: { forca: '16', notas: 'Água' }, messageId: 'm1' };
  return { t, c };
}

test('ficha vai pelo link com o sistema junto, acento e tudo', () => {
  const { t, c } = tanjiro();
  const f = decodeFicha(encodeFicha(t, c));
  assert.equal(f.c.name, 'Tanjiro');
  assert.deepEqual(f.c.values, { forca: '16', notas: 'Água' });
  assert.equal(f.t.name, 'Hashira Handbook');
  assert.doesNotMatch(encodeFicha(t, c), /[+/=]/);
});

test('ficha recebida entra no perfil em uso, já aberta, como ficha nova', () => {
  const { t, c } = tanjiro();
  const s = addFicha(aparelho(), decodeFicha(encodeFicha(t, c)));
  const [nova] = s.characters;
  assert.equal(nova.profileId, 'bia');
  assert.notEqual(nova.id, c.id);
  assert.equal(s.currentId, nova.id);
  assert.equal(nova.avatarUrl, c.avatarUrl);
  assert.equal(s.templates.length, 1, 'o sistema chega junto');
});

test('a cópia não herda a mensagem viva: as duas brigariam por ela no canal do mestre', () => {
  const { t, c } = tanjiro();
  const s = addFicha(aparelho(), decodeFicha(encodeFicha(t, c)));
  assert.equal(s.characters[0].messageId, undefined);
});

test('reaproveita o sistema que o aparelho já tem, mesmo com outro id', () => {
  const { t, c } = tanjiro();
  const doMestre = decodeTemplate(encodeTemplate(t)); // link de sistema: id novo
  const s = addFicha(aparelho([doMestre]), decodeFicha(encodeFicha(t, c)));
  assert.equal(s.templates.length, 1);
  assert.equal(s.characters[0].templateId, doMestre.id);
});

test('sistema com o mesmo nome mas outra forma não é confundido', () => {
  const { t, c } = tanjiro();
  const editado = { ...decodeTemplate(encodeTemplate(t)), rolls: [] };
  const s = addFicha(aparelho([editado]), decodeFicha(encodeFicha(t, c)));
  assert.equal(s.templates.length, 2);
  assert.notEqual(s.characters[0].templateId, editado.id);
});

test('valor adulterado no link não entra na ficha', () => {
  const { t, c } = tanjiro();
  const f = decodeFicha(encodeFicha(t, { ...c, values: { forca: '16', inspiracao: true, x: { y: 1 }, n: 3 } as never }));
  assert.deepEqual(addFicha(aparelho(), f).characters[0].values, { forca: '16', inspiracao: true });
});

test('link de ficha corrompido, ou de sistema, dá erro e não tela branca', () => {
  assert.throws(() => decodeFicha(encodeTemplate(EXAMPLE())), /inválido/);
  assert.throws(() => decodeFicha('lixo!!'));
});

// --- entrada ---------------------------------------------------------------

test('a senha é conferida por hash, não guardada em texto', async () => {
  assert.equal(await sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(await senhaDoMestre(''), false);
  assert.equal(await senhaDoMestre('mestre'), false);
});

test('texto sobre a cor de destaque é o que contrasta mais', () => {
  assert.equal(tintaSobre('#b08cff'), '#111'); // lilás padrão: claro, pede texto escuro
  assert.equal(tintaSobre('#6d3fd4'), '#fff'); // roxo do tema claro: escuro, pede branco
  assert.equal(tintaSobre('#ffffff'), '#111');
  assert.equal(tintaSobre('#000000'), '#fff');
});

// --- música: o que o app escreve é o que o bot lê -----------------------------

test('comando de tocar: a mesa vê o nome, o bot lê o link', () => {
  const c = comandoTocar('Combate', 'https://youtu.be/abc', false);
  assert.equal(c, '🎵 **Combate**\ntocar <https://youtu.be/abc>', 'link entre <>: sem prévia no canal');
  assert.deepEqual(lerComando(c), { acao: 'tocar', alvo: 'https://youtu.be/abc', repetir: false });
  assert.deepEqual(lerComando(comandoTocar('Taverna', 'taverna medieval', true)), { acao: 'tocar', alvo: 'taverna medieval', repetir: true });
  assert.deepEqual(lerComando('repetir não'), { acao: 'repetir', repetir: false });
  const pl = comandoTocar('Batalhas', 'https://youtube.com/playlist?list=PL1', true, true);
  assert.equal(pl, '📀 **Batalhas**\nplaylist 🔁 <https://youtube.com/playlist?list=PL1>');
  assert.deepEqual(lerComando(pl), { acao: 'playlist', alvo: 'https://youtube.com/playlist?list=PL1', repetir: true, faixa: 1 });
  const da5 = comandoTocar('Batalhas · 5. Duelo', 'https://youtube.com/playlist?list=PL1', false, true, 5);
  assert.deepEqual(lerComando(da5), { acao: 'playlist', alvo: 'https://youtube.com/playlist?list=PL1', repetir: false, faixa: 5 });
  assert.deepEqual(lerComando(comandoListar('Batalhas', 'https://youtube.com/playlist?list=PL1')), { acao: 'listar', alvo: 'https://youtube.com/playlist?list=PL1' });
  assert.equal(lerComando('pular')?.acao, 'pular');
  for (const b of ['Pausar', 'Continuar', 'Parar']) assert.equal(lerComando(b.toLowerCase())?.acao, b.toLowerCase());
});

test('a lista que o bot escreve na mensagem é a que o app lê', () => {
  const itens = [{ titulo: '紅蓮華 — LiSA' }, { titulo: 'Duelo' }, { titulo: 'Fuga' }];
  assert.deepEqual(lerLista({ embeds: [embedDaLista(itens)] }), { faixas: ['紅蓮華 — LiSA', 'Duelo', 'Fuga'], atual: undefined });
  assert.equal(lerLista({ embeds: [embedDaLista(itens, 2)] })?.atual, 2, 'o rodapé diz qual toca');
  assert.equal(lerLista({ embeds: [] }), null, 'o bot ainda não respondeu');
  const muitas = Array.from({ length: 200 }, (_, i) => ({ titulo: `Faixa ${i + 1}` }));
  const lidas = lerLista({ embeds: [embedDaLista(muitas)] })!.faixas;
  assert.deepEqual(lidas.slice(0, 2), ['Faixa 1', 'Faixa 2']);
  assert.ok(!lidas.some((f) => f.startsWith('…')), '"e mais N" não vira faixa');
});

// --- sistemas prontos de outros ramos --------------------------------------

test('cada sistema pronto: campos únicos, rolagens válidas que rolam com a ficha preenchida', async () => {
  const { PRONTOS } = await import('./sistemas.ts');
  const { roll } = await import('./dice.ts');
  assert.ok(PRONTOS.length >= 10, 'vários ramos');
  for (const p of PRONTOS) {
    const t = p.criar();
    assert.equal(t.name.length > 0, true);
    const campos = t.sections.flatMap((s) => s.fields);
    const ids = campos.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length, `${t.name}: id repetido`);
    // Valores típicos: atributo 12, número 2 (paradas, bônus, tipo de dado vira d2… usamos 6 pra dado).
    const valores = Object.fromEntries(campos.map((c) => [c.id, c.type === 'attr' ? '12' : c.type === 'number' ? '6' : '']));
    for (const r of t.rolls) {
      for (const [, a, b] of r.notation.matchAll(/@\{([\w]+)\}|@([\w]+)/g)) {
        assert.ok(ids.includes(a ?? b), `${t.name} › ${r.label}: @${a ?? b} não existe`);
      }
      assert.deepEqual(unknownTargets(r.assign, t), [], `${t.name} › ${r.label}: destino inexistente`);
      const res = roll(r.notation, withMods(t, valores));
      assert.ok(res.every((x) => Number.isFinite(x.total)), `${t.name} › ${r.label}: ${r.notation}`);
    }
    assert.notEqual(p.criar().id, t.id, 'cada adição é uma cópia nova');
  }
});

test('explicar: campo colado no dado mostra o nome junto', () => {
  const t: Template = { id: 'v', name: 'V', sections: [{ id: 's', title: 'A', fields: [{ id: 'forca', label: 'Força', type: 'number' }, { id: 'briga', label: 'Briga', type: 'number' }] }], rolls: [] };
  assert.equal(explicar('@{forca}d10>=6+@{briga}d10>=6', t, { forca: '3', briga: '2' }), '3d10>=6 (Força 3) + 2d10>=6 (Briga 2)');
});

// --- ajustes e backup --------------------------------------------------------

test('ajustes: padrão é fonte padrão, giro normal e resultado que não some', async () => {
  const { ajustesDe, AJUSTES_PADRAO, GIROS } = await import('./store.ts');
  assert.deepEqual(ajustesDe({}), AJUSTES_PADRAO);
  assert.equal(AJUSTES_PADRAO.fonte, 'padrao');
  assert.equal(AJUSTES_PADRAO.sumir, false);
  assert.ok(GIROS[AJUSTES_PADRAO.giro] > 700, 'o giro padrão ficou mais lento que o antigo (700 ms)');
  assert.deepEqual(ajustesDe({ ajustes: { fonte: 'grande' } }), { ...AJUSTES_PADRAO, fonte: 'grande' }, 'ajuste novo num app antigo cai no padrão');
});

test('backup: volta igual, e arquivo que não é backup é recusado sem apagar nada', async () => {
  const { exportarBackup, importarBackup } = await import('./store.ts');
  const { t, c } = tanjiro();
  const s = { ...aparelho([t]), characters: [c], ajustes: { fonte: 'enorme' as const } };
  const volta = importarBackup(exportarBackup(s));
  assert.deepEqual(volta.characters, s.characters);
  assert.deepEqual(volta.templates, s.templates);
  assert.deepEqual(volta.ajustes, { fonte: 'enorme' });
  assert.equal((volta as Record<string, unknown>).app, undefined, 'a marca do arquivo não entra no estado');
  assert.throws(() => importarBackup('não é json'), /não dá pra ler/);
  assert.throws(() => importarBackup('{"foto": 1}'), /não é um backup/);
  assert.throws(() => importarBackup('{"templates": [], "characters": []}'), /não é um backup/);
});

// --- texto do livro -----------------------------------------------------------

test('livro: rótulo vira tópico, "·" vira etiquetas, lista de vírgulas vira lista', async () => {
  const { blocos } = await import('./texto.ts');
  const [a, b, c, d, e] = blocos(
    '+2 em dois atributos · 15 PV base · 1 perícia.\n' +
      'Particularidades (escolha duas): Alteração Corporal (15 cm a 5 m), Aparência Animalesca, Camuflagem (+2 Furtividade), Garra Laminada (dano cortante), Visão Noturna (preto e branco).\n' +
      'Caminho: Alimentação por Sangue (1 L por semana) ou Retenção de Carne.\n' +
      '• Dano — 1 ponto de energia: +1d10 num ataque.\n' +
      'Sem fadiga, mas a cada 3 técnicas num turno precisa de recarga.',
  );
  assert.deepEqual(a, { tipo: 'p', corpo: { tipo: 'pontos', intro: undefined, itens: ['+2 em dois atributos', '15 PV base', '1 perícia'], nota: undefined } });
  assert.equal(b.rotulo, 'Particularidades (escolha duas)');
  assert.deepEqual(b.corpo, { tipo: 'lista', itens: ['Alteração Corporal (15 cm a 5 m)', 'Aparência Animalesca', 'Camuflagem (+2 Furtividade)', 'Garra Laminada (dano cortante)', 'Visão Noturna (preto e branco)'] });
  assert.deepEqual(c, { tipo: 'topico', rotulo: 'Caminho', corpo: { tipo: 'texto', texto: 'Alimentação por Sangue (1 L por semana) ou Retenção de Carne.' } }, 'poucos itens: fica texto');
  assert.deepEqual(d, { tipo: 'item', rotulo: 'Dano', corpo: { tipo: 'texto', texto: '1 ponto de energia: +1d10 num ataque.' } });
  assert.equal(e.tipo, 'p');
});

test('livro: etiqueta com frase depois vira etiqueta + nota; todo verbete tem forma', async () => {
  const { blocos } = await import('./texto.ts');
  const [m] = blocos('Médios (8 kg): M 12 + Des · M+1 13 + Des · M+3 15 + Des. Do +1 em diante, desvantagem em Furtividade.');
  assert.deepEqual(m.corpo, { tipo: 'pontos', intro: undefined, itens: ['M 12 + Des', 'M+1 13 + Des', 'M+3 15 + Des'], nota: 'Do +1 em diante, desvantagem em Furtividade.' });
  const [morte] = blocos('Morte: não morre a 0 PV. Regenera por turno: nível 1–5 1d10 · 6–10 2d10 · 11–15 3d10.');
  assert.deepEqual(morte.corpo, { tipo: 'pontos', intro: 'Não morre a 0 PV.', itens: ['Regenera por turno: nível 1–5 1d10', '6–10 2d10', '11–15 3d10'], nota: undefined }, 'frase antes das etiquetas vira texto');
  const { LIVRO } = await import('./livro.ts');
  for (const c of LIVRO) for (const v of c.verbetes) assert.ok(blocos(v.texto).length > 0, v.nome);
});
