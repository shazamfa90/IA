# Fase 3 — Restrição (nunca pula)

Preguiçoso = eficiente, nunca descuidado. O melhor script é o que não foi
escrito; o segundo melhor é o que a Roblox já escreveu.

## A escada

Pare no primeiro degrau que segura.

1. **Isso precisa existir?** Necessidade especulativa = não construa, diga em uma linha.
2. **Já existe no place?** Módulo, util, remote ou padrão que já mora aqui → reuse. Reimplementar o que está duas pastas ao lado é o desperdício mais comum.
3. **Um serviço nativo resolve?** Ver tabela abaixo.
4. **Uma dependência já instalada resolve?** ProfileStore, Trove/Maid, Fusion/Roact, Knit já no projeto → use. Nunca adicione pacote novo para o que cabe em poucas linhas.
5. **Cabe em uma linha?** Uma linha.
6. **Só então:** o mínimo de código que funciona.

Dois degraus servem → pegue o mais alto e siga.

## Nativo antes de próprio

| Em vez de | Use |
|---|---|
| Loop de `Heartbeat` interpolando | `TweenService` |
| Física própria de personagem | `Humanoid`, `Constraints`, `AlignPosition`/`AlignOrientation` |
| Detector de distância + prompt de UI | `ProximityPrompt` |
| Matemática de posição de UI | `UIListLayout`, `UIGridLayout`, `UIScale`, `AutomaticSize` |
| `ValueObject` ou tabela paralela de estado | `Attributes` (replicam sozinhos) |
| Registry manual de objetos | `CollectionService` tags |
| Gerenciador de som próprio | `SoundService`, `SoundGroup` |
| Máquina de dia/noite manual | `Lighting` + `ClockTime`/atmosfera |
| Pathfinding próprio | `PathfindingService` |
| Fila de espera própria | `MemoryStoreService` |
| Loop de save por timer | autosave do ProfileStore + `BindToClose` |
| Antifraude por detecção no cliente | autoridade no servidor (o cliente não decide nada) |

A última linha não é otimização, é arquitetura: ver `../references/security.md`.

## Regras

- Sem abstração não pedida: nada de interface com uma implementação, factory de um produto, `Config` para valor que nunca muda, ECS para 3 scripts.
- Sem scaffolding "pro futuro". O futuro faz o próprio scaffolding.
- Menos arquivos. Menor diff que funciona vence — **depois** de entender o problema, nunca no lugar disso.
- Chato > esperto. Esperto é o que alguém decifra às 3 da manhã.
- Deleção conta como entrega. Remover um sistema morto é progresso.
- Simplificação com teto conhecido leva comentário nomeando o teto e o upgrade:
  `-- ponytail: um DataStore único; shard por região se passar de 1k req/min`

## Intensidade

| Nível | Comportamento |
|---|---|
| lite | Constrói o pedido e nomeia a alternativa mais enxuta em uma linha. |
| full | Escada aplicada. Nativo primeiro, menor diff, explicação curta. |
| **ultra** | YAGNI extremo. Deletar antes de adicionar. Entrega o mínimo e questiona o resto do requisito na mesma resposta. **Padrão.** |

Exemplo — "Adicione save automático":
- lite: "Feito. FYI: `BindToClose` + autosave a cada 60s cobre isso sem a classe."
- full: "`ProfileStore` já faz autosave. Liguei o `BindToClose`. Pulei o scheduler próprio."
- ultra: "`ProfileStore` já salva sozinho — não escrevi save automático nenhum. Faltava só `BindToClose`. Sistema próprio só se você medir perda real de dado."

## O limite da restrição

A escada corta escopo, abstração e linha. **Nunca** corta os 11 invioláveis do
`SKILL.md` — validação, autoridade do servidor, `pcall` em DataStore, session
locking, ordem do `ProcessReceipt`, limpeza de conexão, rate limit,
acessibilidade, proteção de dado, verificação de API, compreensão do problema.

Cortar validação não é preguiça, é dívida com juros de exploit. Um `if
typeof(x) ~= "number" then return end` é uma linha — a escada **aprova**, não
condena.

Usuário insiste na versão completa depois de você propor a enxuta? Construa a
completa, sem re-argumentar.
