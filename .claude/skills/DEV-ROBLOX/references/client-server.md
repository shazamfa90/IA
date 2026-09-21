# Fronteira cliente-servidor

**O cliente é hostil.** Não "pode ser" — é. Todo payload que chega num remote
foi escrito por um atacante até prova em contrário. Essa suposição não é
paranoia, é o modelo de ameaça correto: executores de script são gratuitos e
comuns.

## Quem decide o quê

| Servidor decide | Cliente decide |
|---|---|
| moeda, inventário, dano, progresso, loot | input, câmera, efeito visual local |
| quem pode comprar/equipar/atacar | previsão de movimento (sujeita a correção) |
| posição autoritativa de NPC e objetivo | som e partícula local |
| tempo de cooldown | animação de feedback |

O cliente **exibe** o que o servidor decidiu. Um cliente que calcula dano e
manda o resultado é um jogo já exploitado.

## O padrão de validação

Toda `OnServerEvent` começa igual:

```luau
local COOLDOWN = 0.5
local lastFire: { [Player]: number } = {}

BuyItem.OnServerEvent:Connect(function(player, itemId)
	-- 1. rate limit (antes de qualquer trabalho)
	local now = os.clock()
	if now - (lastFire[player] or 0) < COOLDOWN then return end
	lastFire[player] = now

	-- 2. tipo
	if type(itemId) ~= "string" then return end

	-- 3. existência / range
	local item = Catalog[itemId]
	if not item then return end

	-- 4. posse e estado
	local profile = DataService.get(player)
	if not profile then return end                  -- ainda carregando
	if profile.coins < item.price then return end
	if profile.inventory[itemId] and item.unique then return end

	-- 5. só agora o efeito
	profile.coins -= item.price
	profile.inventory[itemId] = (profile.inventory[itemId] or 0) + 1
	UpdateInventory:FireClient(player, profile.inventory)
end)

Players.PlayerRemoving:Connect(function(p) lastFire[p] = nil end)
```

A ordem importa: rate limit primeiro (barato, corta flood), efeito por último
(caro, irreversível). Validação falhou → `return` silencioso. Não mande erro
de volta detalhando o motivo: é manual de exploit.

## O que validar, sempre

| Checagem | Por quê |
|---|---|
| `type()` / `typeof()` | o atacante manda tabela onde você espera número |
| Range numérico e `x == x` (NaN) | `math.huge`, negativo e NaN quebram matemática |
| Instância: existe, é da classe certa, ainda tem `Parent` | remote aceita `Instance` arbitrária |
| Posse: o alvo pertence a quem pediu? | pedir em nome de outro jogador |
| Distância: o jogador está perto o suficiente? | interagir com o mapa inteiro |
| Estado: o jogador pode fazer isso agora? | comprar morto, atacar no lobby |
| Cooldown por jogador | flood e automação |

Argumento variádico (`...`) num remote é superfície de ataque aberta. Declare
os parâmetros esperados e ignore o resto.

## RemoteFunction: cuidado

`RemoteFunction:InvokeClient()` **trava o servidor** se o cliente não
responder (ou responder nunca, de propósito). Regra prática: servidor nunca
invoca cliente. Use `FireClient` e deixe o cliente responder por um
`RemoteEvent` separado.

`OnServerInvoke` é aceitável quando o cliente precisa mesmo de resposta
(consultar preço, validar nome) — com a mesma validação acima, e erro tratado.

## Escolhendo o remote

| Use | Quando |
|---|---|
| `RemoteEvent` | padrão; ação sem resposta imediata |
| `RemoteFunction` (`OnServerInvoke`) | cliente precisa do retorno para continuar |
| `UnreliableRemoteEvent` | cosmético de alta frequência (rastro, posição de efeito) onde perder pacote não importa |
| `Attributes` | estado simples que o cliente só precisa ler — replica sozinho, zero código |

## Frequência

Um remote por frame por jogador é um problema de rede com 30 jogadores.
Agrupe: acumule mudanças e mande um lote por intervalo, ou mande só o delta.
Ver `multiplayer.md` e `optimization.md`.

Aprofundar: `../../roblox-game/references/multiplayer-networking.md` ·
`../../roblox/sources/gamedev/skills/other-engines/roblox-networking/`
