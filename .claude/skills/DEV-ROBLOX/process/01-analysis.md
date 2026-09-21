# Fase 1 — Analisar

Objetivo: saber **o que realmente precisa existir** antes de decidir como.
Barato aqui, caro depois.

## 1. Extraia o requisito real

O pedido é um sintoma do objetivo, não o objetivo. Separe:

- **Objetivo** — o que o jogador deve poder fazer/sentir.
- **Mecânica pedida** — a solução que o usuário já imaginou.
- **Restrição** — plataforma, público, prazo, dinheiro, o que já existe no place.

Quando os três não fecham, a mecânica cede, nunca o objetivo.

## 2. Pergunte só o que muda o trabalho

**Uma** rodada de perguntas, só as que mudam a implementação:

- Serve para quantos jogadores por servidor? (muda replicação e DataStore)
- Precisa persistir entre sessões? (muda tudo)
- Envolve Robux? (muda `ProcessReceipt`, auditoria, risco de refund)
- Mobile/console também? (muda UI, input, orçamento de performance)
- Já existe sistema parecido no place? (muda para "estender", não "criar")

Dúvida que você mesmo pode responder lendo o place ou a doc oficial: **leia, não pergunte**.

## 3. Inventário do que já existe

Antes de propor qualquer coisa nova, procure no projeto:

| Procure por | Onde |
|---|---|
| ModuleScript com função equivalente | `ReplicatedStorage`, `ServerScriptService` |
| Remote já existente para o mesmo fluxo | `ReplicatedStorage/Remotes` |
| Tabela de config / `Attributes` / tags | `CollectionService`, `Attributes` dos Instances |
| Padrão de save já em uso | qualquer `DataStoreService:GetDataStore` |
| Biblioteca já instalada | ProfileStore, Trove/Maid, Fusion, Roact, Knit, Matter |

Modo MCP `full`: `grep_scripts` responde isso em segundos. Reaproveitar o que
já está a duas pastas de distância é o maior ganho disponível.

## 4. Pré-mortem — o risco antes do código

Responda em uma linha cada. Só aprofunde onde a resposta for incerta.

| Risco | Pergunta |
|---|---|
| **Exploit** | Se um atacante controlasse totalmente o cliente, o que ele conseguiria? |
| **Perda de dado** | O que acontece se o servidor cair no meio desta operação? |
| **Escala** | Isso ainda funciona com 50 jogadores? Com 200 itens no inventário? |
| **Performance** | Isso roda por frame? Por jogador? Por jogador por frame? |
| **Retenção** | Um jogador volta amanhã por causa disso? Se não, por que estamos construindo? |
| **Reversão** | Se sair errado em produção, dá para desligar sem update? (flag/`Attribute`) |

Risco alto de exploit ou de perda de dado **cancela** qualquer atalho de
restrição naquele ponto. Ver os invioláveis no `SKILL.md`.

## 5. Veredito

Feche a fase com 3–5 linhas, não um documento:

```
Objetivo: <uma frase>
Menor solução que serve: <uma frase>
Risco principal: <um> → mitigação: <uma>
Já existe: <o que reusar> | Falta: <o que criar>
Verificação: <como saberemos que funcionou>
```

Se a menor solução que serve for "não construir isso", diga agora e explique
em uma linha. É o resultado mais barato possível desta fase.

Aprofundar: `../references/architecture.md` · `../../roblox-game/references/game-design-roblox.md`
