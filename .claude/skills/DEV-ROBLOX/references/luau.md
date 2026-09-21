# Luau

## Tipagem — use, é de graça

```luau
--!strict
type ItemId = string
type Item = { id: ItemId, qty: number, bound: boolean? }

local function stack(a: Item, b: Item): Item?
	if a.id ~= b.id then return nil end
	return { id = a.id, qty = a.qty + b.qty, bound = a.bound }
end
```

`--!strict` no topo de todo `ModuleScript` novo. Pega erro de digitação e de
nil antes do playtest, custa nada em runtime. `--!nonstrict` num arquivo
legado que ainda não dá para limpar.

Tipo `?` é a diferença entre "pode ser nil" e "nunca é nil" — e é isso que
evita metade dos "attempt to index nil".

## Idioms que importam

```luau
-- Iteração: use a forma curta (Luau), não ipairs/pairs
for i, v in list do end
for k, v in dict do end

-- Compostos
count += 1     -- não count = count + 1
name ..= "!"

-- if como expressão
local speed = sprinting and 24 or 16

-- Congele constante: erro em vez de bug silencioso
local CONFIG = table.freeze({ maxHealth = 100 })
```

## Espera e tempo

```luau
task.wait(1)          -- nunca wait()
task.spawn(fn)        -- nunca spawn()
task.defer(fn)        -- fim do frame atual
task.delay(2, fn)
```

`wait()` e `spawn()` são legados com throttling imprevisível. `task.wait()`
retorna o delta real — use-o em vez de somar tempo você mesmo.

Loop por frame: `RunService.Heartbeat` (depois da física) ou `PreRender` (só
cliente, antes de desenhar). Nunca `while true do task.wait() end` para
trabalho por frame.

## Erros — trate, não ignore

```luau
local ok, result = pcall(risky, arg)
if not ok then
	warn(`[Shop] falha ao conceder item: {result}`)
	return false              -- decisão explícita, não silêncio
end
```

Regra: `pcall` em **toda** fronteira externa — DataStore, MarketplaceService,
HttpService, `require` de módulo remoto. Ver `datastore.md`.

`pcall` que engole o erro sem log nem decisão é pior que erro nenhum: o bug
vira invisível. Sempre `warn` com contexto, sempre um retorno que o chamador
consegue tratar.

Interpolação com crases (`` `texto {var}` ``) em vez de concatenação — mais
curto e não quebra com nil silenciosamente.

## Performance de linguagem

| Faça | Em vez de |
|---|---|
| `local v3 = Vector3.new` (cache do construtor em loop quente) | chamar `Vector3.new` 10k vezes/frame |
| `table.create(n)` quando o tamanho é conhecido | crescer tabela aos poucos |
| `(a - b).Magnitude` só quando precisa da distância real | comparar `Magnitude` em vez de magnitude² |
| `buffer` para dado binário compacto | tabela de números |
| `parallel` + `Actor` para trabalho pesado independente | tudo na thread principal |

Regra de ouro: **meça antes** (MicroProfiler). Micro-otimização sem medição é
overengineering — ver `../process/03-restraint.md`.

## Limpeza

```luau
local Trove = require(ReplicatedStorage.Packages.Trove)
local trove = Trove.new()

trove:Connect(humanoid.Died, onDied)
trove:Add(effectPart)
-- na saída:
trove:Destroy()   -- desconecta tudo, destrói tudo
```

Sem Trove/Maid no projeto: guarde cada `RBXScriptConnection` numa tabela e
desconecte em bloco. O que **não** pode acontecer é `:Connect()` sem plano de
desconexão. Ver `../process/06-review.md`.

Aprofundar: `../../roblox-game/references/luau-mastery.md` ·
`../../roblox/sources/gamedev/skills/other-engines/roblox-luau/`
