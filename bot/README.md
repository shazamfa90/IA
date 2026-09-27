# Bot da mesa (música)

Toca no canal de voz a trilha que o mestre escolhe na aba **Música** do app. O app escreve no
canal pelo webhook; este bot lê, entra no canal de voz onde estiver a mesa e toca, repetindo a
trilha até o mestre trocar ou parar.

Bots de música de terceiros (Jockie Music e parecidos) ignoram mensagens de webhook e só atendem
quem está num canal de voz. Por isso a mesa tem o próprio: ele obedece **só** ao webhook do app,
então jogador nenhum mexe na música digitando no canal.

## Uma vez só

**1. Criar o bot no Discord**

1. Abra <https://discord.com/developers/applications> → **New Application** → dê um nome
   (ex.: *Trilha da Mesa*).
2. Aba **Bot** → **Reset Token** → copie o token e guarde. Ele é a senha do bot.
3. Na mesma aba, ligue **Message Content Intent** e salve.

**2. Colocar no servidor**

1. Aba **OAuth2** → **URL Generator** → marque **bot**.
2. Em permissões, marque: *View Channels*, *Send Messages*, *Read Message History*,
   *Add Reactions*, *Connect* e *Speak*.
3. Abra a URL gerada no fim da página e escolha o servidor da mesa.

O bot precisa enxergar o canal de texto do webhook. Dica: um canal só pra música
(ex.: `#trilha`) deixa o canal da sessão limpo.

**3. Preparar o PC**

1. Instale o [Node.js](https://nodejs.org) 22 ou mais novo (a versão LTS serve).
2. Baixe o projeto: no GitHub, **Code → Download ZIP**, e extraia.
3. Abra um terminal dentro da pasta `bot`. No Windows: abra a pasta, clique na barra de
   endereço, digite `cmd` e Enter.
4. Crie o arquivo de configuração e preencha:
   ```
   copy .env.example .env
   notepad .env
   ```
   (no Mac/Linux: `cp .env.example .env`). Cole o token em `DISCORD_TOKEN` e, em `WEBHOOK_URL`,
   o mesmo webhook que está no app em **Música → Canal do bot**. O `.env` fica só no seu PC.
5. Instale: `npm install`

## A cada sessão

```
npm start
```

Aparece `Pronto como Trilha da Mesa#…`. Deixe o terminal aberto enquanto jogam; `Ctrl+C` desliga.

No app, **Música** → toque numa trilha. O bot entra no canal de voz com mais gente e marca ✅ na
mensagem quando começa a tocar. Se algo der errado, ele responde a mensagem com ⚠️ e o motivo.

## O que ele toca

- **YouTube:** link de vídeo (de playlist, toca o primeiro).
- **Busca:** qualquer texto, ex. `taverna medieval` — toca o primeiro resultado do YouTube.
- **Spotify:** o Spotify não deixa tocar fora dele; o bot busca "música + artista" no YouTube.
  Link de playlist ou álbum vira busca pelo nome.
- **Link direto de áudio:** mp3, ogg etc.

## Problemas

- **"Sign in to confirm you're not a bot"**: o YouTube desconfiou. No `.env`, descomente
  `YTDLP_ARGS=--cookies-from-browser chrome` (ou `edge`, `firefox`: o navegador em que você está
  logado no YouTube).
- **"Ninguém num canal de voz"**: entre num canal de voz antes de tocar.
- **Não consegui entrar no canal de voz**: o bot precisa de *Connect* e *Speak* nesse canal.
- **Nada acontece**: confira se o terminal mostra `Pronto como…` e se o `WEBHOOK_URL` do `.env` é
  o mesmo do app.

O `yt-dlp` (que busca o áudio) é baixado sozinho na primeira vez, em `bot/bin`, e se atualiza a cada
`npm start`.
