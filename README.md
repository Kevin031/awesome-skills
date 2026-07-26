# awesome-skills

个人 Agent Skills 仓库，统一存放在 `skills/` 目录，并通过 npm script 软链到各工具的配置目录。

## 目录结构

```
awesome-skills/
├── skills/           # 你的 skills（每个 skill 一个子目录，含 SKILL.md）
│   └── my-skill/
│       └── SKILL.md
├── scripts/
│   └── link.mjs      # 软链管理脚本
└── package.json
```

## 创建 Skill

在 `skills/` 下新建目录，并添加 `SKILL.md`：

```
skills/
└── my-skill/
    └── SKILL.md
```

`SKILL.md` 需包含 YAML frontmatter，例如：

```markdown
---
name: my-skill
description: 简要描述该 skill 的用途与触发场景
---

# My Skill

正文说明...
```

## 软链到各工具

| 命令 | 目标目录 |
|------|----------|
| `pnpm skills:link` | 同时链接到 Cursor、Claude Code、Codex |
| `pnpm skills:link:cursor` | `~/.cursor/skills` |
| `pnpm skills:link:claude` | `~/.claude/skills` |
| `pnpm skills:link:codex` | `~/.codex/skills` |
| `pnpm skills:status` | 查看当前链接状态 |
| `pnpm skills:unlink` | 移除由本项目创建的软链 |

> 注意：不要使用 `pnpm link`，那是 pnpm 内置的全局包链接命令，与本项目无关。

仅链接到指定目标：

```bash
pnpm skills:link cursor
pnpm skills:unlink claude
```

## 注意事项

- 只会链接 `skills/` 下包含 `SKILL.md` 的子目录
- 若目标路径已存在非本项目管理的软链或文件，会跳过并提示
- `~/.cursor/skills-cursor/` 为 Cursor 内置 skills，请勿手动修改
