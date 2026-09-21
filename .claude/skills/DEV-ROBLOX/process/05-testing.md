# Fase 5 — Testar (nunca pula para lógica não trivial)

Lógica não trivial sem verificação é trabalho inacabado. "Não trivial" =
branch, loop, matemática de moeda, caminho de segurança, persistência,
qualquer coisa que envolva mais de um jogador.

Trivial (um setter, um `print`, um valor de config) não precisa de teste.
YAGNI vale para teste também.

## Escolha o nível mais barato que pega o bug

| Nível | Quando | Ferramenta |
|---|---|---|
| **Teste unitário** | função pura: dano, preço, validação, serialização, geração | TestEZ ou Jest-Lua via Rojo |
| **Self-check em ModuleScript** | projeto sem runner; uma função crítica | `assert` num `.spec` ou bloco de teste chamado manualmente |
| **Playtest roteirizado** | integração, UI, replicação, persistência | Studio, matriz abaixo |
| **Servidor publicado** | DataStore real, Robux real, latência real | lugar de teste privado antes do público |

Escreva o teste **antes** da correção/feature quando a lógica é definível de
antemão — ele precisa falhar primeiro, senão você não sabe o que ele testa.

## Lógica testável = lógica extraída

Um `ModuleScript` puro é testável; um `Script` que lê `Workspace` e dispara
remote não é. Separe:

```luau
-- ReplicatedStorage/Shared/DamageMath.lua  (puro, testável)
local DamageMath = {}
function DamageMath.compute(base: number, armor: number, crit: boolean): number
	assert(type(base) == "number" and base >= 0, "base inválido")
	local reduced = base * (1 - math.clamp(armor / (armor + 100), 0, 0.8))
	return crit and reduced * 2 or reduced
end
return DamageMath

-- ServerScriptService/Combat.lua  (efeito, fino)
local dmg = DamageMath.compute(weapon.Base, target.Armor, isCrit)
humanoid:TakeDamage(dmg)
```

Essa separação é o maior ganho de testabilidade disponível no Roblox — e
também deixa o código mais curto, então a restrição aprova.

## Matriz mínima de playtest

Toda feature que toca jogador roda esta matriz antes de "pronto":

| Cenário | Por que |
|---|---|
| 1 jogador, fluxo feliz | funciona? |
| 2 jogadores (Studio: 2 players) | replicação, autoridade, corrida |
| Sair e voltar | persistência, session lock, limpeza |
| Morrer/respawnar | reconexão de `CharacterAdded`, UI, estado |
| Mobile (emulador do Studio) | toque, escala de UI, alvo ≥ 44px |
| Gamepad/teclado | navegação e foco (acessibilidade) |
| Servidor desligando | `BindToClose` salvou? |
| Entrada hostil | remote com tipo errado, valor negativo, alvo de outro jogador |

A última linha não é opcional. Dispare o remote manualmente com lixo e
confirme que o servidor rejeita sem erro e sem efeito.

## Testando o que é difícil no Roblox

- **DataStore:** injete uma implementação falsa (tabela em memória) no módulo de save; o teste unitário roda sem tocar no serviço real.
- **Tempo:** injete a função de tempo em vez de chamar `os.clock()` direto; o teste controla o relógio.
- **Aleatório:** injete `Random.new(seed)` fixo; resultado reprodutível.
- **Latência:** teste no Studio com dois clientes e, para o caso real, um servidor publicado privado.

## Antes de declarar pronto

Rode. Mostre a saída. Ver `06-review.md` — nenhuma afirmação de sucesso sem
evidência colada.

Aprofundar: `../../roblox-game/references/testing-patterns.md`
