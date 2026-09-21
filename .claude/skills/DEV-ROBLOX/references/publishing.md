# Publicação e monetização

## Monetização — a parte que não pode errar

### ProcessReceipt: a ordem é lei

Dev Product mal implementado cobra o jogador e não entrega, ou entrega
infinitas vezes. Ambos são irreversíveis em reputação.

```luau
local MarketplaceService = game:GetService("MarketplaceService")

local HANDLERS = {
	[123456] = function(player) return addCoins(player, 1000) end,
	[123457] = function(player) return addItem(player, "sword_iron", 1) end,
}

MarketplaceService.ProcessReceipt = function(receipt)
	local player = Players:GetPlayerByUserId(receipt.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet   -- tenta de novo depois
	end

	local data = DataService.get(player)
	if not data then
		return Enum.ProductPurchaseDecision.NotProcessedYet   -- dado não carregou
	end

	-- idempotência: já processamos este recibo?
	data.receipts = data.receipts or {}
	if data.receipts[receipt.PurchaseId] then
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end

	local handler = HANDLERS[receipt.ProductId]
	if not handler then
		return Enum.ProductPurchaseDecision.NotProcessedYet   -- produto desconhecido: NÃO consuma
	end

	local ok, granted = pcall(handler, player)
	if not ok or not granted then
		warn(`[Shop] falha ao conceder {receipt.ProductId}: {granted}`)
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	data.receipts[receipt.PurchaseId] = os.time()             -- marque só após conceder
	return Enum.ProductPurchaseDecision.PurchaseGranted
end
```

Três regras que fecham o problema inteiro:

1. **Conceda antes de retornar `PurchaseGranted`.** Retornar primeiro e falhar depois cobra sem entregar.
2. **`NotProcessedYet` em qualquer dúvida.** A Roblox tenta de novo; o jogador não perde nada.
3. **Registre o `PurchaseId` no dado persistido.** Sem isso, um retry concede duas vezes.

Limpe recibos antigos periodicamente para não crescer sem fim — mas só os com
meses de idade.

### Gamepass

```luau
local ok, owns = pcall(function()
	return MarketplaceService:UserOwnsGamePassAsync(player.UserId, PASS_ID)
end)
if not ok then owns = false end     -- falha de rede não vira benefício grátis
```

Cache o resultado por sessão (a chamada tem limite), mas escute
`PromptGamePassPurchaseFinished` para conceder na hora da compra sem precisar
reentrar.

### Monetização responsável

Não é moralismo, é retenção e conformidade com as políticas da plataforma:

- Preço e conteúdo do item claros **antes** da compra.
- Nada de mecânica que confunde criança sobre estar gastando dinheiro real.
- Caixa/loot com chance: exiba as probabilidades. Exigido em várias jurisdições.
- Sem pressão temporal falsa ("resta 1 minuto!" que reinicia sozinho).
- Vantagem paga em PvP destrói a base de jogadores mais rápido do que gera receita.

## Gate de publicação

Nada sobe para o público sem isto:

- [ ] Testado em **servidor publicado privado**, não só no Studio — latência e DataStore real mudam comportamento.
- [ ] Compra testada ponta a ponta: sucesso, cancelamento, e falha no meio (desconecte a internet na hora).
- [ ] Dado de jogador da versão anterior carrega sem erro (`datastore.md`, migração).
- [ ] Rodou 30 minutos com 2+ jogadores: memória estável, sem erro novo no Developer Console (F9).
- [ ] Matriz de playtest completa (`../process/05-testing.md`), incluindo mobile e gamepad.
- [ ] Feature nova pode ser desligada sem publicar update? (`Attribute` no `Workspace`, lido em runtime)
- [ ] Nenhum `print` de debug, nenhuma parte de teste no `Workspace`, nenhum script comentado "temporário".

## Rollout

Publique com capacidade de recuar:

```luau
-- flag lida em runtime; editável no Studio sem republicar
local function featureOn(name: string): boolean
	return workspace:GetAttribute(`feature_{name}`) == true
end
```

Feature grande: libere para um lugar de teste primeiro, depois para todos.
Dado novo: escreva o campo novo antes de passar a lê-lo, para que a versão
antiga e a nova convivam durante o rollout.

## Página da experiência

Influencia mais as primeiras impressões que boa parte do código:

- Ícone legível em miniatura pequena; thumbnail mostrando gameplay real.
- Título e descrição dizendo o que o jogador faz, não adjetivos.
- Gênero e faixa etária corretos — errado derruba a descoberta.
- Idiomas: `LocalizationService` + tabela de tradução se o público for global.

## Pós-lançamento

Olhe nos primeiros 30 minutos e nas primeiras 24 h:

- Developer Console de um servidor real: erros novos.
- Retenção D1 e tempo médio de sessão no painel de analytics.
- Funil de compra: quantos abrem a loja vs. quantos compram.
- Relatos de exploit: um vetor novo costuma aparecer em horas.

Erro de servidor não aparece no Studio. A primeira hora depois de publicar é o
melhor momento para achar o que o playtest não pegou.

Aprofundar: `../../roblox-game/workflows/publish-checklist.md` ·
`../../roblox-game/references/monetization-systems.md` ·
`../../roblox-game/workflows/monetization-audit.md`
