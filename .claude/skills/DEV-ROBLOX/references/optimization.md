# Otimização

**Meça primeiro.** Otimização sem número é overengineering com boa intenção —
`../process/03-restraint.md`. O orçamento é simples: 60 FPS = 16,6 ms por
frame, no pior dispositivo que você suporta, não no seu PC.

## Ferramentas

| Ferramenta | Responde |
|---|---|
| MicroProfiler (Ctrl+F6) | onde o frame vai embora, por seção |
| Developer Console → Memory (F9) | o que está consumindo RAM e crescendo |
| `Stats.Network` / `Stats:GetTotalMemoryUsageMb()` | banda e memória em número |
| Script Performance (Studio) | qual script custa CPU |
| `debug.profilebegin("nome")` / `debug.profileend()` | marca sua própria seção no MicroProfiler |

Memória que sobe e nunca desce = vazamento, não uso. Procure conexão não
desconectada e tabela indexada por jogador que não limpa no `PlayerRemoving`.

## As grandes economias, em ordem

1. **Não rodar** — o maior ganho. Escalone por distância e relevância: NPC longe pensa devagar, efeito fora da tela não existe, sistema sem jogador na área dorme.
2. **Rodar menos vezes** — evento em vez de polling. `Changed`/`GetPropertyChangedSignal` em vez de checar a propriedade todo frame.
3. **Rodar em lote** — um loop iterando 100 tabelas em vez de 100 loops.
4. **Rodar mais barato** — só agora micro-otimização.

A ordem quase nunca é invertida. Trocar `pairs` por iteração direta quando o
problema real é um `while true` por NPC é otimizar o irrelevante.

## Renderização

O gargalo mais comum em Roblox é *draw call* e parte, não script.

- **Menos partes:** una geometria estática em `MeshPart`. Mil partes de decoração custam mais que um mesh.
- `Anchored = true` em tudo que não se move; `CanCollide/CanTouch/CanQuery = false` no que é decorativo. Cada um remove o objeto de um sistema inteiro.
- **`StreamingEnabled`** para mapa grande — carrega só o que está perto. Ver `multiplayer.md`.
- Textura: resolução proporcional ao tamanho na tela. Textura 1024² num objeto de 20 px é desperdício puro.
- Luz dinâmica e sombra são caras; `Future` lighting em mobile é ambicioso. Teste no dispositivo real.
- Partícula: `Rate` baixo, vida curta, e nunca emissor eterno esquecido na cena.

## Scripts

```luau
-- caro: recalcula tudo por frame para todos
RunService.Heartbeat:Connect(function()
	for _, npc in npcs do npc:think() end
end)

-- barato: escalonado por relevância
local acc = 0
RunService.Heartbeat:Connect(function(dt)
	acc += dt
	if acc < 0.1 then return end                 -- 10 Hz em vez de 60
	acc = 0
	for _, npc in npcs do
		if npc.nearPlayer then npc:think() end
	end
end)
```

- Cache de serviço e construtor fora do loop.
- `table.create(n)` quando o tamanho é conhecido.
- Comparar magnitude²  em vez de `Magnitude` quando só precisa de comparação (evita `sqrt`).
- `parallel`/`Actor` para trabalho pesado e independente (geração procedural, pathfinding em massa).

## Rede

- Remote por frame por jogador é o erro que escala pior: 30 jogadores × 60 Hz = 1800 mensagens/s.
- Agrupe e mande delta.
- `FireAllClients` só quando **todos** precisam; senão, direcione por distância.
- `UnreliableRemoteEvent` para cosmético de alta frequência.
- `Attributes` para estado simples: replicam sem custo de código.

Ver `multiplayer.md`.

## Memória

Checklist de vazamento:

- [ ] Toda `:Connect()` tem `:Disconnect()` correspondente (Trove/Maid).
- [ ] Toda instância criada em runtime é destruída.
- [ ] Toda tabela `[Player]` é limpa em `PlayerRemoving`.
- [ ] Toda tabela `[Instance]` usa chave fraca ou é limpa no `Destroying`.
- [ ] Nenhum `task.spawn` com `while true` sem condição de saída.

Servidor de vida longa expõe vazamento que o playtest de 5 minutos esconde.
Rode 30 minutos e olhe a curva de memória.

Aprofundar: `../../roblox-game/references/performance-optimization.md` ·
`../../roblox-game/workflows/performance-audit.md`
