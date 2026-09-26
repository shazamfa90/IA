/**
 * Fichário do Hashira Handbook 1.0 (Natan, 2023) — projeto de fãs, gratuito,
 * que leva Kimetsu no Yaiba para a 5ª edição.
 *
 * Resumo com palavras próprias, para consulta na mesa: números e regras, sem o
 * texto do livro. O livro continua sendo a fonte, com as descrições completas.
 * Carregado só quando alguém abre a aba Livro.
 */
export type Verbete = { nome: string; texto: string };
export type Capitulo = { titulo: string; intro?: string; verbetes: Verbete[] };

export const LIVRO: Capitulo[] = [
  {
    titulo: 'Como jogar',
    intro: 'O mestre descreve a cena, os jogadores dizem o que fazem, o mestre narra o resultado — e o ciclo recomeça.',
    verbetes: [
      {
        nome: 'O teste de d20',
        texto:
          'Role 1d20, some o modificador do atributo e, se for proficiente, o bônus de proficiência. Chegou ou passou do número-alvo, deu certo.\n' +
          'Alvo de teste de habilidade ou de resistência: CD (Classe de Dificuldade).\n' +
          'Alvo de ataque: CR (Classe de Resistência) do alvo.',
      },
      {
        nome: 'CR — Classe de Resistência',
        texto:
          'É o "CA" deste livro: o número que um ataque precisa alcançar para acertar você.\n' +
          'Sem uniforme: 10 + modificador de Destreza. Com uniforme, a conta vem do uniforme (ver Equipamento). Mantos somam por cima de qualquer CR, inclusive fixa.\n' +
          'Se mais de uma regra calcula a sua CR, você escolhe a melhor.',
      },
      {
        nome: 'Vantagem e desvantagem',
        texto: 'Role dois d20: com vantagem fica o maior, com desvantagem o menor.',
      },
      { nome: 'O específico vence o geral', texto: 'Quando uma habilidade contradiz a regra geral, vale a habilidade.' },
      { nome: 'Arredonde para baixo', texto: 'Toda divisão arredonda para baixo, mesmo que a fração passe da metade.' },
      {
        nome: 'Os três pilares',
        texto: 'Exploração (andar pelo mundo, investigar), interação social (conversar, negociar, interrogar) e combate (em turnos).',
      },
    ],
  },
  {
    titulo: 'Criando o personagem',
    intro: 'Raça, classe, atributos, antecedente e equipamento, nessa ordem. O livro constrói o Tanjiro como exemplo.',
    verbetes: [
      {
        nome: 'Passo a passo',
        texto:
          '1. Raça (Humano, Especial, Marechi, Tsuyoi ou Demônio).\n' +
          '2. Classe: uma Respiração (ou subclasse) — ou um Kekkijutsu, se demônio.\n' +
          '3. Atributos, e os ajustes da raça.\n' +
          '4. Aparência, personalidade, história e antecedente.\n' +
          '5. Equipamento: o da classe e do antecedente, ou comprar com os ienes do antecedente.',
      },
      {
        nome: 'Pontos de vida no 1º nível',
        texto:
          'Valor máximo do Dado de Vida da classe + modificador de Constituição + PV base da raça (só no 1º nível).\n' +
          'Exemplo: Água (d10), humano (12), Constituição +2 → 10 + 2 + 12 = 24.\n' +
          'A cada nível depois: role o Dado de Vida (ou pegue a média arredondada para cima) + Constituição.',
      },
      {
        nome: 'Gerando os atributos',
        texto:
          'Rolagem: 4d6, descarta o menor, seis vezes — o botão "Rolar atributos" da ficha faz isso.\n' +
          'Ou os valores fixos 15, 14, 13, 12, 10, 8.\n' +
          'Ou compra de pontos (se o mestre deixar): 27 pontos; 8 custa 0, 9→1, 10→2, 11→3, 12→4, 13→5, 14→7, 15→9. Nada acima de 15 antes da raça, nada abaixo de 8.',
      },
      {
        nome: 'Modificador',
        texto:
          '(valor − 10) ÷ 2, para baixo. 8–9 → −1 · 10–11 → +0 · 12–13 → +1 · 14–15 → +2 · 16–17 → +3 · 18–19 → +4 · 20–21 → +5.\n' +
          'O teto normal é 20; algumas habilidades passam disso (a Força do Tsuyoi vai a 22).',
      },
      {
        nome: 'Bônus de proficiência',
        texto:
          '+2 do 1º ao 4º nível, +3 do 5º ao 8º, +4 do 9º ao 12º, +5 do 13º ao 16º, +6 do 17º ao 20º.\n' +
          'Entra em ataques com armas que você domina, ataques de Respiração ou Kekkijutsu, perícias e testes de resistência proficientes, e na CD das suas técnicas. Nunca soma duas vezes na mesma rolagem.',
      },
      {
        nome: 'Armas e acuidade',
        texto:
          'Ataque = d20 + modificador + proficiência (se proficiente). Dano = dado da arma + o mesmo modificador.\n' +
          'Corpo a corpo usa Força; se a arma tem acuidade (a katana tem), pode usar Destreza. À distância usa Destreza; arma de arremesso pode usar Força.',
      },
      {
        nome: 'Katana',
        texto: 'Versátil: 1d6 com uma mão, 1d8 com as duas. Tem acuidade, então Força ou Destreza — o que for maior. É a arma padrão dos caçadores.',
      },
      {
        nome: 'Peso que dá para carregar',
        texto: 'Recomendação do livro: não passe de 7,5 kg por ponto de Força.',
      },
      {
        nome: 'Experiência e nível',
        texto:
          'XP para cada nível: 2º 300 · 3º 900 · 4º 2.700 · 5º 6.500 · 6º 14.000 · 7º 23.000 · 8º 34.000 · 9º 48.000 · 10º 64.000 · 11º 85.000 · 12º 100.000 · 13º 120.000 · 14º 140.000 · 15º 165.000 · 16º 195.000 · 17º 225.000 · 18º 265.000 · 19º 305.000 · 20º 355.000.\n' +
          'Ao subir: um Dado de Vida a mais, e as características da classe daquele nível. Se o modificador de Constituição sobe, o PV máximo ganha 1 por nível que você já tem.',
      },
    ],
  },
  {
    titulo: 'Esquadrão de Exterminadores',
    intro: 'Quem passa na Seleção Final — sete dias numa montanha cheia de demônios — ganha o uniforme e a própria Nichirin.',
    verbetes: [
      {
        nome: 'Patentes',
        texto:
          'Dez patentes, que sobem com o nível (salário mensal em ienes · missões):\n' +
          'Mizunoto, nív. 0–2 · 200.000 · D\n' +
          'Mizunoe, 3–4 · 230.000 · D\n' +
          'Kanoto, 5–6 · 260.000 · C\n' +
          'Kanoe, 7–8 · 290.000 · C\n' +
          'Tsuchinoto, 9–10 · 320.000 · B\n' +
          'Tsuchinoe, 11–12 · 350.000 · B\n' +
          'Hinoto, 13–14 · 380.000 · A\n' +
          'Hinoe, 15–16 · 410.000 · A\n' +
          'Kinoto, 17–18 · 440.000 · S\n' +
          'Kinoe, 19–20 · 470.000 · S',
      },
      { nome: 'Kakushi', texto: 'Membros sem espada: socorrem os feridos e limpam os locais das lutas. Patente não oficial, sem salário fixo.' },
      {
        nome: 'Hashira e Tsuguko',
        texto:
          'Os nove Hashira são a elite, um por respiração. Vira Hashira quem matou 50 demônios sendo Kinoe, ou derrotou uma das Doze Luas.\n' +
          'Cada Hashira escolhe um sucessor, o Tsuguko. Um jogador pode ser escolhido e receber treino e benefícios especiais do mestre.',
      },
    ],
  },
  {
    titulo: 'Raças',
    intro:
      'Quatro humanas (Humano, Especial, Marechi, Tsuyoi) e o Demônio. O PV base da raça soma ao da classe só no 1º nível. Todas andam 9 m por turno.',
    verbetes: [
      {
        nome: 'Humano',
        texto:
          '+2 em dois atributos · 12 PV base · 2 perícias à escolha · 1 talento.\n' +
          'Sentido extrassensorial (escolha um):\n' +
          '• Audição — ouve conversas num raio de 30 m, distingue humano de demônio pelo som, e com uma ação pode captar pensamentos leves. Vantagem em Percepção pela audição.\n' +
          '• Olfato — reconhece pessoas pelo cheiro, percebe emoções, rastreia (Investigação). Vantagem em Percepção pelo olfato.\n' +
          '• Tato — sente pessoas num raio de 9 m e sabe quando e onde estão olhando para você. Vantagem em Percepção pelo tato.\n' +
          '• Visão — vê em detalhe até 100 m e lê os músculos do inimigo: +1 de CR (mesmo fixa) contra ataques que você vê chegar. Vantagem em Percepção pela visão.',
      },
      {
        nome: 'Especial',
        texto:
          '+1 em todos os atributos · 8 PV base · 1 perícia.\n' +
          'Carnívoro: comer carne de demônio (turno completo) dá forma demoníaca por 1 minuto — +2 Força e vantagem em testes de Força, arremesso de objetos pesados (2d12, ataque de Força), +1 CR, garras cortantes, visão no escuro em preto e branco, só morre se perder a cabeça, mas fica vulnerável a dano primordial. Ação bônus encerra.\n' +
          'Regeneração: na forma demoníaca, gastando turnos dela, regenera PV ou membros conforme o ND do demônio comido (1–5: 1d4 · 6–10: 2d4 · 11–15: 3d4 · 16–20: 4d4 · 21–24: 6d4 · 25–30: 8d4).\n' +
          'Traços demoníacos: fora da forma, regenera coisas pequenas em descanso longo; na forma, as emoções se amplificam e o mestre pode pedir testes.\n' +
          'Carne de demônio que não come humanos não funciona.',
      },
      {
        nome: 'Marechi',
        texto:
          '+2 em dois atributos · 10 PV base.\n' +
          'Sangue raríssimo, irresistível para demônios. Quando sangra, todo demônio a até 100 m é compelido a atacá-lo e a se mover até ele; quem acerta e prova o sangue passa a atacar só o Marechi. Um demônio que o devora sobe de poder (o mestre soma ao ND).\n' +
          'ND 13 ou mais resiste com Sabedoria CD 18; Luas Superiores com CD 12; Demônios Primordiais são imunes.\n' +
          'Sangue atordoante: perto dele (9 m) os demônios têm −5 em Percepção, desvantagem para manter concentração a 3 m, e a cada dois turnos a 3 m de um Marechi sangrando fazem Constituição CD 15 ou ficam atordoados.\n' +
          'Variação rara: role 1d20 ao criar; 18–20 torna tudo mais forte (+5 nas CDs, +6 m de alcance do cheiro, −10 de Percepção).',
      },
      {
        nome: 'Tsuyoi',
        texto:
          '+2 Força e +2 Destreza · 14 PV base · 2 perícias.\n' +
          'Força anormal: vantagem em testes de resistência de Força e Força máxima 22. Como reação, enrijece o corpo: resistência a todo dano exceto psíquico por um turno, mas fica sem agir no turno seguinte.\n' +
          'Flexibilidade: proficiente em resistência de Destreza, e soma metade da proficiência em qualquer teste de Destreza.\n' +
          'Kawaii: +2 em Carisma com quem o acha adorável; com uma ação, encanta uma criatura a até 9 m (Sabedoria CD 8 + Carisma + proficiência) por 1 minuto. Não funciona em Inteligência acima de 14.\n' +
          'Preconceito: o cabelo de cor incomum gera desconfiança de estranhos.',
      },
      {
        nome: 'Demônio',
        texto:
          '+2 em dois atributos · 15 PV base · 1 perícia.\n' +
          'Particularidades (escolha duas): Alteração Corporal (15 cm a 5 m), Aparência Animalesca, Aparência Perturbadora (vantagem para intimidar), Camuflagem Adaptativa (+2 Furtividade), Extensão de Membros (+1,5 m de alcance), Forma Cativante (vantagem em Persuasão), Garra Laminada (dano cortante), Mimetismo (imita vozes, Intuição CD 15), Múltiplos Membros (desarmado 1d10), Pele de Aço (−2 em dano cortante e de concussão), Transformação em Humano, Respiração Aquática, Visão Noturna (preto e branco).\n' +
          'Caminho: Alimentação por Sangue (1 L por semana, leva 1 minuto para entrar em combate) ou Retenção de Carne (não come nada, mas perde o controle mais fácil e dorme nas viagens).\n' +
          'Instintos: CD de Sabedoria definida na criação (sangue: 1d10+8; carne: 1d10+12). Testa em falha crítica, ao ver humano sangrando; cada vez que prova sangue humano a CD sobe +2 (até 25). Devorar um humano entrega o personagem ao mestre.\n' +
          'Morte: não morre a 0 PV (exceto no sol) — fica Fragilizado e só morre decapitado (resistência de Constituição CD 20 − Con, podendo somar proficiência). Regenera por turno: nível 1–5 1d10 · 6–10 2d10 · 11–15 3d10 · 16–20 4d10. Não é curado por itens; curas de classe valem metade.\n' +
          'Sem fadiga, mas a cada 3 técnicas num turno precisa de um turno de recarga (+1 por técnica extra). Pode ter Respiração (dano vira necrótico) ou uma classe de Kekkijutsu.',
      },
    ],
  },
  {
    titulo: 'Equipamento',
    intro: 'O equipamento inicial vem da classe e do antecedente; ou compre com os ienes do antecedente. Vendido, um item vale metade do preço.',
    verbetes: [
      {
        nome: 'Uniformes (a sua CR)',
        texto:
          'Leves (4–5 kg): Uniforme 11 + Des · +1 12 + Des · +2 13 + Des · +3 14 + Des.\n' +
          'Médios (8 kg): M 12 + Des · M+1 13 + Des · M+2 14 + Des · M+3 15 + Des. Do +1 em diante, desvantagem em Furtividade.\n' +
          'Pesados (10 kg, CR fixa): P 17 (For 12) · P+1 18 (For 14) · P+2 19 (For 16) · P+3 20 (For 18). Desvantagem em Furtividade; sem a Força pedida, −3 m de deslocamento.\n' +
          'Uniforme de Hashira: CR 22, dado pela organização a quem vira Hashira.\n' +
          'Sem proficiência no tipo de uniforme: desvantagem em todo teste, resistência e ataque de Força ou Destreza.',
      },
      {
        nome: 'Mantos',
        texto: 'Por cima do uniforme, na cor da sua respiração. Manto +1 CR · Manto +1 dá +2 · +2 dá +3 · +3 dá +4 — soma até em CR fixa. O mestre decide se você começa com um.',
      },
      {
        nome: 'Escudo',
        texto: '+2 de CR, um por vez. Mas quem usa uma técnica de respiração com escudo perde a proficiência no ataque dela, e classes de Kekkijutsu não usam escudo.',
      },
      {
        nome: 'Nichirin e Decepadora',
        texto:
          'Só arma de Nichirin corta o pescoço de um demônio — e só se tiver a propriedade Decepadora. Sem isso, nenhuma técnica decapita, por melhor que seja.\n' +
          'Armas de fogo nunca decepam. Quebrou a arma sem ferreiro por perto: duas semanas para chegar outra, e você paga.',
      },
      {
        nome: 'Propriedades das armas',
        texto:
          'Acuidade: Força ou Destreza (o mesmo para ataque e dano). Alcance: +1,5 m. Arremesso: ataque à distância com a arma. Distância (normal/máxima): além da normal, desvantagem. Duas mãos. Leve: boa para lutar com duas. Pesada: criaturas pequenas têm desvantagem. Recarga: um disparo por ação. Versátil: dano maior com as duas mãos.\n' +
          'Arma improvisada: 1d4, ou como a arma que ela lembra.',
      },
      {
        nome: 'Armas únicas',
        texto:
          'Katana 1d6 cortante (1d8 com duas mãos) · acuidade, leve, versátil · decepadora · 100.000.\n' +
          'Odachi 2d4 cortante · pesada, duas mãos · decepadora.\n' +
          'Tachi 1d10 cortante · duas mãos · decepadora.\n' +
          'Kusarigama 1d8 cortante/concussão · acuidade, duas mãos · decepadora. Pesada: 1d10.\n' +
          'Kusanagi 1d6 · leve. Wakizashi 1d4 · acuidade, leve. Kunai 1d4 · acuidade, leve. Tessen 1d6 · acuidade, leve. Todas decepadoras.\n' +
          'Chakram 1d6 · arremesso 30/60 · decepadora.\n' +
          'Yumi 1d6 · 45/180. Senbon, shanken e shuriken 1d4 · arremesso 6/18. Não decepam.',
      },
      {
        nome: 'Outras armas',
        texto:
          'Simples: adaga 1d4, lança 1d6 (1d8), machadinha 1d6, arco curto 1d6, besta leve 1d8…\n' +
          'Marciais: espada longa 1d8 (1d10), rapieira 1d8, cimitarra 1d6, machado de batalha 1d8 (1d10), alabarda e glaive 1d10, machado grande 1d12, espada grande 2d4, arco longo 1d8…\n' +
          'A tabela do livro diz quais decepam — de modo geral, as que cortam ou perfuram de perto.',
      },
      {
        nome: 'Respiração com arma à distância',
        texto: 'Pode: técnicas de toque passam a ter o alcance da arma, mas deixam de desmembrar e de causar condições. Com arma de fogo, não dá.',
      },
      {
        nome: 'Armas de fogo',
        texto: 'Pistola 1d8; mosquete, revólver, espingardas, magnum e rifle 2d6. Muito dano, mas nunca decepam e não servem para técnicas. Tiro duplo: ataque extra com ação bônus, sem somar o modificador.',
      },
      {
        nome: 'Modificando armas',
        texto:
          'Um ferreiro dá três espaços de alteração a cada arma. Exemplos: Acuidade (1 espaço), Alcance (2), Decepadora (1), Aumentar o dano um estágio (1 cada: 1d4→1d6→1d8→1d10→1d12→2d6), Defesa +1 CR (3), Dobro — ataque extra com ação bônus (2), Golpe Poderoso — proficiência no dano uma vez por combate (2), Precisão Letal — −2 no ataque por +2 no dano (2), Repetição — refaz o acerto com ação bônus (1).\n' +
          'Uma arma-objeto (o guarda-chuva que vira katana) custa o dobro e só quem a fez conserta.',
      },
      {
        nome: 'Itens úteis',
        texto:
          'Pacote de Caçador (10.000): mochila, saco de dormir, kit de refeição, caixa de fogo, 10 tochas, 10 dias de ração, cantil e 15 m de corda.\n' +
          'Kit de primeiros socorros (5.000, 10 usos): estabiliza quem está a 0 PV sem teste de Medicina.\n' +
          'Óleo: +5 de dano de fogo em quem estiver coberto. Estrepes, esferas de metal e armadilha de caça para controlar o terreno.',
      },
      {
        nome: 'Custo de vida (por dia)',
        texto: 'Miserável grátis · esquálido 300 · pobre 500 · modesto 1.000 · confortável 2.000 · rico 4.000 · luxuoso 10.000 ienes.',
      },
    ],
  },
  {
    titulo: 'Combate',
    intro: 'Rodadas de 6 segundos. Em cada uma, todos agem uma vez, na ordem da iniciativa.',
    verbetes: [
      {
        nome: 'Começando a luta',
        texto:
          'Surpresa: quem tenta se esconder rola Destreza (Furtividade) contra a Sabedoria (Percepção) passiva do outro lado. Surpreendido não se move nem age no primeiro turno, e não reage até ele acabar.\n' +
          'Iniciativa: teste de Destreza, do maior para o menor, e a ordem vale a luta toda.',
      },
      {
        nome: 'O seu turno',
        texto:
          'Um movimento (até o seu deslocamento, dividido como quiser antes, entre e depois dos ataques) e uma ação.\n' +
          'Ação bônus: só quando uma habilidade dá, e uma por turno.\n' +
          'Reação: resposta a um gatilho, uma até o seu próximo turno — a mais comum é o ataque de oportunidade.\n' +
          'De graça: falar rápido e interagir com um objeto (sacar a arma, abrir uma porta).',
      },
      {
        nome: 'Ações',
        texto:
          'Atacar · Ajudar (vantagem no próximo teste ou ataque de um aliado) · Desengajar (sair sem ataque de oportunidade) · Disparada (dobra o deslocamento) · Esconder (Furtividade) · Esquivar (ataques contra você com desvantagem e vantagem em Destreza até o seu próximo turno) · Preparar (age depois, com a reação, num gatilho que você define) · Procurar (Percepção ou Investigação) · Usar um objeto.',
      },
      {
        nome: 'Movimento',
        texto:
          'Terreno difícil: cada 1,5 m custa 1 m a mais. Levantar do chão custa metade do deslocamento; rastejar custa o dobro.\n' +
          'Dá para passar pelo espaço de um inimigo só se ele for duas categorias de tamanho maior ou menor.\n' +
          'Flanquear: você e um aliado em lados opostos de um inimigo, corpo a corpo — os dois têm vantagem, inclusive em técnicas de toque. Não vale para ataques à distância.',
      },
      {
        nome: 'Atacando',
        texto:
          'd20 + modificador + proficiência contra a CR do alvo. 20 natural sempre acerta e é crítico; 1 natural sempre erra.\n' +
          'Crítico: role todos os dados de dano duas vezes e some os modificadores uma vez.\n' +
          'Alvo que você não vê: desvantagem. Você oculto atacando: vantagem.\n' +
          'Desarmado: 1 + Força de dano de concussão, e todos são proficientes.\n' +
          'Duas armas leves: o ataque da segunda mão é ação bônus e não soma o modificador no dano.\n' +
          'Agarrar e empurrar: trocam um ataque por Força (Atletismo) contra Atletismo ou Acrobacia do alvo.',
      },
      {
        nome: 'Técnica no lugar do ataque',
        texto:
          'Na ação de Atacar, troque um ataque por uma técnica de respiração: o dano vira o da técnica mais o modificador da sua classe.\n' +
          'Com Ataque Extra, dá para usar mais de uma técnica no turno — mas aí entra a fadiga. O ataque de ação bônus das duas armas não pode virar técnica.',
      },
      {
        nome: 'Fadiga',
        texto:
          'Cada técnica seguida no mesmo turno custa o dobro da anterior: 1, depois 2, depois 4 pontos de energia.\n' +
          'Em troca, cada nível de fadiga soma um dado de dano à técnica: a segunda do turno tem +1 dado, a terceira +2.',
      },
      {
        nome: 'Sem energia: Exausto',
        texto: 'Só para respirações: com a energia em zero você ainda pode usar técnicas, mas cada ponto gasto assim é um nível de exaustão.',
      },
      {
        nome: 'Ataque no pescoço',
        texto:
          'Demônio a 0 PV fica Fragilizado, e o mestre avisa. Antes de rolar o ataque, diga que mira o pescoço: ele faz resistência de Constituição, e se falhar perde a cabeça. Um ataque no pescoço por jogador por turno, e só com Nichirin decepadora.\n' +
          'Ataque decepador em conjunto: uma vez por dia, o grupo abre mão das ações do turno para um golpe combinado no pescoço: +1 na CD, e vale usar técnicas.',
      },
      {
        nome: 'Oportunidade e cobertura',
        texto:
          'Ataque de oportunidade: quando um inimigo que você vê sai do seu alcance, use a reação para um ataque corpo a corpo. Desengajar evita; ser empurrado ou teleportado não provoca.\n' +
          'Meia cobertura: +2 de CR e em resistência de Destreza. Três quartos: +5. Total: não pode ser alvo direto.',
      },
      {
        nome: 'Dano, cura e 0 PV',
        texto:
          'Resistência corta o dano pela metade; vulnerabilidade dobra — aplicadas depois de todos os outros modificadores.\n' +
          'A 0 PV você cai inconsciente. Se o dano que sobrou chega ao seu PV máximo, morte na hora.\n' +
          'Teste contra a morte no começo de cada turno a 0 PV: d20, 10 ou mais é sucesso. Três sucessos estabilizam, três falhas matam. 1 conta como duas falhas; 20 devolve 1 PV. Sofrer dano a 0 PV é uma falha (crítico, duas).\n' +
          'Estabilizado sem cura volta com 1 PV depois de 1d4 horas.\n' +
          'Nocautear: quem não é demônio pode ser deixado inconsciente e estável em vez de morto.',
      },
      {
        nome: 'PV temporários',
        texto: 'Absorvem o dano antes dos PV de verdade, não somam entre si (fica o maior, à sua escolha), não são curados e somem no descanso longo.',
      },
      {
        nome: 'Tipos de dano',
        texto: 'Ácido, concussão, cortante, elétrico, fogo, frio, necrótico, perfurante, psíquico, trovejante, veneno — e primordial, que só a respiração primordial causa.',
      },
      {
        nome: 'Desmembramento',
        texto:
          'Corte profundo: −1 CR.\n' +
          'Mão: desvantagem nos ataques (sem as duas, sem armas).\n' +
          'Braço: −2 CR, os efeitos da mão, e precisa de uma ação para estancar ou morre em 1 minuto.\n' +
          'Perna: deslocamento pela metade, −2 CR, e estancar ou morrer em 1 minuto. Sem as duas: caído, e 1,5 m por ação.\n' +
          'Corpo cortado ao meio: −5 CR, caído, e morte em 1 minuto.\n' +
          'Cabeça: morte imediata.\n' +
          'Demônios não morrem por sangramento nem pelo corte ao meio — só pela cabeça.',
      },
      {
        nome: 'Debaixo d\'água',
        texto: 'Sem deslocamento de natação, desvantagem com Nichirin, exceto as de estocada (adaga, azagaia, espada curta, lança, tridente). Ataques à distância erram além da distância normal. Tudo submerso resiste a fogo.',
      },
    ],
  },
  {
    titulo: 'Condições',
    intro: 'A mesma condição não acumula: ou a criatura tem, ou não tem.',
    verbetes: [
      { nome: 'Agarrado', texto: 'Deslocamento 0. Acaba se quem agarrou ficar incapacitado.' },
      { nome: 'Amedrontado', texto: 'Desvantagem em testes e ataques enquanto vê a fonte do medo, e não pode se aproximar dela.' },
      { nome: 'Atordoado', texto: 'Incapacitado, não se move, mal fala. Falha em resistência de Força e Destreza; ataques contra ele têm vantagem.' },
      { nome: 'Caído', texto: 'Desvantagem nos próprios ataques. Contra ele: vantagem a até 1,5 m, desvantagem de longe.' },
      { nome: 'Cego', texto: 'Falha no que depende da visão. Ataques contra ele têm vantagem; os dele, desvantagem (salvo quem tem o sentido do tato).' },
      { nome: 'Enfeitiçado', texto: 'Não ataca quem o enfeitiçou, e este tem vantagem para interagir socialmente com ele.' },
      { nome: 'Envenenado', texto: 'Desvantagem em ataques e testes de habilidade.' },
      {
        nome: 'Fragilizado',
        texto:
          'Demônio a 0 PV: pode ter a cabeça cortada, e sai da condição ao recuperar PV.\n' +
          'Cada outra condição que ele tenha no turno soma +1 na CD da resistência de Constituição contra a decapitação; ataques combinados de mais de uma criatura, também +1.',
      },
      { nome: 'Impedido', texto: 'Deslocamento 0. Ataques contra ele com vantagem, os dele com desvantagem, e desvantagem em resistência de Destreza.' },
      { nome: 'Incapacitado', texto: 'Sem ações nem reações.' },
      { nome: 'Inconsciente', texto: 'Incapacitado, caído, larga tudo. Falha em Força e Destreza; ataques contra ele têm vantagem, e de perto são sempre críticos.' },
      { nome: 'Invisível', texto: 'Só é visto com habilidade ou sentido extrassensorial. Ataques contra ele com desvantagem; os dele, com vantagem.' },
      { nome: 'Paralisado', texto: 'Incapacitado, sem se mover nem falar. Falha em Força e Destreza; vantagem contra ele, e de perto todo acerto é crítico.' },
      { nome: 'Petrificado', texto: 'Vira pedra: incapacitado, falha em Força e Destreza, resistente a todo dano e imune a veneno e doença.' },
      { nome: 'Queimado', texto: '1d6 de fogo no começo de cada turno, até gastar uma ação apagando as chamas.' },
      { nome: 'Surdo', texto: 'Falha no que depende da audição.' },
      {
        nome: 'Exaustão',
        texto:
          'Dez níveis, e cada um soma ao anterior:\n' +
          '1 desvantagem em testes · 2 −3 m de deslocamento · 3 desvantagem em ataques e resistências · 4 PV máximo pela metade · 5 −3 m a mais · 6 Constituição CD 16 ou desmaia · 7 deslocamento 0 · 8 −5 nos acertos · 9 Constituição CD 25 ou desmaia · 10 morte.\n' +
          'Descanso longo, com comida e água, tira um nível.',
      },
    ],
  },
  {
    titulo: 'Atributos, testes e perícias',
    intro: 'Força mede o poder físico, Destreza a agilidade, Constituição a resistência, Inteligência o raciocínio e a memória, Sabedoria a percepção e a intuição, Carisma a força da personalidade.',
    verbetes: [
      {
        nome: 'Classe de Dificuldade (CD)',
        texto: 'Muito fácil 5 · fácil 10 · moderada 15 · difícil 20 · muito difícil 25 · quase impossível 30.',
      },
      {
        nome: 'Vantagem de várias fontes',
        texto: 'Várias vantagens ainda são um d20 extra só. Qualquer vantagem junto com qualquer desvantagem se anulam: role um d20 só.',
      },
      {
        nome: 'Perícias',
        texto:
          'Força: Atletismo.\n' +
          'Destreza: Acrobacia, Furtividade, Prestidigitação.\n' +
          'Inteligência: História, Medicina, Natureza.\n' +
          'Sabedoria: Intuição, Investigação, Lidar com Animais, Percepção, Sobrevivência.\n' +
          'Carisma: Blefar, Intimidação, Persuasão.\n' +
          'Constituição não tem perícia. Neste livro, Investigação é de Sabedoria.\n' +
          'Teste de perícia: d20 + atributo + proficiência, se você for proficiente nela. O mestre pode trocar o atributo quando fizer sentido (Constituição com Atletismo para nadar longe).',
      },
      {
        nome: 'Testes passivos',
        texto: '10 + tudo que somaria ao teste; +5 com vantagem, −5 com desvantagem. A Percepção passiva é o que o mestre usa contra quem se esconde.',
      },
      {
        nome: 'Testes resistidos e em grupo',
        texto:
          'Resistido: os dois rolam, maior vence; empate deixa tudo como estava.\n' +
          'Trabalho em equipe: quem lidera rola com vantagem.\n' +
          'Teste em grupo: todos rolam; se metade ou mais passar, o grupo passa.',
      },
      {
        nome: 'Carregar peso',
        texto:
          'Levantar acima da cabeça: Força × 30 kg. Carregar: Força × 7,5 kg. Empurrar ou arrastar: o dobro de carregar.\n' +
          'Variante de sobrecarga: acima de Força × 2,5 kg, −3 m; acima de Força × 5 kg, −6 m e desvantagem em Força, Destreza e Constituição.',
      },
      {
        nome: 'Constituição e PV',
        texto: 'Mudou o modificador de Constituição, o PV máximo muda como se ele sempre tivesse sido o novo: +1 (ou −1) por nível que você tem.',
      },
      {
        nome: 'Testes de resistência',
        texto: 'd20 + o atributo pedido + proficiência se a sua classe dá proficiência naquele atributo (toda classe dá em pelo menos dois).',
      },
    ],
  },
  {
    titulo: 'Técnicas de Respiração e Kekkijutsu',
    intro: 'Humanos lutam com técnicas de respiração, que gastam energia. Demônios lutam com Kekkijutsu, as artes de sangue, que gastam espaços.',
    verbetes: [
      {
        nome: 'Pontos de energia',
        texto:
          'Uma por nível da classe (a Respiração do Inseto tem menos). Cada técnica custa 1; a Técnica Especial do 20º nível custa 2. Algumas técnicas cobram mais por um efeito extra.\n' +
          'Descanso curto ou longo? Ver Aventura → Descanso. Energia em zero: ver Combate → Sem energia.',
      },
      {
        nome: 'Concentração Total',
        texto:
          'Toda classe de respiração tem, desde o 1º nível:\n' +
          '• Dano — 1 ponto de energia: +1d10 num ataque corpo a corpo, ou um dado a mais numa técnica. Duas vezes por dia; volta em descanso curto ou longo.\n' +
          '• Resiliência — 1 ponto de energia: rola de novo um teste de resistência. Uma vez por dia.',
      },
      {
        nome: 'Respiração Contínua',
        texto: 'No 10º nível, depois de um mês de treino com o mestre: a Concentração Total: Dano soma tantos dados quanto a evolução da sua respiração, e a de Resiliência ganha +5 no novo teste.',
      },
      {
        nome: 'Evolução das técnicas',
        texto:
          'No 3º nível você aprende todas as técnicas da sua respiração. Elas evoluem no 7º (1ª evolução), 10º (2ª) e 13º (3ª). No 17º você escolhe três técnicas para a 4ª evolução. No 20º cria a sua Técnica Especial.\n' +
          'CD das técnicas = 8 + proficiência + o atributo da classe. Ataque das técnicas = proficiência + o atributo da classe.',
      },
      {
        nome: 'Lendo uma técnica',
        texto:
          'Alcance (toque, pessoal, ou uma área em metros), duração (instantânea ou concentração), dano e custo.\n' +
          'Uma técnica é uma jogada de ataque só, mesmo que a descrição fale em nove golpes — a menos que diga que cada golpe rola.\n' +
          'Ataque à distância com um inimigo hostil a até 1,5 m: desvantagem.',
      },
      {
        nome: 'Concentração',
        texto:
          'Técnicas de concentração acabam se você usar outra de concentração, ficar incapacitado ou morrer.\n' +
          'Sofreu dano: resistência de Constituição, CD 10 ou metade do dano (o maior), um teste por fonte de dano.',
      },
      {
        nome: 'Áreas',
        texto: 'Cilindro, cone, cubo, esfera e linha. A origem da esfera e do cilindro está dentro da área; a do cone, do cubo e da linha, não (a menos que você queira).',
      },
      {
        nome: 'Criando uma técnica',
        texto:
          'Regra opcional, nos níveis 7, 10, 13 e 17: seis pontos para gastar, dano instantâneo, do tipo de dano da sua classe.\n' +
          'Alcance: toque grátis · linha 1 ponto · cilindro, cone, cubo ou esfera 2 pontos. Área de 3 m grátis, +1 ponto a cada 3 m (até 15 m); linha de 6 m grátis, 9 m por 2 pontos, até 18 m por 5.\n' +
          'Dado de dano (começa com dois dados): d4 grátis · d6 1 · d8 2 · d10 3 · d12 4 pontos, e sobe um dado a cada evolução.\n' +
          'Condição: corte profundo 1 · caído, amedrontado, cego, surdo, cortar mão 2 · agarrado, cortar braço ou perna 3 · enfeitiçado, impedido, paralisado 4 · atordoado, incapacitado, inconsciente, petrificado 5 pontos.\n' +
          'Pescoço: +1 na CD por 1 ponto, +2 por 3, +3 por 6.\n' +
          'Movimento extra: +3 m por ponto, até +18 m.\n' +
          'Defensiva: sempre reação e de toque; reduz d12 ou d10 de dano, +1 dado por evolução.\n' +
          'Técnica Especial (20º): livre de pontos, até 7d12, e pode ter efeitos únicos.',
      },
      {
        nome: 'Kekkijutsu: níveis e espaços',
        texto:
          'Vão do nível 0 (Chi) ao 9. O Chi é livre, sem gastar espaço. Os outros gastam um espaço daquele nível ou maior — e usar um espaço maior fortalece o Kekkijutsu.\n' +
          'Os espaços são o preço de um demônio que não come humanos: um demônio comum não tem esse limite.\n' +
          'Classificação: elemento (fogo, gelo, veneno…) e tipo — Conjuração (foco à distância) ou Combate (foco corpo a corpo). Sua classe diz quais pode usar.\n' +
          'Só vão junto do Ataque Extra se a classe disser (a Keizou pode).',
      },
      {
        nome: 'Criando um Kekkijutsu',
        texto:
          'Sempre mestre e jogador juntos, no conceito do personagem, e com no máximo duas condições.\n' +
          'Tempo: ataque é uma ação; aumentar CR ou movimento, ação bônus; defesa instantânea, reação.\n' +
          'Dano de referência (um alvo / vários alvos · alcance único / de área): Chi 1d12 / 1d6 · 18 m / 3 m — 1º 2d12 / 2d6 — 2º 3d12 / 4d6 — 3º 4d12 / 6d6 — 4º 5d12 / 7d6 — 5º 6d12 / 8d6 — 6º 7d12 / 11d6 — 7º 9d12 / 12d6 — 8º 13d12 / 13d6 — 9º 15d12 / 14d6.\n' +
          'Cada condição reduz o nível de dano pela metade; sem dano no sucesso, +25%. Kekkijutsu Único (de uma classe só) bate mais forte.',
      },
    ],
  },
  {
    titulo: 'Aventura',
    intro: 'Masmorra em minutos, cidade e mata em horas, viagem em dias; combate em rodadas de 6 segundos.',
    verbetes: [
      {
        nome: 'Descanso',
        texto:
          'Curto: pelo menos 1 hora parado. Gaste Dados de Vida (até o seu nível), cada um rolado + Constituição, para recuperar PV.\n' +
          'Longo: pelo menos 8 horas, com no máximo 2 de atividade leve; uma hora de esforço reinicia. Recupera todos os PV e metade dos Dados de Vida. Um por dia, e só com pelo menos 1 PV.\n' +
          'Completo: depois de uma batalha grande, dias ou meses, para curar ferimentos graves — o mestre decide quanto.',
      },
      {
        nome: 'Luz do sol',
        texto:
          'Queima demônios com dano primordial, conforme a hora (exposto / meia cobertura / cobertura completa):\n' +
          '6h e 18h: 6d10 / 4d10 / 3d10 · 7h e 17h: 7–8d10 · 8h: 8d10 · 9h e 16h: 9d10 · 10h: 10d10 · 11h e 15h: 11d10 · 12h a 14h: 12d10 / 10d10 / 9d10.\n' +
          'Demônio de jogador Fragilizado ao sol morre na hora. (A tabela vale para personagens de jogador.)',
      },
      {
        nome: 'Ritmo de viagem',
        texto:
          'Rápido 6 km/h (45 km/dia), −5 na Percepção passiva · normal 4,5 km/h (36 km/dia) · lento 3 km/h (27 km/dia), dá para ir furtivo.\n' +
          'Passou de 8 horas no dia: Constituição CD 10 + 1 por hora extra, ou um nível de exaustão (demônios não sentem). Respirações podem pagar 1 de energia por hora extra em vez do teste, até metade do nível.\n' +
          'Terreno difícil: metade da distância.',
      },
      {
        nome: 'Pulos, queda e fôlego',
        texto:
          'Salto em distância: Força × 0,3 m com 3 m de corrida (metade parado). Em altura: 0,3 × (3 + Força) m.\n' +
          'Queda: 1d6 de concussão a cada 3 m, até 20d6, e cai no chão.\n' +
          'Prender a respiração: 1 + Constituição minutos (mínimo 30 s). Sem ar: Constituição rodadas, depois 0 PV. Demônios só ficam atordoados.',
      },
      {
        nome: 'Comida e água',
        texto: 'Meio quilo de comida e 3 L de água por dia (6 L no calor). Sem comer: 3 + Constituição dias, depois um nível de exaustão por dia. Meia água: Constituição CD 15 ou exaustão.',
      },
      {
        nome: 'Luz e visão',
        texto: 'Penumbra: desvantagem em Percepção visual. Escuridão densa: você está cego para o que está nela. Visão no escuro: penumbra vira luz plena e escuridão vira penumbra, em tons de cinza.',
      },
      {
        nome: 'Entre as aventuras',
        texto:
          'Exercer o antecedente paga um estilo de vida modesto. No quartel do Esquadrão, a organização paga a vida e você recebe o salário. Nos postos dos Kakushi, descanso completo com atendimento médico.\n' +
          'Pesquisar (Estudioso e Policial vão mais rápido), treinar um talento com um mestre (pelo menos um mês) ou aprimorar uma técnica criada.',
      },
      {
        nome: 'Missões',
        texto: 'Chegam por carta ou pelo animal que acompanha o caçador, em ranks D, C, B, A e S conforme a patente. Recusar pode custar uma patente — ou a expulsão.',
      },
    ],
  },
  {
    titulo: 'Características especiais',
    intro: 'Opcionais e raras: o mestre decide se entram na campanha, porque deixam um personagem bem mais forte que os outros.',
    verbetes: [
      {
        nome: 'Evolução da Nichirin',
        texto:
          '1º estágio: lâmina pura, sem cor — já decepa demônios para sempre.\n' +
          '2º (3º nível): ganha a cor e o padrão da sua respiração (com Hinokami Kagura, fica negra).\n' +
          '3º (18º nível, só humanos): com uma ação, fica vermelha por 1 minuto — o dano corpo a corpo vira primordial; regeneração cancelada em ND 10 ou menos e cortada pela metade em ND até 20, até o fim do próximo turno do demônio. Uma vez por descanso.\n' +
          '4º (quando o mestre decidir, só humanos): Vermelha Carmesim o tempo todo — cancela a regeneração até ND 20 e corta pela metade acima disso.',
      },
      {
        nome: 'Recompensa de Hashira',
        texto: 'Ao virar Hashira (ou Tsuguko), o mestre pode dar uma — perto do 20º nível: um atributo à escolha passa a ter teto 24 (Força do Gigante, Velocidade, Corpo Esculpido, Inteligência Descomunal, Sabedoria Anormal ou Grande Amigo).',
      },
      {
        nome: 'Marca do Caçador',
        texto:
          'Dormente: nasce com ela, parece uma cicatriz; um grande choque emocional pode despertá-la por um tempo.\n' +
          'Despertada (15º nível): uma marca no rosto no padrão da sua respiração. Ação bônus, 1 minuto: +2 em todos os atributos.\n' +
          'Completa (20º nível): despertada o tempo todo, a sua intenção de matar some para os inimigos, fica imune aos sentidos extrassensoriais deles e vê o Mundo Transparente.\n' +
          'Passa de um caçador a outro pela convivência em situações extremas (coração acima de 200 bpm e 39 °C).',
      },
      {
        nome: 'Mundo Transparente',
        texto:
          'Enxerga músculos, sangue e movimentos do inimigo em câmera lenta. Uma das duas por turno:\n' +
          '• Ataque pontual (ação bônus ao atacar): Investigação CD 15 — passou, +5 no acerto e nunca menos da metade do dano; 20 natural no teste, dano máximo.\n' +
          '• Reação certeira (quando for atacado): Investigação CD 15 — +5 de CR contra o ataque. Se ainda acertar, usa uma técnica defensiva de graça, sem energia nem fadiga.',
      },
      {
        nome: 'Descendentes do Sol',
        texto:
          'Na criação, role 1d20: 20 é descender de uma linhagem do Sol (ou o mestre concede, inteira ou em parte).\n' +
          'Humano: ganha a Hinokami Kagura, sem perder a sua respiração, e a Marca Dormente.\n' +
          'Demônio: ganha o Kekkijutsu do Sol e, com o tempo, pode conquistar o sol. Só pelo caminho da Retenção de Carne, mas a CD de instinto é calculada como a do sangue.',
      },
      {
        nome: 'Kekkijutsu do Sol',
        texto:
          'Sangue em chamas que só fere demônios e o que eles criam, e que também cura pessoas.\n' +
          'Chi: Chama Primordial (Destreza, 1d12, ignora cobertura) e Raio Primordial (ataque, 1d10); os dois sobem no 5º, 11º e 17º nível.\n' +
          '1º círculo: Bakatsu (Constituição, 2d12 primordial), Cura Rápida (ação bônus, 1d6 + atributo). 2º: Cura Primordial (1d12 + atributo), Raio Primordial (três raios de 2d8). 3º: Explosão Primordial (esfera de 6 m, 8d6), Aura Primordial (cura 2d6 por ação bônus). 4º: Explosão de Cura (30 PV e limpa cegueira, surdez, doença, veneno e exaustão).\n' +
          'Troca Primordial (3º): muda o dano de um Kekkijutsu para primordial, proficiência vezes por descanso longo. Imbuir Lâmina (9º): deixa a Nichirin de um aliado Vermelha Carmesim por 1 minuto, uma vez por dia. Conquistando o Sol: o mestre pode dar, no fim, andar sob o sol.',
      },
      {
        nome: 'Hinokami Kagura',
        texto:
          'A dança do deus do fogo, herdada da Respiração do Sol: todo dano é primordial, e a CD e o ataque são os da sua classe.\n' +
          'Custo: com fadiga, o gasto dobra de novo — até o 15º nível. Dança do Sol (3º): demônio de ND até 10 atingido por dano primordial não regenera até o fim do próximo turno dele; acima, regenera metade.\n' +
          'Opções no lugar de uma característica única (3º, 9º, 14º): Vantagem do Sol (vantagem no dano das técnicas) ou Troca Primordial (metade do dano da sua respiração vira primordial).\n' +
          'As doze formas, todas de 1 ponto de energia e crescendo um dado por evolução: Enbu (2d12, +3 na CD do pescoço) · Heki-ra no Ten (corte circular 2d10, dobro em estruturas) · Retsujitsu Kokyo (cone, 2d8, pode ser reação) · Gen\'Nichi Kou (imagens residuais: inimigos testam Percepção ou atacam com desvantagem) · Kasha (salto, 2d10 com +5 no acerto) · Shyakkotsu Enyo (reação: reduz 2d12 do dano) · Youkatotsu (linha de 3 m, corte profundo) · Hirin Kagerou (2d10 + cone de chamas, pode refazer o acerto) · Shayou Tenshin (salto por cima, pode decepar braço) · Kiki Onkou (2d12, mais movimento, pior o corte) · Nichiun no Ryu Kaburimai (linha de 4,5 m) · E\'nbuu (dois cortes, 2d12, −1 CR).\n' +
          'Dança completa (técnica especial, 9 de energia): as doze em sequência, quatro por turno, todas como se na 4ª evolução.',
      },
    ],
  },
  {
    titulo: 'Antecedentes e personalidade',
    intro: 'O antecedente diz de onde o caçador veio e dá perícias, às vezes ferramentas ou um talento, equipamento e ienes para começar. Pode ser adaptado com o mestre.',
    verbetes: [
      {
        nome: 'Tendência',
        texto: 'Duas partes: leal, neutro ou caótico, e bom, neutro ou mau — nove combinações (LB, NB, CB, LN, N, CN, LM, NM, CM). É um guia do comportamento, não uma prisão.',
      },
      {
        nome: 'Traços, ideais e defeitos',
        texto: 'Traço: um detalhe específico e marcante ("lê à luz de vela"). Ideal: o princípio pelo qual você lutaria. Defeito: o vício, medo ou fraqueza que alguém poderia usar contra você.',
      },
      {
        nome: 'Inspiração',
        texto: 'O mestre dá por boa interpretação dos traços, ideais e defeitos. Não acumula: você tem ou não tem. Gaste para ter vantagem num ataque, teste ou resistência — ou passe a outro jogador que brilhou na cena.',
      },
      {
        nome: 'Proficiência repetida',
        texto: 'Se o antecedente dá uma perícia ou ferramenta que você já tem, escolha outra do mesmo tipo.',
      },
      { nome: 'Artista', texto: 'Atuação e Persuasão · talento Ator (sem o +1 de Carisma) · kit de disfarce e um instrumento · 3d6 × 1.000 ienes.\nReconhece obras autênticas, desperta emoções com a arte, e a apresentação dá +1 nos testes dos aliados por 1 hora.' },
      { nome: 'Brigão', texto: 'Atletismo e Intimidação · talento Especialista em Briga (sem o +1 de Força) · porrete · 3d10 × 1.000 ienes.\nSoco de 1d8 sem arma, vantagem para intimidar, acha pontos fracos (Percepção) e conhece as ruas.' },
      { nome: 'Costureiro', texto: 'Blefar e Furtividade · ferramenta de costureiro · 3d10 × 1.000 ienes.\nFaz uniformes de caçador pela metade do preço e, com o tecido especial, mantos (dois dias, e a ferramenta se gasta). Conserta roupas e cria disfarces.' },
      { nome: 'Cozinheiro', texto: 'História e Persuasão ou Percepção · utensílios de cozinheiro · 3d12 × 1.000 ienes.\nCozinha que cura e que convence, conhece ingredientes, improvisa com o que tiver.' },
      { nome: 'Estudioso', texto: 'História e Intuição · talento Mente Afiada (sem o +1 de Inteligência) · kit de falsificação · 3d12 × 1.000 ienes.\nErudição, perícia em livros, raciocínio lógico, línguas; pesquisa muito mais rápido entre aventuras.' },
      { nome: 'Ferreiro', texto: 'História e Percepção · ferramenta de ferreiro · 3d10 × 1.000 ienes.\nForja armas, inclusive Nichirin, pela metade do preço em material; conserta rápido, reaproveita metal e personaliza armas (as modificações do capítulo de Equipamento).' },
      { nome: 'Ladrão', texto: 'Blefar e Prestidigitação · ferramentas de ladrão · 3d12 × 1.000 ienes.\nLadinagem, olho para avaliar valor, gíria de ladrão, e é ardiloso.' },
      { nome: 'Médico', texto: 'Medicina e Natureza · kit de primeiros socorros e de herbalismo · dois kits de primeiros socorros · 3d10 × 1.000 ienes.\nEstabiliza com ação bônus, diagnostica doenças e prepara poções de cura.' },
      { nome: 'Ninja', texto: 'Acrobacia e Furtividade · proficiente com kunai, shuriken e bombas de mão (cinco de cada) · 3d10 × 1.000 ienes.\nMovimento acrobático, furtividade aprimorada, resistência a veneno e armas envenenadas.' },
      { nome: 'Órfão', texto: 'Natureza e Sobrevivência · armas simples · adaga, funda e kit de primeiros socorros · 3d10 × 1.000 ienes.\nSobrevive na cidade, some na multidão, resiliente e adaptável.' },
      { nome: 'Policial', texto: 'Intuição e Investigação · armas de fogo · distintivo, pistola com 20 balas e kit de primeiros socorros · 3d10 × 1.000 ienes.\nInvestigação aprofundada, rede de contatos, sempre em guarda; investiga mais fácil entre aventuras.' },
      { nome: 'Religioso', texto: 'Intuição e História · símbolo sagrado e livro de preces · 3d12 × 1.000 ienes.\nConhecimento religioso, discernimento espiritual, inspira fé e renova a coragem dos aliados.' },
      { nome: 'Selvagem', texto: 'Sobrevivência, Lidar com Animais e Natureza · talento Caçador · 3d12 × 1.000 ienes.\nSobrevivência por instinto, rastreamento, camuflagem na mata e memória do terreno.' },
    ],
  },
  {
    titulo: 'Talentos',
    intro: 'Em vez do Incremento no Valor de Habilidade, você pode pegar um talento. Cada um uma vez só (salvo se disser o contrário), e só funciona enquanto você cumprir o pré-requisito.',
    verbetes: [
      { nome: 'Adepto Elemental', texto: 'Pré: conjurar Kekkijutsu. Um Kekkijutsu elemental ignora resistência ao tipo escolhido, e 1 no dado de dano vale 2. Pode repetir, outro tipo.' },
      { nome: 'Alerta', texto: '+5 na iniciativa, não é surpreendido consciente, e esconder-se de você não dá vantagem contra você.' },
      { nome: 'Ambidestro', texto: '+1 de CR com uma arma em cada mão, luta com duas armas mesmo não leves, saca as duas de uma vez.' },
      { nome: 'Aprimorador de Kekkijutsu', texto: 'Pré: conjurar Kekkijutsu. Um Kekkijutsu de ataque tem alcance dobrado e ignora meia cobertura e três quartos.' },
      { nome: 'Atacante Bestial', texto: 'Uma vez por turno, rola de novo o dado de dano de um ataque corpo a corpo e fica com o que quiser.' },
      { nome: 'Atirador Aguçado', texto: 'Sem desvantagem na distância longa, ignora meia cobertura e três quartos, e pode trocar −5 no ataque por +10 no dano.' },
      { nome: 'Atleta', texto: '+1 Força ou Destreza; levantar custa 1,5 m, escalar não custa a mais, corrida de salto de 1,5 m.' },
      { nome: 'Ator', texto: '+1 Carisma; vantagem em Atuação e Blefar para se passar por outra pessoa.' },
      { nome: 'Brutal', texto: '+1 Força; arma versátil em uma mão usa o dado de duas; arma de duas mãos numa mão só, com desvantagem.' },
      { nome: 'Caçador', texto: 'Lembra todo rosto e nome. Ação: marca uma criatura a até 36 m por 1 hora — vantagem para encontrá-la e sabe se ela passou por um lugar.' },
      { nome: 'Conjurador Destrutivo', texto: 'Pré: Kekkijutsu. Vantagem para manter concentração, e pode trocar o ataque de oportunidade por um Kekkijutsu de alvo único.' },
      { nome: 'Conjurador Sentinela', texto: 'Pré: Kekkijutsu. Deixa um Kekkijutsu pronto antes da luta e o solta logo depois da iniciativa (até 10 minutos, em concentração).' },
      { nome: 'Conjurador Versátil', texto: 'Pré: Kekkijutsu, nível 8. Duas vezes por descanso longo, conjura com ação bônus — dois Kekkijutsu no turno.' },
      { nome: 'Crítico Forçado', texto: 'Crítico com 19 ou 20, em ataques corpo a corpo ou à distância (escolha um). Não vale para técnicas.' },
      { nome: 'Curandeiro · Curandeiro Expert', texto: 'Estabilizar com o kit deixa a criatura com 1 PV; uma ação e um uso do kit curam 1d6 + 4 + os Dados de Vida dela (uma vez por descanso). Expert: o kit vira ação bônus.' },
      { nome: 'Duelista de Fogo · Defensivo · Duplo', texto: 'De Fogo: duas armas de fogo (ou uma leve e uma de fogo), segundo disparo com ação bônus.\nDefensivo (Des 14): com arma de acuidade, reação para somar a proficiência à CR contra um ataque.\nDuplo (Des 14): a segunda arma soma o modificador no dano.' },
      { nome: 'Especialista em Armas de Fogo · em Besta', texto: 'Sem desvantagem com inimigo colado, e recarga com ação bônus (fogo) ou ignorando recarga, com ataque de besta de mão na ação bônus (besta).' },
      { nome: 'Especialista em Briga · em Combate', texto: 'Briga: +1 For ou Con, desarmado 1d4, e agarra com ação bônus depois de acertar. Combate (pré: Briga): depois de atacar com arma de uma mão, soco com ação bônus, desarmado 1d8.' },
      { nome: 'Explorador de Cavernas', texto: 'Vantagem para achar portas secretas e contra armadilhas, resistência ao dano delas, procura armadilhas em ritmo normal.' },
      { nome: 'Extravagante', texto: '+1 Carisma, Atuação (ou o dobro), e plateia assistindo dá bônus igual ao número de pessoas (até o Carisma), três vezes por descanso longo.' },
      { nome: 'Hábil', texto: 'Depois de cada descanso longo, 10 minutos de treino dão proficiência numa arma, perícia ou ferramenta.' },
      { nome: 'Imobilizador', texto: 'Pré: For 13. Vantagem contra quem você agarra, e pode deixar os dois impedidos.' },
      { nome: 'Infortúnio', texto: 'Escolha um número de 2 a 19: quando você o tira num teste ou ataque, vira 1 — e quando alguém o tira contra você, também.' },
      { nome: 'Investida Poderosa', texto: 'Na Disparada, ataque ou empurrão com ação bônus; depois de 3 m em linha reta, +5 no dano ou empurra 3 m.' },
      { nome: 'Investigador', texto: 'Pré: nível 8. Proficiente em Investigação, ou o dobro se já for.' },
      { nome: 'Líder do Amor · Liderança Ardente · Inata', texto: 'Amor (Car 13): 10 minutos de discurso dão PV temporários (metade do nível + Carisma) a até seis aliados.\nArdente (Car 14): ação bônus deixa um aliado a 1,5 m andar metade do deslocamento sem ataque de oportunidade, uma vez por dia cada.\nInata (pré: Ardente): o aliado ainda ataca com a reação antes de andar.' },
      { nome: 'Maestria com Arma de Fogo · em Arma de Haste', texto: 'Fogo: proficiência com todas as armas de fogo.\nHaste: com glaive, alabarda ou bordão, ataque de 1d4 com a outra ponta na ação bônus, e quem entra no seu alcance provoca ataque de oportunidade.' },
      { nome: 'Maestria em Mantos · em Uniforme', texto: 'Mantos: +1 CR vestindo manto.\nUniforme leve: +1 CR. Médio: +1 CR e sem desvantagem em Furtividade. Pesado: +1 CR e −3 em dano de concussão, corte e perfuração. Elemental: −3 em dano elemental vestindo qualquer uniforme.' },
      { nome: 'Matador de Conjuradores', texto: 'Reação para atacar quem conjura Kekkijutsu a 1,5 m, desvantagem na concentração de quem você fere, e vantagem contra Kekkijutsu de quem está colado.' },
      { nome: 'Mente Afiada', texto: '+1 Inteligência; sempre sabe onde é o norte e quantas horas faltam para o sol nascer ou se pôr, e lembra tudo do último mês.' },
      { nome: 'Mente Destruidora', texto: 'Vantagem em todo teste contra Kekkijutsu psíquico ou que invada a mente.' },
      { nome: 'Mestre de Armas Grandes · Defensiva', texto: 'Crítico ou derrubar alguém a 0 dá ataque com ação bônus; com arma pesada, −5 no ataque por +10 no dano.\nDefensiva: empurrão com ação bônus depois de atacar, e proteção extra contra efeitos de Destreza.' },
      { nome: 'Mobilidade', texto: '+3 m de deslocamento, Disparada ignora terreno difícil, e quem você ataca não ganha ataque de oportunidade em você no turno.' },
      { nome: 'Observador', texto: '+1 Int ou Sab e +5 na Percepção e Investigação passivas.' },
      { nome: 'Perito', texto: 'Proficiência em três perícias ou ferramentas à escolha.' },
      { nome: 'Persistência Defensiva', texto: 'Pré: nível 8. +2 de CR contra quem tem CR maior que o seu nível, e vantagem contra quem derrubou um aliado a 0 PV na rodada anterior.' },
      { nome: 'Poliglota', texto: '+1 Inteligência e cria códigos escritos que só quem você ensinar lê.' },
      { nome: 'Premonição', texto: 'Uma vez por descanso longo, no começo do turno, rola um d20 e guarda: ele substitui o próximo teste, ataque ou resistência do turno.' },
      { nome: 'Proteção Leve · Moderada · Pesada', texto: 'Proficiência em uniformes leves (+1 Des), médios (+1 For, pré: leves) ou pesados (+1 For, pré: médios).' },
      { nome: 'Resiliente · Supremo', texto: '+1 num atributo e proficiência na resistência dele. Supremo (só Água): +1d4 nessa resistência.' },
      { nome: 'Resistente', texto: '+1 Constituição; ao gastar Dado de Vida, recupera no mínimo o dobro do modificador de Constituição.' },
      { nome: 'Respiração Destruidora', texto: 'Pré: uma técnica. Uma técnica ignora resistência ao tipo de dano dela. Pode repetir.' },
      { nome: 'Respiração Versátil', texto: 'Pré: nível 8. Aprende uma técnica de outra classe ou subclasse, só na 1ª evolução. Nada de especiais.' },
      { nome: 'Robusto · Supremo', texto: 'Só Pedra: +2 PV máximo por nível (retroativo). Supremo (nível 8): +4 por nível.' },
      { nome: 'Sentinela', texto: 'Acertar ataque de oportunidade zera o deslocamento do alvo, Desengajar não o protege de você, e reação para atacar quem ataca outro ao seu lado.' },
      { nome: 'Sobrevivente', texto: 'Perde a proficiência numa resistência, mas só morre com cinco falhas nos testes contra a morte.' },
      { nome: 'Sorrateiro', texto: 'Pré: Des 13. Esconde-se na penumbra, errar um ataque à distância escondido não revela onde está, e penumbra não atrapalha a Percepção.' },
      { nome: 'Sorte Constante', texto: 'Pré: nível 12. Três rolagens seguidas de 10 ou menos no d20: a próxima vira 20 (num ataque, não é crítico).' },
      { nome: 'Sortudo', texto: 'Três pontos de sorte por descanso longo: cada um rola um d20 extra, seu ou contra você, e você escolhe qual vale.' },
      {
        nome: 'Talentos específicos de classe',
        texto:
          'Pedem a classe, um nível e a habilidade de origem — combine com o mestre:\n' +
          'Água: Mizu Ampliada (4º), Sukiru Dupla (16º). Flor: Peônia (4º), Viola (8º), Lírio de Martagon (18º). Serpente: Snake Strike Fortificado (4º, de novo no 16º), Sensor Ampliado (12º).\n' +
          'Besta: Ampliando a Amizade (4º), Aliados Favoritos (8º). Chamas: Chama Infalível (4º), Mandato (16º). Amor: Crescimento do Amor (4º), Estilo da Paixão (12º).\n' +
          'Inseto: Caçador de Demônios (4º), Reforço Venenoso (12º), Transmutação Primordial (18º). Lua: Luminosidade da Lua Minguante (4º), Empurrão Aprimorado (8º), Lua Completa (18º).\n' +
          'Pedra: Desmembramento Aprimorado (4º), Guardião Inabalável (11º), Guardião Protetor (18º). Trovão: Trovão Transformado (4º), Trovão Aprimorado (12º). Som: Arma Aprimorada (8º), Ataque Assassino Potencializado (16º).\n' +
          'Vento: Vento Reduzido (4º), Taifu Duplo (12º). Névoa: Mist Superior (4º), Gekisen Alterado (4º).',
      },
    ],
  },
  {
    titulo: 'Classes',
    intro: 'Dois tipos: classes de Respiração (em geral humanos, mas um demônio pode usar — o dano vira necrótico) e classes de Kekkijutsu (demônios). Subclasses mantêm a classe principal e trocam as habilidades marcadas como "Única" e as técnicas.',
    verbetes: [
      {
        nome: 'Respirações',
        texto:
          'Água · d10 · Força e Destreza · fácil.\n' +
          'Besta · d12 · Carisma e Sabedoria · médio.\n' +
          'Chamas · d12 · Força e Carisma · médio.\n' +
          'Inseto · d6 · Inteligência e Sabedoria · difícil.\n' +
          'Lua · d6 · Destreza e Inteligência · difícil.\n' +
          'Pedra · d12 · Força e Constituição · fácil.\n' +
          'Trovão · d8 · Destreza e Sabedoria · médio.\n' +
          'Vento · d10 · Destreza e Constituição · fácil.',
      },
      {
        nome: 'Subclasses',
        texto:
          'Flor (da Água) · fácil — giros que acumulam energia.\n' +
          'Serpente (da Água) · fácil — caçador letal, movimentos de cobra.\n' +
          'Amor (das Chamas) · médio — protege o usuário e os aliados.\n' +
          'Som (do Trovão) · médio — ouve o inimigo e prevê os golpes.\n' +
          'Névoa (do Vento) · difícil — alterna a velocidade para enganar.',
      },
      {
        nome: 'Construção rápida',
        texto:
          'Água: Força ou Destreza, depois Constituição. Besta: Carisma ou Sabedoria, depois Destreza. Chamas: Carisma, depois Força e Constituição. Inseto: Inteligência e Sabedoria, depois Destreza. Lua: Destreza, depois Inteligência ou Constituição. Pedra: Força, depois Constituição. Trovão: Destreza, depois Sabedoria. Vento: Destreza, depois Constituição.',
      },
      {
        nome: 'O que toda respiração tem',
        texto:
          'Energia = nível (Inseto, menos). Concentração Total (Dano e Resiliência) desde o 1º nível e Respiração Contínua no 10º — ver Técnicas de Respiração.\n' +
          'Técnicas no 3º nível, evoluções no 7º, 10º, 13º e 17º (três técnicas), Técnica Especial no 20º. Incremento de atributo (ou talento) no 4º, 8º, 12º, 16º e 19º.',
      },
      {
        nome: 'Kekkijutsu',
        texto: 'Classes de demônio: Especial, Gen, Kamakiri, Oiran e Sozo — cada uma com o seu capítulo aqui.',
      },
    ],
  },
  {
    titulo: 'Respiração da Água',
    intro: 'A mais comum entre os caçadores e a mais fácil para iniciantes: fluida, equilibrada entre ataque e defesa. d10 · Força ou Destreza · fácil.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 10 + Constituição no 1º nível; depois 1d10 + Constituição.\n' +
          'Proficiências: armas simples e especiais, uniformes leves e médios. Resistência: Força e Destreza. Duas perícias.\n' +
          'Equipamento: uma arma simples, uma katana, uniforme leve ou médio.\n' +
          'CD das técnicas: 8 + proficiência + Força ou Destreza. Ataque: proficiência + Força ou Destreza. Dano de frio.',
      },
      {
        nome: 'Progressão',
        texto:
          '1º Domínio, Resiliente · 2º Especialização, Kaifuku · 3º Técnicas, Mizu (única) · 4º Incremento · 5º Ataque Extra, Controle de Danos · 6º Ataque de Oportunidade Focado · 7º Evolução · 8º Incremento · 9º Kaisui (única) · 10º Evolução · 11º Ataque Extra (3 ataques) · 12º Incremento · 13º Evolução · 14º Sukiru Mizu (única) · 15º Potencialização Suprema · 16º Incremento · 17º Evolução · 18º Resiliência Eterna · 19º Incremento · 20º Técnica Especial.',
      },
      { nome: 'Domínio (1º)', texto: 'Tirou 1 ou 2 no dado de dano de uma arma corpo a corpo de duas mãos ou versátil: rola de novo e fica com o novo.' },
      { nome: 'Resiliente (1º)', texto: 'Refaz um teste de resistência que falhou. Uma vez por descanso longo; duas no 10º, três no 15º.' },
      { nome: 'Especialização (2º)', texto: 'Duas perícias novas, ou dobra a proficiência numa que já tem.' },
      { nome: 'Kaifuku (2º)', texto: 'Descanso longo em 4 horas e curto em 1 hora.' },
      {
        nome: 'Mizu — Única (3º)',
        texto:
          'No começo de cada turno, escolha a postura:\n' +
          '• Ofensiva: ataque extra com a Nichirin na ação bônus, +1 no acerto e no dano (+2 no 12º), +3 m de deslocamento.\n' +
          '• Defensiva: uma vez por turno reduz 1d8 do dano de um ataque corpo a corpo (1d12 no 10º, 2d10 no 15º) — se reduzir mais que o dano, contra-ataca; e +1 de CR (+2 no 12º, +3 no 15º).',
      },
      { nome: 'Ataque Extra (5º, 11º)', texto: 'Dois ataques na ação de Atacar; três no 11º.' },
      { nome: 'Controle de Danos (5º)', texto: 'Ação bônus: PV temporários de 1d8 + Constituição (1d12 no 9º, 2d12 no 15º) até o fim do combate. Proficiência vezes por descanso longo.' },
      { nome: 'Ataque de Oportunidade Focado (6º)', texto: 'Inimigo sai do seu alcance: reação para atacar, parar o movimento dele e ainda andar metade do deslocamento sem provocar.' },
      { nome: 'Kaisui — Única (9º)', texto: 'Herda uma habilidade única de 3º nível de outra classe ou subclasse de respiração, com aprovação do mestre.' },
      { nome: 'Sukiru Mizu — Única (14º)', texto: 'Uma técnica perfeita: sem custo de energia, proficiência vezes por descanso curto ou longo (ainda conta para a fadiga).' },
      { nome: 'Potencialização Suprema (15º)', texto: 'Nas técnicas, rola de novo até dois dados de dano por turno.' },
      { nome: 'Resiliência Eterna (18º)', texto: 'Com metade dos PV ou menos (e acima de 0), recupera 15 + Constituição no começo de cada turno.' },
      {
        nome: 'Técnicas (1 energia cada, frio)',
        texto:
          '1ª Minamogiri — toque, 2d10; decapita na hora quem tiver menos de 10 PV (15, 20, 25, 30 nas evoluções).\n' +
          '2ª Mizuguruma — giro de 360°, 2d12.\n' +
          '3ª Ryuuryuu Mai — corrida, raio de 3 m, 2d6 (Destreza, metade); a área cresce até 12 m.\n' +
          '4ª Uchishio — toque, 2d12 e +6 m de deslocamento.\n' +
          '5ª Kanten no Jiu — morte instantânea de uma criatura que aceita; sem custo e sem evolução.\n' +
          '6ª Nejire Uzu — redemoinho de 3 m, 2d10 (Destreza, metade).\n' +
          '7ª Shizuku Wa Mondzuki — estocada que acerta sempre, a partir do 3º turno contra o alvo, 2d6 perfurante; não corta pescoço.\n' +
          '8ª Takitsubo — salto e queda em cachoeira, raio de 3 m, 2d10; anula dano de queda de até 9 m.\n' +
          '9ª Suiryuu Shibuki — corre sobre a água ignorando terreno difícil, 2d10, +2 na CD do pescoço.\n' +
          '10ª Seisei Ruten — dragão d\'água, 2d12; Constituição ou perde a perna (1 ou 2 no d20: o corpo).\n' +
          'Todas sobem um dado por evolução (2 → 3 → 4 → 5 → 6 dados).\n' +
          'Especial (20º, 2 de energia): Nagi — 7d12 no pescoço, +5 na CD; ou Nejire Uzu-Ryuuryuu — 7d10 em área.',
      },
    ],
  },
  {
    titulo: 'Respiração da Flor',
    intro: 'Subclasse da Água: nove danças elegantes, trocadas turno a turno. Pede: Água como principal, Sentido da Visão, uniforme médio, humano. Troca as habilidades de 3º, 9º e 14º da Água; CD e ataque iguais aos da Água, dano cortante.',
    verbetes: [
      {
        nome: 'Petal Dance — Única (3º)',
        texto:
          'No começo de cada turno adota uma dança (duas a partir do 10º):\n' +
          'Escudo do Lírio (+proficiência de CR contra quem você atacou) · Florescência Mortal (ignora resistência ao seu dano) · Golpe da Rosa (empurra 3 m, Força) · Impulso do Girassol (+3 m, pode ser pulo) · Manobra da Flor (reposiciona em volta do alvo) · Rosa Amarela (reação para atacar quando um aliado a 3 m ataca) · Rosa Branca (troca de lugar com aliado a 3 m) · Rosa Negra (+1d6 necrótico, 1d10 no 15º) · Silene (vantagem nos seus ataques, mas quem você acerta tem vantagem contra você).',
      },
      { nome: 'Flor de Lótus — Única (3º)', texto: 'Uma ação extra no turno e pode trocar de dança. Uma vez por descanso curto ou longo; duas a partir do 13º (uma por turno).' },
      { nome: 'Lírio — Única (9º)', texto: 'Crítico com 19–20 em quem você vê, e um teste de Percepção revela um atributo do inimigo.' },
      { nome: 'Violeta — Única (14º)', texto: 'A partir do 3º turno, proficiência em todas as resistências contra ataques que você vê.' },
      {
        nome: 'Técnicas',
        texto:
          '2ª Mikage Ume — reação: reduz 2d10 do dano; se reduzir tudo, +1 no acerto contra o atacante.\n' +
          '4ª Beni Hanagoromo — 2d10; Sabedoria ou o alvo fica sem reações contra você.\n' +
          '5ª Ada no Shakuyaku — nove golpes num só ataque, 2d12.\n' +
          '6ª Uzumomo — salto invertido, 2d10, +1 na CD do pescoço; como reação, anula queda de até 6 m.\n' +
          'Especial: Higan Shugan (1 minuto com todas as danças e Lótus ilimitado — mas cobra a visão) ou Haru no Ken (linha de 9 m, 7d12 necrótico, pode zerar o deslocamento).',
      },
    ],
  },
  {
    titulo: 'Respiração da Serpente',
    intro: 'Subclasse da Água: movimentos sinuosos e uma Nichirin maleável. Pede: Água como principal, arma de acuidade e uniforme leve; humanos, variantes ou demônio. Troca as habilidades de 3º, 9º e 14º; dano cortante.',
    verbetes: [
      {
        nome: 'Snake Strike — Única (3º)',
        texto:
          'Uma vez por turno, no primeiro ataque: +2d4 de dano se tiver vantagem — ou se um aliado estiver a 1,5 m do alvo. Sobe 1d4 a cada dois níveis (3d4 no 5º … 10d4 no 19º).\n' +
          'Junto com uma técnica, custa 1 de energia e conta como dois de fadiga.',
      },
      { nome: 'Companheira — Única (3º)', texto: 'Uma serpente pequena (CR 11, 13 PV, mordida 1d6+2). Ação bônus + Percepção (CD 15 − Sabedoria): vantagem num ataque por turno contra aquele inimigo até ele cair. Você também vê pelos olhos dela.' },
      { nome: 'Infra-Red — Única (9º)', texto: 'Sente toda criatura a até 9 m, mesmo invisível.' },
      { nome: 'Bote — Única (14º)', texto: 'Com a fraqueza marcada pela serpente, rola o dano duas vezes e fica com o maior. Proficiência vezes por descanso curto ou longo.' },
      {
        nome: 'Técnicas',
        texto:
          '1ª Idagari — arco de 6 m, 2d10; reação reduz 1d10 do dano recebido.\n' +
          '2ª Kyozo no Dokuga — na nuca, 2d10, +1 na CD do pescoço (+2 com Snake Strike).\n' +
          '3ª Toguro Jime — espiral, 2d10; Constituição ou perde um braço (com Snake Strike, também a perna).\n' +
          '4ª Jeija Sosei — dois golpes, 2d12 (com Snake Strike, vira necrótico e não pode ser reduzido).\n' +
          'Especial: En\'en Choda (7d12, todos os pescoços num raio de 4,5 m) ou Zettai Teki na Kyofu (7d10 e o alvo fica sem se mover).',
      },
    ],
  },
  {
    titulo: 'Respiração da Besta',
    intro: 'Feroz e imprevisível, com duas lâminas serrilhadas e um aliado de caça. d12 · Carisma ou Sabedoria, depois Destreza · médio.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 12 + Constituição no 1º nível; depois 1d12 + Constituição.\n' +
          'Proficiências: armas simples e katana (sem uniforme). Resistência: Carisma e Sabedoria. Duas perícias.\n' +
          'Equipamento: duas katanas e uma arma simples.\n' +
          'CD das técnicas: 8 + proficiência + Destreza ou Sabedoria. Ataque: proficiência + Destreza ou Sabedoria. Dano cortante.',
      },
      {
        nome: 'Progressão',
        texto:
          '1º Presa Favorita, Corpo Adaptável · 2º Dilacerar, Defesa Primitiva · 3º Técnicas, Aliado Favorito (única) · 4º Incremento · 5º Ataque Extra, Vínculo da Natureza · 6º Ataque de Oportunidade Focado · 7º Evolução · 8º Incremento · 9º Aliado Bestial (única) · 10º Evolução · 11º Ataque Extra (3) · 12º Incremento · 13º Evolução · 14º Time Favorito (única) · 15º Mandíbula do Caçador · 16º Incremento · 17º Evolução · 18º Transposição Vital · 19º Incremento · 20º Técnica Especial.',
      },
      { nome: 'Presa Favorita (1º)', texto: 'Acertou, marca o alvo por 1 minuto: +1d6 de dano uma vez por turno (1d8 no 6º, 1d10 no 14º), vantagem para rastreá-lo e lembrar dele. Proficiência marcas.' },
      { nome: 'Corpo Adaptável (1º)', texto: 'Passa por espaços apertados onde um humano não caberia.' },
      { nome: 'Dilacerar (2º)', texto: 'Lâminas quebradas em serra: uma vez por turno, o alvo atingido perde todas as resistências contra você até o fim do turno (até se curar).' },
      { nome: 'Defesa Primitiva (2º)', texto: 'Sem uniforme: CR = 10 + Destreza + Sabedoria.' },
      {
        nome: 'Aliado Favorito — Única (3º)',
        texto:
          'Na iniciativa, marca um aliado. Contra o mesmo inimigo: +2 no acerto e no dano para os dois, vantagem no primeiro turno, o aliado também ignora resistência de quem você dilacerou, e ganha metade da sua proficiência de CR (mínimo 1) a pelo menos 3 m de você. Trocar de aliado: ação bônus, até 9 m.',
      },
      { nome: 'Vínculo da Natureza (5º)', texto: 'Na floresta, Esconder vira ação bônus.' },
      {
        nome: 'Aliado Bestial — Única (9º)',
        texto:
          'Com o aliado favorito a até 9 m: Manobra do Lobo (gasta seu deslocamento para ele se mover sem ataque de oportunidade) · Orientação da Águia (ação bônus: vantagem no próximo teste dele) · Energia do Leão (paga com a sua energia parte do custo das técnicas dele, até o seu Carisma) · Dificuldade da Serpente (ação bônus e 1 de energia: +1 na CD quando ele tenta decepar).',
      },
      { nome: 'Time Favorito — Única (14º)', texto: 'Contra um inimigo dilacerado, tantos aliados quanto o seu Carisma também ignoram as resistências dele.' },
      { nome: 'Mandíbula do Caçador (15º)', texto: '1 de energia ao acertar a presa marcada: enquanto durar a marca, +proficiência no dano contra ela.' },
      { nome: 'Transposição Vital (18º)', texto: 'Desvia os órgãos de golpes fatais; na primeira vez no dia que cair a 0 PV, levanta no turno seguinte com 1 PV.' },
      {
        nome: 'Técnicas (Presas, 1 energia cada)',
        texto:
          '1ª Ugachi Nuki — crava as duas espadas, 2d12.\n' +
          '2ª Kirisaki — corte em X, 2d10, e aplica Dilacerar.\n' +
          '3ª Kuizaki — na garganta, 2d10, +1 na CD do pescoço.\n' +
          '4ª Kiri Koma Zaki — cone de 3 m, 2d6 (Destreza, metade); a área chega a 12 m.\n' +
          '5ª Kurai Zaki — giro no ar, 1,5 m ao redor, 2d8 (Destreza, metade).\n' +
          '6ª Rangui Gami — serra no pescoço de um Fragilizado, 2d10, +2 na CD.\n' +
          '7ª Kukan Shikikaku — pede Sentido do Tato: localiza todas as criaturas a 100 m (até 300 m).\n' +
          '8ª Bakuretsu Moshin — dobra o deslocamento, ignora terreno difícil e ataques de oportunidade no turno.\n' +
          '9ª Shin Unerizaki — ação bônus e concentração (1 min): +1,5 m de alcance.\n' +
          '10ª Enten Senga — reação: reduz 2d12 de dano e dissipa fumaça num raio de 9 m.\n' +
          'Especial: Omoitsuki no Nagesaki (+3 na CD quando o aliado favorito mira o pescoço) ou Kasai no Hana (7d12; Sabedoria ou fica sem reagir, e depois Constituição ou perde um membro).',
      },
    ],
  },
  {
    titulo: 'Respiração das Chamas',
    intro: 'Herdeira direta da Respiração do Deus do Fogo, para espíritos inabaláveis: puxa o inimigo para si e protege o grupo. d12 · Carisma, depois Força e Constituição · médio.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 12 + Constituição no 1º nível; depois 1d12 + Constituição.\n' +
          'Proficiências: armas simples, marciais, pesadas e únicas; uniformes leves, médios e pesados. Resistência: Força e Carisma. Duas perícias.\n' +
          'Equipamento: uma arma pesada ou única, katana, uniforme médio ou pesado.\n' +
          'CD das técnicas: 8 + proficiência + Carisma. Ataque das técnicas: proficiência + Força. Dano de fogo.',
      },
      {
        nome: 'Progressão',
        texto:
          '1º Espírito Inabalável, Encorajar · 2º Espírito Defensivo, Proteção · 3º Técnicas, Alma Ardente (única) · 4º Incremento · 5º Ataque Extra, Aura de Chamas · 6º Ataque de Oportunidade Poderoso · 7º Evolução · 8º Incremento · 9º Fire (única) · 10º Evolução · 11º Ataque Forte · 12º Incremento · 13º Evolução · 14º Enkai (única) · 15º Ampliação da Aura Inabalável · 16º Incremento · 17º Evolução · 18º Espírito Indestrutível · 19º Incremento · 20º Técnica Especial.',
      },
      { nome: 'Espírito Inabalável (1º)', texto: 'Aliados a até 3 m não ficam amedrontados enquanto você estiver consciente, e somam o seu Carisma nas resistências contra condições.' },
      { nome: 'Encorajar (1º)', texto: 'Depois de atacar, ação bônus: um aliado usa a reação para atacar o mesmo alvo.' },
      { nome: 'Espírito Defensivo (2º)', texto: 'Reação: aliado a menos de 3 m atacado ganha metade da sua proficiência de CR; se o ataque errar, ele anda 3 m.' },
      { nome: 'Proteção (2º)', texto: 'No seu crítico, você ou um aliado a 3 m ganha metade da proficiência de CR contra o próximo ataque.' },
      {
        nome: 'Alma Ardente — Única (3º)',
        texto:
          'Ao atacar corpo a corpo, ação bônus para incendiar a lâmina: Constituição ou o alvo fica Queimado (2 de energia: sem teste).\n' +
          'Contra um alvo Queimado: +2 no acerto, +2 de CR, reação para obrigá-lo (a até 9 m) a atacar só você, e ação bônus para apagar o fogo e travar a regeneração dele por um turno.',
      },
      { nome: 'Ataque Extra (5º)', texto: 'Dois ataques na ação de Atacar (esta classe não chega a três).' },
      { nome: 'Aura de Chamas (5º)', texto: 'Reação: aliado a até 6 m que falhou numa resistência contra dano rola de novo. Carisma vezes por descanso longo.' },
      { nome: 'Ataque de Oportunidade Poderoso (6º)', texto: 'Inimigo saindo do alcance: reação para atacar, parar o movimento dele, com +1d6 de dano.' },
      { nome: 'Fire — Única (9º)', texto: 'Uma vez por dia, ação bônus: você ou um aliado a até 6 m recupera 1d4 de energia (1d8 e duas vezes no 15º).' },
      { nome: 'Ataque Forte (11º)', texto: 'Derrubou alguém a 0 PV: ação bônus para mirar um membro (Constituição ou perde), ou usar uma técnica como ação bônus (1 vez por dia, 2 no 16º).' },
      { nome: 'Enkai — Única (14º)', texto: 'Uma vez por turno, reação: inimigos a até 9 m fazem Carisma ou têm de atacar você até o seu próximo turno (quem passa e ataca outro, com desvantagem). Você ganha metade da proficiência de CR e resistência a concussão, corte e perfuração.' },
      { nome: 'Ampliação da Aura Inabalável (15º)', texto: 'Espírito Inabalável vai a 9 m, e aliados a 3 m ganham +1d4 nas resistências.' },
      { nome: 'Espírito Indestrutível (18º)', texto: '+2 Força e Carisma (teto 22). A 0 PV, continua por três turnos com metade dos PV como temporários; se eles acabarem, morre. A cada dois ataques sofridos nesse estado, uma falha contra a morte.' },
      {
        nome: 'Técnicas (1 energia cada, fogo)',
        texto:
          'Quase todas pedem Constituição ou o alvo fica Queimado.\n' +
          '1ª Shiranui — investida com rastro de fogo (terreno difícil por 2 turnos), 2d12.\n' +
          '2ª Nobori Enten — corte de baixo para cima, 2d12.\n' +
          '3ª Kien Banjo — de cima para baixo, 2d12, +6 m e rastro de fogo.\n' +
          '4ª Sei En no Uneri — reação ao ser acertado: reduz 2d12 do dano.\n' +
          '5ª Enko — golpes em forma de tigre, 2d12; o Queimado é com desvantagem.\n' +
          'Especial: Rengoku (salto de 24 m ao pescoço, 7d12, Queimado automático) ou Taiyo (7d12, Constituição ou perde três membros).',
      },
    ],
  },
  {
    titulo: 'Respiração do Amor',
    intro: 'Subclasse das Chamas, movida por um sentimento: Nichirin em forma de chicote e palavras que inspiram. Pede: Chamas como principal, uniforme médio e chicote; humanos, variantes ou demônio. Troca as habilidades de 3º, 9º e 14º; dano cortante.',
    verbetes: [
      { nome: 'Love — Única (3º)', texto: 'Ação bônus: uma criatura a até 18 m ganha um dado de Amor (d6; d8 no 5º, d10 no 10º, d12 no 15º) para somar uma vez, em 10 minutos, a um teste, ataque, resistência ou dano. Carisma vezes por descanso longo.' },
      { nome: 'Estilo do Amor — Única (3º)', texto: 'Ataque extra com a Nichirin na ação bônus, quem entra ou sai do seu alcance provoca ataque de oportunidade, e o seu pulo vai tão longe quanto o seu deslocamento, sem dano de queda.' },
      { nome: 'Grande Amor — Única (9º)', texto: 'Um uso do Love inspira tantas criaturas quanto o seu Carisma. Uma vez por descanso longo, discurso: PV temporários de nível + Carisma para cada aliado.' },
      { nome: 'Amor Imparável — Única (14º)', texto: 'Rolou iniciativa sem nenhum uso de Love: recupera todos.' },
      {
        nome: 'Técnicas',
        texto:
          '1ª Hatsukoi no Wananaki — avança 3 m, 2d10, Constituição ou deslocamento pela metade; termina atrás do alvo.\n' +
          '2ª Ono Meguru Koi — salto de 3 m, 2d12; também como reação (metade do dano), Constituição ou perde um braço.\n' +
          '3ª Koi Neko Shigure — chuva de golpes, cilindro de 6 m, 2d6 (Destreza, metade).\n' +
          '4ª Ai no Hoyo — enrola o chicote no pescoço, 2d10, Força ou é arremessado 3 m.\n' +
          '5ª Yurameku Renjo Midarezume — salto de 6 m e vórtice de 3 m, 2d10, você escolhe quem atinge.\n' +
          '6ª Neko Ashi Koi Kaze — reação: reduz 2d12 do dano; se reduzir mais que o dano, o ataque volta para o atacante.\n' +
          'Especial: Ai no Kisu — estocada a 9 m, 7d12, e o alvo perde o movimento.',
      },
    ],
  },
  {
    titulo: 'Respiração do Inseto',
    intro: 'Para quem não tem força para decapitar: a Nichirin vira um ferrão que injeta venenos. d6 · Inteligência e Sabedoria, depois Destreza · difícil.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 6 + Constituição no 1º nível; depois 1d6 + Constituição.\n' +
          'Proficiências: armas simples, katana, uniformes leves. Resistência: Inteligência e Sabedoria. Duas perícias.\n' +
          'Equipamento: uma arma simples, uma katana, uniforme leve.\n' +
          'Energia: metade do nível, arredondada para cima (1 no 1º … 10 no 20º). Venenos conhecidos = nível.\n' +
          'CD dos venenos: 8 + proficiência + Inteligência. CD das técnicas: 8 + proficiência + Sabedoria; ataque: proficiência + Destreza. Técnicas recebem a 4ª evolução em todas no 17º.',
      },
      {
        nome: 'Progressão',
        texto:
          '1º Ferrão, Venenos · 2º Passo Insetívoro · 3º Destruição Venenosa (única), Técnicas · 4º Incremento · 5º Combinações · 6º Asas Efêmeras · 7º Evolução · 8º Incremento · 9º Infestação Potencializada (única) · 10º Evolução · 11º Combinações (3), Resiliência Tóxica · 12º Incremento · 13º Evolução · 14º Combinações (4), Metamorfose Venenosa (única) · 15º Desintegração Celular · 16º Incremento · 17º Evolução · 18º Combinações (5) · 19º Incremento · 20º Transfusão Mortífera.',
      },
      { nome: 'Ferrão (1º)', texto: 'A Nichirin vira injetor: 1d4 por ataque (armas não adaptadas, desvantagem). Refaz uma nova num descanso longo com material; adaptar outra arma leva um dia.' },
      { nome: 'Venenos (1º)', texto: 'Ao atacar com a Nichirin, injeta um veneno: dano da arma + dano do veneno, sem modificador. Escolha o veneno na iniciativa e depois no começo de cada turno. O acerto decide se pega; se tiver teste, o alvo testa depois. Cada veneno tem usos, recuperados no descanso longo.' },
      { nome: 'Passo Insetívoro (2º)', texto: 'Desengajar, Disparada e Esquivar viram ações bônus.' },
      { nome: 'Destruição Venenosa — Única (3º)', texto: 'Veneno que fere um demônio de ND baixo o destrói na hora: ND 1 no 3º, 2 no 5º, 3 no 8º, 4 no 11º, 5 no 14º, 6 no 17º, 7 no 20º.' },
      { nome: 'Combinações (5º)', texto: 'Dois venenos combináveis numa ação de Atacar, em ordem, um acerto para cada (três no 11º, quatro no 14º, cinco no 18º). No máximo duas condições por turno numa criatura. Reaplicar um veneno ativo reinicia a duração.' },
      { nome: 'Asas Efêmeras (6º)', texto: 'Reação ao cair: plana sem dano. E em resistência de Destreza ou Constituição: passou, nada de dano; falhou, metade.' },
      { nome: 'Infestação Potencializada — Única (9º)', texto: 'Sacrifica uma combinação para reforçar o próximo veneno: soma o dano e +2 dados, ou +5 na CD; as durações somam.' },
      { nome: 'Resiliência Tóxica (11º)', texto: 'Resistência a veneno e necrótico, e imune aos efeitos de venenos.' },
      { nome: 'Metamorfose Venenosa — Única (14º)', texto: 'Troca o tipo de dano de um veneno (menos primordial), proficiência vezes por descanso longo, uma por turno.' },
      { nome: 'Desintegração Celular (15º)', texto: 'Ação: golpe com veneno corrosivo, +6d6 primordial; a 0 PV, o mestre pode desintegrar o alvo. Duas vezes por dia.' },
      { nome: 'Transfusão Mortífera (20º)', texto: 'O seu corpo é veneno: o demônio que o devorar morre; um primordial perde a regeneração por 1 hora e fica com desvantagem em tudo.' },
      {
        nome: 'Venenos (1º nível)',
        texto:
          'Só dano: Pulsatila 2d10, Catharanthus 2d8, Oenanthe 2d10, Ricinus 2d10, Taxus 2d12, Toxicodendron 2d10.\n' +
          'Condições: Abrus 1d10 atordoado · Aesculus 1d6 paralisado · Colchicum 1d8 incapacitado · Dracena 1d10 cego (2 turnos) · Gelsemium 1d12 surdo · Nerium 2d6 queimado · Solanium 1d10 petrificado (até ND 10) · Lantana 1d10 perde uma perna · Pieris Japonica 1d10 perde uma mão.\n' +
          'Enfraquecer: Conium 1d10 −1 CR · Hyoscyamus 1d10 −2 CR · Phytolacca 1d4 −2 no acerto · Nicotiana 1d8 deslocamento pela metade · Ilex 2d6 sem reações · Robinia e Thymus sem ação bônus · Euphorbia tira resistência a cortante.\n' +
          'Desvantagem numa resistência (1d4): Apitoxina (Des), Chironex (Car), Loxosceles (Sab), Paraponera (Con), Phoneutria (For), Solenopsis (Int).\n' +
          'Regeneração: Belladona e Datura impedem (até ND 10), Thevetia corta pela metade. Dano contínuo: Lonomia 1d8/turno, Polistes 1d4/turno por 5 turnos.',
      },
      {
        nome: 'Venenos (11º e 16º)',
        texto:
          '11º: Aconitum e Atropa 3d10, Chelidonium 4d10, Ammi 4d6 −2 CR, Camellia sem regeneração (ND 15), Cerbera sem ação bônus, Cinex sem regenerar membros, Coccinella 2d6/turno, Cycas sem reações, Delphinium deslocamento pela metade, Dioscorea regeneração pela metade (ND 20), Euonymus −2 CR, Gelsemium −3 no acerto, Ipomoea perde uma perna, Leiurus falha em Destreza, Lophophora sem ação bônus, Nicandra incapacitado, Pyrophorus 2d10/turno, Staphylea tira resistência a cortante.\n' +
          '16º: Aconito 6d10, Strychnos 7d12, Aristolochia sem regeneração (ND 18), Brugmansia −4 no acerto, Colchinum deslocamento pela metade, Dedaleira 4d10 sem regenerar membros, Echium paralisado, Solanum perde os dois braços, Viburnum 4d10/turno em não lendários, Viscum 4d10 e queimado.',
      },
      {
        nome: 'Técnicas (1 energia cada)',
        texto:
          'Cho no Mai: Tawamure — dança de borboleta: +2 no acerto dos venenos (sobe até +4 em todos).\n' +
          'Hoga no Mai: Manabiki — um golpe com vantagem que junta o dano de todos os venenos e um teste só; as evoluções prolongam os efeitos.\n' +
          'Seirei no Mai: Fukugan Rokkaku — seis golpes nos pontos vitais: +1 turno na duração de um veneno (até +3 em todos).\n' +
          'Goko no Mai: Hyakusoku Jabara — zigue-zague, +3 m ignorando terreno difícil e um dado a mais no primeiro veneno do turno.',
      },
    ],
  },
  {
    titulo: 'Respiração da Lua',
    intro: 'Derivada da Lua (não do Sol): cortes em cone que alcançam longe e são letais de perto. d6 · Destreza, depois Inteligência ou Constituição · difícil.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 6 + Constituição no 1º nível; depois 1d6 + Constituição.\n' +
          'Proficiências: armas simples e marciais, katanas, uniformes leves e médios. Resistência: Destreza e Inteligência. Duas perícias.\n' +
          'Equipamento: uma arma simples, uma katana, uniforme leve.\n' +
          'CD e ataque das técnicas: Destreza. Dano necrótico.',
      },
      {
        nome: 'Progressão',
        texto:
          '1º Aprimoramento, Expansão · 2º Estilo Perfeito, Letalidade · 3º Técnicas, Lua Minguante (única) · 4º Incremento · 5º Ataque Extra, Esquiva Perfeita · 6º Ataque de Oportunidade Fatal · 7º Evolução · 8º Incremento · 9º Lua Nova (única) · 10º Evolução · 11º Ataque Extra (3) · 12º Incremento · 13º Evolução · 14º Ataque Extra (4), Lua Cheia (única) · 15º Letalidade Expandida · 16º Incremento · 17º Evolução · 18º Dominação · 19º Incremento · 20º Técnica Especial.\n' +
          'Expansão: 3 m do 1º ao 4º, 6 m do 5º ao 10º, 9 m do 11º ao 16º, 12 m do 17º em diante.',
      },
      { nome: 'Aprimoramento (1º)', texto: 'Crítico com 19–20.' },
      { nome: 'Expansão (1º)', texto: 'Ataque corpo a corpo com a Nichirin vira um cone do tamanho da Expansão: todos dentro levam o dano da arma (um acerto por criatura, aliados incluídos), e só o alvo escolhido soma o modificador. Ou ataque um alvo só a essa distância.' },
      { nome: 'Estilo Perfeito (2º)', texto: 'Ninguém tem vantagem contra você (salvo incapacitado), e você nunca é surpreendido consciente.' },
      { nome: 'Letalidade (2º)', texto: 'Ação bônus, anunciada antes do ataque, contra um alvo a 1,5 m: se acertar, Constituição (CD 8 + Des + proficiência) ou o dano vira crítico. Proficiência vezes por descanso curto ou longo, um alvo por vez.' },
      { nome: 'Lua Minguante — Única (3º)', texto: '+1d6 nos ataques corpo a corpo a 1,5 m (+1d4 a mais de 3 m). Uma vez por dia, a 1,5 m, Constituição ou o alvo perde um membro.' },
      { nome: 'Ataque Extra (5º, 11º, 14º)', texto: 'Dois ataques; três no 11º; quatro no 14º.' },
      { nome: 'Esquiva Perfeita (5º)', texto: 'Reação ao ser acertado: metade do dano. Depois, 1 de energia dá +2 de CR (até +4) até o seu próximo turno.' },
      { nome: 'Ataque de Oportunidade Fatal (6º)', texto: 'Reação contra quem sai do seu alcance de 1,5 m: +2d6 de dano, e o movimento dele para.' },
      { nome: 'Lua Nova — Única (9º)', texto: 'Acertou a 1,5 m: ação bônus para empurrar 4,5 m (Força, CD 8 + For + proficiência).' },
      { nome: 'Lua Cheia — Única (14º)', texto: 'Uma vez por dia, marca três inimigos a até 18 m por 1 minuto: no primeiro acerto do turno em cada um, +1d10 cortante e +2 no acerto.' },
      { nome: 'Letalidade Expandida (15º)', texto: 'Crítico com 18–20 em ataques e técnicas, e a Letalidade vale também em técnicas e ataques em cone.' },
      { nome: 'Dominação (18º)', texto: 'No primeiro turno contra alguém: Sabedoria ou amedrontado por 1 minuto (quem passa fica imune por 24 h). E quem avança 3 m na sua direção dentro do seu alcance toma um ataque grátis e perde 3 m.' },
      {
        nome: 'Técnicas (1 energia cada, necrótico)',
        texto:
          'Várias usam o alcance da Expansão.\n' +
          '1ª Yamizuki – Yoi no Miya — saque rápido, 2d10, Constituição ou perde um membro.\n' +
          '2ª Shuka no Rougetsu — giro de 360°, 2d12.\n' +
          '3ª Enkizuki – Tsugari — duas ondas em cone, 2d6 (Destreza, metade).\n' +
          '5ª Geppaku Saika — vórtex em linha, 2d12.\n' +
          '6ª Tokoyo Kogetsu — luas crescentes em linha, 2d10, Constituição ou deslocamento pela metade.\n' +
          '7ª Yakkyou — três grandes cortes em cone, 2d10.\n' +
          '8ª Getsuryu Rinbi — corte gigante, 2d8, +1d8 em todos os atingidos.\n' +
          '9ª Kudaritsuki — 2d8, Força ou é empurrado 1,5 m para o lado que você quiser.\n' +
          '10ª Senmenzan — vórtex de luas, 2d10, Constituição ou perde um membro.\n' +
          '14ª Kyouhen — linha de 9 m, 2d10 (Destreza, metade).\n' +
          'Especial: Katawarezuki (círculo de 6 m à escolha, 50 necrótico) ou Tsuki no Kamae (raio de 6 m, 60 necrótico e empurra).',
      },
    ],
  },
  {
    titulo: 'Respiração da Pedra',
    intro: 'Robusta como a terra: muita vida, CR fixa alta e uma Kusarigama pesada que bate cada vez mais forte. d12 · Força, depois Constituição · fácil.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 12 + Constituição no 1º nível; depois 1d12 + Constituição.\n' +
          'Proficiências: armas simples, pesadas e únicas; uniformes leves, médios e pesados. Resistência: Força e Constituição. Duas perícias.\n' +
          'Equipamento: Heavy Kusarigama e uniforme pesado.\n' +
          'CD e ataque das técnicas: Força.',
      },
      {
        nome: 'Progressão',
        texto:
          '1º Kusari, Destruidor · 2º Defesa Inabalável, Corpo Fechado · 3º Técnicas, Devastador (única) · 4º Incremento · 5º Ataque Extra, Investida · 6º Ataque de Oportunidade Destruidor · 7º Evolução · 8º Incremento · 9º Guardião Único (única) · 10º Evolução · 11º Evolução Destruidora · 12º Incremento · 13º Evolução · 14º Sentinela (única) · 15º Fúria Indomável · 16º Incremento · 17º Evolução · 18º Corpo Indestrutível · 19º Incremento · 20º Técnica Especial.\n' +
          'Máximo do Destruidor: 2 (1º–4º), 3 (5º–7º), 4 (8º–10º), 5 (11º–13º), 6 (14º–16º), 7 (17º–19º), 8 (20º).',
      },
      { nome: 'Kusari (1º)', texto: 'Kusarigama pesada com uma ponta de concussão e outra cortante: alcance de 4,5 m, dobro de dano em estruturas, e ataque com a outra ponta na ação bônus (no mesmo alvo ou em outro a 4,5 m). Consertar com um ferreiro: 50.000 ienes.' },
      { nome: 'Destruidor (1º)', texto: 'Cada ataque com a Kusari soma +1 de dano a mais que o anterior (+2 a partir do 10º), até o máximo da tabela. Errar todos no turno zera.' },
      { nome: 'Defesa Inabalável (2º)', texto: 'Reação contra ataque corpo a corpo: gasta pontos do Destruidor, cada um reduz 1d6 do dano; o resto zera.' },
      { nome: 'Corpo Fechado (2º)', texto: '+3 PV, e +2 PV a cada nível. CR fixa 18 (20 no 11º, 22 no 18º), que só sobe com o que diz somar em CR fixa.' },
      { nome: 'Devastador — Única (3º)', texto: 'No crítico, Constituição ou o alvo perde um membro. Com o Destruidor no máximo, ação bônus ao acertar: decepar um membro ou zerar o deslocamento (zera o Destruidor). CD 8 + proficiência + Força.' },
      { nome: 'Ataque Extra (5º)', texto: 'Dois ataques (esta classe não chega a três).' },
      { nome: 'Ataque de Oportunidade Destruidor (6º)', texto: 'Reação contra quem sai do alcance: se acertar, Força ou cai. Não para o movimento.' },
      { nome: 'Guardião Único — Única (9º)', texto: 'Aliados a até 4,5 m têm meia cobertura; com o Destruidor no máximo, cobertura total para eles e meia para você.' },
      { nome: 'Evolução Destruidora (11º)', texto: 'Com o Destruidor no máximo, zera para curar o dobro dos pontos (até 30 PV por dia, 60 no 15º). Uma vez por dia (duas no 15º), ação bônus põe o Destruidor no máximo.' },
      { nome: 'Sentinela — Única (14º)', texto: 'Ação bônus ou reação: troca pontos do Destruidor por +1 de CR cada, para quem você quiser na sua cobertura.' },
      { nome: 'Fúria Indomável (15º)', texto: 'Ação bônus, 1 minuto: +2 de dano, imune a medo, resistência a tudo menos psíquico e primordial. Depois: −2 em tudo por 2 minutos.' },
      { nome: 'Corpo Indestrutível (18º)', texto: '+2 Força e Constituição (teto 22), resistência a concussão e +40 PV máximo.' },
      {
        nome: 'Técnicas (1 energia cada)',
        texto:
          '1ª Jamongan Sokyoku — as duas pontas ao mesmo tempo, 2d12 perfurante, Constituição ou deslocamento pela metade.\n' +
          '2ª Tenmen Kudaki — pisão na corrente, 2d6 cortante + 1d6 concussão, Constituição ou perde uma perna.\n' +
          '3ª Ganko no Hadae — reação: reduz 2d10 do dano (corpo a corpo ou à distância).\n' +
          '4ª Ryumongan Sokusei — sequência brutal, 2d12 cortante, Constituição ou perde um braço.\n' +
          '5ª Garin Gyobu — distrai com uma ponta e corta o pescoço com a outra, 2d12, +1 na CD.\n' +
          'Especial: Jishin (tremor num cilindro de 10 m, 7d10 e derruba) ou Miburui (7d12 de concussão na cabeça, +2 na CD do pescoço).',
      },
    ],
  },
  {
    titulo: 'Respiração do Trovão',
    intro: 'Velocidade pura: some da vista e reaparece com o golpe. No 3º nível escolhe entre só a Primeira Forma (letal) ou todas as outras (versátil). d8 · Destreza, depois Sabedoria · médio.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 8 + Constituição no 1º nível; depois 1d8 + Constituição.\n' +
          'Proficiências: armas simples e especiais, uniformes leves e médios. Resistência: Destreza e Sabedoria. Duas perícias.\n' +
          'Equipamento: uma arma simples, uma katana, uniforme leve ou médio.\n' +
          'CD das técnicas: 8 + proficiência + Sabedoria. Ataque: proficiência + Destreza. Dano elétrico.',
      },
      {
        nome: 'Progressão',
        texto:
          '1º Golpe Tempestuoso, Movimento Trovejante · 2º Desviar, Passo Elétrico · 3º Técnicas, Caminho do Trovão (única) · 4º Incremento · 5º Ataque Extra · 6º Ataque de Oportunidade Ágil · 7º Evolução · 8º Incremento · 9º Discharge (única) · 10º Evolução · 11º Ataque Extra (3) · 12º Incremento · 13º Evolução · 14º Kaminari (única) · 15º Golpe Tempestuoso Aprimorado · 16º Incremento · 17º Evolução · 18º Velocidade Absoluta · 19º Incremento · 20º Técnica Especial.',
      },
      { nome: 'Golpe Tempestuoso (1º)', texto: 'Destreza nos ataques corpo a corpo com a Nichirin e nas técnicas de toque; se a arma já é de acuidade, soma ainda metade da Destreza no dano (mínimo 1).' },
      { nome: 'Movimento Trovejante (1º)', texto: '+3 m de deslocamento (+4,5 m no 6º, +6 m no 10º, +7,5 m no 14º, +9 m no 18º). No 9º, anda por paredes e sobre a água durante o turno.' },
      { nome: 'Desviar (2º)', texto: 'Reação: desvantagem num ataque corpo a corpo ou técnica de toque vindo de pelo menos 1,5 m.' },
      { nome: 'Passo Elétrico (2º)', texto: 'Desengajar e Disparada como ação bônus; terreno difícil não custa a mais ao Atacar ou Disparar; em resistência de Destreza, passou = nada, falhou = metade.' },
      {
        nome: 'Caminho do Trovão — Única (3º)',
        texto:
          'Especializado na Primeira Forma: só usa a Primeira Forma e variantes. Ação bônus: +1d6 de dano a cada 3 m em linha reta até o alvo (até 3d6; 1d8 até 4d8 no 12º), proficiência vezes por descanso longo. Andou 6 m em linha reta: vantagem no primeiro ataque ou técnica.\n' +
          'Versado em Todas as Formas: todas menos a Primeira. +1 de CR e +1 no acerto, reação para contra-atacar quem errar você, +1d4 elétrico nos ataques, e uma vez por turno pode "reaparecer" em qualquer ponto que veja, gastando o movimento.',
      },
      { nome: 'Ataque Extra (5º, 11º)', texto: 'Dois ataques; três no 11º.' },
      { nome: 'Ataque de Oportunidade Ágil (6º)', texto: 'Reação quando um inimigo sai ou entra no seu alcance; se acertar, você o segue por até 6 m.' },
      { nome: 'Discharge — Única (9º)', texto: 'Primeira Forma: ação bônus para usar todo o movimento numa técnica em linha reta; em alvo Fragilizado, +2 na CD do pescoço — e no próximo turno você não se move. Todas as Formas: técnica com ação bônus sem o custo da fadiga, proficiência vezes por descanso longo.' },
      { nome: 'Kaminari — Única (14º)', texto: 'Uma vez por turno, o ataque ou técnica vira área de 3 m: o alvo leva tudo, os outros metade. Três vezes, depois descanso curto ou longo.' },
      { nome: 'Golpe Tempestuoso Aprimorado (15º)', texto: 'Soma o dobro da Destreza no dano, e essa parte ignora resistência e imunidade.' },
      { nome: 'Velocidade Absoluta (18º)', texto: 'Destreza máxima 22, testes de velocidade nunca abaixo de 10 no dado, e três vezes por dia passa automaticamente numa resistência de Destreza.' },
      {
        nome: 'Técnicas — Primeira Forma',
        texto:
          'Hekireki Issen — corre em linha reta pelo movimento restante e corta todos no caminho, 2d10; +2 na CD do pescoço de todos os Fragilizados; depois anda mais 3 m.\n' +
          'Rokuren — seis cortes num alvo, 2d12, Sabedoria ou corte profundo; salta mais 3 m ou anula queda de 10 m.\n' +
          'Hachiren — oito cortes, 2d10, Destreza ou perde uma mão.\n' +
          'Shinsoku — 2d12, crítico 18–20, +3 na CD do pescoço; mas custa metade do seu deslocamento até o descanso longo (duas vezes: caído).\n' +
          'Quase todas: ação bônus para crítico 18–20.',
      },
      {
        nome: 'Técnicas — Todas as Formas',
        texto:
          '2ª Inadama — esfera de trovão a 1,5 m, 2d10 (Destreza, metade), depois Constituição ou deslocamento pela metade.\n' +
          '3ª Shiubun Serai — arcos em um alvo, 2d12.\n' +
          '4ª Enrai — raios em cone de 3 m, 2d6 (Destreza, metade), até 12 m.\n' +
          '5ª Retsu Kairai — raio em linha de 9 m, 2d12.\n' +
          '6ª Dengou Raigou — a 4ª concentrada num só, 2d12.\n' +
          'Ação bônus: crítico 19–20.\n' +
          'Especial: Honoikazuchi no Kami (só Primeira Forma: 12 m em linha reta, dragão elétrico, 7d12, +5 na CD, crítico 18–20) ou Raitei no Arashi (só Todas as Formas: tempestade num raio de 9 m, 5d6 por turno, concentração).',
      },
    ],
  },
  {
    titulo: 'Respiração do Som',
    intro: 'Subclasse do Trovão: ouve as vibrações do ar e lê a luta como música. Pede: Trovão como principal, Sentido da Audição, antecedente Ninja, humano. Troca as habilidades de 3º, 9º e 14º; dano cortante e de fogo.',
    verbetes: [
      { nome: 'Arma Ninja (3º)', texto: 'Um ferreiro adapta de graça uma arma dupla e pesada, de duas mãos, 1d12, usando Destreza: ataque extra com ação bônus somando o modificador, e uma vez por turno alcance de 3 m (com 1d6 nesse golpe). Não usa outra arma com ela; nova custa 50.000 ienes.' },
      { nome: 'Arte Shinobi (3º)', texto: 'Sem dano de queda até 9 m, até 4 m do deslocamento como salto, e ao atacar corpo a corpo, ação bônus para bomba de mão num raio de 1,5 m (ou kunais e shurikens nos alvos que escolher).' },
      { nome: 'Partitura Musical — Única (9º)', texto: 'Depois de 1 minuto estudando uma criatura, por 1 minuto: seus atributos igualam os dela (os seus maiores ganham +2, podendo passar de 20), uma ação bônus extra, proficiência no dano, vantagem nas técnicas do Som e nada de exaustão. Ao terminar: seis níveis de exaustão.' },
      { nome: 'Ataque Assassino — Única (14º)', texto: 'O primeiro ataque do combate é sempre crítico — e crítico nele triplica os dados. Com arma cortante, +2 na CD do pescoço de um Fragilizado.' },
      {
        nome: 'Técnicas',
        texto:
          '1ª Todoroki — ataque duplo com onda de impacto, 2d12 cortante, dobro em estruturas.\n' +
          '4ª Kyozan Muken — lâminas e bombas num alvo, 1d12 cortante + 1d6 fogo; como reação, reduz 2d10.\n' +
          '5ª Meigen Sousou — explosões num raio de 3 m, 2d6 cortante + 2d6 fogo (Destreza, metade), depois Constituição ou perde um braço.\n' +
          '5ª Bursting Bloom — só no último ataque do turno: Força ou o alvo sobe 6 m, e as bombas somam 1d10 de fogo.\n' +
          'Especial: A Partitura Está Completa! (3 de energia) — a partitura sai com uma ação só, +4 nos atributos, +2 de CR, imune a efeitos de mobilidade, vantagem contra o alvo, reação extra e o dobro da proficiência no dano.',
      },
    ],
  },
  {
    titulo: 'Respiração do Vento',
    intro: 'Uma das mais agressivas: redemoinhos cortantes, críticos frequentes e técnicas de graça no meio do ataque. d10 · Destreza, depois Constituição · fácil.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 10 + Constituição no 1º nível; depois 1d10 + Constituição.\n' +
          'Proficiências: armas simples, marciais e únicas; uniformes leves e médios. Resistência: Destreza e Constituição. Duas perícias.\n' +
          'Equipamento: uma arma marcial ou única, uma katana, uniforme leve ou médio.\n' +
          'CD e ataque das técnicas: Destreza.',
      },
      {
        nome: 'Progressão',
        texto:
          '1º Fúria, Imparável · 2º Manobras · 3º Técnicas, Kaze (única) · 4º Incremento · 5º Ataque Extra, Defesa Agressiva · 6º Ataque de Oportunidade Certeiro · 7º Evolução · 8º Incremento · 9º Taifu (única) · 10º Evolução · 11º Ataque Extra (3), Dança dos Ventos · 12º Incremento · 13º Evolução · 14º Mestre do Vento (única) · 15º Reflexos Aprimorados · 16º Incremento · 17º Evolução · 18º Crítico Absoluto · 19º Incremento · 20º Técnica Especial.\n' +
          'Fúria (PV por acerto): 2 do 1º ao 5º, 3 do 6º ao 10º, 4 do 11º ao 15º, 5 do 16º ao 19º, 6 no 20º.',
      },
      { nome: 'Fúria (1º)', texto: 'Cada ataque que acerta cura os PV da coluna Fúria; no crítico, o dobro.' },
      { nome: 'Imparável (1º)', texto: 'Crítico com 19–20 em ataques e técnicas (18–20 no 15º).' },
      { nome: 'Manobras (2º)', texto: 'Proficiência em todos os testes de Destreza, e +3 m no salto, mesmo sem corrida.' },
      { nome: 'Kaze — Única (3º)', texto: 'A cada ataque, role 1d6 e vá somando; ao chegar a 10, solta uma técnica do Vento (até a 1ª evolução) de graça, sem ação, e a soma recomeça. O dado vira d8 no 10º e d10 no 15º. Crítico corpo a corpo com a Nichirin também solta uma técnica grátis (até a 2ª evolução a partir do 15º).' },
      { nome: 'Ataque Extra (5º, 11º)', texto: 'Dois ataques; três no 11º.' },
      { nome: 'Defesa Agressiva (5º)', texto: 'Reação e 1 de energia contra um ataque corpo a corpo que você vê: + metade da proficiência de CR (+1 a mais no 10º, +2 no 15º).' },
      { nome: 'Ataque de Oportunidade Certeiro (6º)', texto: 'Reação contra quem sai do alcance: uma técnica sem evolução, que ainda para o movimento dele.' },
      { nome: 'Taifu — Única (9º)', texto: 'Ação bônus para reforçar a próxima técnica de um aliado a até 4,5 m: vantagem no acerto e mais uma de: +2 dados de dano, +6 m de alcance, +3 m de deslocamento depois, ou dano com vantagem.' },
      { nome: 'Dança dos Ventos (11º)', texto: 'Reação ao ser atacado corpo a corpo: recua o seu deslocamento e recupera 2 de energia. Uma vez por dia (duas no 15º).' },
      { nome: 'Mestre do Vento — Única (14º)', texto: 'Imune a empurrões e quedas forçadas; ao acertar uma técnica, aparece ao lado do alvo.' },
      { nome: 'Reflexos Aprimorados (15º)', texto: 'Vantagem em resistência de Destreza contra armadilhas, áreas e reflexos.' },
      { nome: 'Crítico Absoluto (18º)', texto: 'No crítico, role 1d6 para o corte (Destreza para evitar, CD das técnicas): 1 corte profundo · 2 mão · 3 braço · 4 perna · 5 corpo ao meio · 6 cabeça. Não funciona em ND 15+; se o 6 não puder decapitar, escolha de 1 a 4 e o alvo falha automaticamente.' },
      {
        nome: 'Técnicas (1 energia cada)',
        texto:
          '1ª Jin Senpuu — espiral cortante em linha de 9 m, 2d10 perfurante, Força ou é empurrado.\n' +
          '2ª Shinato Kaze — corte com quatro garras de vento, 2d12, Destreza ou perde a mão.\n' +
          '3ª Seiran Fuju — reação: reduz o dano corpo a corpo (2d10).\n' +
          '4ª Shoujou Sajinran — golpes diagonais, 2d12; como reação, solta você de um agarrão.\n' +
          '5ª Kogarashi Oroshi — caindo de um salto, espirais num raio de 3 m, 2d6 (Destreza, metade), até 15 m.\n' +
          '6ª Kokufuu Enran — corte em tornado, 2d12, Destreza ou perde a perna.\n' +
          '7ª Tengu Kaze — salto de +4 m, 2d12, dobro em estruturas, sem dano de queda.\n' +
          '8ª Rekkaza Kiri — turbilhão, +6 m e termina atrás do alvo, 2d12, Constituição ou corte profundo.\n' +
          '9ª Idaten Taifuu — salta 6 m e perfura uma linha de 9 m, 2d10 (Destreza, metade).\n' +
          'Especial: Storm (cilindro de 18 m nos pescoços, 7d10), Fuijin (salto de 18 m e lança de vento, 7d12), Seiran Fuijin (reação, reduz 6d12 e pode cortar as duas pernas) ou Hasagi (furacão, 7d10).',
      },
    ],
  },
  {
    titulo: 'Respiração da Névoa',
    intro: 'Subclasse do Vento: acelera e desacelera para enganar o inimigo. Pede: Vento como principal e arma de acuidade. Troca as habilidades de 3º, 9º e 14º; dano cortante.',
    verbetes: [
      {
        nome: 'Mist — Única (3º)',
        texto:
          'No começo de cada turno, escolha a postura (e troque também ao fazer um crítico):\n' +
          '• Velocidade: +4,5 m sem ataque de oportunidade (6 m se veio de um crítico); ação bônus dá +1 dado na primeira técnica (2 no 12º, 3 no 20º) — vindo de crítico, sem ação bônus e ignorando resistência.\n' +
          '• Desaceleração: ação bônus para se esconder na névoa (vindo de crítico, esconde garantido e grátis); o primeiro ataque escondido tem vantagem; +1 de CR (+2 no 12º).',
      },
      { nome: 'Tensai — Única (9º)', texto: 'Troca para Velocidade com ação bônus e para Desaceleração com reação.' },
      { nome: 'Gekisen — Única (14º)', texto: 'Cada crítico no seu turno dá um ataque a mais no Ataque Extra.' },
      {
        nome: 'Técnicas',
        texto:
          '1ª Suiten Togasumi — estocada com +1,5 m de alcance, 2d12; termina em Velocidade.\n' +
          '2ª Kyozan Muken — golpes rapidíssimos, 2d10. Em Velocidade, passa metade do dano a outro alvo; em Desaceleração, dobro em estruturas e, como reação, solta de agarrão.\n' +
          '3ª Kasan no Shibuki — reação: reduz 2d12 do dano com névoa.\n' +
          '4ª Iryuukiri — saque (só em Velocidade), 2d12, Constituição ou perde um braço; como primeira ação da luta, +5 no acerto e rola o dano duas vezes.\n' +
          '5ª Kaun no Umi — só em Velocidade: +3 m e golpes, 2d10; se o alvo reagir, o dano vira crítico. Termina em Desaceleração.\n' +
          '6ª Tsuki no Kashou — só em Desaceleração: salto de 3 m, 2d12; como reação, anula queda de 6 m.\n' +
          'Especial: Oboro — névoa de 6 m por 1 minuto: terreno difícil, −5 e desvantagem na Percepção dos outros, as duas posturas juntas e um golpe final de 6d12 (+3 na CD do pescoço).',
      },
    ],
  },
  {
    titulo: 'Classes de Kekkijutsu',
    intro: 'Para demônios que romperam com o progenitor e ajudam na caça — sem comer carne humana, então com poderes limitados. A exceção é o Kekkijutsu Especial, de humanos que comem demônios. Todas são difíceis e pedem leitura com calma.',
    verbetes: [
      {
        nome: 'As cinco',
        texto:
          'Especial · d12 · Força e Sabedoria — humano (raça Especial) com arma e arma de fogo, que copia Kekkijutsu.\n' +
          'Gen · d6 · Destreza e Inteligência — fios cortantes à distância, e controle de criaturas.\n' +
          'Kamakiri · d10 · Destreza e Sabedoria — foices de sangue, corpo a corpo.\n' +
          'Oiran · d8 · Destreza e Carisma — disfarce humano e faixas de sangue.\n' +
          'Sozo · d8 · Constituição e Inteligência — para criar o seu próprio Kekkijutsu.',
      },
      {
        nome: 'Únicos e escolhidos',
        texto: 'Os Kekkijutsu "Únicos" da sua classe vêm de graça conforme os espaços chegam. Os outros você escolhe na lista (capítulo Kekkijutsu), só nas categorias que a sua classe permite.',
      },
      {
        nome: 'Classificação',
        texto: 'Combate (corpo a corpo, até o 6º nível) ou Conjuração (à distância, até o 9º). Elementos: ácido, elétrico, fogo, frio, necrótico, trovejante, veneno e vento — mais os de cura, psíquico e primordial. Algumas classes misturam dois ou três elementos num Kekkijutsu.',
      },
    ],
  },
  {
    titulo: 'Kekkijutsu Especial',
    intro: 'Humano da raça Especial que não domina a respiração e luta com uma arma simples numa mão e uma arma de fogo na outra, comendo demônios para copiar os poderes deles. d12.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'Requisito: raça Especial. PV: 12 + Constituição no 1º nível; depois 1d12 + Constituição.\n' +
          'Proficiências: armas de fogo, simples e especiais; uniformes médios e pesados. Resistência: Força e Sabedoria. Duas perícias.\n' +
          'Equipamento: uma arma simples, uma arma de fogo, uniforme médio ou pesado.\n' +
          'CD dos Kekkijutsu: 8 + proficiência + Sabedoria; ataque: proficiência + Sabedoria. Espaços do 1º ao 6º círculo, a partir do 3º nível.',
      },
      {
        nome: 'Progressão',
        texto: '1º Arma Dupla, Especialização · 2º Balas de Nichirin, Dualidade Mortal · 3º Kekkijutsu Mimetismo (única) · 4º Incremento · 5º Ataque Extra · 6º Ataque de Oportunidade Mortal · 7º Infalível · 8º Incremento · 9º Ação Sombria (única) · 10º Características Demoníacas · 11º Ataque Extra (3) · 12º Incremento · 13º Atletismo Demoníaco, Infalível (2) · 14º Infusão Elemental (única) · 15º Ação Sombria (2) · 16º Incremento · 17º Infalível (3) · 18º Características Demoníacas (2) · 19º Incremento · 20º Kekkijutsu Especial.',
      },
      { nome: 'Arma Dupla (1º)', texto: 'Arma de fogo de uma mão e arma simples: atacou com uma, ataca com a outra na ação bônus. Arma de fogo de duas mãos numa mão só, sem desvantagem. Crítico 19–20. Crítico corpo a corpo num demônio a 1,5 m arranca carne dele.' },
      {
        nome: 'Especialização (1º)',
        texto:
          'Sem respirações. Comer carne de demônio vira ação bônus e a forma dura 2 minutos, mais forte conforme o ND:\n' +
          'ND 1–5: regenera 2d4, Destreza +1 · 6–10: 2d8, Força +3, Destreza +2 · 11–15: 3d10, +3/+3 · 16–20: 4d12, +4/+3 · 21–25: 5d12, +4/+4 · 26–30: 6d12, +5/+5. Força e Destreza podem chegar a 30.',
      },
      { nome: 'Balas de Nichirin (2º)', texto: 'Fabrica munição que decepa demônios: 2.000 ienes por bala, preparada em descanso longo.' },
      { nome: 'Dualidade Mortal (2º)', texto: 'Com as duas armas, o ataque da ação bônus soma o modificador, e pode usar Força em todos os ataques com elas.' },
      {
        nome: 'Kekkijutsu Mimetismo — Única (3º)',
        texto:
          'Comendo um demônio com Kekkijutsu, você copia o poder dele — tipo de dano e condição — enquanto durar a forma. Cada conjuração gasta um espaço e um turno da transformação; os espaços só voltam no descanso longo.\n' +
          'Formas: Chi (1d10, sobe no 5º/11º/17º) · Dano (2d10, +1d10 por círculo) · Concentração (o bônus do original por até 1 minuto) · Condição (a condição do original, com 1d6–1d10 de dano conforme ela) · Dano em Área (2d6 em 3 m, +2d6 e +3 m por círculo) · Defesa (reação: +2 de CR e resistência ao elemento do demônio).\n' +
          'Nada de ação bônus nem livre; copiar dano primordial fere você também; e o mestre precisa ter revelado o poder.',
      },
      { nome: 'Ataque Extra (5º, 11º)', texto: 'Dois ataques; três no 11º.' },
      { nome: 'Ataque de Oportunidade Mortal (6º)', texto: 'Reação contra quem sai do alcance: ataque corpo a corpo ou com a arma de fogo.' },
      { nome: 'Infalível (7º)', texto: 'Na forma demoníaca, refaz uma resistência que falhou. Uma vez por descanso longo; duas no 13º, três no 17º.' },
      { nome: 'Ação Sombria — Única (9º)', texto: 'Conjurou um Kekkijutsu com a ação: ataque com arma na ação bônus (dois no 15º).' },
      { nome: 'Características Demoníacas (10º)', texto: 'Ao consumir um demônio, ganha uma habilidade da ficha dele à escolha do mestre (duas no 18º, e passa a ouvir os comandos do demônio primordial).' },
      { nome: 'Atletismo Demoníaco (13º)', texto: 'Na forma demoníaca, + metade da proficiência em testes e resistências de For, Des e Con em que não é proficiente, e salto longo maior.' },
      { nome: 'Infusão Elemental — Única (14º)', texto: 'As armas pegam o elemento do Kekkijutsu em uso, ignorando resistência e imunidade, e o alvo atingido tem desvantagem na próxima resistência contra você.' },
      { nome: 'Kekkijutsu Especial (20º)', texto: 'Ao consumir um demônio, cria com o mestre Kekkijutsu próprios que ficam com você nas próximas transformações.' },
    ],
  },
  {
    titulo: 'Kekkijutsu Gen',
    intro: 'Fios de carne, finos e afiados, manipulados como um mestre de marionetes. Conjuração, fogo. d6 · Destreza e Inteligência.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 6 + Constituição no 1º nível; depois 1d6 + Constituição.\n' +
          'Proficiências: armas simples. Resistência: Destreza e Inteligência. Duas perícias. Equipamento: um bordão.\n' +
          'CD: 8 + proficiência + Inteligência; ataque: proficiência + Inteligência. Kekkijutsu escolhidos: Inteligência + nível (mínimo 1), da lista de Conjuração de Fogo; dois Chi de fogo (até 4). Espaços até o 9º círculo.',
      },
      {
        nome: 'Progressão',
        texto: '1º Kekkijutsu Gen (única), Defesa Demoníaca · 2º Kekkijutsu Especializado · 3º Criar Fios (única) · 4º Incremento · 6º Marionete (única) · 8º Incremento · 10º Especializado (2) · 12º Incremento · 14º Teatro Mortal (única) · 16º Incremento · 17º Especializado (3) · 18º Sangue Potencializado (única) · 19º Incremento · 20º Kekkijutsu Definitivo.',
      },
      { nome: 'Defesa Demoníaca (1º)', texto: 'Sem uniforme: CR = 10 + Destreza + Constituição.' },
      { nome: 'Kekkijutsu Especializado (2º)', texto: 'Dois Kekkijutsu de 1º nível (podem ser únicos) uma vez por dia sem espaço e com um dado a mais. No 10º, mais dois até o 5º nível; no 17º, mais um até o 8º.' },
      {
        nome: 'Criar Fios — Única (3º)',
        texto:
          'Ação bônus: fios quase invisíveis (Percepção CD 13) até 9 m, até o seu próximo turno. Com eles:\n' +
          'ação — ataque de 1d6 + Inteligência cortante; puxar objeto de até 10 kg; marcar uma criatura e saber onde ela está por 1 hora (até 1 km);\n' +
          'reação — você ou aliado a 9 m ganha resistência ao dano que está levando (Inteligência vezes por descanso longo);\n' +
          'livre — lança fios e anda por eles, até em pontos altos, sem custo de escalada.',
      },
      { nome: 'Marionete — Única (6º)', texto: 'Acerta um ataque de fios a até 9 m e o alvo faz Sabedoria: falhou, fica sob o seu controle por 1 minuto (até sofrer dano ou passar no teste). Com ação bônus você o move e ataca com os números dele. Concentração. Inteligência vezes por descanso longo.' },
      { nome: 'Teatro Mortal — Única (14º)', texto: 'Um ataque atinge o dobro da sua Inteligência em criaturas, e todas podem virar marionetes, controladas juntas com uma ação. CD soma o dobro do modificador.' },
      { nome: 'Sangue Potencializado — Única (18º)', texto: 'Os Kekkijutsu únicos ignoram resistência e até imunidade.' },
      { nome: 'Kekkijutsu Definitivo (20º)', texto: 'Especializados com vantagem no ataque e desvantagem nas resistências do alvo; ao conjurá-los, escudo elemental de 40 + 2 × Inteligência PV, transferível a um aliado com a reação. Duas vezes por dia.' },
      {
        nome: 'Kekkijutsu únicos',
        texto:
          'Chi: Goshikito — fios a 18 m, 1d12 cortante (sobe no 5º/11º/17º).\n' +
          '1º: Fio Perfurante Enredante (2d12 perfurante) · Fios da Fortuna (ação bônus: até três aliados somam 1d4 em ataques e resistências).\n' +
          '2º: Vínculo Eterno (liga-se a um aliado e se teleporta até ele; Ajudar como ação bônus) · Emaranhado Ígneo (área de 3 m, 3d6 fogo e prende).\n' +
          '3º: Teia Entrelaçante (6 m por 1 minuto, 5d6 cortante e Impedido) · Ataduras da Alma (4d8 fogo, deslocamento pela metade, +2d8 por ação bônus).\n' +
          '4º: Executar (com Marionete: 4d12 e pode arrancar os braços — ou cortar ao meio) · Marionete de Defesa (reação: a marionete leva o ataque por você).\n' +
          '5º: Kokushiro (teia vermelha, 5d12, pode arrancar a perna) · Amplificação de Kekkijutsu (+1 dado nos únicos).\n' +
          '6º: Ayame Kago (gaiola, 6d8 fogo + 3d6 perfurante e Impedido) · Teia do Destino (reação: troca o d20 de até três criaturas pelo seu).\n' +
          '7º: Kokushi Rinten (5d12 perfurante + 2d12 fogo) · Trançar Destinos (quatro aliados dividem o dano).\n' +
          '8º: Labirinto Flamejante (cubo de 30 m, 5d10 por turno para quem se perde).\n' +
          '9º: Lacerar com Chamas Ígneas (até oito criaturas presas, 8d10 fogo por turno).',
      },
    ],
  },
  {
    titulo: 'Kekkijutsu Kamakiri',
    intro: 'Um par de foices negras de sangue que envenenam e desaceleram a cada golpe: combate corpo a corpo, veneno. d10 · Destreza e Sabedoria.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 10 + Constituição no 1º nível; depois 1d10 + Constituição.\n' +
          'Proficiências: armas simples. Resistência: Destreza e Sabedoria. Duas perícias. Equipamento: uma arma simples.\n' +
          'CD: 8 + proficiência + Sabedoria; ataque: proficiência + Sabedoria. Kekkijutsu escolhidos: metade da Sabedoria + nível (mínimo 1), da lista de Conjuração de Veneno. Espaços até o 6º círculo.',
      },
      {
        nome: 'Progressão',
        texto: '1º Kamachi, Kekkijutsu Kamakiri (única) · 2º Dokujin, Defesa Demoníaca · 3º Dokusatsu (única) · 4º Incremento · 5º Ataque Extra · 6º Ataque de Oportunidade Debilitante · 7º Ataque Contínuo · 8º Incremento · 9º Foice Dilacerante (única) · 10º Intuição Tática · 11º Ataque Extra (3) · 12º Incremento · 13º Caçador · 14º Chokkan (única) · 15º Teiko · 16º Incremento · 17º Dokujin Aprimorado · 18º Ataque Contínuo (2) · 19º Incremento · 20º Veneno Mortal.',
      },
      { nome: 'Kamachi (1º)', texto: 'Duas foices de sangue, invocadas no início da luta (ou com ação bônus se quebrarem): 1d6 de veneno ou corte, com Destreza, e a segunda ataca na ação bônus somando o modificador. Com uma ação, arremessa a 9 m por 1d12 de veneno, e elas voltam.' },
      { nome: 'Dokujin (2º)', texto: 'Acertou com a foice: gasta um espaço para +2d8 de veneno (+1d8 por círculo acima, até 7d8; d10 a partir do 17º).' },
      { nome: 'Defesa Demoníaca (2º)', texto: 'Sem armadura: CR = 10 + Destreza + Constituição.' },
      { nome: 'Dokusatsu — Única (3º)', texto: 'Cada acerto com as foices tira 1,5 m do deslocamento do alvo (3 m no crítico) — a menos que ele reduza o dano com uma reação.' },
      { nome: 'Ataque Extra (5º, 11º)', texto: 'Dois ataques; três no 11º.' },
      { nome: 'Ataque de Oportunidade Debilitante (6º)', texto: 'Reação contra quem sai do alcance: para o movimento e corta o deslocamento dele pela metade.' },
      { nome: 'Ataque Contínuo (7º)', texto: 'Depois de um Kekkijutsu de dano com a ação, um ataque corpo a corpo na ação bônus no mesmo alvo (dois no 18º).' },
      { nome: 'Foice Dilacerante — Única (9º)', texto: 'Crítico com as foices: +1d10 e corte profundo, que acumula −1 de CR a cada novo crítico enquanto não for curado.' },
      { nome: 'Intuição Tática (10º)', texto: 'Vantagem nas resistências contra ataques em área que você vê.' },
      { nome: 'Caçador (13º)', texto: 'Não ver o alvo não dá desvantagem.' },
      { nome: 'Chokkan — Única (14º)', texto: 'Vantagem na iniciativa, e age normalmente mesmo surpreendido.' },
      { nome: 'Teiko (15º)', texto: 'Dois inimigos flanqueando não ganham vantagem (três ou mais, sim).' },
      { nome: 'Veneno Mortal (20º)', texto: 'Humano ferido pelas foices fica paralisado em 3 minutos e morre 1 minuto depois, sem antídoto. Em demônios, +1d10 de veneno a partir do segundo golpe.' },
      {
        nome: 'Kekkijutsu únicos',
        texto:
          '1º Tobi Chigamo — lâminas de sangue a 9 m, 2d10 + Sab de veneno, Constituição ou perde um membro.\n' +
          '2º Batsuko Chiyou Ryou — lâminas girando em volta (1d12 em quem está a 1,5 m), soltas depois num raio de 3 m por 3d12 + Sab.\n' +
          '3º Chigamo Rangeki — cortes e golpe em X, 4d12 + Sab; crítico ataca um segundo alvo.\n' +
          '4º Chigamo Giri — +3 m e sequência, 5d12 + Sab, corte profundo.\n' +
          '5º Tobi Chigamo Kyoku — X de sangue em linha de 12 m, 5d10 (Constituição, metade); falha crítica corrói 1d10 por turno.\n' +
          '6º Enzan Senkai Tobi Chigamo — onda de lâminas num raio de 9 m, 8d10 + Sab (Destreza, metade), e quem falha pode ficar paralisado; também como reação, até sendo decapitado.',
      },
    ],
  },
  {
    titulo: 'Kekkijutsu Oiran',
    intro: 'Faixas de obi feitas de sangue, macias como seda e afiadas como lâmina, usadas como membros extras — e um disfarce humano perfeito. Conjuração, um elemento à escolha. d8 · Destreza e Carisma.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 8 + Constituição no 1º nível; depois 1d8 + Constituição.\n' +
          'Proficiências: armas simples. Resistência: Destreza e Carisma. Duas perícias. Equipamento: uma arma simples.\n' +
          'CD: 8 + proficiência + Carisma; ataque: proficiência + Carisma. Kekkijutsu escolhidos de um elemento da lista de Conjuração. Espaços até o 6º círculo.',
      },
      {
        nome: 'Progressão',
        texto: '1º Obi, Kekkijutsu Oiran (única) · 2º Defesa Demoníaca, Shibari · 3º Ketsugiri (única) · 4º Incremento · 5º Ataque Extra · 6º Alteração Corporal Aprimorada · 7º Controle Multifuncional · 8º Incremento · 9º Cobertura das Faixas (única) · 10º Faixas Destruidoras · 11º Ataque Extra (3) · 12º Incremento · 13º Mimizu Obi · 14º Aprimorar (única) · 15º Execução Dupla · 16º Incremento · 17º Tenshinki Henge · 18º Ataque Extra (4) · 19º Incremento · 20º Fortaleza das Faixas.',
      },
      { nome: 'Obi (1º)', texto: 'Quatro faixas: ataques corpo a corpo a 4,5 m por 1d10 cortante, e reação para ter resistência a um golpe cortante ou de concussão (mesmo que ignore resistência). Somem fora do combate e se regeneram.' },
      { nome: 'Shibari (2º)', texto: 'Guarda nas faixas até quatro objetos, ou uma criatura média que aceite (inconsciente enquanto presa, por até 1 hora). A faixa tem 10 PV e CR 15.' },
      { nome: 'Ketsugiri — Única (3º)', texto: 'Crítico com 19–20; todo crítico pede Constituição ou o alvo perde um membro.' },
      { nome: 'Ataque Extra (5º, 11º, 18º)', texto: 'Dois ataques; três no 11º; quatro no 18º.' },
      { nome: 'Alteração Corporal Aprimorada (6º)', texto: 'Ganha Alteração Corporal e, em forma humana, fica imperceptível até para sentidos extrassensoriais de ND 18 ou menos.' },
      { nome: 'Controle Multifuncional (7º)', texto: 'Cada faixa faz uma ação separada (Ajudar, Agarrar, Usar um Objeto), pagando com a ação bônus ou um dos ataques extras.' },
      { nome: 'Cobertura das Faixas — Única (9º)', texto: 'Meia cobertura o combate todo; ao se defender com a reação do Obi, cobertura total até o seu próximo turno.' },
      { nome: 'Faixas Destruidoras (10º)', texto: 'Ação: todas as faixas num ataque perfurante com vantagem, alcance 6 m, +1d12 por ataque que você teria, dobro em estruturas.' },
      { nome: 'Mimizu Obi (13º)', texto: 'Faixas vivas vigias (10 PV, CR 15) que patrulham 18 m e avisam por telepatia. Metade do Carisma por dia.' },
      { nome: 'Aprimorar — Única (14º)', texto: 'Crítico corpo a corpo com 18–20, e com os Kekkijutsu únicos com 19–20.' },
      { nome: 'Execução Dupla (15º)', texto: 'Um segundo Kekkijutsu no turno, saindo de uma faixa (os de ação viram ação bônus). Duas vezes por dia.' },
      { nome: 'Tenshinki Henge (17º)', texto: 'Uma vez por dia, 1 minuto de forma demoníaca: +1d10 cortante nos ataques e um dado a mais nos Kekkijutsu.' },
      { nome: 'Fortaleza das Faixas (20º)', texto: 'Cobertura total ao entrar em combate, e a reação do Obi soma metade da proficiência à CR.' },
      {
        nome: 'Kekkijutsu únicos',
        texto:
          '1º Tsurane Obi — três faixas numa ilusão, com vantagem, 2d10 + Car cortante.\n' +
          '2º Hashiri Obi — desliza até as costas do alvo sem ataque de oportunidade, 3d10 + Car, Constituição ou perde um membro.\n' +
          '3º Sashi Obi — salto de 6 m e chuva de faixas numa esfera de 6 m, 4d10 perfurante (Destreza, metade).\n' +
          '4º Tachi Obi — 2d12 cortante + 2d12 perfurante + Car, e −3 m de deslocamento.\n' +
          '5º Yae Obigiri — faixas entrelaçadas, vantagem e +2 no acerto, 6d12 + Car.\n' +
          '6º Yae Obigiri – Kaijin — com vantagem, 7d12 + Car, Constituição ou perde um membro.',
      },
    ],
  },
  {
    titulo: 'Kekkijutsu Sozo',
    intro: 'A classe para criar o seu próprio Kekkijutsu com o mestre — ou tornar únicos os que já existem. Um elemento à escolha. d8 · Constituição e Inteligência.',
    verbetes: [
      {
        nome: 'Básico',
        texto:
          'PV: 8 + Constituição no 1º nível; depois 1d8 + Constituição.\n' +
          'Proficiências: armas simples. Resistência: Constituição e Inteligência. Duas perícias. Equipamento: um bordão.\n' +
          'CD: 8 + proficiência + Inteligência; ataque: proficiência + Inteligência. Kekkijutsu escolhidos: Inteligência + nível (mínimo 1), de um elemento; dois Chi (até 4). Espaços até o 9º círculo.',
      },
      {
        nome: 'Progressão',
        texto: '1º Kekkijutsu (única), Sozo · 2º Defesa Demoníaca, Proteção Elemental · 3º Criação Sozo · 4º Incremento · 6º Criação Sozo · 8º Incremento · 10º Restauração de Sangue · 12º Incremento · 14º Criação Sozo · 16º Incremento · 17º Restauração de Sangue (2) · 18º Criação Sozo · 19º Incremento · 20º Fúria Elemental.',
      },
      { nome: 'Sozo (1º)', texto: 'Cria Kekkijutsu únicos com o mestre (pelas tabelas de dano e alcance do capítulo de criação), ou pega um de cada círculo da lista e o torna único, com um efeito ou dano a mais. Os únicos não contam na sua lista.' },
      { nome: 'Defesa Demoníaca (2º)', texto: 'Sem uniforme: CR = 10 + Destreza + Constituição.' },
      { nome: 'Proteção Elemental (2º)', texto: 'Num Kekkijutsu de área, 1 + Inteligência criaturas à sua escolha não levam dano e passam na resistência.' },
      {
        nome: 'Criação Sozo (3º, 6º, 14º, 18º)',
        texto:
          'Uma habilidade própria, criada com o mestre, que expresse o seu Kekkijutsu. Ou as prontas:\n' +
          '3º Chi Devastador — quem passa na resistência contra seu Chi ainda leva metade, e você soma a Inteligência.\n' +
          '6º Kekkijutsu Poderoso — soma a Inteligência ao dano; crítico dá um dado a mais e vantagem na próxima conjuração.\n' +
          '14º Sobrecarregando — Kekkijutsu de até 4º nível com dano máximo, metade da proficiência vezes por descanso.\n' +
          '18º Transmutar — ação bônus: troca o elemento do Kekkijutsu à vontade (menos Chi).',
      },
      { nome: 'Restauração de Sangue (10º)', texto: 'Três Chi em turnos diferentes recuperam um espaço de até 3º círculo (dois Chi no 17º). Ou uma ação completa para recuperar um, Inteligência vezes.' },
      { nome: 'Fúria Elemental (20º)', texto: 'Acertou um Kekkijutsu de dano: Chi de ação bônus no mesmo alvo. Inteligência vezes por descanso curto ou longo.' },
    ],
  },
  {
    titulo: 'Lista de Kekkijutsu',
    intro: 'Oito elementos. Cada classe só escolhe nos elementos e no tipo (Combate ou Conjuração) que ela permite. Aqui vão círculo, alcance, teste ou ataque e dano base; o efeito completo e o que muda em círculos maiores estão no livro.',
    verbetes: [
      {
        nome: 'Ácido — corrói, com muito dano em área ou num alvo só',
        texto:
          'Chi: Esfera Ácida (18 m, ataque, 1d6 ácido) · Spray Ácido (4,5 m, cone de 4,5 m, Destreza, 1d4 ácido) · Toque Ácido Leve (toque, 1d10 ácido) · Língua de Ácido (9 m) · Toque Ácido Leve (9 m, Destreza, 1d4 ácido)\n' +
          '1º: Toque Ácido (toque, Constituição, 1d8 ácido) · Névoa Ácida (9 m, 1d6 ácido, conc.) · Projétil Ácido (18 m, ataque, 2d6 ácido) · Escudo Ácido (18 m, ataque, 1d4 ácido, conc.) · Chuva Ácida (36 m, Destreza, 2d6 ácido)\n' +
          '2º: Ácido Voraz (18 m, ataque, 4d6 ácido) · Lâmina Ácida (pessoal, conc.) · Emissário do Ácido (pessoal, ação bônus, 2d6 ácido, conc.) · Dissolver (18 m, Destreza, 2d6 ácido) · Vórtice Ácido (18 m, esfera de 3 m, 3d8 ácido)\n' +
          '3º: Chuva Ácida Prolongada (36 m, 3d6 ácido, conc.) · Pulso Ácido (9 m, linha de 9 m, Destreza, 5d6 ácido) · Turbilhão Ácido (36 m, esfera de 6 m, Força, 3d6 ácido) · Ácido Profundo (pessoal, 3d6 ácido, conc.) · Explosão Ácida (36 m, Constituição, 6d6 ácido)\n' +
          '4º: Ácido Devorador (27 m, raio de 4,5 m, 8d6 ácido, conc.) · Inundação Ácida (18 m, Destreza) · Erosão do Caos Ácido (36 m, linha de 18 m, Constituição, 4d8 ácido, conc.) · Ácido Devorador (pessoal, conc.) · Ácido Instável (18 m, esfera de 4,5 m, Destreza, 5d8 ácido)\n' +
          '5º: Ferrão Ácido (toque, ataque, 5d6 ácido) · Destruição Ácida (36 m, 8d6 ácido) · Muralha Ácida (30 m, 6d10 ácido, conc.) · Aura Ácida (1,5 m, 6d6 ácido, conc.) · Resonância Ácida (4,5 m, raio de 4,5 m, Constituição, 8d6 ácido)\n' +
          '6º: Abismo Ácido (18 m, linha de 18 m, Destreza, 10d8 ácido) · Erupção Ácida (36 m, Constituição, 10d6 ácido) · Prisão Ácida (toque, Força, 8d6 ácido) · Símbolo Ácido (toque, raio de 6 m, 6d10 ácido)\n' +
          '7º: Drenar Essência Ácida (36 m, Constituição, 12d6 ácido) · Serpente Ácida (45 m, 8d10 ácido, conc.) · Neblina Corrosiva (36 m, 9d6 ácido, conc.) · Barreira Ácida Intransponível (pessoal, reação, Constituição, 10d6 ácido)\n' +
          '8º: Feixe Ácido (18 m, linha de 3 m, 0d10 ácido) · Cristalização Ácida (36 m, Constituição) · Proteção Ácida (pessoal, conc.)\n' +
          '9º: Tsunami Ácido (36 m, Constituição, 20d6 ácido) · Dissolução Total (36 m, Constituição, 12d10 ácido)',
      },
      {
        nome: 'Elétrico — dano em vários ou num só, e reforço de mobilidade, precisão e defesa dos aliados',
        texto:
          'Chi: Faísca (18 m, ataque, 1d6 elétrico) · Toque de Choque (toque, ataque, 1d8 elétrico) · Centelha Estática (9 m, raio de 3 m, 1d4 elétrico, conc.) · Aura de Estática (pessoal, ataque, 1d4 elétrico) · Emissão Elétrica (9 m, linha de 9 m, Destreza, 1d6 elétrico)\n' +
          '1º: Presa Elétrica (toque, ação bônus, ataque) · Raio Elétrico (18 m, Destreza, 2d8 elétrico) · Barreira Elétrica (9 m, 1d6 elétrico, conc.) · Campo Elétrico (3 m, raio de 3 m, Destreza, 1d8 elétrico, conc.) · Toque Estático (toque, Constituição, 1d6 elétrico)\n' +
          '2º: Relampago Sibilante (36 m, Destreza, 4d6 elétrico) · Corrente de Choque (9 m, ataque, 2d8 elétrico, conc.) · Caminho Elétrico (9 m, linha de 9 m, 2d6 elétrico) · Resistência do Trovão (toque, conc.) · Estrondo Trovejante (18 m, esfera de 4,5 m, Constituição, 3d6 elétrico, conc.)\n' +
          '3º: Explosão Elétrica em Área (18 m, Constituição, 6d6 elétrico) · Relâmpago Fulgurante (36 m, Constituição, 4d8 elétrico) · Tempestade Estática (18 m, Constituição, 3d8 elétrico, conc.) · Benção do Relâmpago (toque, ataque, 1d6 elétrico, conc.) · Explosão Estática (18 m, Constituição, 2d6 elétrico)\n' +
          '4º: Tempestade Fulminante (36 m, raio de 3 m, Destreza, 6d10 elétrico) · Energia Estática (toque, raio de 3 m, ataque, 2d8 elétrico, conc.) · Campo Eletromagnético (9 m, 2d8 elétrico, conc.) · Spark (45 m, ataque, 5d6 elétrico) · Tormenta Elétrica (36 m, Constituição, conc.)\n' +
          '5º: Raio Vitalício (36 m, Constituição, 8d8 elétrico) · Tempestade Elétrica Iônica (45 m, Constituição, 6d8 elétrico, conc.) · Cadeia Temporal Elétrica (45 m, Intelig, 10d6 elétrico) · Orbe Elétrico Sincrônico (45 m, Constituição, 4d8 elétrico, conc.) · Estrondo Elétrico (12 m, Constituição, 8d6 elétrico)\n' +
          '6º: Carga Estática da Mente (18 m, Sabedoria, 10d6 elétrico, conc.) · Tempestade do Relâmpago Eterno (36 m, Constituição, 8d10 elétrico, conc.) · Fusão Elétrica (45 m, raio de 6 m, Constituição, 9d8 elétrico) · Explosão Elétrica Dimensional (36 m, Constituição, 10d6 elétrico)\n' +
          '7º: Furacão de Raios (45 m, raio de 9 m, Força, 10d8 elétrico, conc.) · Relâmpago Celestial (45 m, Destreza, 10d10 elétrico) · Cascata de Raios (45 m, Constituição, 8d8 elétrico) · Transmutação Elétrico (toque, 6d10 elétrico, conc.)\n' +
          '8º: Supernova Elétrica (45 m, Destreza, 2d8 elétrico) · Vórtice da Tormenta Elétrica (45 m, Constituição, 2d8 elétrico, conc.) · Terraço Elétrica (45 m, Força, 11d8 elétrico) · Terraço Elétrica (36 m, raio de 6 m, Carisma, 14d6 elétrico) · Relâmpago Estridente (45 m, 10d10 elétrico)\n' +
          '9º: Eletro-Genesis Primordial (45 m, Constituição, 10d10 elétrico, conc.) · Explosão Divina Elétrica (45 m, Constituição, 14d8 elétrico) · Inundação do Trovão Sagrado (45 m, Constituição, 10d10 elétrico, conc.) · Fúria Elétrica (45 m, Constituição, 2d10 elétrico)',
      },
      {
        nome: 'Fogo — dano contínuo e alto, incendeia o campo de batalha',
        texto:
          'Chi: Raio Incandescente (18 m, ataque, 1d10 fogo) · Brasa (4,5 m, cone de 4,5 m, Constituição, 1d4 fogo) · Labareda Efêmera (toque, Destreza, 1d8 fogo) · Esfinge Flamejante (toque) · Chama Inicial (9 m, 1d4 fogo)\n' +
          '1º: Repreensão das Chamas (9 m, Destreza, 2d10 fogo) · Língua de Fogo (9 m, ataque, 2d8 fogo) · Marca de Fogo (toque, ação bônus, 1d4 fogo) · Chama Ardente (9 m, 1d6 fogo, conc.) · Escudo Flamejante (9 m, reação, 1d6 fogo)\n' +
          '2º: Fornalha Flamejante (18 m, raio de 3 m, Destreza, 3d8 fogo) · Língua de Dragão (9 m, ataque, 3d6 fogo) · Parede de Fogo (18 m, 2d8 fogo, conc.) · Rajada de Chamas (9 m, linha de 9 m, Destreza, 3d6 fogo) · Erupção (9 m, Destreza, 3d8 fogo)\n' +
          '3º: Explosão Infernal (18 m, Destreza, 8d6 fogo) · Inferno Furiso Ampliado (toque, pessoal, ação bônus, 2d6 fogo, conc.) · Adaga Flamejante (pessoal, 2d6 fogo, conc.) · Girasol Flamejante (18 m, ação bônus, Constituição, 5d6 fogo) · Parede de Chamas Vagantes (18 m, Destreza, 4d8 fogo, conc.)\n' +
          '4º: Explosão Cegante (18 m, raio de 3 m, Constituição) · Baforada Infernal (18 m, Destreza, 6d6 fogo) · Lanças de Chamas (18 m, 4d8 fogo) · Corrente de Chamas (18 m, ataque, 2d6 fogo, conc.) · Círculo de Fogo (pessoal, 3 m, raio de 3 m, Destreza, 4d8 fogo)\n' +
          '5º: Voragem Flamejante (4,5 m, raio de 4,5 m, Destreza, 6d8 fogo) · Chuva de Estrelas Ardentes (60 m, 7d6 fogo) · Sopro do Dragão (18 m, cone de 18 m, Destreza, 10d6 fogo) · Cruz de Chamas (18 m, Destreza, 6d8 fogo) · Inferno Ardente (9 m, raio de 9 m, Constituição, 8d6 fogo)\n' +
          '6º: Muralha de Chamas Infernais (36 m, 4d10 fogo, conc.) · Salamandra Ardente (18 m, linha de 18 m, Destreza, 8d8 fogo) · Combustão (pessoal, 3d10 fogo, conc.) · Marca Ardente (18 m, 4d10 fogo, conc.) · Piroclasma Infernal (45 m, Constituição, 5d6 fogo, conc.)\n' +
          '7º: Muralha de Chamas Infernais (36 m, 4d10 fogo, conc.) · Pentrama das Chamas (36 m, ataque, 6d10 fogo, conc.) · Explosão Estelar Dupla (36 m, ataque, 6d10 fogo) · Retaliação das Chamas Defensoras (pessoal, reação, ataque) · Chuva de Estrelas Flamejantes (1,5 quilômetros, 5d10 fogo)\n' +
          '8º: Anel de Chamas Imortal (pessoal, Constituição, 7d10 fogo, conc.) · Explosão Cósmica (120 m, Força, 10d10 fogo) · Labareda Suprema (45 m, linha de 45 m, Destreza, 8d10 fogo) · Expulsão da Serpente de Chamas (45 m, Força, 4d10 fogo, conc.)\n' +
          '9º: Inferno Abrasador (45 m, Constituição, 10d10 fogo) · Fúria Solar (120 m, ataque, 12d10 fogo) · Colar de Estrelas Flamejantes (18 m, raio de 18 m, 9d10 fogo)',
      },
      {
        nome: 'Frio — controle do terreno: congela, prende e ergue barreiras',
        texto:
          'Chi: Raio de Gelo (18 m, ataque, 1d8 frio) · Raio Polar (18 m) · Resistência Ao Gelo (18 m, conc.) · Criação de Gelo (18 m) · Toque Frio (toque, 1d12 frio)\n' +
          '1º: Snowball (30 m, ataque, 2d10 frio) · Nevasca (18 m, ação bônus, Constituição, 1d6 frio, conc.) · Passo Congelante (pessoal, ação bônus, conc.) · Escudo de Gelo (toque, conc.) · Rajada Gélida (30 m, ataque, 2d12 frio) · Proteção Contra Elementos Gélidos (toque, conc.) · Escalada Glacial (9 m, conc.) · Toque Gélido (toque, ataque, 2d6 frio) · Terreno Congelado (18 m, ação bônus, Destreza)\n' +
          '2º: Lança Glacial Perfurante (9 m, ataque, 2d6 frio) · Barreira Glacial (9 m, linha de 4,5 m) · Lâmina Gelada (pessoal, ação bônus, 1d6 frio) · Pele de Gelo (toque, conc.) · Congelamento Temporário (9 m, Constituição, conc.) · Tempestade Gélida (27 m, cilindro de 4,5 m, Constituição, 3d6 frio, conc.) · Prisão Fria (18 m, ataque, 3d6 frio, conc.) · Mar de Gelo (12 m e 1,5 m de largura, linha de 12 m, Força, 4d6 frio)\n' +
          '3º: Lâmina Gélida Maior (toque, ação bônus, 2d6 frio, conc.) · Adagas Geladas (30 m, ataque, 2d10 perfurante) · Resfriamento Total (30 m, Constituição, 5d8 frio) · Ice Tomb (18 m, Força, 2d8 frio, conc.) · Colisão Glacial (9 m, cone de 3 m, ataque, 2d8 frio) · Parede de Gelo (pessoal, reação, ataque) · Explosão Glacial (45 m, esfera de 6 m, Destreza, 4d6 frio) · Barrage de Gelo (pessoal)\n' +
          '4º: Vórtice Congelante (18 m, esfera de 6 m, Força, 6d6 frio) · Tempestade Congelante (36 m, raio de 4,5 m, Destreza, 6d8 frio) · Manto Glacial (toque, ataque, 2d6 frio, conc.) · Lança de Gelo (18 m, linha de 18 m, Constituição, 5d8 frio) · Projétil de Gelo (18 m, ataque, 6d8 frio) · Vento Gélido das Esferas (pessoal, 1d10 frio, conc.) · Gêiser de Gelo (4,5 m, cilindro de 4,5 m, ação bônus, Destreza) · Tempestade Congelante (36 m, raio de 4,5 m, Destreza, 6d8 frio)\n' +
          '5º: Ice Block (pessoal, reação) · Artic Lock (18 m, Destreza, 6d10 frio) · Explosão de Estalactites (60 m, raio de 18 m, Destreza, 3d6 perfurante) · Visão Congelante (pessoal, conc.) · Black Ice (36 m, 4d6 frio) · Chuva de Estrelas Congeladas (12 m, Destreza, 8d8 frio) · Prisão de Espinhos de Gelo (18 m, Força, 3d10 frio, conc.)\n' +
          '6º: Avalanche (9 m, cone de 9 m, Força, 6d6 frio) · Geada (18 m, Constituição, 6d10 frio) · Congelar (toque, reação, ataque, 6d8 de) · Muralha de Gelo (36 m) · Viagem Criogênica (toque) · Casa de Gelo (toque, 1 minuto)\n' +
          '7º: Cataclismo Glacial (45 m, raio de 18 m, Constituição, 0d6 frio) · Aurora Azul (90 m, Constituição, 12d8 frio) · Presença Invernal (9 m, raio de 9 m, Carisma, conc.) · Tempestade de Cristal (45 m, cubo de 3 m, Destreza, 8d10 frio, conc.)\n' +
          '8º: Vórtice de Cristal (90 m, Constituição, 10d10 de) · Lâmina Congelante Épica (pessoal, Constituição, 4d12 de, conc.) · Nuvem Congelante (45 m, esfera de 6 m, Destreza, 10d8 frio, conc.) · Cálice de Gelo Eterno (pessoal, Constituição, 5d10 frio, conc.) · Geada Aniquiladora (56 m, Constituição, 8d8 frio, conc.)\n' +
          '9º: Esfera Temporal Congelante (45 m, raio de 6 m, Destreza) · Domínio do Gelo Eterno (72 m, raio de 72 m, 6d8 frio, conc.) · Punho Congelante (36 m, Força, 10d12 frio) · Muralha Abissal (36 m, 12d10 frio)',
      },
      {
        nome: 'Necrótico — dano num alvo só, drenando vida para quem conjura',
        texto:
          'Chi: Emissão Sombria (18 m, ataque, 1d10 necrótico) · Toque Sombrio (toque, ataque, 1d12 necrótico) · Olhar Vampírico (9 m, ataque) · Sussuros de Agonia (toque, raio de 3 m, 1d4 necrótico) · Raio Necrótico Mínimo (9 m, linha de 9 m, Constituição, 1d4 necrótico)\n' +
          '1º: Mão Espectral (toque, 2d8 necrótico) · Sangria Vital (18 m, ataque, 2d6 necrótico) · Tentáculos da Escuridão (12 m, Destreza) · Aura de Drenagem (pessoal, 1d4 necrótico, conc.) · Símbolo de Fragilidade (12 m, ataque)\n' +
          '2º: Dreno de Vitalidade (18 m, Constituição, 3d6 necrótico, conc.) · Manto das Sombras (pessoal, conc.) · Fumaça Anti Vida (6 m, cone de 6 m, Constituição, 3d6 necrótico) · Emissão das Trevas (9 m, 2d4 necrótico, conc.) · Sombra Dilacerante (18 m, 2d10 necrótico)\n' +
          '3º: Explosão de Almas (36 m, raio de 6 m, Constituição, 8d6 necrótico) · Infligir Ferimentos (toque, 5d10 necrótico) · Terra Corrompida (36 m, 3d6 necrótico) · Maldição de Fragilidade (18 m, Intelig) · Peste Profana (18 m, 4d6 necrótico)\n' +
          '4º: Aura de Decadência (pessoal, 4d6 necrótico, conc.) · Consumir Almas (toque, ataque, 5d8 necrótico) · Lança da Perdição (18 m, ataque, 6d6 necrótico) · Corrente de Almas (18 m, ataque, 4d8 necrótico) · Lâmina da Caçada (36 m, ataque, 4d4 necrótico)\n' +
          '5º: Explosão da Vida (36 m, 6d6 necrótico) · Manto da Sombra (pessoal, conc.) · Golpe da Vampirização (toque, 6d8 necrótico) · Corrente da Aflição (9 m, ataque, 4d8 necrótico) · Vento Necrótico (18 m, cone de 18 m, Constituição, 8d8 necrótico)\n' +
          '6º: Fúria Sombria (pessoal, conc.) · Golpe do Oni (toque, ataque, 8d10 necrótico) · Tormenta Necrótica em Massa (36 m, Constituição, 5d6 necrótico) · Tormenta Necrótica em Massa (36 m, Constituição, 5d6 necrótico) · Morte Falsa (toque, conc.)\n' +
          '7º: Explosão Cadavérica (18 m, raio de 18 m, 10d8 necrótico) · Agonia Abissal (18 m, Constituição, 7d8 necrótico) · Maldição da Alma Negra (9 m, Constituição, 5d10 necrótico) · Sussurros do Abismo (18 m, raio de 18 m, Sabedoria, 8d8 necrótico) · Corrente de Chamas Sombrias (36 m, ataque, 8d6 necrótico)\n' +
          '8º: Aniquilição da Alma (72 m, Constituição, 4d10 necrótico) · Profundidades do Abismo (45 m, raio de 12 m, Constituição, 10d10 necrótico) · Barreira da Eternidade (30 m, 6d10 necrótico, conc.) · Fome do Abismo (36 m, ataque, 5d10 necrótico, conc.) · Vínculo das Sombras (9 m, raio de 18 m, Constituição, 4d10 necrótico, conc.)\n' +
          '9º: Noite Eterna (72 m, raio de 72 m, Sabedoria, conc.) · Peste da Escuridão (18 m, raio de 18 m, 5d12 necrótico, conc.) · Flagelo do Abismo (72 m, Constituição, 5d10 necrótico) · Devastação Sombria (150 m, ataque, 10d12 necrótico) · Dissolução Carnal (18 m, Constituição, 6d10 necrótico)',
      },
      {
        nome: 'Trovejante — som e eletricidade: dano em área e ensurdece',
        texto:
          'Chi: Estalo Sônico (18 m, ataque, 1d10 trovejante) · Estourinho (9 m, raio de 3 m, Constituição) · Sibilo (3 m, cone de 3 m, Constituição, 1d4 trovejante) · Estampido Audível (18 m, raio de 3 m, Constituição, 1d4 trovejante) · Distorção Sônica (9 m, Sabedoria)\n' +
          '1º: Impacto Trovejante (18 m, Constituição, 2d8 trovejante) · Eco do Trovão (18 m, raio de 3 m, Constituição, 2d6 trovejante) · Repelir Tempestade (9 m, 1 rea, Força, 2d4 trovejante) · Crescendo Trovejante (18 m, raio de 3 m, Constituição, 2d6 trovejante) · Relâmpago Iminente (18 m, ação bônus, ataque, 2d8 trovejante)\n' +
          '2º: Tempestade Sonora (18 m, raio de 4,5 m, Constituição, 3d6 trovejante) · Trovejante (pessoal, Constituição, 2d6 trovejante, conc.) · Tempestade Sonora (pessoal, 1d6 trovejante, conc.) · Som da Cura (9 m, raio de 9 m, ação bônus, cura 1d4) · Ruptura Sônica (18 m, raio de 3 m, Constituição, 2d6 trovejante)\n' +
          '3º: Ciclone Trovejante (18 m, 3d6 trovejante) · Tempestade Elétrica em Massa (36 m, raio de 6 m, Constituição, 8d6 trovejante) · Armadura Trovejante (toque, ataque, 2d4 trovejante, conc.) · Caminho do Trovão (9 m, Constituição, 3d6 trovejante, conc.) · Redemoinho Trovejante Força (18 m, raio de 4,5 m, Constituição, 4d6 trovejant)\n' +
          '4º: Fúria Celestial (9 m, raio de 9 m, 1d8 trovejante, conc.) · Estrondo Sônico (18 m, cone de 18 m, Constituição, 6d8 trovejante) · Raios Scarlat (27 m, ataque, 6d6 trovejante) · Tempestade Fulgurante (27 m, raio de 6 m, Constituição, 5d8 trovejante, conc.) · Punho Trovejante (18 m, Constituição, 8d8 trovejante)\n' +
          '5º: Chuva Estrondosa (45 m, raio de 9 m, Destreza, 6d6 trovejante, conc.) · Muralha Trovejante (15 m, 4d6 trovejante, conc.) · Chuva Estrondosa (45 m, raio de 9 m, Destreza, 6d6 trovejante, conc.) · Rugido do Trovão (45 m, Constituição, 5d8 trovejante) · Rugido do Trovão (36 m, Constituição, 5d6 trovejante)\n' +
          '6º: Explosão Sônica (36 m, Constituição, 8d8 trovejante) · Maremoto de Estrondos (45 m, raio de 9 m, Constituição, 8d10 trovejante) · Furacão Furioso (27 m, cone de 27 m, Constituição, 9d8 trovejante) · Terremoto Sônico (15 m, ataque, 7d10 trovejante) · Explosão do Trovão (45 m, Constituição, 12d6 trovejan)\n' +
          '7º: Eco Estrondoso (18 m, cone de 18 m, Constituição, 10d8 trovejante) · Chuva de Decibéis (18 m, linha de 18 m, Constituição, 9d8 trovejante) · Melodia da Paz (18 m, raio de 18 m, cura 3d8) · Melodia Menor (9 m, raio de 9 m, cura 6d8) · Carga de Energia (9 m, raio de 9 m, ação bônus, cura 1d8)\n' +
          '8º: Estrondo Celeste (45 m, raio de 12 m, Constituição, 9d10 trovejante) · Coluna Trovejante (56 m, ataque, 0d12 trovejante) · Corrente Sonora (36 m, Constituição, 10d6 trovejante) · Esfera Trovejante (45 m, raio de 12 m, Constituição, 11d8 trovejante) · Orquestra Divina (pessoal, 6d10 trovejante, conc.)\n' +
          '9º: Estrondo Celeste (30 m, raio de 30 m, Constituição, 10d10 trovejante, conc.) · Ressonância (pessoal, 5d10 trovejante, conc.) · Estrondos da Ira (36 m, linha de 36 m, Constituição, 11d8 trovejante) · Apocalipse Trovejante (30 m, raio de 30 m, Constituição, 13d8 trovejante) · Campo de Estática (45 m, cura 3d8, conc.)',
      },
      {
        nome: 'Veneno — muito dano num alvo só, e condições que debilitam',
        texto:
          'Chi: Agulha da Serpente (18 m, ataque) · Toque Envenenado (toque, ataque, 1d6 veneno) · Toque da Serpente (toque, Constituição, 1d4 veneno) · Sopro Venenoso (9 m, Constituição) · Névoa Tóxica (9 m, Constituição, 1d4 veneno)\n' +
          '1º: Lâmina Envenenada (toque, Constituição, conc.) · Nuvem de Veneno (9 m, raio de 3 m, Constituição, 2d6 veneno, conc.) · Agulhas Envenenadas (18 m, ataque, 2d6 veneno) · Toque da Serpente Venenosa (toque, Constituição, 2d4 veneno) · Bote (9 m, ataque, 2d10 veneno)\n' +
          '2º: Peçonha Fatal (18 m, ataque, 3d8 veneno) · Chuva de Agulhas Envenenadas (18 m, Destreza, 4d6 veneno, conc.) · Aura Venenosa (pessoal, Constituição, 2d6 veneno) · Presa da Víbora (toque, ataque, 3d6 veneno) · Lança Venenosa (18 m, ataque, 3d8 veneno)\n' +
          '3º: Explosão Venenosa (36 m, Constituição, 8d6 veneno) · Balaço Venenoso (18 m, raio de 3 m, ataque, 4d8 veneno) · Reflexos Envenenados (pessoal, Constituição, 1d6 veneno) · Escudo de Veneno (pessoal, reação) · Agulha Envenenada (6 m, Constituição)\n' +
          '4º: Emissão de Toxina (pessoal, Constituição, 5d8 veneno, conc.) · Injeção Venenosa (toque, Constituição, 5d6 veneno) · Agonia Persistente (36 m, ataque, 7d6 veneno) · Sopro Pestilento (18 m, linha de 18 m, Constituição, 6d8 veneno) · Adaga Venenosa Ardente (36 m, ataque, 6d6 veneno)\n' +
          '5º: Peçonha Invisível (pessoal, Constituição, 7d6 veneno) · Garra do Escorpião (18 m, 8d8 veneno) · Peçonha Corrosiva (toque, ação bônus, Constituição, 1d8 veneno) · Efeito Residual (toque, ataque, 4d8 veneno, conc.) · Exalação Venenosa (18 m, 5d8 veneno)\n' +
          '6º: Parede de Veneno Pervasivo (18 m, Constituição, 6d8 veneno, conc.) · Toque Venenoso (toque, Constituição) · Retribuição Venenosa (toque, reação, ataque, 6d8 veneno) · Chuva de Serpentes (45 m, raio de 9 m, Constituição, 6d10 veneno) · Mordida da Serpente Venenosa (18 m, ataque, 8d10 veneno)\n' +
          '7º: Sopro do Dragão Venenoso (36 m, Constituição, 8d12 veneno) · Véu do Veneno (90 m, raio de 18 m, Constituição, 6d10 veneno, conc.) · Punhalada Envenenada (toque, ação bônus, ataque) · Turbilhão das Serpentes (36 m, linha de 36 m, Constituição, 9d8 veneno) · Explosão de Esporos Venenosos (36 m, raio de 9 m, Constituição, 7d10 veneno)\n' +
          '8º: Sangria Venenosa (45 m, Constituição, 9d10 veneno) · Sussurros Envenenados (45 m, Sabedoria, 10d8 veneno, conc.) · Sussurros Envenenados (45 m, Sabedoria, 10d8 veneno, conc.) · Toque da Víbora (toque, Constituição, 0d8 veneno)\n' +
          '9º: Abismo Venenoso (90 m, raio de 18 m, Constituição, 0d10 veneno) · Neblina Tóxica de Lysandra (27 m, Constituição, 12d10 veneno) · Mordida do Dragão Víbora (45 m, ataque, 6d10 veneno)',
      },
      {
        nome: 'Vento — cortes, furacões e empurrões',
        texto:
          'Chi: Sopro (18 m, ataque, 1d10 cortante) · Sopro Cortante (toque, 1d4 cortante, conc.) · Suspiro Sibilante (9 m, Constituição, 1d4 cortante) · Brisa (9 m, Força, 1d4 concussão) · Sopro Cortante (4,5 m, cone de 4,5 m, Destreza, 1d4 cortante)\n' +
          '1º: Lâmina de Vento (toque, ataque, 1d8 cortante, conc.) · Rajada Ciclônica (9 m, Força, 2d6 concussão) · Zéfiro Vigilante (pessoal) · Golpe dos Ventos (18 m, Destreza, 2d10 cortante) · Ventos da Cura (9 m, cura 1d4)\n' +
          '2º: Escudo Aerodinamico (pessoal, reação) · Flecha Cortante (9 m, 4d6 perfurante) · Rajada Tempestuosa (18 m, linha de 18 m, Força, 3d6 concussão) · Ventania Envolvente (9 m, 2d6 corte, conc.) · Brisa Curativa em Massa (6 m, cura 4 pontos)\n' +
          '3º: Tornado Voraz (18 m, esfera de 6 m, Força, 4d8 concussão, conc.) · Muralha Cortante (9 m, 4d6 corte, conc.) · Fúria dos Vendavais (18 m, Força, 7d6 concussão) · Chuva de Penas Afiadas (18 m, Destreza, 7d6 cortante) · Sopro Ciclônico (9 m, cone de 9 m, Força, 5d6 concussão)\n' +
          '4º: Rasgar Os Céus (18 m, cone de 18 m, Destreza) · Lâmina Furiosa (30 m, 7d8 concussão) · Redemoinho Defensivo (9 m, 2d6 corte, conc.) · Sopro Astral (18 m, cura 3d8) · Rasgar Os Céus (30 m, raio de 9 m, 4d8 concussão, conc.)\n' +
          '5º: Flecha Ciclônica (45 m, 5d8 perfurante) · Tempestade Elemental (45 m, raio de 9 m, Destreza, 6d10 cortante) · Deslocamento do Vendaval (9 m) · Vórtice de Corte (45 m, raio de 6 m, Destreza, 8d8 cortante, conc.) · Lâmina de Tufão (45 m, ataque, 5d8 cortante)\n' +
          '6º: Tormenta (30 m, Força, 8d6 cortante) · Fúria dos Ventos (56 m, Força, 6d10 concussão) · Fúria dos Ventos (18 m, ataque, 9d8 concussão) · Foco Cortante (18 m, linha de 18 m, Destreza, 7d8 cortante) · Poder dos Ventos (18 m, Constituição, 7d10 cortante)\n' +
          '7º: Voo dos Sussurros (toque, conc.) · Aura de Ventania (pessoal, ataque, 3d10 vento, conc.) · Lança Eólica (30 m, Destreza, 0d8 perfurante) · Estrondo de Tufão (45 m, Força, 9d8 vento) · Ciclone de Devastação (56 m, raio de 15 m, 7d10 concussão)\n' +
          '8º: Vórtice Elemental (56 m, Força, 8d10 cortante) · Rajada de Vento (36 m, Constituição, 9d10 concussão) · Agarrar dos Ventos (18 m, Força) · Explosão de Ar Comprimido (36 m, Constituição, 9d12 concussão) · Rajada de Vento (18 m, Constituição, 9d10 cortante)\n' +
          '9º: Tempestade Titânica (100 m, Constituição, 5d12 concussão, conc.) · Detonação Comprimida (9 m, raio de 9 m, Constituição, 10d10 concussão) · Vácuo Sombrio (18 m, esfera de 6 m, Constituição, 5d12 psíquico, conc.) · Tríplice Lança (36 m, 5d12 concussão)',
      },
    ],
  },
];
