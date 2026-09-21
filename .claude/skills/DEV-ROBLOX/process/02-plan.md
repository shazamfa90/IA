# Fase 2 — Planejar

Um plano é uma lista de **fatias verificáveis**, não um documento de design.
Se a fatia não pode ser testada sozinha, ela não é uma fatia.

## Regra da fatia

Cada fatia:

1. Entrega comportamento observável (não "criar a estrutura de pastas").
2. Cabe em um ciclo de implementar → testar → ver funcionando.
3. Tem critério de aceite escrito **antes** de começar.
4. Deixa o place jogável ao final — nunca commit que quebra o playtest.

Ordene por risco: **a fatia mais arriscada primeiro**. Descobrir na fatia 1
que a abordagem não funciona custa uma fatia; descobrir na 6 custa seis.

## Formato

Mantenha no chat para até ~5 fatias. Só vire arquivo se o usuário pedir ou se
o trabalho atravessa sessões.

```
Plano: <objetivo em uma frase>

1. <fatia> — arquivos: <caminhos> — aceite: <observável>
2. <fatia> — arquivos: <caminhos> — aceite: <observável>
3. ...

Fora de escopo: <o que não vamos fazer agora e por quê>
```

Nomeie os caminhos reais (`ServerScriptService/Combat/DamageService.lua`), não
"o módulo de combate". Plano com caminho errado vira retrabalho na fatia 1.

## Ordem de composição

Dentro de uma feature, construa nesta ordem — cada camada depende da anterior
estar correta:

1. **Dado e autoridade** — o que o servidor sabe, onde guarda, quem pode mudar.
2. **Regra** — a lógica no servidor, com validação na fronteira.
3. **Remote** — o contrato cliente/servidor, já com validação e rate limit.
4. **Cliente** — input, previsão, efeito local.
5. **UI** — a apresentação, por último, sobre um estado que já funciona.

Construir UI antes da regra produz UI que mente. Construir remote antes da
autoridade produz buraco de exploit.

## Sinais de plano ruim

- Fatia chamada "setup", "estrutura" ou "refatorar" sem comportamento observável.
- Mais de ~6 fatias para um pedido → o escopo cresceu sozinho, volte à fase 1.
- Fatia que só é testável depois que a próxima existir → funda as duas.
- Abstração na fatia 1 para um caso que só aparece na fatia 5 → corte (ver `03-restraint.md`).

## Executando

Uma fatia por vez, anunciada em uma linha (`Fatia 2/4: validação do remote`).
Ao terminar cada uma: rode a verificação, mostre o resultado, siga. Nunca
empilhe três fatias e teste no fim — o erro fica indistinguível.

Plano mudou no meio? Diga em uma linha o que mudou e por quê, ajuste, siga.
Plano em silêncio é plano abandonado.

Aprofundar: `../../roblox-game/workflows/new-game.md`
