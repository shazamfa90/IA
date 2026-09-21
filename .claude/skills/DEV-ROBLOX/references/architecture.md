# Arquitetura Roblox

## Onde mora o quê

| Local | Conteúdo | Regra |
|---|---|---|
| `ServerScriptService` | lógica de servidor, dados, anti-cheat | cliente nunca lê |
| `ServerStorage` | assets só do servidor (mapas, tools) | cliente nunca lê |
| `ReplicatedStorage` | módulos compartilhados, remotes, config pública | **tudo aqui é visível ao atacante** |
| `StarterPlayerScripts` | controllers de cliente (input, câmera, UI) | roda uma vez por jogador |
| `StarterCharacterScripts` | scripts que precisam re-rodar a cada respawn | cuidado com duplicação |
| `StarterGui` | ScreenGuis (clonados para `PlayerGui`) | `ResetOnSpawn` importa |
| `Workspace` | mundo 3D | mantenha leve; é replicado |

Regra que decide 90% dos casos: **se o cliente não precisa ver, não coloque em
`ReplicatedStorage`.** Tabela de loot, fórmula de preço e chance de drop em
`ReplicatedStorage` são um mapa do tesouro para quem exploita.

## Formato de organização

```
ServerScriptService/
  Services/        -- um módulo por domínio: DataService, CombatService, ShopService
  init.server.lua  -- bootstrap: requer, inicializa em ordem, começa
ReplicatedStorage/
  Shared/          -- lógica pura usada pelos dois lados (matemática, validação, tipos)
  Remotes/         -- RemoteEvents/Functions, criados em código, não à mão
  Config/          -- só o que o cliente pode saber
StarterPlayerScripts/
  Controllers/     -- um módulo por domínio de cliente
  init.client.lua  -- bootstrap do cliente
```

Bootstrap explícito e em ordem vence auto-descoberta mágica: quando algo
falha, a stack aponta a linha certa.

```luau
-- ServerScriptService/init.server.lua
local Services = script.Parent.Services
local order = { "DataService", "CombatService", "ShopService" }

for _, name in order do
	local svc = require(Services[name])
	if svc.init then svc.init() end        -- fase 1: todos prontos
end
for _, name in order do
	local svc = require(Services[name])
	if svc.start then task.spawn(svc.start) end  -- fase 2: começam a agir
end
```

Duas fases (`init` depois `start`) eliminam a classe inteira de bugs de "o
serviço B usou o A antes de ele existir".

## Módulo de serviço — a forma padrão

```luau
local DataService = {}
local profiles: { [Player]: any } = {}

function DataService.init() end          -- só preparar estado, nada de esperar
function DataService.start() end         -- conectar eventos, começar loops

function DataService.get(player: Player)
	return profiles[player]
end

return DataService
```

Estado no módulo, não em global. Uma função pública por operação. Sem
`_G`, sem `shared`.

## Framework: precisa?

Knit, Matter, Flamework resolvem problemas de projeto grande. Para um place
com menos de ~10 serviços, o bootstrap acima é menos código e menos coisa para
aprender. Adote framework quando sentir a dor que ele resolve, não antes —
ver `../process/03-restraint.md`.

Já tem um no projeto? Siga o padrão dele. Consistência vence preferência.

## Comunicação

- **Servidor → servidor:** `require` direto entre serviços. Sem eventos internos por hábito.
- **Cliente → servidor:** `RemoteEvent`/`RemoteFunction`, sempre validando (`client-server.md`).
- **Servidor → cliente:** `FireClient`/`FireAllClients`, ou `Attributes` quando é só estado replicável.
- **Dentro do cliente:** `BindableEvent` ou chamada direta entre controllers.

`Attributes` merecem consideração antes de qualquer remote de estado: replicam
sozinhos, aparecem no Explorer, e não custam nada de código.

## Rojo e código versionado

Place inteiro dentro do `.rbxl` não tem diff, review nem histórico. Rojo
(`default.project.json`) mapeia arquivos `.lua` para o place e devolve git ao
projeto. Vale a partir do momento em que existe mais de uma pessoa ou mais de
um mês.

Aprofundar: `../../roblox-game/references/architecture-patterns.md` ·
`../../roblox-game/references/tooling-ecosystem.md` ·
`../../roblox/sources/gamedev/skills/other-engines/roblox-studio-workflow/`
