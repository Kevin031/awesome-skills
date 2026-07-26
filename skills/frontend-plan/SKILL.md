---
name: frontend-plan
description: 按 OpenSpec 风格的 spec-driven 流程生成单文件前端开发计划（含意图、需求规格、技术设计、任务清单），供审阅后再编码。在用户要求制定前端计划、功能方案、UI 改造方案、组件设计、页面开发规划，或提及「先出计划」「审阅后再做」时使用。
---

# Frontend Plan

在写任何前端代码之前，先产出**一份**可审阅的计划文档。理念参考 [OpenSpec](https://github.com/Fission-AI/OpenSpec)：先对齐「做什么」，再讨论「怎么做」，最后才实现。

## 核心原则

1. **先计划后编码** — 计划未通过审阅前，不开始实现
2. **单文件输出** — 所有内容写入一个 Markdown 文件，不拆分为多个文件
3. **行为与实现分离** — 需求描述用户可观察的行为；技术细节放 Design 章节
4. **单一意图** — 一个计划只解决一件事，能用一句话说清
5. **棕地优先** — 先读现有代码、组件库、路由、状态管理，再写增量变更
6. **可测试** — 每个需求至少有一个 GIVEN/WHEN/THEN 场景

## 何时触发

- 新页面、新功能、UI 重构、交互改版
- 用户说「做个方案」「先规划」「审阅后再开发」
- 复杂前端任务（跨页面、涉及状态/路由/接口联动）

**不触发**：单行 bug 修复、纯样式微调、用户已明确「直接做」。

## 工作流程

```
探索代码库 → 生成 plan.md → 提交审阅 → 根据反馈修订 → 审阅通过后才开始编码
```

### Step 1: 探索（必做）

- 相关页面、组件、路由、store/composable
- 项目 UI 框架与设计规范（Element Plus、Tailwind、设计 token 等）
- 是否已有类似功能可复用
- 与后端的接口约定（如有）

信息不足时，先向用户确认边界，再继续。

### Step 2: 确定变更标识

使用 kebab-case 命名，如 `add-user-profile-page`。

### Step 3: 生成单文件计划

按下方「计划模板」填写**一个** Markdown 文档，包含四个章节：

| 章节 | 回答的问题 | 审阅重点 |
|------|-----------|---------|
| **Proposal** | 为什么做、做什么、边界在哪 | 意图是否正确、范围是否膨胀 |
| **Specs** | 做完后系统应有什么行为 | 需求可测试、场景覆盖边界 |
| **Design** | 技术上怎么做 | 方案合理、与现有架构一致 |
| **Tasks** | 按什么顺序做 | 任务可追溯、粒度适中 |

### Step 4: 输出

**默认**：在对话中输出完整 plan 内容。

**用户要求落盘时**，写入 `docs/plans/<change-name>.md`（单文件，不建子目录）。

### Step 5: 等待审阅

生成后明确提示用户审阅，**不要自动开始编码**。审阅顺序：

1. Proposal — 意图不对则停止
2. Specs — 需求与场景是否完整
3. Design — 复杂变更细读
4. Tasks — 任务是否与需求对应

### Step 6: 修订

用户反馈后，在同一文件中修改对应章节，说明改了什么。重复审阅直到通过。

## 计划模板

生成时严格使用此结构，删除不适用的章节，不留空占位符：

```markdown
# Plan: <变更标题>

## Proposal

### Intent
<为什么做，解决什么问题>

### Scope

**In Scope**
- <明确包含的内容>

**Out of Scope**
- <明确不包含的内容>

### Approach
<一两段整体思路，不涉及具体组件/API 细节>

### Risks & Open Questions
- <风险或待确认项，无则写「无」>

---

## Specs

### ADDED Requirements

#### Requirement: <需求名称>
<系统 SHALL/MUST ...>

##### Scenario: <场景名>
- GIVEN <前置条件>
- WHEN <操作>
- THEN <结果>

### MODIFIED Requirements

#### Requirement: <已有需求名>
<完整新版本>
（变更说明：<改了什么>）

##### Scenario: <场景名>
- GIVEN ...
- WHEN ...
- THEN ...

### REMOVED Requirements

#### Requirement: <废弃需求名>
（原因：<为什么移除>）

---

## Design

### Overview
<技术方案摘要>

### Component Structure
<组件树>

### Routing
| 路径 | 组件 | 说明 |
|------|------|------|
| `/example` | ExamplePage | <备注> |

### State Management
| 状态 | 位置 | 说明 |
|------|------|------|
| `foo` | composable / store | <用途> |

### Data Flow
1. <步骤>

### API Integration
| 接口 | 方法 | 用途 |
|------|------|------|
| `/api/xxx` | GET | <说明> |

### Styling Notes
- <复用组件/样式、新增范围>

---

## Tasks

### 1. <阶段名>
- [ ] 1.1 <任务描述> → Requirement: <需求名>

### 2. 验证
- [ ] 2.1 手动验证所有 Scenario
```

## 写作规则

### Specs

- 一条需求 = 一个可观察行为，使用 `SHALL` / `MUST`
- 不写实现细节（组件名、API 路径放 Design）
- Delta 分区：`ADDED` / `MODIFIED` / `REMOVED`，对照现有行为选择
- 前端特别关注：加载中、空状态、错误状态、权限、重复提交、表单校验失败

### Design

按项目实际情况选取：组件结构、路由、状态、数据流、样式、依赖（用 pnpm）、影响面。复杂交互可用 mermaid。

### Tasks

- checkbox 格式，按阶段分组
- 每条任务追溯到某个 Requirement
- 避免「实现整个功能」这种笼统任务

## 审阅清单

```
- [ ] Proposal 意图与请求一致，无范围蔓延
- [ ] 每个 Requirement 可测试，有 SHALL/MUST
- [ ] 每个 Requirement 至少一个有效场景
- [ ] 覆盖关心的边界/错误情况
- [ ] Design 与现有项目架构一致
- [ ] Tasks 可追溯，无超范围任务
- [ ] 愿意让 AI 严格按此计划实现
```

## 规模指引

| 规模 | 示例 | 建议 |
|------|------|------|
| 小 | 按钮文案、样式修复 | 简化 Proposal + Tasks，Specs 可省略 |
| 中 | 新表单页、列表筛选 | 完整四章节 |
| 大 | 跨模块重构 | 完整四章节，或拆为多个 change |

## 示例（节选）

```markdown
# Plan: 添加订单列表筛选

## Proposal

### Intent
运营人员需要在订单列表页按状态和时间范围筛选订单。

### Scope

**In Scope**
- 筛选栏：状态（全部/待支付/已完成/已取消）、创建时间范围
- 筛选条件同步到 URL query

**Out of Scope**
- 订单导出、高级搜索、修改接口协议

### Approach
在 OrderListPage 顶部嵌入 FilterBar，筛选通过 composable 与 URL query 双向同步，复用 fetchOrders 追加参数。

### Risks & Open Questions
- 确认 fetchOrders 是否支持 status、dateRange 参数

---

## Specs

### ADDED Requirements

#### Requirement: 订单状态筛选
订单列表页 SHALL 提供状态筛选控件。

##### Scenario: 按状态筛选
- GIVEN 用户在订单列表页
- WHEN 用户选择「待支付」
- THEN 列表仅展示待支付订单
- AND URL 包含 `status=pending`

---

## Design

### Component Structure
OrderListPage → FilterBar（新增）+ OrderTable（已有）

### State Management
| 状态 | 位置 | 说明 |
|------|------|------|
| `filter` | `useOrderFilter()` | 与 route.query 同步 |

---

## Tasks

### 1. 基础设施
- [ ] 1.1 创建 useOrderFilter composable → Requirement: 订单状态筛选

### 2. 组件开发
- [ ] 2.1 实现 FilterBar 并集成到 OrderListPage → Requirement: 订单状态筛选
```
