# Inventário

## Modelo de dado

Comece com a forma mais simples que serve. Para a maioria dos jogos, é um
dicionário de contagem:

```luau
type Inventory = { [string]: number }         -- itemId -> quantidade
```

Item com estado próprio (durabilidade, encantamento, nível) precisa de
instâncias:

```luau
type ItemInstance = { uid: string, id: string, qty: number, meta: { [string]: any }? }
type Inventory = { ItemInstance }
```

**Não comece pelo segundo se o jogo não tem estado por item.** A migração de
um para o outro é uma função de 10 linhas; carregar a complexidade desde o
início custa em todo lugar (`../process/03-restraint.md`).

## Catálogo no servidor

A definição do item — preço, raridade, efeito, se é único — vive em
`ServerScriptService`. Só a parte cosmética (nome exibido, ícone, descrição)
vai para `ReplicatedStorage`.

```luau
-- ServerScriptService/Catalog.lua
return table.freeze({
	sword_iron = { price = 100, maxStack = 1, tradeable = true, damage = 12 },
	potion_hp  = { price = 25,  maxStack = 99, tradeable = true, heal = 50 },
})
```

Tabela de preço em `ReplicatedStorage` é um convite: o atacante lê, acha o
item mais lucrativo e foca o exploit nele. Ver `security.md`.

## Operações atômicas

Toda mudança acontece no servidor, numa função, sem `task.wait()` no meio.
Qualquer yield entre checar e aplicar é uma janela de duplicação.

```luau
local function addItem(player: Player, id: string, qty: number): boolean
	local data = DataService.get(player)
	if not data then return false end                      -- ainda carregando
	if not Catalog[id] then return false end
	if type(qty) ~= "number" or qty ~= qty or qty <= 0 then return false end
	qty = math.floor(qty)

	local current = data.inventory[id] or 0
	local maxStack = Catalog[id].maxStack
	if current + qty > maxStack then return false end
	if countSlots(data.inventory) >= MAX_SLOTS and current == 0 then return false end

	data.inventory[id] = current + qty
	InventoryChanged:FireClient(player, data.inventory)
	return true
end

local function removeItem(player: Player, id: string, qty: number): boolean
	local data = DataService.get(player)
	if not data then return false end
	local current = data.inventory[id] or 0
	if type(qty) ~= "number" or qty <= 0 or current < qty then return false end

	data.inventory[id] = (current - qty > 0) and (current - qty) or nil
	InventoryChanged:FireClient(player, data.inventory)
	return true
end
```

`data.inventory[id] = nil` em vez de `= 0`: o dicionário não cresce com
entradas mortas, e o DataStore fica menor.

## Transferência — remova antes de dar

```luau
local function transfer(from: Player, to: Player, id: string, qty: number): boolean
	if not removeItem(from, id, qty) then return false end
	if not addItem(to, id, qty) then
		addItem(from, id, qty)            -- desfaz; nunca deixe o item sumir
		return false
	end
	return true
end
```

A ordem importa: remover primeiro impede duplicação, e o rollback impede
perda. O caminho errado (dar antes de remover) duplica item se a segunda
operação falhar.

Trade entre jogadores: trave os dois inventários durante a negociação,
confirme os dois lados e execute a troca inteira numa passagem sem yield.

## Sincronização com o cliente

O cliente recebe o inventário e desenha. Ele **nunca** o modifica localmente —
nem "otimisticamente". Uma UI que subtrai antes da confirmação mostra estado
falso quando o servidor recusa.

Inventário grande muda muito? Mande o delta em vez da tabela inteira:

```luau
InventoryDelta:FireClient(player, { [id] = newQty })   -- nil = removido
```

## Persistência

Inventário é dado de jogador: ProfileStore, session lock, template com
`inventory = {}`, `Reconcile()` ao adicionar campo. Ver `datastore.md`.

Serialize compacto: `{ sword_iron = 1 }` e não `{ { itemId = "sword_iron",
quantity = 1, acquiredAt = ... } }`. O limite de 4 MB por chave chega mais
rápido do que parece com estrutura verbosa.

Aprofundar: `../../roblox-game/references/inventory-systems.md`
