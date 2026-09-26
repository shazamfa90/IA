import type { RollDef, Section, Template } from './store.ts';
import { uid } from './store.ts';

/**
 * Ficha adaptada do **Hashira Handbook 1.0** (Natan, 2023), projeto de fãs sem
 * fins lucrativos que leva Kimetsu no Yaiba para a 5ª edição.
 *
 * As descrições (o ⓘ ao lado de cada campo e rolagem) resumem a regra com
 * palavras próprias; o texto do livro não é reproduzido. O fichário completo
 * está em livro.ts, na aba Livro.
 *
 * Base 5e, então o modificador é (valor − 10) ÷ 2.
 */

const pericia = (id: string, nome: string, atr: string) => ({
  id,
  label: `${nome} (${atr})`,
  type: 'check' as const,
  desc: `Marque se for proficiente. Teste: d20 + ${atr} + bônus de proficiência se marcado.`,
});

const SECOES = (): Section[] => [
  {
    id: uid(),
    title: 'Caçador',
    fields: [
      {
        id: 'raca',
        label: 'Raça',
        type: 'text',
        desc: 'Humano (12 PV base, +2 em dois atributos, sentido extrassensorial), Especial (8 PV, +1 em tudo, come demônios), Marechi (10 PV, sangue que atrai demônios), Tsuyoi (14 PV, +2 For e Des) ou Demônio (15 PV, regenera, não pode tomar sol). O PV base soma só no 1º nível.',
      },
      {
        id: 'classe',
        label: 'Respiração / Kekkijutsu',
        type: 'text',
        desc: 'A classe. Respirações: Água, Besta, Chamas, Inseto, Lua, Pedra, Trovão, Vento (subclasses: Flor, Serpente, Amor, Som, Névoa). Demônios podem ter um Kekkijutsu: Especial, Gen, Kamakiri, Oiran ou Sozo. Cada uma diz o dado de vida, as proficiências e o atributo das técnicas.',
      },
      {
        id: 'nivel',
        label: 'Nível',
        type: 'number',
        desc: 'Do 1 ao 20. Define o bônus de proficiência (+2 até o 4º, +3 até o 8º, +4 até o 12º, +5 até o 16º, +6 depois), a energia e a patente.',
      },
      {
        id: 'xp',
        label: 'Experiência (XP)',
        type: 'number',
        desc: 'Para subir: 300 (2º), 900 (3º), 2.700 (4º), 6.500 (5º), 14.000 (6º), 23.000 (7º), 34.000 (8º), 48.000 (9º), 64.000 (10º)… até 355.000 no 20º. A tabela inteira está no Livro, em Criando o personagem.',
      },
      {
        id: 'patente',
        label: 'Patente',
        type: 'text',
        desc: 'Sobe com o nível: Mizunoto (0–2), Mizunoe (3–4), Kanoto (5–6), Kanoe (7–8), Tsuchinoto (9–10), Tsuchinoe (11–12), Hinoto (13–14), Hinoe (15–16), Kinoto (17–18), Kinoe (19–20). Define o salário e o rank das missões.',
      },
      {
        id: 'sentido',
        label: 'Sentido extrassensorial',
        type: 'text',
        desc: 'Só humanos: Audição, Olfato, Tato ou Visão. Cada um dá vantagem em Percepção por aquele sentido e um poder próprio (a Visão dá +1 de CR contra ataques que você vê).',
      },
      { id: 'antecedente', label: 'Antecedente', type: 'text', desc: 'De onde o caçador veio: Artista, Brigão, Costureiro, Cozinheiro, Estudioso, Ferreiro, Ladrão, Médico, Ninja, Órfão, Policial, Religioso ou Selvagem. Dá perícias, equipamento, ienes e às vezes um talento.' },
      { id: 'tendencia', label: 'Tendência', type: 'text', desc: 'Leal, neutro ou caótico + bom, neutro ou mau (LB, NB, CB, LN, N, CN, LM, NM, CM). Um guia do comportamento.' },
    ],
  },
  {
    id: uid(),
    title: 'Atributos',
    fields: [
      { id: 'forca', label: 'Força', type: 'attr', desc: 'Poder físico. Ataque e dano corpo a corpo (a katana aceita Força ou Destreza), Atletismo, carregar peso (Força × 7,5 kg).' },
      { id: 'destreza', label: 'Destreza', type: 'attr', desc: 'Agilidade. Iniciativa, CR (10 + Destreza sem uniforme), ataques à distância e com acuidade; Acrobacia, Furtividade, Prestidigitação.' },
      { id: 'constituicao', label: 'Constituição', type: 'attr', desc: 'Resistência. Soma aos PV em todo nível e segura a concentração. Não tem perícia.' },
      { id: 'inteligencia', label: 'Inteligência', type: 'attr', desc: 'Raciocínio e memória. História, Medicina, Natureza. Atributo dos venenos do Inseto e de vários Kekkijutsu.' },
      { id: 'sabedoria', label: 'Sabedoria', type: 'attr', desc: 'Percepção e intuição. Intuição, Investigação, Lidar com Animais, Percepção, Sobrevivência. Atributo das técnicas do Trovão e do Inseto.' },
      { id: 'carisma', label: 'Carisma', type: 'attr', desc: 'Força da personalidade. Blefar, Intimidação, Persuasão. Atributo das técnicas das Chamas.' },
    ],
  },
  {
    id: uid(),
    title: 'Combate',
    fields: [
      { id: 'pv', label: 'Pontos de vida', type: 'number', desc: 'A 0 você cai inconsciente e faz testes contra a morte (demônios ficam Fragilizados). Descanso longo devolve tudo.' },
      { id: 'pvmax', label: 'PV máximo', type: 'number', desc: '1º nível: máximo do dado de vida da classe + Constituição + PV base da raça. Depois, a cada nível: dado de vida (ou a média) + Constituição.' },
      { id: 'pvtemp', label: 'PV temporários', type: 'number', desc: 'Absorvem o dano primeiro, não somam entre si (fica o maior), não são curados e somem no descanso longo.' },
      { id: 'dadovida', label: 'Dados de vida', type: 'text', desc: 'Um por nível, do tipo da classe (Água d10, Pedra d12, Inseto d6…). No descanso curto, gaste para curar: role + Constituição. O descanso longo devolve metade.' },
      {
        id: 'ca',
        label: 'Classe de Resistência (CR)',
        type: 'number',
        desc: 'O "CA" deste livro: o número que um ataque precisa alcançar. Sem uniforme: 10 + Destreza. Uniforme leve: 11–14 + Des; médio: 12–15 + Des; pesado: 17–20 fixa. Manto soma +1 a +4, até em CR fixa. Algumas classes têm conta própria (Pedra: 18 fixa; Besta: 10 + Des + Sab).',
      },
      { id: 'prof', label: 'Bônus de proficiência', type: 'number', desc: '+2 do 1º ao 4º nível, +3 até o 8º, +4 até o 12º, +5 até o 16º, +6 até o 20º. Entra nos ataques, perícias e resistências proficientes e na CD das técnicas.' },
      { id: 'deslocamento', label: 'Deslocamento', type: 'text', desc: 'Todas as raças andam 9 m por turno. Algumas classes somam (Trovão, Vento); uniforme pesado sem a Força pedida tira 3 m.' },
      { id: 'resistencias', label: 'Resistências proficientes', type: 'text', desc: 'Os testes de resistência em que a classe te deu proficiência (ex.: Água: Força e Destreza). Neles você soma o bônus de proficiência.' },
    ],
  },
  {
    id: uid(),
    title: 'Respiração',
    fields: [
      { id: 'energia', label: 'Pontos de energia', type: 'number', desc: 'Cada técnica custa 1 (a Técnica Especial, 2). Técnicas seguidas no mesmo turno dobram o custo (fadiga: 1, 2, 4…) mas ganham um dado de dano a mais. Zerou: dá para continuar, ganhando exaustão por ponto.' },
      { id: 'energiamax', label: 'Energia máxima', type: 'number', desc: 'Igual ao nível da classe. Exceção: Respiração do Inseto, metade do nível arredondada para cima.' },
      { id: 'concentracao', label: 'Concentração Total: Dano (usos)', type: 'number', desc: '1 ponto de energia: +1d10 num ataque corpo a corpo, ou um dado a mais numa técnica. Duas vezes por dia; volta em descanso curto ou longo.' },
      { id: 'resiliencia', label: 'Concentração Total: Resiliência (usos)', type: 'number', desc: '1 ponto de energia: rola de novo um teste de resistência. Uma vez por dia.' },
      { id: 'continua', label: 'Respiração Contínua', type: 'check', desc: 'A partir do 10º nível, depois de um mês de treino: Concentração Total: Dano soma um dado por evolução da respiração, e a de Resiliência dá +5.' },
      { id: 'tecnicas', label: 'Técnicas conhecidas', type: 'textarea', desc: 'No 3º nível você aprende todas as técnicas da sua respiração; evoluem no 7º, 10º, 13º e (três delas) no 17º. Anote nome, alcance, dano e evolução. Todas estão no Livro, na respiração de cada classe.' },
    ],
  },
  {
    id: uid(),
    title: 'Perícias',
    fields: [
      pericia('atletismo', 'Atletismo', 'For'),
      pericia('acrobacia', 'Acrobacia', 'Des'),
      pericia('furtividade', 'Furtividade', 'Des'),
      pericia('prestidigitacao', 'Prestidigitação', 'Des'),
      pericia('historia', 'História', 'Int'),
      pericia('medicina', 'Medicina', 'Int'),
      pericia('natureza', 'Natureza', 'Int'),
      pericia('intuicao', 'Intuição', 'Sab'),
      pericia('investigacao', 'Investigação', 'Sab'),
      pericia('lidaranimais', 'Lidar com Animais', 'Sab'),
      pericia('percepcao', 'Percepção', 'Sab'),
      pericia('sobrevivencia', 'Sobrevivência', 'Sab'),
      pericia('blefar', 'Blefar', 'Car'),
      pericia('intimidacao', 'Intimidação', 'Car'),
      pericia('persuasao', 'Persuasão', 'Car'),
    ],
  },
  {
    id: uid(),
    title: 'Caderno',
    fields: [
      { id: 'pericias', label: 'Outras proficiências', type: 'textarea', desc: 'Armas, uniformes, ferramentas e idiomas que a classe, a raça e o antecedente deram.' },
      { id: 'talentos', label: 'Talentos', type: 'textarea', desc: 'Pegos no lugar de um Incremento de atributo (4º, 8º, 12º, 16º, 19º), pela raça (humano) ou pelo antecedente. A lista está no Livro.' },
      { id: 'equipamento', label: 'Equipamento', type: 'textarea', desc: 'O da classe e do antecedente. A Nichirin só corta o pescoço de um demônio se tiver a propriedade Decepadora.' },
      { id: 'ienes', label: 'Ienes', type: 'number', desc: 'A moeda. Começa com o que o antecedente dá (3d6 a 3d12 × 1.000) e recebe salário da patente a cada mês.' },
      { id: 'notas', label: 'Anotações', type: 'textarea', desc: 'Espaço livre: onis encontrados, pistas, nomes, dívidas e promessas. O livro não pede nada aqui.' },
    ],
  },
];

const ROLAGENS = (): RollDef[] => [
  { id: uid(), label: 'Força', notation: 'd20+@forca', desc: 'Teste de Força (Atletismo, levantar, empurrar). Se for de uma perícia em que você é proficiente, some o bônus de proficiência.' },
  { id: uid(), label: 'Destreza', notation: 'd20+@destreza', desc: 'Teste de Destreza (Acrobacia, Furtividade, Prestidigitação). Com perícia proficiente, some a proficiência.' },
  { id: uid(), label: 'Constituição', notation: 'd20+@constituicao', desc: 'Teste de Constituição: fôlego, marcha, aguentar. Também a resistência para manter concentração (CD 10 ou metade do dano).' },
  { id: uid(), label: 'Inteligência', notation: 'd20+@inteligencia', desc: 'Teste de Inteligência (História, Medicina, Natureza). Com perícia proficiente, some a proficiência.' },
  { id: uid(), label: 'Sabedoria', notation: 'd20+@sabedoria', desc: 'Teste de Sabedoria (Intuição, Investigação, Lidar com Animais, Percepção, Sobrevivência). Com perícia proficiente, some a proficiência.' },
  { id: uid(), label: 'Carisma', notation: 'd20+@carisma', desc: 'Teste de Carisma (Blefar, Intimidação, Persuasão). Com perícia proficiente, some a proficiência.' },
  { id: uid(), label: 'Iniciativa', notation: 'd20+@destreza', desc: 'Teste de Destreza no começo do combate; a ordem vai do maior para o menor e vale a luta toda.' },
  {
    id: uid(),
    label: 'Ataque com katana',
    notation: 'd20+@destreza+@prof',
    desc: 'd20 + Destreza + proficiência contra a CR do alvo. A katana tem acuidade: se a sua Força for maior, troque @destreza por @forca no editor (e no dano também). 20 natural é crítico; 1 sempre erra.',
  },
  { id: uid(), label: 'Dano da katana (uma mão)', notation: '1d6+@destreza', desc: 'Katana com uma mão: 1d6 cortante + o mesmo atributo do ataque. No crítico, role o dado duas vezes.' },
  { id: uid(), label: 'Dano da katana (duas mãos)', notation: '1d8+@destreza', desc: 'Katana é versátil: com as duas mãos, 1d8 cortante + o atributo do ataque.' },
  {
    id: uid(),
    label: 'Ataque de técnica',
    notation: 'd20+@prof+@destreza',
    desc: 'Técnicas com jogada de ataque: d20 + proficiência + o atributo da sua classe. Destreza serve para Água, Lua, Vento, Trovão, Inseto e Besta; nas Chamas e na Pedra é Força — troque no editor. O dano é o da técnica (ver Técnicas conhecidas).',
  },
  { id: uid(), label: 'Concentração Total (+dano)', notation: '1d10', desc: 'Gaste 1 ponto de energia: +1d10 no dano de um ataque corpo a corpo (numa técnica, um dado a mais do tipo dela). Duas vezes por dia.' },
  { id: uid(), label: 'Teste contra a morte', notation: 'd20', desc: 'No começo de cada turno a 0 PV: 10 ou mais é sucesso. Três sucessos estabilizam, três falhas matam. 1 conta como duas falhas; 20 devolve 1 PV.' },
  {
    id: uid(),
    label: 'Rolar atributos',
    notation: '6#4d6kh3',
    assign: '@forca @destreza @constituicao @inteligencia @sabedoria @carisma',
    desc: 'Seis vezes 4d6, descartando o menor, preenchendo os atributos na ordem. O livro também aceita os valores fixos 15, 14, 13, 12, 10, 8 — ou compra de pontos, se o mestre deixar.',
  },
];

export const HASHIRA = (): Template => ({
  id: uid(),
  name: 'Hashira Handbook',
  // relativa: resolve tanto no site publicado quanto rodando local
  image: 'capa-hashira.svg',
  modRule: 'd20',
  theme: 'nichirin',
  livro: 'hashira',
  sections: SECOES(),
  rolls: ROLAGENS(),
});

/** As rolagens da primeira versão da ficha, que chutava a katana errado (1d8/1d10 de Força). */
const V1 = new Set([
  'Força|d20+@forca', 'Destreza|d20+@destreza', 'Constituição|d20+@constituicao',
  'Inteligência|d20+@inteligencia', 'Sabedoria|d20+@sabedoria', 'Carisma|d20+@carisma',
  'Iniciativa|d20+@destreza', 'Ataque com katana|d20+@forca+@prof', 'Dano da katana|1d8+@forca',
  'Katana a duas mãos|1d10+@forca', 'Concentração Total (+dano)|1d10', 'Rolar atributos|6#4d6kh3',
]);

/**
 * Leva um Hashira salvo antes das descrições para a versão atual, sem perder
 * o que o mestre personalizou: os campos existentes ganham descrição, os que
 * faltam entram no fim da seção certa, e só as rolagens que ainda são as
 * originais (as da katana estavam erradas) são trocadas. Id e valores das
 * fichas ficam onde estão.
 */
export function atualizaHashira(t: Template): Template {
  if (t.livro || t.name !== 'Hashira Handbook') return t;
  const novo = HASHIRA();
  const porId = new Map(novo.sections.flatMap((s) => s.fields).map((f) => [f.id, f]));
  const existentes = new Set(t.sections.flatMap((s) => s.fields).map((f) => f.id));

  const sections = t.sections.map((s) => ({
    ...s,
    fields: s.fields.map((f) => {
      const n = porId.get(f.id);
      return n && !f.desc ? { ...f, desc: n.desc, label: f.id === 'ca' || f.id === 'concentracao' ? n.label : f.label } : f;
    }),
  }));
  for (const ns of novo.sections) {
    const faltam = ns.fields.filter((f) => !existentes.has(f.id));
    if (!faltam.length) continue;
    const alvo = sections.find((s) => s.title === ns.title);
    if (alvo) alvo.fields = [...alvo.fields, ...faltam];
    else sections.push({ ...ns, fields: faltam });
  }

  const proprias = t.rolls.filter((r) => !V1.has(`${r.label}|${r.notation}`));
  const rotulos = new Set(novo.rolls.map((r) => r.label));
  return { ...t, livro: 'hashira', sections, rolls: [...novo.rolls, ...proprias.filter((r) => !rotulos.has(r.label))] };
}
