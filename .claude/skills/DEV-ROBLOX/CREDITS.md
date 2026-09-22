# Créditos e licenças

DEV-ROBLOX é **conteúdo original**: nenhum arquivo aqui é cópia de um
repositório de origem. O que foi incorporado são *padrões* — ideias,
disciplinas e checklists — destilados das fontes abaixo e reescritos para o
contexto Roblox/Luau. Os créditos permanecem devidos.

## Fontes de padrões

| Fonte | Licença | O que DEV-ROBLOX incorporou |
|---|---|---|
| [obra/superpowers](https://github.com/obra/superpowers) — Jesse Vincent | MIT | O ciclo analisar → planejar → implementar → testar → revisar; a "lei de ferro" da causa raiz antes da correção (`process/04-debugging.md`); evidência antes de afirmação de conclusão (`process/06-review.md`); plano como fatias verificáveis com a mais arriscada primeiro (`process/02-plan.md`) |
| ponytail | MIT | A escada de restrição, a tabela nativo-antes-de-próprio, os níveis lite/full/ultra, o formato de saída `[código] → pulado: X` (`process/03-restraint.md`) |
| [brockmartin/roblox-game-skill](https://github.com/brockmartin/roblox-game-skill) | sem LICENSE declarada | Os sharp edges SE-1..SE-5 como invioláveis; a detecção de modo MCP; o padrão router + referências sob demanda |
| [zilibobi/roblox-skills](https://github.com/zilibobi/roblox-skills) | sem LICENSE declarada | Verificar a doc oficial via subagente em vez de responder de memória; o script `robloxdocs.py` é **invocado** de `../roblox/sources/roblox-docs/`, não copiado |
| [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | Apache-2.0 | Cobertura de personagem/respawn, física/raycast e workflow de Studio, ausentes nas outras fontes; a ideia de roteamento por engine detectada |
| [jeffallan/claude-skills](https://github.com/jeffallan/claude-skills) | MIT | Arquitetura de divulgação progressiva (SKILL.md curto + `references/` modulares) |
| [wshobson/agents](https://github.com/wshobson/agents) — Seth Hobson | MIT | O pré-mortem de risco antes de construir (`process/01-analysis.md`); os eixos de revisão segurança/dado/ciclo de vida/erro (`process/06-review.md`) |

Nenhuma das duas fontes sem LICENSE declarada teve arquivos copiados para cá,
justamente por isso. Onde o material delas é usado diretamente, é por
referência de caminho ao que já está vendorizado em `../roblox/` e
`../roblox-game/`, com a procedência registrada em `../roblox/LICENSES.md`.

## Skills oficiais vendorizadas (`vendor/anthropic/`)

Copiadas **sem modificação** de [anthropics/skills](https://github.com/anthropics/skills),
sob **Apache-2.0**. Avisos de terceiros preservados em
`vendor/anthropic/THIRD_PARTY_NOTICES.md`.

| Skill | Por que entrou |
|---|---|
| `mcp-builder` | DEV-ROBLOX opera em três modos de MCP do Roblox Studio; esta é a skill para criar ou estender esse servidor |
| `skill-creator` | Evoluir, avaliar e medir a própria DEV-ROBLOX |
| `claude-api` | Serviço companheiro que chama a API da Claude (diálogo de NPC, moderação, analytics) |
| `webapp-testing` | Playwright para site ou painel companheiro fora do place |

As 15 restantes do repositório foram **descartadas** por não servirem ao fluxo
Roblox: `docx`, `pdf`, `pptx`, `xlsx` (documentos — e as únicas
*source-available*, não open source), `canvas-design`, `algorithmic-art`,
`brand-guidelines`, `theme-factory`, `frontend-design`, `web-artifacts-builder`
(design e artefatos), `internal-comms`, `doc-coauthoring`, `academy-guide`,
`discernment-nudge`, `slack-gif-creator`.

## Animação de personagem (`vendor/animate-roblox-characters/`)

De [dillydog580/animate-roblox-characters](https://github.com/dillydog580/animate-roblox-characters).
Preenche a lacuna de animação autoral do DEV-ROBLOX.

**Uma correção factual aplicada sobre o vendorizado:** o repositório de
origem chama o plugin de Studio de "Blender Animations (ultimate edition)"
em três arquivos (`SKILL.md`, `references/toolchain.md`,
`references/roblox-rigs-export.md`). O autor (CAUTIONED) renomeou o plugin
na Creator Store em 2024 — verificado em 2026-09-22 pela API pública da
Roblox (`toolbox-service/v1/items/details`, asset id `16708835782`), cuja
própria descrição confirma: *"Formerly Blender Animations (ultimate
edition) ... the name was just too long so I changed it."* Nome atual:
**RBXMonkey - Blender Animations**, mesmo asset id, mesmo link, ainda
gratuito e mantido. Corrigido nos três arquivos, com o nome antigo mantido
entre parênteses para quem procurar por ele.

**Licenças em camadas — leia antes de redistribuir:**

| Componente | Licença |
|---|---|
| Código e docs do repositório | MIT — `vendor/animate-roblox-characters/LICENSE` |
| **Add-on Cautioned 2.6.3** (`assets/blender-addons/rbx_anims_v2.6.3.zip`) | **GPL-3.0-or-later** — `assets/blender-addons/Cautioned-Blender-Animations-Plugin-LICENSE.txt` |
| Rig R6 IK+FK V2.22 (Aeresei) | **sem licença de redistribuição declarada** — por isso **não** está aqui; `scripts/fetch_assets.py` baixa do DevForum original com hash fixado |

O zip GPL-3.0 é agregação (obra separada, não modificada, não linkada), o que
mantém MIT o restante. Ainda assim, este repositório agora **carrega um
componente GPL-3.0** — relevante se ele for redistribuído sob outros termos.
Notas originais preservadas em `REPO-THIRD_PARTY_NOTICES.md` e
`THIRD_PARTY_NOTICES.md`.

**Dependências externas obrigatórias:** Blender 4.5+, Blender MCP 1.6.4, rig
R6 V2.22 baixado, add-on Cautioned (incluso), Blender Animations ultimate
edition (Creator Store) para o lado Studio. Sem isso a skill não opera —
`scripts/toolchain.py` verifica.

## Dependências em tempo de execução

- `../roblox/sources/roblox-docs/scripts/robloxdocs.py` — usado pela consulta à documentação oficial. Requer `git` e Python 3; clona [Roblox/creator-docs](https://github.com/Roblox/creator-docs) em cache local.
- `../roblox-game/`, `../roblox/sources/gamedev/`, `../roblox/sources/fullstack/` — corpo profundo apontado pelos módulos quando a referência curta não basta. DEV-ROBLOX funciona sem eles, com menos profundidade.

## Bibliotecas Luau citadas

ProfileStore/ProfileService, Trove/Maid, Knit, Matter, Fusion, Roact/React-lua
são citadas como recomendação. Nenhuma está incluída; cada uma tem licença
própria no repositório de origem.
