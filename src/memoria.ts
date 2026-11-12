/**
 * A memória do mestre.
 *
 * O modelo de linguagem não lembra de nada entre uma chamada e outra; quem lembra é a
 * campanha. São três camadas:
 *
 * - memória de trabalho: o que vai inteiro em toda fala (status, fatos recentes, pendências,
 *   segredos, NPCs em cena, o capítulo atual);
 * - arquivo: tudo que saiu da memória de trabalho, guardado para sempre no aparelho —
 *   nada é descartado, por mais longa que a campanha fique;
 * - lembrança: a cada fala, o app procura no arquivo e nas cenas antigas o que tem a ver
 *   com o que está acontecendo agora e põe só isso na frente do mestre. É busca por
 *   palavras, feita no próprio celular: não gasta chamada de IA nem depende de sinal.
 */
import { extrairStatus, lerBloco, semAcento, separar } from './leitura.ts';

export type Msg = {
  de: 'mestre' | 'jogador' | 'nota';
  /** Do mestre, o texto com os bastidores. A tela mostra só `separar().visivel`. */
  texto: string;
  t: number;
  /** Qual IA narrou esta fala: aparece discreto embaixo, pra saber quando houve troca. */
  por?: string;
};

export type Memoria = {
  /** Leis do universo e tramas ocultas, escritas antes da primeira cena. Nunca mudam. */
  leis: string;
  /** Ficha fixa: nome, aparência, origem, estilo e limites de conteúdo combinados no início. */
  personagem: string;
  tempo: string;
  /** O último bloco de status que o jogador viu. */
  status: string;
  /** A campanha inteira em poucas linhas, reescrita a cada capítulo fechado. */
  resumo: string;
  /** Um resumo por trecho de conversa já condensado. Nunca são reescritos. */
  capitulos: string[];
  /** O que o jogador mandou o mestre nunca esquecer. Vai em toda fala e nunca é arquivado. */
  fixos: string[];
  fatos: string[];
  /** Fios soltos: promessas, dívidas, prazos, missões, ameaças em andamento. */
  pendencias: string[];
  segredos: string[];
  npcs: Record<string, string>;
  /** Em que fala cada NPC foi atualizado pela última vez: os recentes vão inteiros no prompt. */
  vistos: Record<string, number>;
  /** Memória de longo prazo: tudo que saiu das listas acima. Só volta quando vem ao caso. */
  arquivo: string[];
  pesquisas: { termo: string; texto: string }[];
};

export type Campanha = {
  id: string;
  nome: string;
  tema: string;
  criada: number;
  jogada: number;
  mem: Memoria;
  msgs: Msg[];
  /** As mensagens antes deste índice já viraram capítulo e não vão mais inteiras no contexto. */
  resumidoAte: number;
  /** Como a memória estava antes da última resposta do mestre: é o que o "refazer" restaura. */
  desfazer?: { mem: Memoria; resumidoAte: number };
};

export const memoriaVazia = (): Memoria => ({
  leis: '',
  personagem: '',
  tempo: '',
  status: '',
  resumo: '',
  capitulos: [],
  fixos: [],
  fatos: [],
  pendencias: [],
  segredos: [],
  npcs: {},
  vistos: {},
  arquivo: [],
  pesquisas: [],
});

/** Aventura salva por uma versão antiga do app ganha os campos que não existiam. */
export const normalizar = (m: Partial<Memoria> | undefined): Memoria => ({ ...memoriaVazia(), ...m });

// --- Palavras: a base da comparação e da busca ---------------------------

const PARADAS = new Set(
  semAcento(
    'a o e de da do das dos em no na nos nas um uma uns umas que para pra por com sem se ao aos as os ou mas como mais muito ja nao sim ele ela eles elas voce seu sua seus suas meu minha isso isto esse essa este esta aquele aquela lhe me te foi ser esta estava sao era tem tinha ha pelo pela pelos pelas ate entre sobre tambem quando onde quem qual quais entao ainda so depois antes agora aqui ali la the and for with from that this was are',
  ).split(' '),
);

/** As palavras que carregam sentido: sem acento, sem as de ligação, sem as muito curtas. */
export const palavras = (texto: string): string[] =>
  semAcento(texto.toLowerCase())
    .split(/[^a-z0-9]+/)
    .filter((p) => (p.length > 2 || /^\d+$/.test(p)) && !PARADAS.has(p));

const numeros = (texto: string) => (texto.match(/\d+/g) ?? []).join(' ');

/** Dizem a mesma coisa: as palavras do menor estão quase todas no maior. */
function parecido(a: string, b: string): boolean {
  const [pa, pb] = [new Set(palavras(a)), new Set(palavras(b))];
  const [menor, maior] = pa.size <= pb.size ? [pa, pb] : [pb, pa];
  if (menor.size < 2) return semAcento(a.trim().toLowerCase()) === semAcento(b.trim().toLowerCase());
  let comuns = 0;
  for (const p of menor) if (maior.has(p)) comuns++;
  return comuns / menor.size >= 0.8;
}

/**
 * Acrescenta sem duplicar. Modelo pequeno repete o mesmo fato a cada fala, às vezes com
 * um detalhe a mais: nesse caso fica a versão mais completa, no lugar da antiga.
 */
function juntar(lista: string[], novo: string): string[] {
  const texto = novo.trim();
  if (!texto) return lista;
  const i = lista.findIndex((item) => parecido(item, texto));
  if (i < 0) return [...lista, texto];
  // Número diferente é notícia nova (a dívida subiu, o prazo encurtou): vale a mais recente.
  const troca = numeros(texto) !== numeros(lista[i]) || texto.length > lista[i].length;
  return troca ? lista.map((item, j) => (j === i ? texto : item)) : lista;
}

/** A anotação é aquela de que o trecho fala: contém o trecho, ou a maior parte das palavras dele. */
function casa(item: string, trecho: string): boolean {
  if (semAcento(item.toLowerCase()).includes(semAcento(trecho.trim().toLowerCase()))) return true;
  const alvo = new Set(palavras(trecho));
  if (alvo.size < 2) return false;
  const tem = new Set(palavras(item));
  let comuns = 0;
  for (const p of alvo) if (tem.has(p)) comuns++;
  return comuns / alvo.size >= 0.6;
}

/** "Nome | notas" (ou com travessão, dois-pontos ou, na falta, a primeira vírgula) → [nome, notas]. */
export function lerNpc(valor: string): [string, string] {
  const m = valor.match(/^(.{1,60}?)\s*(?:\||—|–| - |:)\s*(.+)$/s) ?? valor.match(/^(.{1,60}?),\s*(.+)$/s);
  return m ? [m[1].trim(), m[2].trim()] : [valor.trim().slice(0, 60), valor.trim()];
}

// --- Anotar --------------------------------------------------------------

/** Quantos itens ficam na memória de trabalho; o excedente mais antigo desce pro arquivo. */
const TETO = { fatos: [40, 30], segredos: [30, 24], pendencias: [24, 18] } as const;
const TETO_ARQUIVO = 4000;

/** O que passou do teto desce pro arquivo, do mais antigo pro mais novo. Nada se perde. */
function arrumar(m: Memoria): Memoria {
  const arquivo = [...m.arquivo];
  const descer = (lista: string[], [teto, fica]: readonly [number, number], rotulo: string) => {
    if (lista.length <= teto) return lista;
    arquivo.push(...lista.slice(0, lista.length - fica).map((t) => `${rotulo}: ${t}`));
    return lista.slice(lista.length - fica);
  };
  const fatos = descer(m.fatos, TETO.fatos, 'Fato');
  const segredos = descer(m.segredos, TETO.segredos, 'Segredo');
  const pendencias = descer(m.pendencias, TETO.pendencias, 'Pendência antiga');
  return { ...m, fatos, segredos, pendencias, arquivo: arquivo.slice(-TETO_ARQUIVO) };
}

/**
 * Junta à memória as anotações de um bloco: os bastidores do mestre, ou as do arquivista.
 * `turno` é o número da fala, pra saber quais NPCs estão em cena.
 */
export function aplicar(mem: Memoria, bloco: string, status = '', turno = 0): Memoria {
  let m: Memoria = { ...mem, npcs: { ...mem.npcs }, vistos: { ...mem.vistos }, arquivo: [...mem.arquivo] };
  for (const [chave, valor] of lerBloco(bloco)) {
    if (chave === 'PERSONAGEM') m.personagem = valor;
    else if (chave === 'TEMPO') m.tempo = valor;
    else if (chave === 'FATO') m.fatos = juntar(m.fatos, valor);
    else if (chave === 'SECRETO') m.segredos = juntar(m.segredos, valor);
    else if (chave === 'PENDENTE') m.pendencias = juntar(m.pendencias, valor);
    else if (chave === 'NPC') {
      const [nome, nota] = lerNpc(valor);
      // "mirta" e "Mirta" são a mesma pessoa: vale o nome que já estava anotado.
      const igual = Object.keys(m.npcs).find((n) => semAcento(n.toLowerCase()) === semAcento(nome.toLowerCase()));
      m.npcs[igual ?? nome] = nota;
      m.vistos[igual ?? nome] = turno;
    } else if (chave === 'RESOLVIDO') {
      m.arquivo.push(...m.pendencias.filter((p) => casa(p, valor)).map((p) => `Resolvido: ${p} (${valor})`));
      m.pendencias = m.pendencias.filter((p) => !casa(p, valor));
    } else if (chave === 'REVELADO') {
      // O jogador descobriu: deixa de ser segredo e vira fato que ele sabe.
      const descobertos = m.segredos.filter((s) => casa(s, valor));
      m.segredos = m.segredos.filter((s) => !casa(s, valor));
      for (const s of descobertos.length ? descobertos : [valor]) m.fatos = juntar(m.fatos, `Descobriu: ${s}`);
    } else if (chave === 'ESQUECER' && valor.length >= 4) {
      m.fatos = m.fatos.filter((f) => !casa(f, valor));
      m.segredos = m.segredos.filter((s) => !casa(s, valor));
      m.pendencias = m.pendencias.filter((p) => !casa(p, valor));
      for (const nome of Object.keys(m.npcs)) if (semAcento(nome.toLowerCase()) === semAcento(valor.toLowerCase())) delete m.npcs[nome];
    }
  }
  if (status.trim()) m.status = status.trim();
  m = arrumar(m);
  return m;
}

/** Guarda uma pesquisa. As três últimas vão no prompt; as mais antigas descem pro arquivo. */
export function comPesquisa(mem: Memoria, termo: string, texto: string): Memoria {
  const outras = mem.pesquisas.filter((p) => p.termo.toLowerCase() !== termo.toLowerCase());
  const todas = [...outras, { termo, texto: texto.slice(0, 1800) }];
  const antigas = todas.slice(0, -3).map((p) => `Pesquisa (${p.termo}): ${p.texto}`);
  return { ...mem, pesquisas: todas.slice(-3), arquivo: [...mem.arquivo, ...antigas].slice(-TETO_ARQUIVO) };
}

// --- Lembrar: achar no que ficou pra trás o que vem ao caso agora --------

export type Trecho = { texto: string; rotulo: string };

/**
 * Ordena trechos pelo quanto têm a ver com a pergunta (BM25): palavra rara pesa mais que
 * palavra comum, e trecho curto que fala do assunto vence trecho longo que só o cita.
 * Só entra quem compartilha pelo menos duas palavras da pergunta, ou uma que seja rara.
 */
export function ordenar<T extends Trecho>(trechos: T[], pergunta: string): T[] {
  const termos = [...new Set(palavras(pergunta))];
  if (!termos.length || !trechos.length) return [];
  const docs = trechos.map((t) => ({ t, p: palavras(t.texto) }));
  const media = docs.reduce((n, d) => n + d.p.length, 0) / docs.length || 1;
  const frequencia = new Map<string, number>();
  for (const d of docs) for (const termo of new Set(d.p)) frequencia.set(termo, (frequencia.get(termo) ?? 0) + 1);
  const raro = Math.max(2, docs.length * 0.03);

  const pontuados = docs.map((d) => {
    const conta = new Map<string, number>();
    for (const p of d.p) conta.set(p, (conta.get(p) ?? 0) + 1);
    let pontos = 0;
    let achados = 0;
    let temRaro = false;
    for (const termo of termos) {
      const tf = conta.get(termo);
      if (!tf) continue;
      const df = frequencia.get(termo) ?? 1;
      achados++;
      temRaro ||= df <= raro;
      pontos += Math.log(1 + (docs.length - df + 0.5) / (df + 0.5)) * ((tf * 2.2) / (tf + 1.2 * (0.25 + (0.75 * d.p.length) / media)));
    }
    return { t: d.t, pontos: achados >= 2 || temRaro ? pontos : 0 };
  });
  return pontuados
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .map((x) => x.t);
}

/** Tudo que já saiu de vista: o arquivo, os capítulos antigos e as cenas antes de `antesDe`. */
function acervo(c: Campanha, antesDe: number): Trecho[] {
  const trechos: Trecho[] = c.mem.arquivo.map((texto) => ({ texto, rotulo: 'anotação antiga' }));
  c.mem.capitulos.slice(0, -2).forEach((texto, i) => trechos.push({ texto, rotulo: `capítulo ${i + 1}` }));
  c.msgs.slice(0, antesDe).forEach((m, i) => {
    if (m.de === 'nota') return;
    const texto = m.de === 'mestre' ? extrairStatus(separar(m.texto).visivel).narrativa : m.texto;
    const rotulo = m.de === 'mestre' ? `cena antiga, fala ${i + 1}` : `o jogador disse, fala ${i + 1}`;
    for (const par of texto.split(/\n{2,}/)) if (par.trim().length > 40) trechos.push({ texto: par.trim().slice(0, 700), rotulo });
  });
  return trechos;
}

/**
 * As lembranças antigas que têm a ver com a pergunta, até caber no orçamento de letras.
 * `antesDe` é onde começa a conversa que o mestre já vê inteira: dali pra frente não é lembrança.
 */
export function lembrar(c: Campanha, pergunta: string, antesDe = c.resumidoAte, orcamento = 1800): string[] {
  const achados: string[] = [];
  let gasto = 0;
  for (const t of ordenar(acervo(c, antesDe), pergunta)) {
    if (achados.some((a) => parecido(a, t.texto))) continue;
    if (gasto + t.texto.length > orcamento) {
      if (achados.length) break;
      continue;
    }
    achados.push(`[${t.rotulo}] ${t.texto}`);
    gasto += t.texto.length;
    if (achados.length >= 8) break;
  }
  return achados;
}

// --- A memória como o mestre lê ------------------------------------------

const lista = (itens: string[]) => (itens.length ? itens.map((i) => `- ${i}`).join('\n') : '(nada ainda)');

/** Com mais NPCs do que isto em letras, só os que estão em cena vão com a ficha inteira. */
const TETO_NPCS = 2600;

/** Os NPCs inteiros (em cena ou recentes) e, dos demais, só o nome e o começo da ficha. */
function npcsEmTexto(c: Campanha, foco: string): string {
  const todos = Object.entries(c.mem.npcs);
  if (!todos.length) return '(nenhum ainda)';
  const inteiro = ([nome, nota]: [string, string]) => `- ${nome}: ${nota}`;
  if (todos.reduce((n, [nome, nota]) => n + nome.length + nota.length, 0) <= TETO_NPCS) return todos.map(inteiro).join('\n');

  const citado = semAcento(foco.toLowerCase());
  const turno = c.msgs.length;
  const emCena = ([nome]: [string, string]) =>
    palavras(nome).some((p) => p.length > 3 && citado.includes(p)) || turno - (c.mem.vistos[nome] ?? -99) <= 8;
  const dentro = todos.filter(emCena);
  const fora = todos.filter((n) => !emCena(n));
  return [
    ...dentro.map(inteiro),
    fora.length ? `- Outros conhecidos (ficha no arquivo; peça com [[LEMBRAR: nome]]): ${fora.map(([nome, nota]) => `${nome} (${nota.slice(0, 50)}…)`).join('; ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * O que o mestre sabe neste momento, do jeito que ele lê. `foco` é a cena atual (a fala do
 * jogador e a última narração): decide quais NPCs vão inteiros e o que se lembra do arquivo.
 */
export function memoriaEmTexto(c: Campanha, foco = '', antesDe = c.resumidoAte): string {
  const m = c.mem;
  const lembrancas = foco ? lembrar(c, foco, antesDe) : [];
  const capitulos = m.capitulos.slice(-2);
  const partes = [
    '═══ MEMÓRIA DO MESTRE (só você lê) ═══',
    `LEIS DO UNIVERSO E TRAMAS OCULTAS (nunca quebre; nunca revele as tramas antes do gatilho lógico):\n${m.leis || '(ainda não definidas: defina e siga)'}`,
    `PERSONAGEM DO JOGADOR:\n${m.personagem || '(ainda não criado: siga a seção 9 – INÍCIO)'}`,
    m.tempo && `TEMPO ATUAL: ${m.tempo}`,
    m.status && `ÚLTIMO STATUS MOSTRADO AO JOGADOR:\n${m.status}`,
    m.fixos.length > 0 && `O JOGADOR PEDIU PARA VOCÊ NUNCA ESQUECER:\n${lista(m.fixos)}`,
    m.resumo && `A CAMPANHA ATÉ AQUI:\n${m.resumo}`,
    capitulos.length > 0 && `CAPÍTULOS MAIS RECENTES:\n${capitulos.map((t, i) => `Capítulo ${m.capitulos.length - capitulos.length + i + 1}: ${t}`).join('\n\n')}`,
    `PENDÊNCIAS (fios soltos: cobre, faça vencer prazos, deixe as ameaças andarem):\n${lista(m.pendencias)}`,
    `FATOS CONFIRMADOS (o personagem viveu; persistem):\n${lista(m.fatos)}`,
    `SEGREDOS (PROIBIDO narrar antes do gatilho lógico):\n${lista(m.segredos)}`,
    `NPCs (cada um só sabe o que está na própria linha; retome a emoção e o vínculo anotados):\n${npcsEmTexto(c, foco)}`,
    lembrancas.length > 0 && `LEMBRANÇAS ANTIGAS QUE VÊM AO CASO NESTA CENA (já aconteceram; não contradiga):\n${lembrancas.join('\n')}`,
    m.pesquisas.length > 0 && `PESQUISAS:\n${m.pesquisas.map((p) => `[${p.termo}]\n${p.texto}`).join('\n\n')}`,
  ];
  return partes.filter(Boolean).join('\n\n');
}
