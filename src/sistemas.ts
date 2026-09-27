/**
 * Sistemas prontos de vários ramos do RPG. Só a estrutura da ficha e as rolagens,
 * com explicações em palavras próprias: regras e números, nunca o texto dos livros.
 * Cada um mostra um jeito de rolar: d20 + modificador, porcentagem, parada de
 * sucessos, Fate, 2d6 do PbtA, dado explosivo, 3d6 abaixo do valor, maior de N d6.
 */
import { uid, type Field, type FieldType, type RollDef, type Template } from './store.ts';

const f = (id: string, label: string, type: FieldType, desc?: string): Field => ({ id, label, type, desc });
const n = (id: string, label: string, desc?: string) => f(id, label, 'number', desc);
const s = (title: string, fields: Field[]) => ({ id: uid(), title, fields });
const r = (label: string, notation: string, desc?: string, assign?: string): RollDef => ({ id: uid(), label, notation, desc, assign });
const notas = () => s('Caderno', [f('equipamento', 'Equipamento', 'textarea'), f('notas', 'Anotações', 'textarea')]);

type Base = Omit<Template, 'id'>;
const sistema = (base: Base) => (): Template => ({ id: uid(), ...base });

const DND = sistema({
  name: 'D&D 5e',
  modRule: 'd20',
  sections: [
    s('Personagem', [
      f('classe', 'Classe e nível', 'text'),
      f('raca', 'Espécie', 'text'),
      n('prof', 'Bônus de proficiência', '+2 nos níveis 1–4, +3 no 5–8, +4 no 9–12, +5 no 13–16, +6 no 17–20.'),
    ]),
    s('Atributos', [
      f('forca', 'Força', 'attr', 'Atletismo, ataques corpo a corpo, carga.'),
      f('destreza', 'Destreza', 'attr', 'Acrobacia, furtividade, ataques à distância, iniciativa, CA sem armadura.'),
      f('constituicao', 'Constituição', 'attr', 'Pontos de vida e concentração em magias.'),
      f('inteligencia', 'Inteligência', 'attr', 'Arcanismo, história, investigação.'),
      f('sabedoria', 'Sabedoria', 'attr', 'Percepção, intuição, sobrevivência.'),
      f('carisma', 'Carisma', 'attr', 'Persuasão, enganação, intimidação.'),
    ]),
    s('Combate', [
      n('ca', 'Classe de Armadura (CA)', 'O número que um ataque precisa alcançar. Sem armadura: 10 + Destreza.'),
      n('pv', 'Pontos de vida'),
      n('pvmax', 'PV máximo'),
      f('inspiracao', 'Inspiração', 'check', 'Gaste para ter vantagem num teste.'),
    ]),
    notas(),
  ],
  rolls: [
    r('Força', 'd20+@forca'),
    r('Destreza', 'd20+@destreza'),
    r('Sabedoria', 'd20+@sabedoria'),
    r('Iniciativa', 'd20+@destreza', 'Ordem de combate: maior age primeiro.'),
    r('Ataque corpo a corpo', 'd20+@forca+@prof', 'Acertou se igualar ou passar a CA do alvo. 20 natural é crítico.'),
    r('Com vantagem', '2d20kh1+@forca+@prof', 'Rola dois d20 e fica com o maior.'),
    r('Com desvantagem', '2d20kl1+@forca+@prof', 'Rola dois d20 e fica com o menor.'),
    r('Teste contra a morte', 'd20', 'Com 0 PV: 10+ é sucesso, três sucessos estabilizam, três falhas é morte. 20 volta com 1 PV.'),
    r('Rolar atributos', '6#4d6kh3', 'Quatro d6, descarta o menor, seis vezes.', '@forca @destreza @constituicao @inteligencia @sabedoria @carisma'),
  ],
});

const TORMENTA = sistema({
  name: 'Tormenta20',
  modRule: 'nenhum',
  sections: [
    s('Personagem', [f('classe', 'Classe e nível', 'text'), f('raca', 'Raça', 'text'), n('nivel', 'Nível')]),
    s('Atributos', [
      n('forca', 'Força', 'Aqui o atributo já é o modificador: soma direto no d20.'),
      n('destreza', 'Destreza'),
      n('constituicao', 'Constituição'),
      n('inteligencia', 'Inteligência'),
      n('sabedoria', 'Sabedoria'),
      n('carisma', 'Carisma'),
    ]),
    s('Combate', [
      n('defesa', 'Defesa', '10 + Destreza + armadura e escudo.'),
      n('pv', 'Pontos de vida'),
      n('pm', 'Pontos de mana', 'Gastos em habilidades e magias.'),
      n('treino', 'Bônus de treino', 'Somado nas perícias treinadas: +2 no começo, cresce com o nível.'),
    ]),
    notas(),
  ],
  rolls: [
    r('Luta', 'd20+@forca+@treino', 'Ataque corpo a corpo contra a Defesa do alvo.'),
    r('Pontaria', 'd20+@destreza+@treino', 'Ataque à distância.'),
    r('Iniciativa', 'd20+@destreza'),
    r('Reflexos', 'd20+@destreza'),
    r('Fortitude', 'd20+@constituicao'),
    r('Vontade', 'd20+@sabedoria'),
  ],
});

const ORDEM = sistema({
  name: 'Ordem Paranormal',
  theme: 'escuro',
  modRule: 'nenhum',
  sections: [
    s('Agente', [f('origem', 'Origem', 'text'), f('classe', 'Classe', 'text'), n('nex', 'NEX (%)', 'Nível de exposição paranormal: sobe de 5% em 5%.')]),
    s('Atributos', [
      n('agilidade', 'Agilidade', 'Em testes, é o número de d20 rolados: fique com o maior.'),
      n('forca', 'Força'),
      n('intelecto', 'Intelecto'),
      n('presenca', 'Presença'),
      n('vigor', 'Vigor'),
    ]),
    s('Estado', [
      n('pv', 'Pontos de vida'),
      n('san', 'Sanidade', 'Cai com o paranormal. Zerou, enlouquece.'),
      n('pe', 'Pontos de esforço', 'Pagam habilidades e rituais.'),
      n('defesa', 'Defesa', '10 + Agilidade + equipamento.'),
      n('luta', 'Bônus de Luta', 'Treino da perícia: +5 treinado, +10 veterano, +15 expert.'),
      n('pontaria', 'Bônus de Pontaria'),
    ]),
    notas(),
  ],
  rolls: [
    r('Agilidade', '@{agilidade}d20kh1', 'Tantos d20 quanto o atributo, fica com o maior. Atributo 0: use "Atributo zero".'),
    r('Força', '@{forca}d20kh1'),
    r('Intelecto', '@{intelecto}d20kh1'),
    r('Presença', '@{presenca}d20kh1'),
    r('Vigor', '@{vigor}d20kh1'),
    r('Luta', '@{forca}d20kh1+@luta', 'Ataque corpo a corpo: Força em d20, fica com o maior, soma o treino.'),
    r('Pontaria', '@{agilidade}d20kh1+@pontaria'),
    r('Atributo zero', '2d20kl1', 'Com atributo 0 rola dois d20 e fica com o menor.'),
  ],
});

const COC = sistema({
  name: 'Call of Cthulhu 7e',
  theme: 'pergaminho',
  modRule: 'nenhum',
  sections: [
    s('Investigador', [f('ocupacao', 'Ocupação', 'text'), n('idade', 'Idade')]),
    s('Características', [
      n('for', 'FOR', 'Todos os testes são d100: sucesso se tirar igual ou menos. Difícil: metade; extremo: um quinto.'),
      n('con', 'CON'),
      n('tam', 'TAM'),
      n('des', 'DES'),
      n('apa', 'APA'),
      n('int', 'INT'),
      n('pod', 'POD'),
      n('edu', 'EDU'),
    ]),
    s('Estado', [
      n('pv', 'Pontos de vida'),
      n('san', 'Sanidade', 'Teste de Sanidade: d100 ≤ Sanidade atual. Falhou, perde mais.'),
      n('sorte', 'Sorte'),
      n('pm', 'Pontos de magia'),
    ]),
    s('Perícias', [n('encontrar', 'Encontrar'), n('ocultismo', 'Ocultismo'), n('esquiva', 'Esquiva'), n('lutar', 'Lutar (Briga)')]),
    notas(),
  ],
  rolls: [
    r('Teste (d100)', 'd%', 'Compare com o valor da característica ou perícia: igual ou menor passa. 01 é crítico; 100 é desastre.'),
    r('Dezena extra (bônus/penalidade)', 'd10', 'Dado de bônus: role outra dezena e fique com a melhor; penalidade, a pior.'),
    r('Teste de Sanidade', 'd%', 'Igual ou menor que a Sanidade atual passa.'),
    r('Soco', 'd3', 'Dano desarmado, mais o bônus de dano.'),
    r('Rolar características', '5#3d6', '3d6 × 5 para FOR, CON, DES, APA e POD.'),
  ],
});

const VAMPIRO = sistema({
  name: 'Vampiro: A Máscara (V5)',
  theme: 'sangue',
  modRule: 'nenhum',
  sections: [
    s('Personagem', [f('cla', 'Clã', 'text'), f('geracao', 'Geração', 'text')]),
    s('Atributos', [
      n('forca', 'Força', 'Pontos de 1 a 5. Um teste junta atributo + habilidade em d10: cada 6+ é um sucesso.'),
      n('destreza', 'Destreza'),
      n('vigor', 'Vigor'),
      n('carisma', 'Carisma'),
      n('manipulacao', 'Manipulação'),
      n('autocontrole', 'Autocontrole'),
      n('inteligencia', 'Inteligência'),
      n('raciocinio', 'Raciocínio'),
      n('determinacao', 'Determinação'),
    ]),
    s('Habilidades', [n('briga', 'Briga'), n('furtividade', 'Furtividade'), n('persuasao', 'Persuasão'), n('prontidao', 'Prontidão'), n('ocultismo', 'Ocultismo')]),
    s('Estado', [
      n('vitalidade', 'Vitalidade'),
      n('vontade', 'Força de vontade'),
      n('fome', 'Fome', 'De 0 a 5. Na mesa, esse número de dados da parada vira dado de Fome.'),
      n('humanidade', 'Humanidade'),
    ]),
    notas(),
  ],
  rolls: [
    r('Força + Briga', '@{forca}d10>=6+@{briga}d10>=6', 'Cada 6+ é sucesso; dois 10 valem 4 (crítico), conte na mesa.'),
    r('Destreza + Furtividade', '@{destreza}d10>=6+@{furtividade}d10>=6'),
    r('Carisma + Persuasão', '@{carisma}d10>=6+@{persuasao}d10>=6'),
    r('Raciocínio + Prontidão', '@{raciocinio}d10>=6+@{prontidao}d10>=6'),
    r('Checagem de Despertar', 'd10', '1–5: a Fome sobe 1.'),
    r('Checagem de Fúria', 'd10', '1–5: a Fome sobe 1.'),
  ],
});

const FATE = sistema({
  name: 'Fate Acelerado',
  modRule: 'nenhum',
  sections: [
    s('Aspectos', [
      f('conceito', 'Conceito', 'text', 'Quem você é, numa frase. Pode ser invocado a favor ou forçado contra.'),
      f('dificuldade', 'Dificuldade', 'text'),
      f('aspecto3', 'Aspecto', 'text'),
    ]),
    s('Abordagens', [
      n('cuidadoso', 'Cuidadoso', 'De +0 a +3. Some a 4dF: cada dado dá −1, 0 ou +1.'),
      n('esperto', 'Esperto'),
      n('estiloso', 'Estiloso'),
      n('poderoso', 'Poderoso'),
      n('rapido', 'Rápido'),
      n('sorrateiro', 'Sorrateiro'),
    ]),
    s('Estado', [
      n('destino', 'Pontos de destino', 'Gaste para invocar um aspecto: +2 ou rolar de novo.'),
      f('estresse1', 'Estresse 1', 'check'),
      f('estresse2', 'Estresse 2', 'check'),
      f('estresse3', 'Estresse 3', 'check'),
      f('consequencias', 'Consequências', 'textarea'),
    ]),
  ],
  rolls: [
    r('Cuidadoso', '4dF+@cuidadoso', 'Resultado na escada: +2 razoável, +3 bom, +4 ótimo, +5 excepcional.'),
    r('Esperto', '4dF+@esperto'),
    r('Estiloso', '4dF+@estiloso'),
    r('Poderoso', '4dF+@poderoso'),
    r('Rápido', '4dF+@rapido'),
    r('Sorrateiro', '4dF+@sorrateiro'),
  ],
});

const PBTA = sistema({
  name: 'Powered by the Apocalypse',
  modRule: 'nenhum',
  sections: [
    s('Personagem', [f('cartilha', 'Cartilha', 'text', 'O "playbook": o tipo de personagem e seus movimentos.')]),
    s('Atributos', [
      n('frio', 'Frio', 'De −1 a +3. Todo movimento é 2d6 + atributo.'),
      n('duro', 'Duro'),
      n('quente', 'Quente'),
      n('afiado', 'Afiado'),
      n('estranho', 'Estranho'),
    ]),
    s('Estado', [n('dano', 'Dano (relógio)', 'De 0 a 6: a partir de 6, morrendo.'), n('xp', 'Experiência'), f('movimentos', 'Movimentos', 'textarea')]),
  ],
  rolls: [
    r('Agir sob pressão (Frio)', '2d6+@frio', '10+ sucesso completo; 7–9 sucesso com custo; 6− o mestre faz um movimento.'),
    r('Partir pra cima (Duro)', '2d6+@duro'),
    r('Seduzir ou manipular (Quente)', '2d6+@quente'),
    r('Ler a situação (Afiado)', '2d6+@afiado'),
    r('Abrir a mente (Estranho)', '2d6+@estranho'),
  ],
});

const SAVAGE = sistema({
  name: 'Savage Worlds',
  modRule: 'nenhum',
  sections: [
    s('Atributos', [
      n('agilidade', 'Agilidade', 'O tipo de dado: 4, 6, 8, 10 ou 12. Tirou o máximo, explode e soma.'),
      n('astucia', 'Astúcia'),
      n('espirito', 'Espírito'),
      n('forca', 'Força'),
      n('vigor', 'Vigor'),
    ]),
    s('Perícias', [n('lutar', 'Lutar'), n('atirar', 'Atirar'), n('perceber', 'Perceber')]),
    s('Estado', [n('aparar', 'Aparar', '2 + metade de Lutar.'), n('resistencia', 'Resistência'), n('bencaos', 'Benes'), n('ferimentos', 'Ferimentos')]),
    notas(),
  ],
  rolls: [
    r('Agilidade', 'd@{agilidade}!', 'Curinga: role também o dado selvagem e fique com o maior. 4+ é sucesso; cada 4 a mais, uma ampliação.'),
    r('Lutar', 'd@{lutar}!'),
    r('Atirar', 'd@{atirar}!'),
    r('Perceber', 'd@{perceber}!'),
    r('Dado selvagem', 'd6!', 'Rolado junto com o dado do teste; vale o maior dos dois.'),
  ],
});

const GURPS = sistema({
  name: 'GURPS 4e',
  modRule: 'nenhum',
  sections: [
    s('Atributos', [
      n('st', 'ST', 'Todo teste é 3d6: sucesso se tirar igual ou menos que o valor. 3–4 é sempre crítico.'),
      n('dx', 'DX'),
      n('iq', 'IQ'),
      n('ht', 'HT'),
    ]),
    s('Secundários', [n('pv', 'PV'), n('pf', 'PF (fadiga)'), n('vontade', 'Vontade'), n('per', 'Percepção'), n('velocidade', 'Velocidade básica')]),
    s('Perícias', [n('espada', 'Espada larga'), n('furtividade', 'Furtividade'), n('primeiros', 'Primeiros socorros')]),
    notas(),
  ],
  rolls: [
    r('Teste (3d6)', '3d6', 'Compare com o nível: igual ou menor passa. A diferença é a margem de sucesso.'),
    r('Dano GdP 1d', '1d6', 'Golpe de ponta: veja a tabela de ST.'),
    r('Reação', '3d6', 'Como os PdMs reagem: 10–12 neutro, mais alto melhor.'),
  ],
});

const CYBERPUNK = sistema({
  name: 'Cyberpunk RED',
  modRule: 'nenhum',
  sections: [
    s('Estatísticas', [
      n('int', 'INT'),
      n('ref', 'REF', 'Testes: d10 + estatística + perícia. 10 no d10 soma outro d10.'),
      n('des', 'DES'),
      n('tec', 'TEC'),
      n('fri', 'FRI (frieza)'),
      n('von', 'VON'),
      n('sor', 'SOR (sorte)'),
      n('mov', 'MOV'),
      n('tco', 'TCO (corpo)'),
      n('emp', 'EMP'),
    ]),
    s('Perícias', [n('pistola', 'Armas de mão'), n('briga', 'Briga'), n('percepcao', 'Percepção'), n('evasao', 'Evasão')]),
    s('Estado', [n('pv', 'Pontos de vida'), n('humanidade', 'Humanidade'), n('blindagem', 'Blindagem')]),
    notas(),
  ],
  rolls: [
    r('Atirar (pistola)', 'd10!+@ref+@pistola', 'Contra o número da distância. 10 soma mais um d10; 1 tira um d10 (na mesa).'),
    r('Briga', 'd10!+@des+@briga'),
    r('Percepção', 'd10!+@int+@percepcao'),
    r('Iniciativa', 'd10+@ref'),
  ],
});

const BLADES = sistema({
  name: 'Blades in the Dark',
  modRule: 'nenhum',
  sections: [
    s('Ações', [
      n('cacar', 'Caçar', 'De 0 a 4. A parada é o número de d6: vale o maior.'),
      n('estudar', 'Estudar'),
      n('lutar', 'Lutar'),
      n('esgueirar', 'Esgueirar'),
      n('influenciar', 'Influenciar'),
      n('sintonizar', 'Sintonizar'),
    ]),
    s('Estado', [n('estresse', 'Estresse', 'De 0 a 9: estourou, ganha um trauma.'), f('traumas', 'Traumas', 'textarea'), f('armadura', 'Armadura usada', 'check')]),
  ],
  rolls: [
    r('Lutar', '@{lutar}d6kh1', '6 sucesso completo (dois 6: crítico); 4–5 sucesso com consequência; 1–3 ruim.'),
    r('Esgueirar', '@{esgueirar}d6kh1'),
    r('Influenciar', '@{influenciar}d6kh1'),
    r('Estudar', '@{estudar}d6kh1'),
    r('Ação zero', '2d6kl1', 'Com 0 dados: rola dois e fica com o menor.'),
  ],
});

const YEARZERO = sistema({
  name: 'Year Zero Engine',
  modRule: 'nenhum',
  sections: [
    s('Atributos', [
      n('forca', 'Força', 'A parada junta atributo + perícia em d6: cada 6 é um sucesso.'),
      n('agilidade', 'Agilidade'),
      n('raciocinio', 'Raciocínio'),
      n('empatia', 'Empatia'),
    ]),
    s('Perícias', [n('luta', 'Luta'), n('furtividade', 'Furtividade'), n('observacao', 'Observação')]),
    s('Estado', [n('estresse', 'Estresse', 'Em alguns jogos, soma dados de estresse à parada.'), f('notas', 'Anotações', 'textarea')]),
  ],
  rolls: [
    r('Força + Luta', '@{forca}d6>=6+@{luta}d6>=6', 'Um 6 basta para passar; 6 extras compram efeitos.'),
    r('Agilidade + Furtividade', '@{agilidade}d6>=6+@{furtividade}d6>=6'),
    r('Raciocínio + Observação', '@{raciocinio}d6>=6+@{observacao}d6>=6'),
  ],
});

export type Pronto = { nome: string; ramo: string; criar: () => Template };

/** Na ordem da lista em Sistemas → Adicionar. */
export const PRONTOS: Pronto[] = [
  { nome: 'D&D 5e', ramo: 'Fantasia · d20', criar: DND },
  { nome: 'Tormenta20', ramo: 'Fantasia brasileira · d20', criar: TORMENTA },
  { nome: 'Ordem Paranormal', ramo: 'Horror investigativo · maior de Nd20', criar: ORDEM },
  { nome: 'Call of Cthulhu 7e', ramo: 'Horror cósmico · d100', criar: COC },
  { nome: 'Vampiro: A Máscara', ramo: 'Horror pessoal · sucessos em d10', criar: VAMPIRO },
  { nome: 'Cyberpunk RED', ramo: 'Ficção científica · d10', criar: CYBERPUNK },
  { nome: 'Savage Worlds', ramo: 'Pulp genérico · dado explosivo', criar: SAVAGE },
  { nome: 'GURPS 4e', ramo: 'Genérico · 3d6 abaixo', criar: GURPS },
  { nome: 'Fate Acelerado', ramo: 'Narrativo · 4dF', criar: FATE },
  { nome: 'Powered by the Apocalypse', ramo: 'Narrativo · 2d6', criar: PBTA },
  { nome: 'Blades in the Dark', ramo: 'Assalto · maior de Nd6', criar: BLADES },
  { nome: 'Year Zero Engine', ramo: 'Sobrevivência · sucessos em d6', criar: YEARZERO },
];
