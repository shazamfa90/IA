/**
 * Mestre IA: o roteiro do mestre e os pedidos que o app faz às IAs. Sem tela e sem rede.
 *
 * Quem narra é uma IA; outra confere e arquiva. O narrador raciocina sobre a ação antes de
 * escrever (num bloco que o jogador não vê) e anota o que mudou nos bastidores. O auxiliar
 * relê a fala contra as regras e a memória, pede correção quando há erro grave, e completa
 * as anotações. A memória em si está em `memoria.ts`; a leitura das respostas, em `leitura.ts`.
 */
import { extrairStatus, lerBloco, separar, valores } from './leitura.ts';
import { aplicar, lembrar, memoriaEmTexto, memoriaVazia, normalizar, palavras, type Campanha } from './memoria.ts';

export * from './leitura.ts';
export * from './memoria.ts';

export type Chat = { role: 'system' | 'user' | 'assistant'; content: string };

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
Apresente o mundo em até 3 parágrafos sem spoilers. Depois pergunte: 1) Nome? 2) Aparência/Espécie? 3) Origem/Conceito em 1 frase? 4) Ponto de partida? 5) Estilo [combate, drama, exploração, mistério, misto]? 6) Limites de conteúdo? Confirme e inicie a Cena 1 com imersão sensorial e dilema aberto.

10. NPCs REALISTAS E COM EMOÇÕES
Todo NPC é uma pessoa, não um balcão de informações. Cada um tem temperamento, um desejo, um medo, um defeito, um jeito próprio de falar e uma vida que não gira em torno do personagem.
• Emoção antes da fala: decida o que o NPC sente AGORA (medo, raiva, luto, alívio, vergonha, cobiça, afeto, tédio, esperança) e por quê. A emoção muda o que ele diz, o que esconde e como age.
• Mostre, não rotule: mãos que tremem, olhar que foge, riso fora de hora, frase que morre no meio, voz que endurece. Nunca "ele está triste"; o jogador percebe pelo corpo e pela voz.
• Emoções têm causa e duram: mudam por acontecimentos, não a cada frase. Quem foi humilhado guarda rancor, quem foi ajudado lembra; luto, trauma e cansaço atravessam dias.
• Reagem como gente: recusam, hesitam, mentem por vergonha, erram por orgulho, ajudam contra o próprio interesse, mudam de ideia, perdem a paciência, fazem piada, têm dia ruim. Ninguém é só bom ou só mau: vilões têm razões, aliados têm limites.
• Relações evoluem: confiança, medo, dívida e afeto pelo personagem crescem ou quebram conforme o que ele faz, o que diz e o tom com que diz.
• Vida própria: família, ofício, rotina, problemas e opinião sobre os outros NPCs. Conversam entre si, fofocam, brigam, se protegem.`;

/**
 * Como o mestre conversa com o app. Vem depois das regras porque é mecânica, não estilo:
 * sem o raciocínio a ação é julgada no improviso, e sem os bastidores nada do que ele
 * decidir em segredo sobrevive à próxima mensagem.
 */
const PROTOCOLO = `═══ COMO RESPONDER (mecânica do aplicativo, invisível ao jogador) ═══
Toda mensagem sua tem quatro partes, nesta ordem:

1) RACIOCÍNIO — antes de narrar, julgue a ação do jogador num bloco que ele NUNCA vê:
<<<RACIOCINIO
Ação: o que exatamente o personagem tentou (e só isso; nada que o jogador não declarou).
Memória: quais fatos, pendências, segredos e fichas de NPC têm a ver com esta cena.
Possível?: o que as leis do universo, a condição do personagem e os recursos dele permitem; dificuldade e risco.
NPCs: o que cada um em cena sabe, sente e quer agora, e como reage a esta ação.
Resultado: sucesso, sucesso parcial ou falha, e o custo — com causa rastreável.
Mundo: o que anda fora de cena enquanto isso (tramas ocultas, prazos, quem ficou sabendo).
>>>
Curto: até 120 palavras, em tópicos. É aqui que a cena se decide; a narração só mostra o resultado.

2) A NARRAÇÃO, conforme as regras acima, terminando em situação aberta e pergunta objetiva.

3) O STATUS DO PERSONAGEM.

4) BASTIDORES — você não se lembra de nada além do que está em "MEMÓRIA DO MESTRE" e nas mensagens abaixo. O que você não anotar, você esquece. Termine TODA mensagem com:
<<<BASTIDORES
PERSONAGEM: ficha fixa numa linha (nome, aparência/espécie, origem, estilo de jogo, limites de conteúdo). Só quando for definida ou mudar.
TEMPO: data, hora e clima atuais do mundo.
FATO: um fato confirmado novo que o personagem viveu (ferimento, item ganho ou perdido, lugar, reputação, o que ele disse ou fez de importante). Uma linha FATO por fato.
PENDENTE: um fio solto novo — promessa, dívida, prazo, missão, ameaça em andamento — com o prazo, se houver.
RESOLVIDO: trecho de uma pendência que se encerrou, e como.
SECRETO: uma informação secreta nova ou alterada (plano de NPC, armadilha, identidade oculta, fraqueza, o que anda acontecendo fora de cena). Uma linha SECRETO por segredo.
REVELADO: trecho de um segredo que o personagem acabou de descobrir.
NPC: Nome | jeito de ser; o que quer e o que teme; o que sabe; o que sente agora e por quê; como vê o personagem (confiança, medo, rancor, afeto); onde está.
ESQUECER: trecho de uma anotação antiga que deixou de valer.
>>>

Regras dos blocos:
• O jogador NUNCA vê os blocos: são o único lugar onde segredos podem ser escritos. Fora deles vale a anti-onisciência.
• Anote só o que mudou nesta mensagem; omita as linhas sem novidade. Uma linha NPC com o mesmo nome substitui a anterior: reescreva-a sempre que a emoção ou o vínculo do NPC mudar, para ele continuar a mesma pessoa na próxima cena.
• Use os SEGREDOS e as PENDÊNCIAS da memória para fazer o mundo andar fora de cena, e respeite todos os FATOS: eles já aconteceram.
• Nunca cite os blocos, a memória ou o aplicativo na narração.

CONSULTAS (no máximo uma por mensagem; responda APENAS com a linha, sem mais nada, e o aplicativo chama você de novo com o resultado):
• [[LEMBRAR: nome ou assunto]] — procura no arquivo da própria campanha (cenas antigas, fichas de NPC fora de cena, capítulos passados). Use quando a cena tocar em algo antigo que não está na memória abaixo.
• [[PESQUISAR: termo; outro termo]] — consulta fora do jogo (uma obra, uma época, um ofício), para manter atmosfera e lógica de poder. Até três termos curtos, separados por ponto e vírgula, cada um como título de enciclopédia. Se já houver pesquisa sobre o assunto, use a que está na memória.`;

/** Vai por último, que é o que os modelos menores mais respeitam: o que conferir antes de enviar. */
const CONFERIR = `═══ ANTES DE ENVIAR, CONFIRA ═══
1. Comecei pelo bloco <<<RACIOCINIO ... >>> e decidi o resultado ali, olhando a memória.
2. Não escrevi fala, pensamento, sentimento nem ação do personagem do jogador além do que ele mesmo declarou.
3. Nenhum segredo apareceu na narração: só dados sensoriais brutos.
4. Cada NPC em cena agiu movido pelo que sente e quer, com voz própria.
5. Terminei com a situação aberta e uma pergunta objetiva.
6. Depois vem o STATUS DO PERSONAGEM e, por último, o bloco <<<BASTIDORES ... >>>.
Escreva sempre em português do Brasil.`;

export const sistema = (c: Campanha, foco = '', antesDe = c.resumidoAte): string =>
  `${REGRAS.replace('[TEMA]', c.tema)}\n\n${PROTOCOLO}\n\n${memoriaEmTexto(c, foco, antesDe)}\n\n${CONFERIR}`;

const ABERTURA = '[O jogador acabou de abrir a aventura. Siga a seção 9 – INÍCIO.]';
const CONTINUA = '[A aventura continua do ponto em que parou.]';
const LEMBRETE = '[Lembrete do aplicativo: comece a resposta pelo bloco <<<RACIOCINIO ... >>>, julgando a ação com a memória em mãos; depois narre, dê o STATUS e feche com <<<BASTIDORES ... >>>.]';

/** Quanto de conversa recente (em letras) cabe com folga na IA mais apertada. ~2,5 mil tokens. */
export const FOLEGO_PADRAO = 9000;

/** O texto que o jogador leu numa fala, sem status nem bastidores. */
const lido = (texto: string) => extrairStatus(separar(texto).visivel).narrativa;

/** A cena atual, pra decidir o que lembrar: a última narração e o que o jogador acabou de dizer. */
export function focoDaCena(c: Campanha): string {
  const falas = c.msgs.filter((m) => m.de !== 'nota');
  const jogador = [...falas].reverse().find((m) => m.de === 'jogador');
  const mestre = [...falas].reverse().find((m) => m.de === 'mestre');
  return [jogador?.texto ?? '', mestre ? lido(mestre.texto).slice(-1200) : ''].join('\n').trim();
}

/**
 * As mensagens que vão para o modelo: regras + memória, e a conversa ainda não resumida.
 * Papéis alternados e começando pelo jogador, que é o que alguns provedores exigem.
 * `folego` é quanto de conversa a IA que vai responder aguenta: uma IA de contexto grande
 * recebe mais falas inteiras, e por isso lembra melhor.
 */
export function contexto(c: Campanha, o: { extra?: string; folego?: number } = {}): Chat[] {
  // O dobro do fôlego é o teto: passa disso só se a condensação vem falhando (cota, sem
  // sinal), e aí o mais antigo fica de fora — vira lembrança, que o app busca quando vem ao caso.
  const teto = (o.folego ?? FOLEGO_PADRAO) * 2;
  let desde = c.msgs.length;
  for (let n = 0; desde > c.resumidoAte; desde--) {
    const m = c.msgs[desde - 1];
    n += m.de === 'nota' ? 0 : m.texto.length;
    if (n > teto && desde < c.msgs.length) break;
  }
  const conversa: Chat[] = [];
  for (const m of c.msgs.slice(desde)) {
    if (m.de === 'nota') continue;
    const role = m.de === 'mestre' ? 'assistant' : 'user';
    const ultima = conversa[conversa.length - 1];
    if (ultima?.role === role) ultima.content += `\n\n${m.texto}`;
    else conversa.push({ role, content: m.texto });
  }
  if (conversa[0]?.role !== 'user') conversa.unshift({ role: 'user', content: desde ? CONTINUA : ABERTURA });
  // O lembrete vai colado na última fala: é o que o modelo lê por último, e os menores só
  // raciocinam antes de narrar se forem lembrados ali. Não é guardado na conversa.
  const recado = [o.extra, LEMBRETE].filter(Boolean).join('\n\n');
  const ultima = conversa[conversa.length - 1];
  if (ultima.role === 'user') ultima.content += `\n\n${recado}`;
  else conversa.push({ role: 'user', content: recado });
  return [{ role: 'system', content: sistema(c, focoDaCena(c), desde) }, ...conversa];
}

// --- Criar o mundo -------------------------------------------------------

/** O pedido que escreve as leis do universo, antes de qualquer cena. */
export function pedidoLeis(tema: string, pesquisa: string): Chat[] {
  return [
    {
      role: 'system',
      content: `Você é o arquiteto de mundo de um RPG narrativo em português do Brasil. Para o tema dado, escreva as LEIS DO UNIVERSO que o mestre seguirá a campanha inteira sem nunca quebrar. Tópicos curtos, no máximo 350 palavras, cobrindo: sistema de poder e seus limites; recursos e custos (energia, tempo, materiais, risco, desgaste, sacrifício); hierarquia de força; regras físicas, sociais, culturais, econômicas e políticas; condições para aprender e para perder habilidades; consequências de ultrapassar limites. Regra de ouro: poder novo nunca surge de graça.

Depois, sob o título "TRAMAS OCULTAS", liste 3 tramas inéditas já em andamento no mundo: quem quer o quê, por quê, e o que acontece se ninguém interferir.

Se o tema vier de uma obra existente, preserve apenas atmosfera, lógica de poder, estética e regras gerais. NÃO reutilize protagonistas, vilões, NPCs, locais ou tramas centrais da obra. Responda só com o texto, sem introdução nem comentários.`,
    },
    { role: 'user', content: `Tema: ${tema}${pesquisa ? `\n\nDossiê de referência (use para atmosfera e lógica de poder, não para copiar personagens ou trama):\n${pesquisa}` : ''}` },
  ];
}

/**
 * Antes de pesquisar um tema: quais buscas fazer. Um tema quase nunca é um verbete só —
 * tem a obra, o sistema de poder, a época que inspira, as criaturas. Pedir os ângulos
 * separados é o que evita voltar com um nicho único, ou com um verbete que só esbarra no tema.
 */
export function pedidoBuscas(tema: string): Chat[] {
  return [
    {
      role: 'system',
      content: `Você prepara a pesquisa de referência para um RPG. Dado o tema, liste de 3 a 5 buscas para uma enciclopédia (Wikipédia), cada uma num ÂNGULO DIFERENTE do tema:
- a obra, o gênero ou o conceito central em si;
- o sistema de poder, magia, tecnologia ou combate;
- a época, o lugar ou a cultura real que inspira o cenário;
- as criaturas, facções, ofícios ou instituições típicas.
Cada busca deve ser um título provável de verbete: curto (1 a 4 palavras), específico, sem frases. Nunca busque nomes de personagens. Responda só com as linhas, uma por busca, neste formato:
BUSCA: título do verbete`,
    },
    { role: 'user', content: `Tema: ${tema}` },
  ];
}

/** As buscas que a IA planejou. Sem plano (IA falhou), o próprio tema serve de busca. */
export function lerBuscas(resposta: string, tema: string): string[] {
  const buscas = valores(lerBloco(separar(resposta).visivel), 'BUSCA')
    .map((b) => b.replace(/^["'“]|["'”.]$/g, '').trim())
    .filter((b) => b.length > 1 && b.length <= 60);
  const unicas = [...new Set(buscas)].slice(0, 5);
  return unicas.length ? unicas : [tema.split('\n')[0].slice(0, 80)];
}

/**
 * Depois de pesquisar: o que do material achado serve ao tema. A busca traz de tudo
 * (biografia de personagem, bilheteria, elenco); só o que ajuda a narrar entra no dossiê.
 */
export function pedidoDossie(tema: string, achados: string): Chat[] {
  return [
    {
      role: 'system',
      content: `Você é o pesquisador de um RPG narrativo. Abaixo há trechos de enciclopédia achados para o tema. Escreva um DOSSIÊ de referência para o mestre, em português, com no máximo 220 palavras, em tópicos, usando SÓ o que os trechos dizem e que serve ao tema: atmosfera e estética; como o poder funciona e o que ele custa; época, lugares e costumes; tipos de criaturas, facções e ofícios; vocabulário próprio.
Descarte o que não tem a ver com o tema e tudo que for sobre a obra como produto (autor, vendas, elenco, episódios, prêmios) ou biografia e enredo de personagens. Não invente o que os trechos não dizem. Se nada servir, responda só: NADA`,
    },
    { role: 'user', content: `Tema: ${tema}\n\nTrechos achados:\n${achados}` },
  ];
}

// --- A equipe: uma segunda IA confere a fala e cuida da memória ----------

/**
 * O pedido ao auxiliar. Ele não narra: relê a fala do mestre contra as regras e a memória,
 * e completa as anotações. Olhar de fora pega o que quem escreveu não vê — e, sendo outra
 * IA, o trabalho de memória não sai da cota de quem narra.
 */
export function pedidoAuxiliar(c: Campanha, resposta: string): Chat[] {
  const falas = c.msgs.filter((m) => m.de !== 'nota');
  const jogador = [...falas].reverse().find((m) => m.de === 'jogador')?.texto ?? '(abertura da aventura)';
  const r = separar(resposta);
  return [
    {
      role: 'system',
      content: `Você é o REVISOR e ARQUIVISTA de um mestre de RPG narrativo. Você não narra. Recebe a memória da campanha, a ação do jogador e a resposta que o mestre acabou de escrever, e faz duas coisas.

1) REVISÃO. Peça para refazer SÓ se houver erro grave e objetivo:
- AGÊNCIA: a narração escreveu fala, pensamento, sentimento, decisão ou ação do personagem do jogador que ele não declarou.
- SEGREDO: a narração entregou ou explicou um segredo da memória sem gatilho lógico, ou deu a conclusão em vez do dado sensorial.
- CONTRADIÇÃO: contradiz a memória (fato, status, ferimento, item, o que um NPC sabe ou sente, quem está vivo, onde as coisas estão) ou as leis do universo, ou dá poder sem custo.
- FORMATO: não termina em situação aberta com pergunta, ou falta o status do personagem.
Estilo, gosto e detalhes pequenos NÃO são motivo. Na dúvida, aprove.

2) ARQUIVO. Anote o que esta fala mudou e que ainda não está na memória nem nas anotações do próprio mestre. Não repita o que já está anotado. Não invente: só o que o texto mostra.

Responda exatamente neste formato, omitindo as linhas sem conteúdo:
VEREDITO: OK   (ou: VEREDITO: REFAZER)
MOTIVO: (só se REFAZER) o tipo do erro e, em uma frase, o que corrigir
FATO: fato confirmado novo que o personagem viveu
PENDENTE: fio solto novo (promessa, dívida, prazo, missão, ameaça), com prazo se houver
RESOLVIDO: trecho de uma pendência da memória que esta fala encerrou
REVELADO: trecho de um segredo da memória que o personagem descobriu nesta fala
NPC: Nome | jeito de ser; o que quer e teme; o que sabe; o que sente agora e por quê; como vê o personagem; onde está
TEMPO: data, hora e clima, se mudaram`,
    },
    {
      role: 'user',
      content: [
        memoriaEmTexto(c, `${jogador}\n${r.visivel}`),
        `═══ AÇÃO DO JOGADOR ═══\n${jogador}`,
        `═══ RESPOSTA DO MESTRE (o jogador vê) ═══\n${r.visivel}`,
        `═══ ANOTAÇÕES DO PRÓPRIO MESTRE (o jogador não vê) ═══\n${r.bastidores || '(nenhuma)'}`,
      ].join('\n\n'),
    },
  ];
}

/** O que o auxiliar decidiu: se a fala volta pro mestre, por quê, e as anotações dele. */
export function lerAuxiliar(resposta: string): { refazer: boolean; motivos: string[]; anotacoes: string } {
  const texto = separar(resposta).visivel;
  const itens = lerBloco(texto);
  const motivos = valores(itens, 'MOTIVO');
  // Sem motivo não há o que corrigir: um REFAZER vazio é ruído, não revisão.
  const refazer = valores(itens, 'VEREDITO').some((v) => /refazer/i.test(v)) && motivos.length > 0;
  return { refazer, motivos: motivos.slice(0, 3), anotacoes: texto };
}

/** O recado ao narrador quando o revisor devolve a fala. */
export const pedidoRefazer = (motivos: string[]): string =>
  `[REVISÃO INTERNA — o jogador não vê este recado] A resposta que você acabou de escrever para a ação acima foi devolvida pelo revisor:\n${motivos.map((m) => `- ${m}`).join('\n')}\nEscreva a resposta inteira de novo (raciocínio, narração, status e bastidores), corrigindo esses pontos e mantendo o que estava bom.`;

/**
 * A resposta a um [[LEMBRAR: assunto]]: as fichas de NPC que casam com o assunto e o que o
 * arquivo da campanha guarda sobre ele, das cenas antigas aos capítulos passados.
 */
export function relembrar(c: Campanha, assunto: string): string {
  const alvo = new Set(palavras(assunto));
  const fichas = Object.entries(c.mem.npcs)
    .filter(([nome]) => palavras(nome).some((p) => alvo.has(p)))
    .map(([nome, nota]) => `[ficha de NPC] ${nome}: ${nota}`);
  return [...fichas, ...lembrar(c, assunto, c.resumidoAte, 3000)].join('\n') || 'Nada no arquivo sobre isso. Siga com o que está na memória.';
}

// --- Capítulos: a conversa antiga vira resumo, sem perder nada -----------

const conversaSemResumo = (c: Campanha) =>
  c.msgs.slice(c.resumidoAte).reduce((n, m) => n + (m.de === 'nota' ? 0 : m.texto.length), 0);

/** A conversa ainda inteira passou do fôlego da IA que narra: hora de fechar um capítulo. */
export const precisaCondensar = (c: Campanha, folego = FOLEGO_PADRAO): boolean => conversaSemResumo(c) > folego;

/**
 * O pedido que fecha um capítulo e até onde ele cobre. As últimas falas (uns 45% do fôlego)
 * ficam de fora: continuam no contexto palavra por palavra, que é o que mantém o tom da cena.
 * As falas resumidas não somem: ficam no aparelho e voltam como lembrança quando vêm ao caso.
 */
export function pedidoCapitulo(c: Campanha, folego = FOLEGO_PADRAO): { mensagens: Chat[]; ate: number } {
  const manter = folego * 0.45;
  let ate = c.msgs.length;
  let guardado = 0;
  while (ate > c.resumidoAte && (guardado < manter || c.msgs.length - ate < 2)) {
    ate--;
    if (c.msgs[ate].de !== 'nota') guardado += c.msgs[ate].texto.length;
  }
  // O corte cai antes de uma fala do jogador: o contexto seguinte começa por ele.
  while (ate > c.resumidoAte && c.msgs[ate]?.de !== 'jogador') ate--;

  const trecho = c.msgs
    .slice(c.resumidoAte, ate)
    .filter((m) => m.de !== 'nota')
    .map((m) => `${m.de === 'mestre' ? 'MESTRE' : 'JOGADOR'}: ${m.de === 'mestre' ? separar(m.texto).visivel : m.texto}`)
    .join('\n\n');
  return {
    ate,
    mensagens: [
      {
        role: 'system',
        content: `Você é o arquivista do mestre de um RPG narrativo. O trecho de aventura abaixo vai sair da frente do mestre; o que você escrever é o que ele vai lembrar dele. Não invente nada.

Responda exatamente neste formato, em português, sem mais nada:
CAPITULO: o que aconteceu neste trecho, em ordem, em até 180 palavras — com os nomes de quem agiu, os lugares, as decisões do personagem, o que ele ganhou, perdeu e prometeu, e como cada NPC ficou em relação a ele.
RESUMO: a campanha inteira até aqui em até 150 palavras, juntando o resumo anterior com este capítulo.
PENDENTE: um fio solto deste trecho que continua aberto (uma linha para cada; só os que ainda não estão nas pendências)`,
      },
      {
        role: 'user',
        content: [
          `RESUMO ANTERIOR DA CAMPANHA:\n${c.mem.resumo || '(nenhum)'}`,
          `PENDÊNCIAS JÁ ANOTADAS:\n${c.mem.pendencias.map((p) => `- ${p}`).join('\n') || '(nenhuma)'}`,
          `TRECHO QUE VAI VIRAR CAPÍTULO:\n${trecho || '(nenhum)'}`,
        ].join('\n\n'),
      },
    ],
  };
}

/**
 * Fecha o capítulo: guarda o resumo do trecho e avança o ponto de corte. Resposta que não
 * traz o capítulo não mexe em nada — a próxima rodada tenta de novo.
 */
export function aplicarCapitulo(c: Campanha, resposta: string, ate: number): Campanha {
  const texto = separar(resposta).visivel;
  const itens = lerBloco(texto);
  const capitulo = valores(itens, 'CAPITULO').join('\n').trim();
  if (!capitulo || ate <= c.resumidoAte) return c;
  const resumo = valores(itens, 'RESUMO').join('\n').trim();
  const mem = aplicar(c.mem, valores(itens, 'PENDENTE').map((p) => `PENDENTE: ${p}`).join('\n'));
  return { ...c, resumidoAte: ate, mem: { ...mem, capitulos: [...mem.capitulos, capitulo], resumo: resumo || mem.resumo } };
}

// --- Arquivo de backup ---------------------------------------------------

export const exportarCampanha = (c: Campanha): string => JSON.stringify({ app: 'ficha-rpg', tipo: 'aventura', versao: 2, campanha: c });

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
    mem: normalizar(c.mem),
    msgs: c.msgs.filter((m: any) => m && typeof m.texto === 'string' && ['mestre', 'jogador', 'nota'].includes(m.de)),
    resumidoAte: Math.max(0, Math.min(Number(c.resumidoAte) || 0, c.msgs.length)),
  };
}

/** Aventura guardada por uma versão antiga do app: ganha os campos novos da memória. */
export const atualizar = (c: Campanha): Campanha => ({ ...c, mem: normalizar(c.mem) });
