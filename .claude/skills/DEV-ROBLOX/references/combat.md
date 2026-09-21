# Combate

## A divisão obrigatória

| Cliente | Servidor |
|---|---|
| detecta input, toca animação e som | valida, calcula dano, aplica |
| mostra o gesto imediatamente | decide se acertou |
| sugere o alvo | confirma alcance, linha de visão, cooldown |

Cliente que aplica dano é jogo com aimbot no primeiro dia. Cliente que só
*sugere* o alvo é jogável e seguro — o servidor confere.

## Fluxo de um ataque

```luau
-- CLIENTE: age no visual, manda a intenção
local function swing()
	if os.clock() - lastSwing < COOLDOWN then return end
	lastSwing = os.clock()
	playAnimation("Swing")                        -- feedback imediato, 0 ms
	Attack:FireServer(hoveredTarget)              -- sugestão, não ordem
end

-- SERVIDOR: a verdade
Attack.OnServerEvent:Connect(function(player, target)
	if not rateLimit(player, COOLDOWN) then return end
	if typeof(target) ~= "Instance" then return end

	local hum = target:FindFirstChildOfClass("Humanoid")
	local targetRoot = target:FindFirstChild("HumanoidRootPart")
	if not hum or not targetRoot or hum.Health <= 0 then return end

	local root = player.Character and player.Character.PrimaryPart
	if not root then return end
	if (root.Position - targetRoot.Position).Magnitude > WEAPON_RANGE then return end
	if not hasLineOfSight(root.Position, targetRoot.Position, player.Character) then return end
	if not canDamage(player, target) then return end     -- time, zona segura, PvP ligado

	local dmg = DamageMath.compute(weaponOf(player), armorOf(target), rollCrit())
	hum:TakeDamage(dmg)
	Hit:FireClient(player, target, dmg)                  -- feedback de acerto
end)
```

Cada `return` ali é um exploit fechado. Nenhum deles é overengineering — são
os invioláveis do `SKILL.md`.

## Hitbox: escolha a mais barata que serve

| Técnica | Quando | Custo |
|---|---|---|
| Distância (`Magnitude`) | corpo a corpo, área | mínimo |
| `Raycast` | tiro preciso, linha de visão | baixo |
| `Shapecast` (`Blockcast`/`Spherecast`) | projétil com espessura | médio |
| `GetPartBoundsInRadius` | explosão, área de efeito | médio |
| `Touched` | **evite** | impreciso, dispara demais, perde em alta velocidade |

`Touched` é a origem de metade dos bugs de dano em Roblox: dispara múltiplas
vezes, perde colisão rápida e não funciona bem com `CanCollide = false`.
Prefira raycast/shapecast com um debounce por alvo.

```luau
local params = RaycastParams.new()
params.FilterType = Enum.RaycastFilterType.Exclude
params.FilterDescendantsInstances = { attackerCharacter }
params.RespectCanCollide = true

local result = workspace:Blockcast(cframe, size, direction, params)
```

Reuse o `RaycastParams`; não crie um por disparo.

## Lag compensation — o mínimo honesto

Com 150 ms de ping, o alvo que o atirador viu já saiu de lá. Duas posturas:

- **Servidor estrito:** só a posição atual conta. Simples, justo com quem tem ping baixo, frustrante para os outros.
- **Favorecer o atirador:** o servidor guarda um histórico curto de posições (300–500 ms) e valida contra onde o alvo estava no instante do tiro.

```luau
-- servidor: histórico circular por jogador
local history: { [Player]: { { t: number, pos: Vector3 } } } = {}
-- ao validar, use a posição em (agora - pingDoAtirador), com teto
```

Comece pelo estrito. Só implemente o histórico quando o jogo for
competitivo **e** o playtest mostrar o problema. É a diferença entre 20 linhas
e 200.

Nunca aceite o timestamp mandado pelo cliente sem teto: `math.clamp` contra o
ping real, senão o atacante "atira no passado" indefinidamente.

## Morte e respawn

```luau
humanoid.Died:Connect(function()
	local killer = lastDamager[humanoid]
	if killer then awardKill(killer) end
	lastDamager[humanoid] = nil                  -- sempre limpe
end)
```

- Registre quem causou o dano para creditar a morte, com validade por tempo.
- Limpe todas as tabelas indexadas por personagem/jogador no `Died` e no `PlayerRemoving`.
- Reconecte tudo em `CharacterAdded` — o personagem novo é outro objeto.

## Zonas seguras e PvP

Uma função central `canDamage(attacker, target)` que checa time, zona, estado
e PvP ligado. Todos os caminhos de dano passam por ela — sem exceção. Espalhar
essa checagem em cada arma garante que uma delas vai esquecer.

Aprofundar: `../../roblox-game/references/combat-systems.md` ·
`../../roblox/sources/gamedev/skills/other-engines/roblox-physics/`
