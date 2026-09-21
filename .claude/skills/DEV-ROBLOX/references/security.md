# Segurança e anti-exploit

O atacante tem execução arbitrária no cliente dele. Ele lê tudo em
`ReplicatedStorage`, chama qualquer remote com qualquer argumento, edita a
memória do próprio cliente e vê tudo que foi replicado. Nada disso é
detectável de forma confiável **de dentro do cliente**.

Conclusão de projeto: **não detecte, previna por arquitetura.**

## Superfície de ataque

| Vetor | Mitigação |
|---|---|
| Remote com argumento hostil | validação completa (`client-server.md`) |
| Remote chamado em flood | rate limit por jogador, antes do trabalho |
| Lógica sensível em `ReplicatedStorage` | mova para `ServerScriptService` |
| Cliente reportando resultado (dano, score, posição) | servidor calcula; cliente no máximo sugere |
| Teleporte / velocidade / voo | validação de movimento no servidor |
| Duplicação de item | operação atômica no servidor, um dono por item |
| Compra fraudulenta | `ProcessReceipt` correto (`publishing.md`) |
| Dado sensível replicado | só replique o que o jogador pode saber |

## Validação de movimento

Personagem tem network ownership do cliente — o cliente *é* a autoridade de
posição por design da engine. Então valide o resultado, não o meio:

```luau
local MAX_STUDS_PER_SEC = 40   -- folga acima da velocidade real de sprint

local last: { [Player]: { pos: Vector3, t: number } } = {}

RunService.Heartbeat:Connect(function()
	for _, player in Players:GetPlayers() do
		local root = player.Character and player.Character.PrimaryPart
		if not root then continue end

		local now, prev = os.clock(), last[player]
		if prev then
			local dt = now - prev.t
			local dist = (root.Position - prev.pos).Magnitude
			if dt > 0 and dist / dt > MAX_STUDS_PER_SEC then
				root.CFrame = CFrame.new(prev.pos)   -- corrige, não pune
			end
		end
		last[player] = { pos = root.Position, t = now }
	end
end)
```

Corrigir é melhor que banir: falso positivo por lag é comum, e punir jogador
legítimo custa mais que o exploit. Kick/ban só com padrão repetido e registrado.

## Interação por distância

Todo remote que age sobre algo do mundo checa proximidade no servidor:

```luau
local MAX_REACH = 20

local function canReach(player: Player, target: BasePart): boolean
	local root = player.Character and player.Character.PrimaryPart
	return root ~= nil and (root.Position - target.Position).Magnitude <= MAX_REACH
end
```

Sem isso, o atacante abre o baú do outro lado do mapa.

## Anti-duplicação

Toda operação que move um item é atômica no servidor, com dono único:

```luau
-- errado: dois pedidos simultâneos ambos passam pela checagem
if inv[id] > 0 then inv[id] -= 1; give(other, id) end

-- certo: decremente primeiro, desfaça se falhar
if (inv[id] or 0) <= 0 then return false end
inv[id] -= 1
local ok = give(other, id)
if not ok then inv[id] += 1 end
return ok
```

Trade entre jogadores: use um estado de "travado" durante a negociação, e
confirme os dois lados na mesma passagem de código, sem `task.wait()` no meio
(qualquer yield é uma janela de corrida).

## O que nunca vai para o cliente

- Chave de API, token de Open Cloud, URL de webhook.
- Fórmula de preço dinâmico, tabela de chance de drop, condição de item raro.
- Dado de outro jogador além do necessário para exibir.
- Qualquer coisa cujo vazamento estrague a economia.

`ReplicatedStorage` é público. `ServerStorage` e `ServerScriptService` não são.

## Proteção de dado do jogador

- Guarde o **mínimo**: `UserId` e progresso de jogo. Nunca nome real, e-mail, idade, mensagem privada.
- Nunca logue dado de jogador em serviço externo sem necessidade clara.
- `HttpService` para fora: só para domínio que você controla, sempre em `pcall`, nunca mandando dado pessoal.
- Chat e nome de jogador exibidos: passe por `TextService:FilterStringAsync` — é requisito da plataforma, não opcional.

## Registro

Registre tentativa de exploit (remote rejeitado, movimento corrigido) com
`UserId`, o que foi tentado e quando. Sem isso você não sabe se está sendo
atacado nem qual vetor. Registre no servidor; nunca dependa de relato do cliente.

Aprofundar: `../../roblox-game/references/security-hardening.md` ·
`../../roblox-game/workflows/security-audit.md`
