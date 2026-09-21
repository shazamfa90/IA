# Multiplayer e replicação

## O que replica sozinho

Mudança de propriedade de `Instance` feita **no servidor** replica para todos.
Mudança feita no cliente **não** replica (exceto no que o cliente tem network
ownership). Isso decide a maior parte das dúvidas:

| Feito no servidor | Feito no cliente |
|---|---|
| replica a todos | local; some para os outros |
| custa banda | grátis |
| autoritativo | cosmético |

Efeito visual (partícula, som, tween de UI) deve rodar no cliente, disparado
por um remote leve. Mandar o servidor criar 30 partículas replicadas é
desperdício de banda que aparece como lag.

## Network ownership

O personagem do jogador pertence ao cliente dele — por isso o movimento é
fluido e por isso o servidor precisa validar (`security.md`).

Para o resto:

```luau
part:SetNetworkOwner(nil)      -- servidor manda: plataforma, porta, objetivo
part:SetNetworkOwner(player)   -- cliente manda: veículo que ele dirige
```

Regra: dê ao cliente o que ele precisa que responda **imediatamente** ao input
dele; mantenha no servidor tudo que afeta outros jogadores. Objeto disputado
por dois jogadores fica no servidor, sempre.

## Latência — o padrão que funciona

Ninguém tolera 200 ms entre clicar e ver. A solução não é "confiar no
cliente", é **prever e reconciliar**:

1. **Cliente** age imediatamente no visual (swing da arma, som, partícula).
2. **Cliente** manda a intenção pelo remote (`atacar`, com alvo e tempo).
3. **Servidor** valida e decide o resultado real.
4. **Servidor** responde; cliente corrige se divergiu.

O cliente nunca aplica dano — ele só mostra o gesto. Se o servidor recusar, o
cliente mostra "errou". Ver `combat.md`.

## Orçamento de rede

| Custo | Regra |
|---|---|
| Remote por frame por jogador | proibido; agrupe em lote |
| `FireAllClients` em evento frequente | mande só para quem está perto |
| Tabela grande no payload | mande delta, não estado completo |
| Estado simples e contínuo | `Attribute` em vez de remote |
| Cosmético de alta frequência | `UnreliableRemoteEvent` |

Envio direcionado, em vez de `FireAllClients`:

```luau
local RANGE = 150
for _, player in Players:GetPlayers() do
	local root = player.Character and player.Character.PrimaryPart
	if root and (root.Position - origin).Magnitude <= RANGE then
		Effect:FireClient(player, origin, kind)
	end
end
```

## StreamingEnabled

Liga carregamento parcial do `Workspace` — essencial para mapa grande, e fonte
de bug sutil: **o cliente pode não ter a parte que o script dele espera**.

- Cliente sempre usa `:WaitForChild()` para o que não é essencial.
- Marque com `ModelStreamingBehavior`/`StreamingIntegrityMode` o que o jogador não pode perder.
- Lógica de servidor nunca depende do que está carregado no cliente.

## Escala

Teste com 2 jogadores no Studio; teste com muitos antes de lançar. O que
quebra com carga:

- Loop O(n²) sobre jogadores (cada um checando todos) a cada frame.
- Orçamento de DataStore compartilhado pelo servidor.
- `FireAllClients` num evento que escala com jogadores.
- Tabela de estado que cresce e nunca limpa quando alguém sai.

`Players.PlayerRemoving` precisa limpar **toda** tabela indexada por jogador.
Esse é o vazamento mais comum em servidor de vida longa.

Aprofundar: `../../roblox-game/references/multiplayer-networking.md` ·
`../../roblox/sources/gamedev/skills/other-engines/roblox-networking/`
