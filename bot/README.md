# Bot da mesa (música)

Toca no canal de voz a trilha que o mestre escolhe na aba **Música** do app. O app escreve no
canal pelo webhook; este bot lê, entra no canal de voz onde estiver a mesa e toca. Com **🔁 Repetir**
ligado no app, a trilha recomeça quando acaba, até o mestre trocar ou parar.

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

## A cada sessão

- **Windows:** dois cliques em `iniciar.bat`, dentro da pasta `bot`.
- **Mac/Linux:** num terminal dentro da pasta `bot`, `npm install` (só na primeira vez) e `npm start`.

Na primeira vez ele instala o que falta e pergunta, no terminal:

- o **token** do bot (passo 1);
- o **webhook**: o mesmo que está no app, em **Música → Canal do bot**.

Os dois ficam guardados no arquivo `.env`, só no seu PC, e não são perguntados de novo. Errou
algum? Apague o `.env` e ligue de novo.

Aparece `Pronto como …`. Se o bot ainda não estiver em nenhum servidor, logo abaixo sai o link de
convite, já com as permissões certas. Deixe a janela aberta enquanto jogam; fechar desliga o bot.

Ao ligar, ele confere as permissões do canal do webhook e avisa na janela se faltar alguma.

No app, **Música** → toque numa trilha. O bot marca ⏳ na mensagem ao receber, entra no canal de voz
com mais gente e troca por ✅ quando a música começa. Se algo der errado, ele responde a mensagem
com ⚠️ e o motivo, e a janela mostra o mesmo.

## Atualizar

Baixe o ZIP de novo e, antes de ligar, copie o arquivo `.env` da pasta `bot` antiga para a nova:
assim ele não pergunta token e webhook outra vez.

## O que ele toca

- **YouTube:** link de vídeo (de playlist, toca o primeiro).
- **Busca:** qualquer texto, ex. `taverna medieval` — toca o primeiro resultado do YouTube.
- **Spotify:** o Spotify não deixa tocar fora dele; o bot busca "música + artista" no YouTube.
  Link de playlist ou álbum vira busca pelo nome.
- **Link direto de áudio:** mp3, ogg etc.

**Playlists** (seção separada no app) tocam a lista inteira em sequência, e **Pular** vai pra
próxima. Playlist do YouTube: inteira (até 300). Spotify: álbum inteiro, playlist até 30 músicas
(o que a página pública mostra). Faixa que não toca é pulada. Com 🔁 ligado, a playlist recomeça
quando acaba; desligado, o bot fica em silêncio no canal.

## Problemas

- **"Sign in to confirm you're not a bot"**: o YouTube desconfiou. Acrescente ao `.env` a linha
  `YTDLP_ARGS=--cookies-from-browser chrome` (ou `edge`, `firefox`: o navegador em que você está
  logado no YouTube).
- **"Ninguém num canal de voz"**: entre num canal de voz antes de tocar.
- **Não consegui entrar no canal de voz**: o bot precisa de *Connect* e *Speak* nesse canal.
- **Nada acontece**: confira se a janela mostra `Pronto como…` e se o webhook que você deu ao bot é
  o mesmo do app (apague o `.env` e ligue de novo para digitar outro).

O `yt-dlp` (que busca o áudio) e o `ffmpeg` (que converte pro Discord) são baixados sozinhos na
primeira vez, em `bot/bin` — uns 100 MB, então a primeira partida demora um pouco. O yt-dlp se
atualiza a cada vez que o bot liga. Se o antivírus apagar algum deles, o bot avisa e baixa de novo
na próxima vez que ligar.
