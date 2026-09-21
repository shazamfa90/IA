# UI

## Ciclo de vida

`StarterGui` é um molde: cada `ScreenGui` é **clonado** para `PlayerGui` a cada
spawn. Consequências:

- `ResetOnSpawn = false` para HUD que deve sobreviver à morte. Padrão é `true` e é a causa nº 1 de "minha UI sumiu".
- Referência guardada ao objeto de `StarterGui` aponta para o molde, não para a cópia viva. Sempre parta de `player.PlayerGui`.
- Script de UI vive em `StarterPlayerScripts` (roda uma vez), não dentro do `ScreenGui` (roda a cada respawn).

```luau
local gui = player:WaitForChild("PlayerGui"):WaitForChild("HUD")
```

## Responsividade

```luau
frame.Size = UDim2.fromScale(0.4, 0.25)    -- escala, não pixel
frame.Position = UDim2.fromScale(0.5, 0.5)
frame.AnchorPoint = Vector2.new(0.5, 0.5)
```

- **Escala** para posição e tamanho; **offset** só para borda, padding e espessura.
- `UIAspectRatioConstraint` para o que não pode distorcer.
- `UIListLayout`/`UIGridLayout` + `AutomaticSize` em vez de calcular posição na mão.
- `UISizeConstraint` para impedir que fique minúsculo ou gigante nos extremos.
- Teste em celular estreito **e** ultrawide. O Studio emula ambos.

Insets seguros (notch, barra de sistema):

```luau
local inset = GuiService:GetGuiInset()          -- topo ocupado pela barra da Roblox
screenGui.ScreenInsets = Enum.ScreenInsets.DeviceSafeInsets
```

## Acessibilidade — inviolável

Não é enfeite. É o que decide se metade dos jogadores consegue jogar.

- **Alvo de toque ≥ 44×44 px** na menor tela suportada. Botão pequeno em mobile é jogo injogável.
- **Gamepad:** `Selectable = true` e `NextSelectionUp/Down/Left/Right` explícitos nos controles; teste navegando só com o direcional. `GuiService.SelectedObject` define o foco inicial.
- **Contraste:** texto claro sobre fundo escuro ou vice-versa; nunca texto fino cinza sobre imagem. Adicione `UIStroke` ou fundo semi-opaco atrás de texto sobre cenário.
- **Nunca só cor:** vermelho/verde para sucesso/erro precisa também de ícone ou texto. Daltonismo é ~8% dos homens.
- **Texto escalável:** `TextScaled` com `UITextSizeConstraint` (mínimo legível), nunca fonte fixa em 11px.
- **Sem dependência de tempo:** nada que exija reação em menos de ~1s sem alternativa.

Coloque isso no review (`../process/06-review.md`), não na lista de desejos.

## Input multi-dispositivo

```luau
local function isTouch() return UserInputService.TouchEnabled end
local function isGamepad() return UserInputService.GamepadEnabled end

UserInputService.LastInputTypeChanged:Connect(function(t)
	-- troque dica de tecla (E / ⬦ / toque) conforme o dispositivo atual
end)
```

Não decida o dispositivo uma vez no início: o jogador troca de teclado para
gamepad no meio da sessão. `ProximityPrompt` já faz isso sozinho — mais uma
razão para preferi-lo.

## UI orientada a estado

O padrão que evita UI mentindo: uma função de render, um estado.

```luau
local state = { coins = 0, items = {} }

local function render()
	coinLabel.Text = `{state.coins}`
	-- ... reconstrói só o que mudou
end

UpdateData.OnClientEvent:Connect(function(newState)
	state = newState
	render()
end)
```

O cliente **nunca** calcula o estado; ele recebe e desenha. Botão de compra
não subtrai moeda localmente — ele pede e espera o servidor confirmar. Ver
`client-server.md`.

## Limpeza e performance

- Toda conexão de botão guardada em Trove/Maid, destruída junto com a tela.
- Lista longa: reuse os frames visíveis em vez de criar 500 (`ScrollingFrame` + reciclagem).
- `CanvasSize` automático via `AutomaticCanvasSize` + `UIListLayout`.
- Não anime dezenas de elementos por frame; `TweenService` e deixe a engine trabalhar.

Framework (Fusion, Roact/React-lua) vale quando a UI tem muito estado
derivado. Para um HUD com 5 labels, é mais código que a solução direta — ver
`../process/03-restraint.md`. Já tem um no projeto? Siga.

Aprofundar: `../../roblox-game/references/gui-systems.md` ·
`../../roblox/sources/gamedev/skills/other-engines/roblox-ui/`
