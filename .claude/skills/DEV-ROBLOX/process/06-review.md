# Fase 6 — Revisar e verificar (nunca pula)

**Lei de ferro:** evidência antes de afirmação. Nunca diga "funciona",
"corrigido", "passou" ou "pronto" sem ter rodado a verificação e visto a
saída nesta sessão.

Não rodou? Então a frase é "implementado, não verificado — rode X para
confirmar". Isso é honesto e custa uma linha.

## Auto-review adversarial

Antes de entregar, releia o próprio diff procurando **quebrá-lo**, não
aprová-lo:

### Segurança e autoridade
- [ ] Todo remote valida tipo, range, posse e cooldown no servidor?
- [ ] O cliente consegue pedir algo em nome de outro jogador?
- [ ] Moeda, inventário, dano ou progresso decididos no servidor?
- [ ] Algum segredo, chave ou lógica de preço foi parar no cliente?
- [ ] Rate limit existe em cada remote novo?

### Dado
- [ ] Toda chamada de DataStore está em `pcall` com retry?
- [ ] Pode escrever por cima de dado que não carregou?
- [ ] `BindToClose` cobre o desligamento?
- [ ] Schema mudou — dado antigo ainda carrega? (migração/versão)

### Ciclo de vida
- [ ] Toda conexão criada é desconectada? Toda instância criada é destruída?
- [ ] Funciona após morrer e respawnar?
- [ ] Funciona para quem entra depois do jogo já rodando?
- [ ] Limpa ao jogador sair?

### Erro
- [ ] O que acontece se a chamada externa falhar? Falha silenciosa, ou trata?
- [ ] Erro derruba o script inteiro ou só a operação?
- [ ] Mensagem de erro ajuda quem for depurar às 3 da manhã?

### UI e acessibilidade
- [ ] Escala em tela pequena e ultrawide? `AutomaticSize`/`UIScale`?
- [ ] Alvo de toque ≥ 44px? Navegável por gamepad?
- [ ] Contraste legível, e nada comunicado **só** por cor?
- [ ] Sobrevive ao respawn?

### Restrição
- [ ] Alguma abstração aqui tem um único uso?
- [ ] Algum serviço nativo faria isso com menos código? (`03-restraint.md`)
- [ ] Dá para apagar alguma coisa e ainda funcionar?

Achou problema → corrija antes de entregar. Auto-review que não muda nada
quase sempre é auto-review que não aconteceu.

## Evidência aceitável

| Afirmação | Evidência |
|---|---|
| "teste passa" | saída do runner colada |
| "funciona no jogo" | qual cenário da matriz rodou e o que aconteceu |
| "corrigi o bug" | a reprodução falhando antes, passando depois |
| "não quebrou nada" | o que você rodou além da feature nova |
| "essa API faz X" | citação `path:line` da doc oficial |
| "está mais rápido" | número antes e depois (MicroProfiler/Stats) |

Sem a coluna da direita, a da esquerda não é dita.

## Gate de publicação

Antes de subir para o público, além de tudo acima:

- [ ] Testado em servidor publicado privado, não só no Studio.
- [ ] Compra de Robux testada de ponta a ponta (incluindo falha e reentrega).
- [ ] Dado de jogador existente carrega na versão nova.
- [ ] Dá para desligar a feature sem publicar update? (`Attribute`/flag)
- [ ] Erros novos no Developer Console? Olhe depois de 10 minutos de jogo real.

Detalhe: `../references/publishing.md`

## Fechamento

Entregue: o que mudou (curto), a evidência, e o que ficou de fora com o
motivo. Nada de tour de features. Se algo ficou não verificado, essa é a
primeira linha, não a última.
