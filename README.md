# Ficha RPG

Ficha de personagem para qualquer sistema de RPG, que posta as rolagens num canal do Discord.
Roda no navegador e instala no celular como app.

```bash
npm install
npm run dev     # site em http://localhost:5173
npm test        # dados, slug, link de ficha, migração
npm run build   # gera dist/
```

## O que dá pra fazer

- **Entrada** — ao abrir o app, a pessoa escolhe **Mestre** ou **Player**, e a escolha fica salva no
  aparelho. Mestre pede senha; player entra direto. Só o mestre vê a aba *Sistemas*: o player
  recebe os sistemas pelo link do mestre. *Perfil → Sair e escolher de novo* troca.
- **Sistemas** — o mestre monta a ficha num editor visual: seções, campos (número, texto,
  texto longo, marcador) e botões de rolagem. Nenhum sistema vem embutido; o "Exemplo d20"
  é só um ponto de partida que dá pra apagar.
- **Imagens** — capa do sistema e avatar do personagem aceitam qualquer endereço direto de
  imagem, de qualquer site. Os campos mostram uma prévia: se ela carregar, o Discord também
  carrega. Quando falha, o app explica o motivo em vez de deixar você adivinhar.
- **Slots de imagem** — na aba *Perfil*, o avatar em uso pode ser guardado num slot, e trocar
  entre os guardados é um toque. Os slots são do perfil, então valem pra todas as fichas dele.
- **Compartilhar** — o botão ↗ copia um link com a ficha inteira dentro, capa incluída. O
  jogador abre o link e o sistema aparece no aparelho dele. Sem conta, sem servidor.
- **Personagens** — vários por aparelho, cada um preso a um sistema. Dá pra duplicar e apagar.
- **Passar fichas** — o ↗ de cada ficha copia um link com ela e o sistema dela dentro. Quem abrir o
  link, ou colar em *Personagens → Importar*, recebe uma cópia no perfil em uso, em qualquer
  aparelho — é também o jeito de levar a ficha do PC pro celular. Se o aparelho já tiver o mesmo
  sistema, a ficha usa ele em vez de trazer outro igual. No mesmo aparelho, o ⇄ (aparece quando há
  mais de um perfil) passa a ficha pra outro perfil sem copiar.
- **Rolagens** — botões definidos no sistema, mais um campo de rolagem avulsa pra qualquer
  notação na hora. O dado gira na tela por um instante e some mostrando o resultado.
- **Explicações (ⓘ)** — campo ou rolagem com explicação ganha um botão ⓘ ao lado. Tocar abre o
  porquê daquilo; numa rolagem, abre também a conta com os números da ficha (`d20 + Destreza (+3) +
  Bônus de proficiência (2)`). Toda rolagem tem o ⓘ; o texto de cada um se escreve no editor.
- **Rolar atributos** — no editor, você marca numa lista quais campos a rolagem preenche, e em
  que ordem. O app preenche a ficha sozinho; se os campos já tiverem valor, pergunta antes.
- **Atributo e modificador** — um campo do tipo *Atributo* guarda o atributo (16) e mostra o
  modificador ao lado (+3), pela regra que o sistema escolher.
- **Temas das respirações** — além dos básicos, 13 temas do Hashira Handbook, um por respiração
  (Lua, Água, Chamas, Trovão, Névoa, Inseto, Vento, Pedra, Flor, Serpente, Som, Amor, Besta). Cada
  um tem duas cores do Hashira em luzes no fundo, um desenho (luas minguantes, ondas, chamas,
  triângulos e raios…), uma camada que anda devagar (estrelas, bolhas, brasas subindo, pétalas
  caindo, névoa passando) e um **efeito ao tocar**: corte em lua crescente, ondas e gotas, brasas,
  raio com faíscas, névoa, borboletas, redemoinho, cacos de pedra, pétalas, a serpente, anéis de
  som com joias, corações e garras. Com "reduzir movimento" ligado no aparelho, tudo fica parado.
  Escolher um tema no Perfil traz a cor de destaque dele junto.
- **Tema por sistema** — um sistema pode trazer aparência própria, e ela assume o app inteiro
  enquanto uma ficha dele está aberta.
- **Música** (só o mestre) — trilhas salvas (nome + link do YouTube/Spotify ou busca) que trocam
  com um toque, e **playlists** numa lista separada, com cada faixa aparecendo no app pra
  escolher qual tocar; depois segue em sequência (com Pular). Mais
  Pausar, Continuar, Parar e 🔁 Repetir (liga e desliga). Quem toca é o **bot da mesa** (pasta [`bot/`](bot/README.md)),
  rodando no PC do mestre durante a sessão: o app escreve pelo webhook, o bot entra no canal de
  voz da mesa e toca, repetindo a trilha se o 🔁 estiver ligado. Bots de terceiros como o Jockie ignoram webhook, por
  isso a mesa tem o próprio. O webhook se cola na aba e fica só no aparelho do mestre.
- **Perfis** — cada pessoa que usa o aparelho tem o seu: fichas separadas e aparência própria
  (6 temas e uma cor de destaque). São locais, sem senha e sem servidor — servem pra dividir um
  tablet na mesa, não pra entrar da sua conta noutro aparelho.

## Sistemas prontos

Em *Sistemas → Adicionar*:

- **Exemplo d20** — três atributos e quatro rolagens, pra usar de base ou apagar.
- **Hashira Handbook** — ficha adaptada do livro de mesmo nome (Natan, 2023), projeto de fãs sem
  fins lucrativos que leva *Kimetsu no Yaiba* para o d20 da 5ª edição. Traz os seis atributos, os
  campos próprios do livro (raça, respiração ou kekkijutsu, patente, pontos de energia,
  Concentração Total, as 15 perícias), tema e capa próprios. Cada campo e rolagem tem ⓘ: por que a
  CR é 10 + Destreza, por que a katana dá 1d6 (1d8 a duas mãos) e aceita Destreza, e assim por
  diante. Sistemas Hashira criados antes disso se atualizam sozinhos ao abrir o app, sem perder
  campos, rolagens ou valores que o mestre tenha acrescentado.

  Com um Hashira no aparelho aparece a aba **Livro**: um fichário com o livro inteiro resumido —
  criação, raças, equipamento, combate, condições, as 13 respirações com todas as formas, as
  classes e a lista de kekkijutsu — com busca (sem acento, por nome, texto ou capítulo). É um
  resumo com palavras próprias, para consulta na mesa: números e regras, sem o texto do livro,
  que continua sendo a fonte. Só é baixado quando alguém abre a aba.

**Prontos para outros ramos** — cada um com a ficha, as rolagens na notação certa e explicação
no ⓘ (regras e números com palavras próprias, sem texto dos livros):

| Sistema | Ramo | Como rola |
|---|---|---|
| D&D 5e | fantasia | `d20+@forca`, vantagem `2d20kh1` |
| Tormenta20 | fantasia brasileira | `d20+@forca+@treino` |
| Ordem Paranormal | horror investigativo | `@{agilidade}d20kh1` (atributo em d20, o maior) |
| Call of Cthulhu 7e | horror cósmico | `d%`, sucesso se ≤ valor |
| Vampiro: A Máscara (V5) | horror pessoal | `@{forca}d10>=6+@{briga}d10>=6` (sucessos) |
| Cyberpunk RED | ficção científica | `d10!+@ref+@pistola` |
| Savage Worlds | pulp | `d@{agilidade}!` (dado da ficha, explosivo) |
| GURPS 4e | genérico | `3d6`, sucesso se ≤ nível |
| Fate Acelerado | narrativo | `4dF+@esperto` |
| Powered by the Apocalypse | narrativo | `2d6+@frio` |
| Blades in the Dark | assalto | `@{lutar}d6kh1` |
| Year Zero Engine | sobrevivência | `@{forca}d6>=6+@{luta}d6>=6` |

## Notação de dados

Mesma do Rollem: `d20+5`, `2d8-1`, `4d6kh3` (mantém os 3 maiores), `4d6dl1` (descarta o menor),
`6#4d6kh3` (repete 6 vezes). Também `kl` e `dh`. E o que os outros ramos usam:

- `d%` — o mesmo que `d100`.
- `4dF` — dados Fate: cada um dá −1, 0 ou +1.
- `d6!` — explode: tirou o máximo, rola de novo e soma (o extra também pode explodir).
- `5d10>=6` — parada de sucessos: o resultado é quantos dados deram 6 ou mais. Também `<=`, `>`
  e `<`. Somar paradas soma os sucessos: `3d10>=6+2d10>=6`.
- `@{campo}` — o valor do campo colado em outra coisa: `@{forca}d10` rola tantos d10 quanto a
  Força. Parada de zero dados vale zero, sem erro.

Dentro de uma rolagem, `@id` lê um campo da ficha — ex.: `d20+@forca`. O editor mostra o `@id`
de cada campo ao lado dele.

Um campo do tipo **Atributo** guarda o atributo, e numa rolagem `@forca` já é o **modificador**
dele — com Força 16 numa mesa d20, `d20+@forca` soma `+3`, não `+16`. É o que se quer escrever
sem pensar. O atributo cheio continua acessível como `@forca.valor`, e `@forca.mod` é um apelido
explícito do modificador.

A conta vem da regra do sistema, escolhida no editor: `(valor − 10) ÷ 2`, metade do valor, ou
nenhuma (o valor já é o modificador). A ficha guarda sempre o atributo; a conversão só acontece
na hora de rolar.

Uma rolagem também pode dizer **onde o resultado cai**: no editor você marca numa lista os
campos que ela preenche, e a ordem aparece numerada. `3#4d6kh3` marcando Força, Destreza e
Constituição rola três vezes e escreve os totais nos três, nessa ordem. Sobra de dados ou de
campos é ignorada.

O id acompanha o rótulo: minúsculo, sem acento e sem cedilha ("Coração" vira `@coracao`).
Renomear é seguro porque leva junto quem apontava pro id antigo — as notações das rolagens e os
valores já preenchidos nas fichas. Dois campos com o mesmo nome ganham ids distintos
(`@destreza`, `@destreza2`).

## Visual e uso no celular

Neumorfismo (Soft UI): fundo e cartões na mesma cor, com volume dado só por duas sombras. Botões
saem da superfície e afundam ao tocar; campos e o que está ativo ficam afundados. Funciona do
celular de 320 px ao monitor largo, respeita o recorte da tela (notch) e o "reduzir movimento"
do aparelho. No primeiro acesso, segue o modo claro/escuro do aparelho.

**Sem internet**: depois de aberto uma vez, o app abre do cache mesmo sem sinal (service worker).
Rolar, editar a ficha e consultar o livro funcionam; só o que vai pro Discord espera a conexão.

## Discord

*Editar canal → Integrações → Webhooks → Novo webhook → Copiar URL*, e cole na aba **Sessão**
(ou configure o canal padrão abaixo, e ninguém precisa colar nada).
A rolagem aparece no canal com o nome e o avatar do personagem, e com a notação já resolvida
(`d20+4`, não `d20+@forca`), pra mesa entender.

O Rollem não entra nesse caminho: ele ignora mensagens de webhook por design
(`if (message.author.bot) { return; }`), então quem rola é o app.

> A URL do webhook é uma senha: quem a tiver posta no seu canal com qualquer nome. Ela fica só
> no aparelho, no `localStorage`. Não coloque em print nem no repositório.

## Imagens

O Discord **aceita qualquer URL de avatar sem reclamar** e cai no avatar padrão quando não
consegue buscar a imagem — sem erro, sem aviso. Por isso os campos de imagem trazem uma prévia:
ela é o teste real, e é o que evita descobrir o problema só depois, no canal.

A confusão mais comum é colar o link da **página** em vez do da **imagem**:

| Cole isto | Não isto |
|---|---|
| `https://i.pinimg.com/originals/…/foto.jpg` | `https://pinterest.com/pin/123…` |
| `https://i.imgur.com/abc.png` | `https://imgur.com/abc` |

Em qualquer site: **toque e segure** na imagem (ou botão direito, no PC) → *Copiar endereço da
imagem*.

Achar a URL certa dá trabalho, então a aba *Perfil* guarda as que você usa em **slots**: o `+`
guarda a imagem atual, e tocar num slot troca na hora. Trocar também guarda sozinho a imagem que
sai, pra sempre dar pra voltar. São oito slots por perfil; passando disso, a mais antiga sai.

Encurtadores (`pin.it`, e afins) nunca servem: por definição eles devolvem um redirecionamento
para uma página, não os bytes de uma imagem.

Links de anexo do Discord (`cdn.discordapp.com/attachments/…`) funcionam por algumas horas e
depois expiram, junto com o avatar — o app avisa se você usar um.

## Ficha viva

Num canal só do mestre, cada personagem ocupa **uma** mensagem, que o app reescreve conforme a
ficha muda — em vez de despejar uma mensagem nova a cada alteração. O mestre abre o canal e
acompanha a mesa inteira sem pedir print.

- Atualiza alguns segundos depois de você parar de digitar, pra respeitar o limite de
  requisições do Discord, e só quando algo que aparece na mensagem realmente mudou.
- Se alguém apagar a mensagem no canal, a próxima mudança cria outra.
- Campo vazio na aba Perfil desliga o recurso.

Configure em `VITE_GM_WEBHOOK_URL` (secret `DISCORD_GM_WEBHOOK`), do mesmo jeito que o canal
padrão abaixo.

> Aponte pra um canal que só o mestre leia. E note que um webhook é **só de escrita**: quem
> extrair a URL do bundle consegue escrever no canal, mas não consegue ler as fichas que estão
> lá.

### Canal padrão

Pra mesa não ter que colar a URL em cada aparelho, o app aceita um canal padrão definido no
build, em `VITE_WEBHOOK_URL`. O campo da aba Sessão já abre preenchido com ele, e continua
editável: quem quiser apontar pra outro canal edita, e um botão devolve o padrão.

- **Local:** copie `.env.example` para `.env.local` e ponha a URL. O git ignora `.env*`.
- **No ar:** crie o secret `DISCORD_WEBHOOK` em *Settings → Secrets and variables → Actions*.
  O workflow injeta no build; a URL não entra no repositório.

Sem nenhum dos dois, o app funciona igual — só volta a pedir que cada jogador cole a URL.

> Isso mantém a URL fora do histórico do git, e permite trocá-la sem reescrever commits. Mas
> **não** a torna secreta: este é um app estático, então o valor fica no bundle JavaScript, que
> é público. Qualquer um que abra o site consegue extraí-lo. Esconder de verdade exigiria um
> servidor intermediário que guardasse o webhook e recebesse as rolagens. Se o canal for
> incomodado, troque o webhook no Discord e atualize o secret.

## Publicar

`.github/workflows/deploy.yml` roda os testes e o build em todo push, em qualquer branch.
O que estiver na branch padrão do repositório é publicado no GitHub Pages — o workflow lê o nome
da branch padrão do próprio GitHub, então não quebra se ela não se chamar `main`.

Só é preciso ligar uma vez em *Settings → Pages → Source: GitHub Actions*.

## Limites conhecidos

- Os dados ficam no `localStorage` do aparelho: não sincroniza entre celular e PC, e limpar os
  dados do site apaga as fichas.
- A senha do mestre é uma placa na porta, não uma fechadura. O código só guarda o hash dela (o
  repositório é público), mas o app roda inteiro no aparelho: quem abrir o DevTools troca o papel
  no `localStorage` sem senha nenhuma. Serve pra jogador não entrar no editor por engano.
- A rolagem acontece no aparelho do jogador, então um jogador determinado consegue forjar um
  resultado mexendo no cliente. O canal do Discord é o registro, não uma garantia.
- O link de ficha carrega o sistema inteiro na URL; um sistema muito grande gera um link longo.
