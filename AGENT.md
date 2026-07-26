# awesome-skills — Agent 指引

本仓库是个人 Agent Skills 的单一数据源（single source of truth）。所有自定义 skill 存放在 `skills/` 目录，通过 `pnpm skills:link` 软链到 Cursor、Claude Code、Codex 的配置目录。

## 项目结构

```
awesome-skills/
├── skills/              # 所有 skill 的根目录（唯一编辑位置）
│   └── <skill-name>/
│       ├── SKILL.md     # 必需
│       ├── reference.md # 可选，详细参考
│       ├── examples.md  # 可选，使用示例
│       └── scripts/     # 可选，辅助脚本
├── scripts/
│   └── link.mjs         # 软链管理脚本
├── AGENT.md             # 本文件
├── README.md
└── package.json
```

## 核心原则

1. **只改 `skills/`** — 不要直接修改 `~/.cursor/skills`、`~/.claude/skills`、`~/.codex/skills` 下的文件，它们是指向本仓库的软链
2. **改完要链接** — 新增或重命名 skill 后运行 `pnpm skills:link`；删除 skill 后运行 `pnpm skills:unlink`
3. **简洁优先** — Skill 面向 LLM 上下文，只写 agent 不知道的信息，避免冗长解释
4. **渐进披露** — 核心流程放 `SKILL.md`，详细内容放 `reference.md` 等附属文件

## 创建 Skill

### 目录命名

- 使用小写字母、数字、连字符：`my-skill-name`
- 目录名与 frontmatter 中的 `name` 保持一致
- 每个 skill 一个独立目录

### SKILL.md 格式

每个 skill 必须包含 `SKILL.md`，带 YAML frontmatter：

```markdown
---
name: my-skill
description: 第三人称描述该 skill 做什么、何时触发。包含关键词以便 agent 发现。
---

# My Skill

## 步骤
1. ...
2. ...
```

### Frontmatter 字段

| 字段 | 要求 | 说明 |
|------|------|------|
| `name` | 必填，≤64 字符，小写+连字符 | skill 唯一标识 |
| `description` | 必填，≤1024 字符 | agent 用于判断何时加载该 skill |
| `disable-model-invocation` | 可选，默认 `true` | 设为 `true` 时仅在被显式引用时加载；需要自动触发时省略 |

### Description 写法

- 使用第三人称，不用「我可以帮你…」
- 同时说明 **做什么（WHAT）** 和 **何时用（WHEN）**
- 包含触发关键词，便于 agent 匹配

```yaml
# 好的示例
description: 根据 git diff 生成规范的 commit message。在用户要求写提交说明、审查 staged 变更时使用。

# 差的示例
description: 帮助处理 git 相关事务
```

### 篇幅与结构

- `SKILL.md` 建议控制在 500 行以内
- 附属文件只从 `SKILL.md` 链接一层，不要嵌套过深
- 用户提供的原文若要求 verbatim 使用，必须原样保留，不得改写

## 软链命令

| 命令 | 作用 |
|------|------|
| `pnpm skills:link` | 链接到 Cursor、Claude Code、Codex |
| `pnpm skills:link:cursor` | 仅链接 `~/.cursor/skills` |
| `pnpm skills:link:claude` | 仅链接 `~/.claude/skills` |
| `pnpm skills:link:codex` | 仅链接 `~/.codex/skills` |
| `pnpm skills:status` | 查看链接状态 |
| `pnpm skills:unlink` | 移除本项目创建的软链 |

> 不要使用 `pnpm link`，那是 pnpm 内置的全局包链接命令。

### 链接目标

| 工具 | 路径 | 备注 |
|------|------|------|
| Cursor | `~/.cursor/skills/` | 个人 skill |
| Claude Code | `~/.claude/skills/` | 个人 skill |
| Codex | `~/.codex/skills/` | 个人 skill |

**禁止**修改 `~/.cursor/skills-cursor/`，该目录为 Cursor 内置 skill，由系统自动管理。

## Agent 在本仓库中的行为

### 应该做

- 新增 skill 时在 `skills/<name>/` 创建完整目录结构
- 修改 skill 内容后提醒用户运行 `pnpm skills:link`（新增/重命名时）或 `pnpm skills:unlink`（删除时）
- 参考 `skills/frontend-plan/` 了解基本结构
- 保持 skill 内容可执行、可验证，优先给出步骤而非泛泛建议

### 不应该做

- 不要直接编辑软链目标目录中的文件
- 不要在 `skills-cursor` 或各工具内置目录中创建 skill
- 不要为 skill 仓库引入不必要的构建依赖或复杂工具链
- 不要创建没有 `SKILL.md` 的空目录并期望被链接
- 未经用户要求不要提交 git、不要删除现有 skill

## 常见任务

### 新增 skill

1. 创建 `skills/<skill-name>/SKILL.md`
2. 按需添加 `reference.md`、`examples.md`、`scripts/`
3. 运行 `pnpm skills:link`
4. 运行 `pnpm skills:status` 确认链接成功

### 修改 skill

1. 直接编辑 `skills/<skill-name>/` 下的文件
2. 已链接的 skill 修改后即时生效，无需重新 link

### 删除 skill

1. 删除 `skills/<skill-name>/` 目录
2. 运行 `pnpm skills:unlink` 清理软链

### 重命名 skill

1. 重命名 `skills/` 下的目录
2. 更新 `SKILL.md` frontmatter 中的 `name`
3. 运行 `pnpm skills:unlink` 清理旧软链
4. 运行 `pnpm skills:link` 创建新软链
