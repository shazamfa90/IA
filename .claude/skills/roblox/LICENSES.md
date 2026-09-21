# Fontes vendorizadas

Esta skill compõe material de terceiros, copiado sem modificação para
`sources/`. Os créditos e licenças originais valem integralmente.

| Diretório | Projeto | Autor | Licença |
|---|---|---|---|
| `sources/roblox-docs/` | [zilibobi/roblox-skills](https://github.com/zilibobi/roblox-skills) | zilibobi | ver repositório de origem (sem arquivo LICENSE no upstream) |
| `sources/gamedev/` | [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | gamedev-skills | Apache-2.0 — `sources/gamedev/LICENSE`, `sources/gamedev/NOTICE` |
| `sources/fullstack/` | [jeffallan/claude-skills](https://github.com/jeffallan/claude-skills) | jeffallan | MIT — `sources/fullstack/LICENSE` |

Skills irmãs referenciadas por caminho, não vendorizadas aqui:

- `.claude/skills/roblox-game/` — [brockmartin/roblox-game-skill](https://github.com/brockmartin/roblox-game-skill)
- `.claude/skills/ponytail/` — ponytail, MIT

`sources/roblox-docs/scripts/robloxdocs.py` clona
[Roblox/creator-docs](https://github.com/Roblox/creator-docs) em cache local
na primeira execução (~1 min) e faz pull quando o cache passa de 24h.
