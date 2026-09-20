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

- **Sistemas** — o mestre monta a ficha num editor visual: seções, campos (número, texto,
  texto longo, marcador) e botões de rolagem. Nenhum sistema vem embutido; o "Exemplo d20"
  é só um ponto de partida que dá pra apagar.
- **Imagens** — capa do sistema e avatar do personagem aceitam qualquer endereço direto de
  imagem, de qualquer site. Os campos mostram uma prévia: se ela carregar, o Discord também
  carrega. Quando falha, o app explica o motivo em vez de deixar você adivinhar.
- **Compartilhar** — o botão ↗ copia um link com a ficha inteira dentro, capa incluída. O
  jogador abre o link e o sistema aparece no aparelho dele. Sem conta, sem servidor.
- **Personagens** — vários por aparelho, cada um preso a um sistema. Dá pra duplicar e apagar.
- **Rolagens** — botões definidos no sistema, mais um campo de rolagem avulsa pra qualquer
  notação na hora.
- **Perfis** — cada pessoa que usa o aparelho tem o seu: fichas separadas e aparência própria
  (5 temas e uma cor de destaque). São locais, sem senha e sem servidor — servem pra dividir um
  tablet na mesa, não pra entrar da sua conta noutro aparelho.

## Notação de dados

Mesma do Rollem: `d20+5`, `2d8-1`, `4d6kh3` (mantém os 3 maiores), `4d6dl1` (descarta o menor),
`6#4d6kh3` (repete 6 vezes). Também `kl` e `dh`.

Dentro de uma rolagem, `@id` lê um campo da ficha — ex.: `d20+@forca`. O editor mostra o `@id`
de cada campo ao lado dele.

O id acompanha o rótulo: minúsculo, sem acento e sem cedilha ("Coração" vira `@coracao`).
Renomear é seguro porque leva junto quem apontava pro id antigo — as notações das rolagens e os
valores já preenchidos nas fichas. Dois campos com o mesmo nome ganham ids distintos
(`@destreza`, `@destreza2`).

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

Em qualquer site: botão direito na imagem → *Copiar endereço da imagem*.

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
- A rolagem acontece no aparelho do jogador, então um jogador determinado consegue forjar um
  resultado mexendo no cliente. O canal do Discord é o registro, não uma garantia.
- O link de ficha carrega o sistema inteiro na URL; um sistema muito grande gera um link longo.
