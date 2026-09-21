# Quests e progressão

## Quest é dado, não código

O erro caro é escrever um `Script` por missão. A forma certa é uma tabela de
definições e **um** motor que as interpreta:

```luau
-- ServerScriptService/Quests/Definitions.lua
return table.freeze({
	kill_10_wolves = {
		name = "Praga de lobos",
		objectives = { { kind = "kill", target = "wolf", need = 10 } },
		rewards = { coins = 500, items = { sword_iron = 1 } },
		requires = { level = 3 },
		repeatable = false,
	},
	collect_herbs = {
		name = "Ervas curativas",
		objectives = { { kind = "collect", target = "herb", need = 5 } },
		rewards = { coins = 200 },
		repeatable = "daily",
	},
})
```

Missão nova vira uma entrada na tabela, não um arquivo. Isso é a diferença
entre 10 missões e 200 missões.

## Estado do jogador

```luau
type QuestState = {
	active: { [string]: { [number]: number } },   -- questId -> índice do objetivo -> progresso
	completed: { [string]: number },              -- questId -> timestamp da conclusão
}
```

Guarde progresso por objetivo, não um booleano: "matou 7 de 10" precisa
sobreviver a sair do jogo.

## O motor

Um único ponto de entrada por tipo de evento, no servidor:

```luau
local function onEvent(player: Player, kind: string, target: string, amount: number)
	local data = DataService.get(player)
	if not data then return end

	for questId, progress in data.quests.active do
		local def = Definitions[questId]
		if not def then continue end                   -- missão removida do jogo

		for i, obj in def.objectives do
			if obj.kind ~= kind or obj.target ~= target then continue end
			local current = math.min((progress[i] or 0) + amount, obj.need)
			if current == progress[i] then continue end
			progress[i] = current
			QuestProgress:FireClient(player, questId, i, current, obj.need)
		end

		if isComplete(def, progress) then completeQuest(player, questId) end
	end
end

-- chamado dos sistemas existentes, nunca o contrário
-- combat.lua:   onEvent(killer, "kill", npcType, 1)
-- inventory.lua: onEvent(player, "collect", itemId, qty)
```

Os sistemas de gameplay **avisam** o motor de quests; o motor não vasculha o
jogo. Isso mantém o acoplamento numa direção só e evita o loop que varre todos
os jogadores a cada frame.

## Entrega da recompensa

Ponto crítico: recompensa concedida duas vezes é economia quebrada.

```luau
local function completeQuest(player: Player, questId: string)
	local data = DataService.get(player)
	if not data then return end
	if not data.quests.active[questId] then return end      -- não está ativa
	local def = Definitions[questId]
	if not def.repeatable and data.quests.completed[questId] then return end

	data.quests.active[questId] = nil                       -- 1. tire de ativa PRIMEIRO
	data.quests.completed[questId] = os.time()              -- 2. marque

	grantRewards(player, def.rewards)                       -- 3. só então conceda
	QuestCompleted:FireClient(player, questId)
end
```

A ordem (desativar → marcar → conceder) impede que dois eventos simultâneos
concedam duas vezes. Nenhum `task.wait()` entre os passos.

## Diária e semanal

Compare por período, não por contagem de segundos:

```luau
local function dailyKey(t: number): string
	return os.date("!%Y-%m-%d", t)      -- UTC, sempre; fuso do jogador vira exploit
end

local function canAccept(data, questId): boolean
	local def = Definitions[questId]
	if def.repeatable ~= "daily" then return not data.quests.completed[questId] end
	local last = data.quests.completed[questId]
	return last == nil or dailyKey(last) ~= dailyKey(os.time())
end
```

`os.time()` no servidor, sempre. Relógio do cliente é entrada hostil.

## Missão removida ou alterada

Jogadores têm missões salvas que podem não existir mais na tabela. O motor
precisa ignorar id desconhecido sem quebrar (o `continue` acima), e uma
limpeza no load remove o que não existe. Alterar o `need` de uma missão ativa é
seguro; remover um objetivo do meio não é — adicione uma versão à definição se
isso for acontecer.

## Progressão geral

Nível, XP e desbloqueio seguem as mesmas regras: servidor calcula, curva numa
tabela, cliente exibe.

```luau
local function xpForLevel(level: number): number
	return math.floor(100 * level ^ 1.5)
end
```

Curva em fórmula (uma linha) em vez de tabela de 100 entradas escrita à mão —
até você precisar de valores irregulares, e aí a tabela vira a resposta certa.

Aprofundar: `../../roblox-game/references/game-design-roblox.md` ·
`../../roblox/sources/gamedev/skills/genres/rpg/`
