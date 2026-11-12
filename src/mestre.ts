/**
 * Mestre IA: a parte que não depende de tela nem de rede.
 *
 * O modelo de linguagem não lembra de nada entre uma chamada e outra. Quem lembra é a
 * campanha: a cada mensagem o app remonta o que o mestre precisa saber (leis do mundo,
 * segredos, fatos, NPCs, resumo) e o mestre devolve, junto da narração, um bloco de
 * bastidores com o que mudou. O jogador nunca vê esse bloco.
 */

export type Msg = {
  de: 'mestre' | 'jogador' | 'nota';
  /** Do mestre, o texto bruto: narração, status e bastidores. A tela mostra só `separar().visivel`. */
  texto: string;
  t: number;
};

export type Memoria = {
  /** Leis do universo e tramas ocultas, escritas antes da primeira cena. Nunca mudam. */
  leis: string;
  /** Ficha fixa: nome, aparência, origem, estilo e limites de conteúdo combinados no início. */
  personagem: string;
  tempo: string;
  /** O último bloco de status que o jogador viu. */
  status: string;
  /** A história já contada, condensada: as mensagens antigas saem do contexto e ficam aqui. */
  resumo: string;
  fatos: string[];
  segredos: string[];
  npcs: Record<string, string>;
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
  /** As mensagens antes deste índice já estão no resumo e não vão mais no contexto. */
  resumidoAte: number;
  /** Como a memória estava antes da última resposta do mestre: é o que o "refazer" restaura. */
  desfazer?: { mem: Memoria; resumidoAte: number };
};

export type Chat = { role: 'system' | 'user' | 'assistant'; content: string };

export const memoriaVazia = (): Memoria => ({
  leis: '',
  personagem: '',
  tempo: '',
  status: '',
  resumo: '',
  fatos: [],
  segredos: [],
  npcs: {},
  pesquisas: [],
});

export const novaCampanha = (tema: string, agora = Date.now()): Campanha => ({
  id: Math.random().toString(36).slice(2, 10) + agora.toString(36),
  nome: tema.trim().split('\n')[0].slice(0, 60) || 'Aventura',
  tema: tema.trim(),
  criada: agora,
  jogada: agora,
  mem: memoriaVazia(),
  msgs: [],
  resumidoAte: 0,
});

// --- O prompt do mestre --------------------------------------------------

/** As regras da mesa, como o dono do app escreveu. Só o [TEMA] é trocado. */
const REGRAS = `MESTRE DE RPG NARRATIVO INTERATIVO
Você é o MESTRE DE UM RPG NARRATIVO INTERATIVO, exclusivo para modo conversa. Sua missão é conduzir uma aventura imersiva, coerente, desafiadora, reativa e VIVA. O mundo continua existindo mesmo fora de foco, os NPCs têm objetivos próprios e as consequências permanecem.

Universo ou Tema: [TEMA]

Se o tema for baseado em obra existente, preserve apenas atmosfera, lógica de poder, estética e regras gerais. NÃO reutilize protagonistas, vilões, NPCs, locais ou tramas centrais originais, salvo se o jogador pedir. Crie história inédita.

1. LEIS DO UNIVERSO
Antes da primeira cena, defina internamente e NUNCA quebre: sistema de poder e seus limites, recursos e custos (energia, tempo, materiais, risco, desgaste, sacrifício), hierarquia de força, regras físicas, sociais, culturais, econômicas e políticas, condições para aprender/perder habilidades e consequências de ultrapassar limites.

Regra de Ouro: Poder novo NUNCA surge gratuitamente. Exige preparação, treino, descoberta, risco ou sacrifício. Se o jogador tentar algo impossível, não diga "você não pode". Descreva a tentativa e aplique falha + custo + efeito parcial.

2. COERÊNCIA E CONTINUIDADE
Toda consequência precisa de causa rastreável. Proibido Deus Ex Machina. Ferimentos, cansaço, dívidas, promessas, itens e reputação PERSISTEM. Tempo passa e gera efeitos off-screen. NPCs têm memória, personalidade e objetivos e podem agir fora de cena se compatível.

3. DESAFIO SEM FACILITAÇÃO
Sem vitórias automáticas. Inimigos inteligentes observam, aprendem e exploram fraquezas. Erros causam ferimentos, perdas, consequências sociais ou morte quando compatível. Recompense planejamento e criatividade. Ofereça sempre mais de uma abordagem, sem garantir sucesso.

4. SISTEMA DE ANTI-ONISCIÊNCIA (Módulo Central)
O Mestre SABE tudo, mas o jogador SÓ sabe o que PERCEBEU.

Classifique toda informação antes de narrar:
• FATO CONFIRMADO: O que ele viu/viveu. Pode narrar direto.
• SINAL PERCEBIDO: Apenas dado sensorial bruto, sem explicação. Ex: "você ouve um clique metálico atrás da parede" e NÃO "tem uma armadilha".
• RUMOR: Info de NPC. Sempre marque a fonte: "Segundo o taverneiro...". Pode ser mentira.
• SECRETO: Planos secretos, identidades ocultas, armadilhas, fraquezas. PROIBIDO narrar até gatilho lógico. Guarde em memória interna secreta.

Regras de Narração:
• PROIBIDO: "Você sente que tem algo errado", "Você não percebe, mas...", "O que você não sabe é que..."
• PERMITIDO: "Você vê um risco circular no chão, como se já tivesse afundado", "O ladino mantém a mão perto do bolso", "O ar está mais frio, com cheiro de pólvora"
• Nunca entregue a conclusão. Entregue apenas os dados brutos sensoriais. O jogador conclui.

Conhecimento dos NPCs:
Cada NPC tem sua própria bolha. Nenhum sabe tudo. NPC não sabe ficha do jogador, item escondido ou pensamento. Não reage ao que não viu. Pode mentir, omitir ou estar enganado.

Filtro de Combate:
Nunca diga "Ele tem 20 de vida". Diga: "Ele ofega, sangue escorre do ombro, mas segura a lâmina firme. Parece perto do limite."

5. CONHECIMENTO LIMITADO
O jogador só sabe o que percebeu, aprendeu ou recebeu de fonte disponível. Não revele planos secretos, armadilhas ou reviravoltas antes da hora. Descreva sinais observáveis sem entregar a explicação.

6. AGÊNCIA DO JOGADOR
NUNCA decida ação, fala, pensamento ou sentimento do personagem. Não mova de cena sem reação, exceto consequência direta. Termine SEMPRE com situação aberta + pergunta objetiva. Se ambíguo, peça esclarecimento.

7. ESTILO DE NARRAÇÃO
Segunda pessoa ("você"), imersivo, visual, cinematográfico. Descreva som, cheiro, temperatura, textura, luz, tensão. Dê vozes distintas aos NPCs. Alterne exploração, interação, investigação, conflito e respiro.

8. STATUS ADAPTATIVO OBRIGATÓRIO
Ao final de TODA mensagem, inclua:
━━━ STATUS DO PERSONAGEM ━━━
• Nome: [valor]
• Condição: [valor]
• [Campo específico do universo]: [valor]
• Inventário: [valor]
• Reputação/Vínculos: [valor]
━━━━━━━━━━━━━━━━━━━━━━━━━━
Regras: Crie campos dinâmicos baseados no TEMA. Só liste o que ele realmente possui/sabe. Use "Perdido/Selado/Desconhecido/Nenhum" quando aplicável. NUNCA revele no status algo que ele não descobriu (se anel é amaldiçoado e ele não sabe, mostre "Anel de prata - Nenhum efeito aparente").

9. INÍCIO
Apresente o mundo em até 3 parágrafos sem spoilers. Depois pergunte: 1) Nome? 2) Aparência/Espécie? 3) Origem/Conceito em 1 frase? 4) Ponto de partida? 5) Estilo [combate, drama, exploração, mistério, misto]? 6) Limites de conteúdo? Confirme e inicie a Cena 1 com imersão sensorial e dilema aberto.`;

/**
 * Como o mestre conversa com o app. Vem depois das regras porque é mecânica, não estilo:
 * sem o bloco de bastidores nada do que ele decidir em segredo sobrevive à próxima mensagem.
 */
const PROTOCOLO = `═══ MEMÓRIA PERSISTENTE (mecânica do aplicativo, invisível ao jogador) ═══
Você não se lembra de nada além do que está escrito em "MEMÓRIA DO MESTRE" e nas mensagens abaixo. O que você não anotar, você esquece. Por isso, depois do STATUS, termine TODA mensagem com este bloco:

<<<BASTIDORES
PERSONAGEM: ficha fixa numa linha (nome, aparência/espécie, origem, estilo de jogo, limites de conteúdo). Só quando for definida ou mudar.
TEMPO: data, hora e clima atuais do mundo.
FATO: um fato confirmado novo que o personagem viveu (ferimento, promessa, dívida, item ganho ou perdido, lugar, reputação). Uma linha FATO por fato.
SECRETO: uma informação secreta nova ou alterada (plano de NPC, armadilha, identidade oculta, fraqueza, o que anda acontecendo fora de cena). Uma linha SECRETO por segredo.
NPC: Nome | o que quer, o que sabe, onde está agora e como vê o personagem.
ESQUECER: trecho de uma anotação antiga que deixou de valer.
>>>

Regras do bloco:
• O jogador NUNCA vê o bloco: é o único lugar onde segredos podem ser escritos. Fora dele vale a anti-onisciência.
• Anote só o que mudou nesta mensagem; omita as linhas sem novidade. Uma linha NPC com o mesmo nome substitui a anterior.
• Use os SECRETOS da memória para fazer o mundo andar fora de cena, e respeite todos os FATOS: eles já aconteceram.
• Nunca cite o bloco, a memória ou o aplicativo na narração.

PESQUISA: se precisar consultar uma obra ou o mundo real para manter atmosfera e lógica de poder, responda APENAS com a linha
[[PESQUISAR: termos de busca]]
O aplicativo anota o resultado em "PESQUISAS" e chama você de novo para narrar. No máximo uma pesquisa por mensagem; se já houver pesquisa sobre o assunto, use a que está na memória.`;

const lista = (itens: string[]) => (itens.length ? itens.map((i) => `- ${i}`).join('\n') : '(nada ainda)');

/** O que o mestre sabe neste momento, do jeito que ele lê. */
export function memoriaEmTexto(c: Campanha): string {
  const m = c.mem;
  const npcs = Object.entries(m.npcs).map(([nome, nota]) => `${nome}: ${nota}`);
  const partes = [
    '═══ MEMÓRIA DO MESTRE (só você lê) ═══',
    `LEIS DO UNIVERSO E TRAMAS OCULTAS (nunca quebre; nunca revele as tramas antes do gatilho lógico):\n${m.leis || '(ainda não definidas: defina e siga)'}`,
    `PERSONAGEM DO JOGADOR:\n${m.personagem || '(ainda não criado: siga a seção 9 – INÍCIO)'}`,
    m.tempo && `TEMPO ATUAL: ${m.tempo}`,
    m.status && `ÚLTIMO STATUS MOSTRADO AO JOGADOR:\n${m.status}`,
    m.resumo && `RESUMO DA HISTÓRIA ATÉ AQUI:\n${m.resumo}`,
    `FATOS CONFIRMADOS (o personagem viveu; persistem):\n${lista(m.fatos)}`,
    `SEGREDOS (PROIBIDO narrar antes do gatilho lógico):\n${lista(m.segredos)}`,
    `NPCs (cada um só sabe o que está na própria linha):\n${lista(npcs)}`,
    m.pesquisas.length > 0 && `PESQUISAS:\n${m.pesquisas.map((p) => `[${p.termo}]\n${p.texto}`).join('\n\n')}`,
  ];
  return partes.filter(Boolean).join('\n\n');
}

export const sistema = (c: Campanha): string =>
  `${REGRAS.replace('[TEMA]', c.tema)}\n\n${PROTOCOLO}\n\n${memoriaEmTexto(c)}`;

const ABERTURA = '[O jogador acabou de abrir a aventura. Siga a seção 9 – INÍCIO.]';
const CONTINUA = '[A aventura continua do ponto em que parou.]';

/**
 * As mensagens que vão para o modelo: regras + memória, e a conversa ainda não resumida.
 * Papéis alternados e começando pelo jogador, que é o que alguns provedores exigem.
 */
export function contexto(c: Campanha, extra?: string): Chat[] {
  const conversa: Chat[] = [];
  // Se a condensação vem falhando (cota, sem sinal), o mais antigo fica de fora: os fatos
  // anotados seguram a continuidade, e um contexto grande demais derrubaria toda chamada.
  let desde = c.msgs.length;
  for (let n = 0; desde > c.resumidoAte; desde--) {
    const m = c.msgs[desde - 1];
    n += m.de === 'nota' ? 0 : m.texto.length;
    if (n > TETO_CONVERSA && desde < c.msgs.length) break;
  }
  for (const m of c.msgs.slice(desde)) {
    if (m.de === 'nota') continue;
    const role = m.de === 'mestre' ? 'assistant' : 'user';
    const ultima = conversa[conversa.length - 1];
    if (ultima?.role === role) ultima.content += `\n\n${m.texto}`;
    else conversa.push({ role, content: m.texto });
  }
  if (conversa[0]?.role !== 'user') conversa.unshift({ role: 'user', content: c.resumidoAte ? CONTINUA : ABERTURA });
  if (extra) {
    const ultima = conversa[conversa.length - 1];
    if (ultima.role === 'user') ultima.content += `\n\n${extra}`;
    else conversa.push({ role: 'user', content: extra });
  }
  return [{ role: 'system', content: sistema(c) }, ...conversa];
}

/** O pedido que escreve as leis do universo, antes de qualquer cena. */
export function pedidoLeis(tema: string, pesquisa: string): Chat[] {
  return [
    {
      role: 'system',
      content: `Você é o arquiteto de mundo de um RPG narrativo em português do Brasil. Para o tema dado, escreva as LEIS DO UNIVERSO que o mestre seguirá a campanha inteira sem nunca quebrar. Tópicos curtos, no máximo 350 palavras, cobrindo: sistema de poder e seus limites; recursos e custos (energia, tempo, materiais, risco, desgaste, sacrifício); hierarquia de força; regras físicas, sociais, culturais, econômicas e políticas; condições para aprender e para perder habilidades; consequências de ultrapassar limites. Regra de ouro: poder novo nunca surge de graça.

Depois, sob o título "TRAMAS OCULTAS", liste 3 tramas inéditas já em andamento no mundo: quem quer o quê, por quê, e o que acontece se ninguém interferir.

Se o tema vier de uma obra existente, preserve apenas atmosfera, lógica de poder, estética e regras gerais. NÃO reutilize protagonistas, vilões, NPCs, locais ou tramas centrais da obra. Responda só com o texto, sem introdução nem comentários.`,
    },
    { role: 'user', content: `Tema: ${tema}${pesquisa ? `\n\nPesquisa de referência (use para atmosfera e lógica de poder, não para copiar personagens ou trama):\n${pesquisa}` : ''}` },
  ];
}

// --- Ler a resposta do mestre --------------------------------------------

const PESQUISAR = /\[\[\s*PESQUISAR\s*:\s*([^\]\n]+)\]\]/i;

/**
 * Separa o que o jogador lê do que é só do mestre. Serve também no meio da resposta,
 * enquanto ela chega: um bloco ainda aberto some inteiro, para segredo nenhum piscar na tela.
 */
export function separar(bruto: string): { visivel: string; bastidores: string; pesquisa: string; limpo: string } {
  // Modelos que "pensam alto" mandam o rascunho entre <think>: não é narração.
  let texto = bruto.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '');
  const pesquisa = texto.match(PESQUISAR)?.[1].trim() ?? '';
  texto = texto.replace(PESQUISAR, '');
  // O que fica guardado e volta ao modelo como histórico: com os bastidores, que é o
  // exemplo que o faz continuar anotando, e sem o rascunho.
  const limpo = texto.trim();

  let bastidores = '';
  texto = texto.replace(/<<<\s*BASTIDORES\b([\s\S]*?)(>>>|$)/gi, (_, dentro: string) => {
    bastidores += `${dentro}\n`;
    return '';
  });
  const visivel = texto
    .replace(/<<<[\s\S]*$/, '') // marcador ainda chegando, ou bloco com outro nome
    .replace(/\[\[\s*P[A-Z]*\s*:?[^\]]*$/i, '') // [[PESQUISAR pela metade
    .replace(/```\w*\s*```/g, '') // cerca de código que ficou vazia em volta do bloco
    .replace(/\s*(```\w*|<{1,2}|\[{1,2})\s*$/, '')
    .trim();
  return { visivel, bastidores: bastidores.trim(), pesquisa, limpo };
}

/** Narração e bloco de status, separados para a tela desenhar o status como cartão. */
export function extrairStatus(visivel: string): { narrativa: string; status: string } {
  const linhas = visivel.split('\n');
  const inicio = linhas.findIndex((l) => /STATUS DO PERSONAGEM/i.test(l));
  if (inicio < 0) return { narrativa: visivel.trim(), status: '' };
  // Fecha na próxima régua (linha só de traços) ou no fim do texto.
  let fim = linhas.findIndex((l, i) => i > inicio && /^[\s━─═—_*-]{6,}$/.test(l));
  if (fim < 0) fim = linhas.length - 1;
  const status = linhas
    .slice(inicio + 1, fim + 1)
    .filter((l) => !/^[\s━─═—_*`-]*$/.test(l))
    .map((l) => l.trim())
    .join('\n');
  const narrativa = [...linhas.slice(0, inicio), ...linhas.slice(fim + 1)].join('\n').replace(/\s*```\s*$/, '').trim();
  return { narrativa, status };
}

/** "• Campo: valor" vira par; linha sem dois-pontos continua o valor anterior. */
export function camposDoStatus(status: string): [string, string][] {
  const campos: [string, string][] = [];
  for (const l of status.split('\n')) {
    const limpa = l.replace(/^[\s•*·-]+/, '').replace(/\*\*/g, '').trim();
    if (!limpa) continue;
    const i = limpa.indexOf(':');
    if (i > 0 && i < 40) campos.push([limpa.slice(0, i).trim(), limpa.slice(i + 1).trim()]);
    else if (campos.length) campos[campos.length - 1][1] += ` ${limpa}`;
    else campos.push(['', limpa]);
  }
  return campos;
}

const CHAVES = ['PERSONAGEM', 'TEMPO', 'FATO', 'SECRETO', 'NPC', 'ESQUECER', 'RESUMO'] as const;
type Chave = (typeof CHAVES)[number];
const APELIDO: Record<string, Chave> = { FATOS: 'FATO', SECRETOS: 'SECRETO', SEGREDO: 'SECRETO', SEGREDOS: 'SECRETO', NPCS: 'NPC' };
const VAZIO = /^[\s([]*(nenhum|nenhuma|nada|sem novidades?|sem mudanças?|n\/a|—|-)?[\s)\].]*$/i;

/**
 * Lê as linhas "CHAVE: valor" de um bloco. Aceita o que os modelos costumam variar:
 * negrito, marcador na frente, plural, e a chave sozinha com os itens em lista embaixo.
 */
export function lerBloco(bloco: string): [Chave, string][] {
  const itens: [Chave, string][] = [];
  let atual: Chave | null = null;
  for (const bruta of bloco.split('\n')) {
    const linha = bruta.replace(/\*\*/g, '').trim();
    if (!linha) continue;
    const m = linha.match(/^[\s•*·-]*([A-Za-zÀ-ú]+)\s*:\s*(.*)$/);
    const nome = m?.[1].toUpperCase() ?? '';
    const chave = (CHAVES as readonly string[]).includes(nome) ? (nome as Chave) : APELIDO[nome];
    if (m && chave) {
      atual = chave;
      if (!VAZIO.test(m[2])) itens.push([chave, m[2].trim()]);
    } else if (atual) {
      const item = linha.replace(/^[\s•*·-]+/, '').trim();
      const ultimo = itens[itens.length - 1];
      // Resumo é texto corrido: a linha seguinte continua o parágrafo. O resto é lista.
      if (atual === 'RESUMO' && ultimo?.[0] === 'RESUMO') ultimo[1] += `\n${item}`;
      else if (!VAZIO.test(item)) itens.push([atual, item]);
    }
  }
  return itens;
}

const semRepetir = (itens: string[]) => [...new Set(itens.map((i) => i.trim()).filter(Boolean))];
const contem = (texto: string, trecho: string) => texto.toLowerCase().includes(trecho.toLowerCase());

/** "Nome | notas" (ou com travessão, ou dois-pontos) → [nome, notas]. */
function lerNpc(valor: string): [string, string] {
  const m = valor.match(/^(.{1,60}?)\s*(?:\||—|–| - |:)\s*(.+)$/s);
  return m ? [m[1].trim(), m[2].trim()] : [valor.trim().slice(0, 60), valor.trim()];
}

/** Junta à memória o que o mestre anotou nos bastidores desta mensagem. */
export function aplicar(mem: Memoria, bastidores: string, status = ''): Memoria {
  const nova: Memoria = { ...mem, fatos: [...mem.fatos], segredos: [...mem.segredos], npcs: { ...mem.npcs } };
  for (const [chave, valor] of lerBloco(bastidores)) {
    if (chave === 'PERSONAGEM') nova.personagem = valor;
    else if (chave === 'TEMPO') nova.tempo = valor;
    else if (chave === 'FATO') nova.fatos.push(valor);
    else if (chave === 'SECRETO') nova.segredos.push(valor);
    else if (chave === 'NPC') {
      const [nome, nota] = lerNpc(valor);
      nova.npcs[nome] = nota;
    } else if (chave === 'ESQUECER' && valor.length >= 4) {
      nova.fatos = nova.fatos.filter((f) => !contem(f, valor));
      nova.segredos = nova.segredos.filter((s) => !contem(s, valor));
      for (const nome of Object.keys(nova.npcs)) if (nome.toLowerCase() === valor.toLowerCase()) delete nova.npcs[nome];
    }
  }
  nova.fatos = semRepetir(nova.fatos);
  nova.segredos = semRepetir(nova.segredos);
  if (status.trim()) nova.status = status.trim();
  return nova;
}

/** Guarda uma pesquisa na memória. Ficam as últimas: contexto é espaço disputado. */
export function comPesquisa(mem: Memoria, termo: string, texto: string): Memoria {
  const outras = mem.pesquisas.filter((p) => p.termo.toLowerCase() !== termo.toLowerCase());
  return { ...mem, pesquisas: [...outras, { termo, texto: texto.slice(0, 1500) }].slice(-4) };
}

// --- Condensar: a memória não pode crescer para sempre -------------------

/** Conversa sem resumo acima disto (em letras) pede uma condensada. ~3 mil tokens. */
export const LIMITE_CONVERSA = 12000;
/** Nem com a condensação falhando o contexto passa disto. */
export const TETO_CONVERSA = 30000;
/** Depois de condensar, o que fica da conversa recente, palavra por palavra. */
export const MANTER_CONVERSA = 5000;
/** Anotações (fatos, segredos, NPCs) acima disto também pedem uma condensada. */
export const LIMITE_NOTAS = 5000;

const tamanhoNotas = (m: Memoria) =>
  [...m.fatos, ...m.segredos, ...Object.entries(m.npcs).flat()].reduce((n, s) => n + s.length, 0);

const conversaSemResumo = (c: Campanha) =>
  c.msgs.slice(c.resumidoAte).reduce((n, m) => n + (m.de === 'nota' ? 0 : m.texto.length), 0);

export const precisaCondensar = (c: Campanha): boolean =>
  conversaSemResumo(c) > LIMITE_CONVERSA || tamanhoNotas(c.mem) > LIMITE_NOTAS;

/**
 * O pedido de condensação e até onde ele cobre. As últimas mensagens ficam de fora:
 * continuam no contexto palavra por palavra, que é o que mantém o tom da cena.
 */
export function pedidoCondensar(c: Campanha): { mensagens: Chat[]; ate: number } {
  let ate = c.msgs.length;
  let guardado = 0;
  while (ate > c.resumidoAte && (guardado < MANTER_CONVERSA || c.msgs.length - ate < 2)) {
    ate--;
    if (c.msgs[ate].de !== 'nota') guardado += c.msgs[ate].texto.length;
  }
  // O corte cai antes de uma fala do jogador: o contexto seguinte começa por ele.
  while (ate > c.resumidoAte && c.msgs[ate]?.de !== 'jogador') ate--;

  const trecho = c.msgs
    .slice(c.resumidoAte, ate)
    .filter((m) => m.de !== 'nota')
    .map((m) => `${m.de === 'mestre' ? 'MESTRE' : 'JOGADOR'}: ${m.texto}`)
    .join('\n\n');
  const m = c.mem;
  const npcs = Object.entries(m.npcs).map(([nome, nota]) => `${nome} | ${nota}`);
  return {
    ate,
    mensagens: [
      {
        role: 'system',
        content: `Você é o arquivista do mestre de um RPG narrativo. Reescreva as anotações da campanha de forma compacta, SEM perder nada que ainda possa ter consequência: ferimentos, dívidas, promessas, itens, reputação, lugares, nomes, planos em andamento, o que cada NPC sabe e quer. Descarte só o que já se resolveu e não volta mais. Não invente nada.

Responda exatamente neste formato, em português, sem mais nada:
RESUMO: a história até aqui em ordem cronológica, em até 250 palavras, incorporando o resumo anterior e o trecho novo.
FATO: um fato confirmado que ainda importa (uma linha FATO para cada, no máximo 20)
SECRETO: um segredo ainda não revelado ou plano em andamento (uma linha SECRETO para cada, no máximo 15)
NPC: Nome | o que quer, o que sabe, onde está, como vê o personagem (uma linha NPC para cada NPC que ainda importa)`,
      },
      {
        role: 'user',
        content: [
          `RESUMO ANTERIOR:\n${m.resumo || '(nenhum)'}`,
          `FATOS ANOTADOS:\n${lista(m.fatos)}`,
          `SEGREDOS ANOTADOS:\n${lista(m.segredos)}`,
          `NPCs ANOTADOS:\n${lista(npcs)}`,
          `TRECHO NOVO DA AVENTURA:\n${trecho || '(nenhum)'}`,
        ].join('\n\n'),
      },
    ],
  };
}

/**
 * Troca as anotações pelas condensadas e avança o ponto de corte. Uma lista que voltou
 * vazia mantém a antiga: perder segredo por resposta malformada é pior que guardar demais.
 */
export function aplicarCondensado(c: Campanha, resposta: string, ate: number): Campanha {
  const itens = lerBloco(separar(resposta).visivel);
  const de = (chave: Chave) => itens.filter(([k]) => k === chave).map(([, v]) => v);
  const resumo = de('RESUMO').join('\n').trim();
  if (!resumo) return c; // não entendeu a resposta: tenta de novo na próxima
  const [fatos, segredos, npcs] = [de('FATO'), de('SECRETO'), de('NPC')];
  return {
    ...c,
    resumidoAte: ate,
    mem: {
      ...c.mem,
      resumo,
      fatos: fatos.length ? semRepetir(fatos) : c.mem.fatos,
      segredos: segredos.length ? semRepetir(segredos) : c.mem.segredos,
      npcs: npcs.length ? Object.fromEntries(npcs.map(lerNpc)) : c.mem.npcs,
    },
  };
}

// --- Arquivo de backup ---------------------------------------------------

export const exportarCampanha = (c: Campanha): string => JSON.stringify({ app: 'ficha-rpg', tipo: 'aventura', versao: 1, campanha: c });

export function importarCampanha(json: string): Campanha {
  let dados: any;
  try {
    dados = JSON.parse(json);
  } catch {
    throw new Error('Este arquivo não é uma aventura: não deu pra ler.');
  }
  const c = dados?.campanha;
  if (dados?.tipo !== 'aventura' || !c || typeof c.tema !== 'string' || !Array.isArray(c.msgs))
    throw new Error('Este arquivo não é uma aventura do Mestre IA.');
  const base = novaCampanha(c.tema);
  return {
    ...base, // id novo: importar duas vezes não sobrescreve a aventura que já está aqui
    nome: String(c.nome || base.nome),
    criada: Number(c.criada) || base.criada,
    jogada: Number(c.jogada) || base.jogada,
    mem: { ...memoriaVazia(), ...c.mem },
    msgs: c.msgs.filter((m: any) => m && typeof m.texto === 'string' && ['mestre', 'jogador', 'nota'].includes(m.de)),
    resumidoAte: Math.max(0, Math.min(Number(c.resumidoAte) || 0, c.msgs.length)),
  };
}
