# Debugging — causa raiz, nunca sintoma

**Lei de ferro:** nenhuma correção antes da causa raiz identificada. Correção
de sintoma é falha, mesmo quando o sintoma some.

O relatório nomeia um sintoma. O sintoma quase nunca fica onde o bug mora.

## O ciclo

### 1. Reproduza de forma confiável

Sem reprodução, não há correção — há chute. Anote:

- Passos exatos, servidor **e** cliente.
- Acontece no Studio? Em servidor publicado? Só com 2+ jogadores? Só no mobile?
- Toda vez ou intermitente? Intermitente = corrida, rede ou ordem de carregamento.

Não reproduz? A primeira tarefa é construir a reprodução, não corrigir.

### 2. Colete evidência antes de teorizar

| Fonte | O que dá |
|---|---|
| Output do Studio (server + client) | erro, stack, ordem dos prints |
| `ScriptContext.Error` / `LogService` | erros em servidor publicado |
| Developer Console (F9) em jogo | erro real de produção, não do Studio |
| MicroProfiler | onde o frame vai embora |
| `game:GetService("Stats")` | memória, rede, instâncias |
| `grep_scripts` (MCP full) | todos os callers do que você vai mexer |

Erro com stack: leia a **primeira** linha do seu código, não a última da engine.

### 3. Trace até a origem

Pergunte "por que" até acabar o porquê:

```
Sintoma: moeda do jogador zera ao reconectar
 ↳ por quê? o save gravou 0
   ↳ por quê? o leave salvou antes do load terminar
     ↳ por quê? não há flag de "carregado" e nem session lock
       ↳ CAUSA RAIZ: escrita sem garantia de leitura concluída
```

Correção de sintoma seria "não salvar se for 0" — e o bug volta disfarçado na
próxima feature. A correção real é o lock, ver `../references/datastore.md`.

### 4. Corrija onde todos os callers passam

Antes de editar, encontre **todos** os chamadores da função. Um guard na
função compartilhada é um diff menor que um guard em cada caller — e corrigir
só o caminho do ticket deixa os irmãos quebrados.

### 5. Prove que corrigiu

Rode a reprodução do passo 1. Ela precisa **falhar antes** e **passar depois**.
Correção sem a reprodução rodando é hipótese, não correção — ver `06-review.md`.

Deixe o teste que pega esse bug (`05-testing.md`). Bug sem teste volta.

## Armadilhas Roblox que parecem outra coisa

| Sintoma | Causa provável |
|---|---|
| Funciona no Studio, quebra em jogo | Studio roda server+client no mesmo processo; latência e `StreamingEnabled` mudam tudo |
| Script do personagem quebra após morrer | `CharacterAdded` não reconectado, `Humanoid` em cache obsoleto |
| "Attempt to index nil" no cliente ao entrar | leu antes de replicar — use `:WaitForChild()` |
| UI reseta ao respawnar | `ResetOnSpawn` do `ScreenGui`, ou UI em `StarterGui` sem persistência |
| Memória subindo por hora | conexão não desconectada, instância não destruída |
| Dessincronia de posição só em 2+ jogadores | network ownership do lado errado |
| Dano às vezes não aplica | hitbox no cliente sem validação/reconciliação no servidor |
| Dado perde só em servidor cheio | throttle de DataStore sem retry |
| Tween/efeito acumula | conexão religada a cada evento sem limpar a anterior |

## Quando travar

Três tentativas sem progresso = a hipótese está errada, não a execução.
Volte ao passo 2, colete evidência nova, e diga ao usuário o que você já
descartou. Insistir na mesma hipótese com variações é o padrão mais caro
possível.

Aprofundar: `../../roblox-game/workflows/debug-loop.md` · `../../roblox-game/references/sharp-edges.md`
