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

## Dependências em tempo de execução

- `../roblox/sources/roblox-docs/scripts/robloxdocs.py` — usado pela consulta à documentação oficial. Requer `git` e Python 3; clona [Roblox/creator-docs](https://github.com/Roblox/creator-docs) em cache local.
- `../roblox-game/`, `../roblox/sources/gamedev/`, `../roblox/sources/fullstack/` — corpo profundo apontado pelos módulos quando a referência curta não basta. DEV-ROBLOX funciona sem eles, com menos profundidade.

## Bibliotecas Luau citadas

ProfileStore/ProfileService, Trove/Maid, Knit, Matter, Fusion, Roact/React-lua
são citadas como recomendação. Nenhuma está incluída; cada uma tem licença
própria no repositório de origem.
