# NPCs e IA

## Antes de escrever IA

A maioria dos NPCs de Roblox não precisa de IA — precisa de **comportamento
previsível e barato**. Escada, do mais barato ao mais caro:

1. **Animação/tween em caminho fixo** — guarda patrulhando, plataforma. Zero lógica.
2. **Máquina de estados** — 3 a 6 estados cobrem inimigo, vendedor, companheiro.
3. **Behavior tree** — só quando estados viram um emaranhado de transições.
4. **Utility AI / planejamento** — raramente justificado num jogo Roblox.

Comece no 1. Suba um degrau quando o comportamento atual visivelmente não
serve, nunca por antecipação (`../process/03-restraint.md`).

## Máquina de estados — a forma padrão

```luau
local States = {}

function States.Idle(npc, dt)
	local target = npc:findTarget()
	if target then return "Chase" end
	if npc:shouldPatrol() then return "Patrol" end
	return nil                                    -- fica
end

function States.Chase(npc, dt)
	local target = npc.target
	if not target or not target.Parent then return "Idle" end
	local dist = (target.Position - npc.root.Position).Magnitude
	if dist > npc.loseRange then return "Idle" end
	if dist <= npc.attackRange then return "Attack" end
	npc:moveTo(target.Position)
	return nil
end

-- tick central, um único loop para todos os NPCs
RunService.Heartbeat:Connect(function(dt)
	for _, npc in activeNpcs do
		local nextState = States[npc.state](npc, dt)
		if nextState then
			npc.state = nextState
			npc:onEnter(nextState)
		end
	end
end)
```

**Um loop para todos os NPCs**, não um `while true` por NPC. Cem NPCs com loop
próprio é cem threads competindo; um loop iterando cem tabelas é trivial.

## Pathfinding

`PathfindingService` antes de qualquer navegação própria:

```luau
local path = PathfindingService:CreatePath({
	AgentRadius = 2, AgentHeight = 5, AgentCanJump = true,
	Costs = { Water = 20, Lava = math.huge },
})

local ok = pcall(function() path:ComputeAsync(from, to) end)
if not ok or path.Status ~= Enum.PathStatus.Success then
	npc:moveTo(to)            -- fallback: linha reta
	return
end

for _, wp in path:GetWaypoints() do
	if wp.Action == Enum.PathWaypointAction.Jump then
		npc.humanoid.Jump = true
	end
	npc.humanoid:MoveTo(wp.Position)
	npc.humanoid.MoveToFinished:Wait()
end
```

- `ComputeAsync` em `pcall` — falha e custa tempo; nunca a cada frame.
- Recalcule por **evento** (alvo se moveu muito, caminho bloqueado), não por intervalo fixo curto.
- Sempre tenha fallback: caminho falhado não pode congelar o NPC.

## Autoridade e custo

NPC é servidor. Sempre:

- Posição, dano e decisão no servidor — senão cada cliente vê um NPC diferente e o atacante mata o boss instantaneamente.
- Efeito visual do NPC no cliente, disparado por remote.
- `SetNetworkOwner(nil)` nas partes do NPC, para o servidor mandar na física.

Orçamento: NPC longe do jogador não precisa pensar.

```luau
local function tickRate(npc): number
	local d = npc:distanceToNearestPlayer()
	if d < 50 then return 0 end        -- todo frame
	if d < 150 then return 0.2 end
	return 1                            -- quase dormindo
end
```

Esse escalonamento por distância costuma ser a maior economia de CPU num jogo
com muitos NPCs — mais que qualquer micro-otimização.

## Percepção

Não use "o jogador está no raio" sozinho: o NPC enxerga através de parede.
Um raycast resolve:

```luau
local params = RaycastParams.new()
params.FilterType = Enum.RaycastFilterType.Exclude
params.FilterDescendantsInstances = { npc.model }

local dir = target.Position - eye.Position
if dir.Magnitude <= sightRange then
	local hit = workspace:Raycast(eye.Position, dir, params)
	local sees = hit and hit.Instance:IsDescendantOf(targetModel)
end
```

Reuse o `RaycastParams` — criar um por frame por NPC é lixo desnecessário.

Aprofundar: `../../roblox/sources/gamedev/skills/disciplines/game-ai/` ·
`../../roblox/sources/gamedev/skills/disciplines/ai-behavior-trees-utility-ai/` ·
`../../roblox/sources/gamedev/skills/other-engines/roblox-characters/`
