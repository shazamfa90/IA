# Persistência — DataStoreService

Perda de dado é o pior bug possível num jogo Roblox: irreversível, visível e
fatal para retenção. Esta página inteira é inviolável.

## Use ProfileStore. Sério.

`SetAsync` cru para dado de jogador está errado por padrão, porque não resolve
**session locking**: o mesmo jogador pode estar em dois servidores (teleporte,
reconexão rápida, servidor fantasma) e o último a salvar apaga o outro.

ProfileStore (sucessor do ProfileService) resolve lock, autosave,
reconciliação com o template e `BindToClose`. Escrever isso à mão é semanas de
bug — ver `../process/03-restraint.md`: a dependência já resolvida vence.

```luau
local ProfileStore = require(ServerStorage.ProfileStore)

local TEMPLATE = {
	coins = 0,
	inventory = {},
	version = 1,
}

local Store = ProfileStore.New("PlayerData_v1", TEMPLATE)
local profiles: { [Player]: any } = {}

local function onJoin(player: Player)
	local profile = Store:StartSessionAsync(`{player.UserId}`, {
		Cancel = function() return player.Parent ~= Players end,
	})
	if not profile then
		player:Kick("Falha ao carregar seus dados. Entre novamente.")
		return
	end

	profile:AddUserId(player.UserId)          -- GDPR
	profile:Reconcile()                        -- campos novos do template
	profile.OnSessionEnd:Connect(function()
		profiles[player] = nil
		player:Kick("Sessão de dados encerrada.")
	end)

	if player.Parent ~= Players then
		profile:EndSession()
		return
	end
	profiles[player] = profile
end

Players.PlayerAdded:Connect(onJoin)
for _, p in Players:GetPlayers() do task.spawn(onJoin, p) end

Players.PlayerRemoving:Connect(function(player)
	local profile = profiles[player]
	if profile then profile:EndSession() end
end)
```

`BindToClose` é tratado pela própria biblioteca. Não reimplemente.

## A regra do "carregou?"

**Nunca** escreva sem saber que leu. Todo acesso passa por um getter que pode
retornar nil, e todo chamador trata o nil:

```luau
function DataService.get(player: Player)
	local profile = profiles[player]
	return profile and profile.Data or nil
end

-- no chamador
local data = DataService.get(player)
if not data then return end    -- ainda carregando; não invente valor padrão
```

Inventar `coins = 0` porque o perfil não carregou é exatamente como o jogador
perde 10 mil moedas.

## DataStore cru — quando é o certo

Para dado que **não** é do jogador (estado global, leaderboard, evento):

```luau
local store = DataStoreService:GetDataStore("GlobalEvent")

local function update(key: string, transform: (any) -> any): boolean
	for attempt = 1, 3 do
		local ok, err = pcall(function()
			store:UpdateAsync(key, transform)      -- UpdateAsync, não Set+Get
		end)
		if ok then return true end
		warn(`[Data] tentativa {attempt} falhou: {err}`)
		task.wait(2 ^ attempt)                      -- backoff
	end
	return false
end
```

`UpdateAsync` é atômico e lê-modifica-escreve numa operação. `GetAsync`
seguido de `SetAsync` perde escrita concorrente — é o bug clássico de
leaderboard.

## Migração de schema

Dado antigo existe para sempre. Versione desde o primeiro dia:

```luau
local MIGRATIONS = {
	[1] = function(d) d.inventory = d.items or {}; d.items = nil; d.version = 2 end,
}

local function migrate(data)
	while MIGRATIONS[data.version] do
		MIGRATIONS[data.version](data)
	end
	return data
end
```

Nunca renomeie um campo sem migração. Nunca mude o tipo de um campo existente
— adicione um novo e migre.

## Limites que mordem

| Limite | Valor aproximado | Consequência |
|---|---|---|
| Requisições por chave | ~10/min | throttle silencioso, dado não salva |
| Tamanho por chave | 4 MB | falha na escrita |
| Orçamento do servidor | escala com jogadores | throttle sob carga |

Inventário grande: serialize compacto (ids curtos, contagem), não tabela de
tabelas verbosa. Perto do limite: quebre em chaves (`inv_1`, `inv_2`), mas só
quando medir, não por antecipação.

## Checklist

- [ ] Toda chamada em `pcall`, com retry e backoff.
- [ ] Session lock ativo (ProfileStore) para dado de jogador.
- [ ] Getter retorna nil enquanto carrega, e chamadores tratam.
- [ ] `UpdateAsync` para qualquer coisa concorrente.
- [ ] Campo novo adicionado ao template + `Reconcile()`.
- [ ] Versão e migração escritas.
- [ ] Testado: entrar, sair, voltar; servidor desligando; dado antigo carregando.

Aprofundar: `../../roblox-game/references/datastore-persistence.md` ·
`../../roblox/sources/gamedev/skills/other-engines/roblox-datastores/`
