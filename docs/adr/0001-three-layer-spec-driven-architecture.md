# ADR-0001: 使用三层楼架构和规格驱动开工流程

> owner: adr-three-layer-spec-driven-architecture
> canonical_for: 为什么影约云要求三层楼架构、Mermaid 数据流、接口契约先行
> upstream: `AGENTS.md`
> downstream: `docs/architecture/three-layer-standard.md`, `docs/contracts/contract-template.md`, `docs/flows/flow-template.md`

## 状态

Accepted

## 背景

影约云已经包含工作台、后端、抖音来客、客户侧公开页面、小程序、服务器部署和大量本地证据。长时间多 AI 协作后，主要风险不是单个功能不会写，而是：

- 页面、状态、API、数据库语义混在大文件里；
- AI 开工前没有统一接口契约，容易边写边猜；
- 真实预约排期、订单账本、抖音历史订单的边界容易被 UI 需求冲散；
- 交接给其他 AI 或国产模型时，容易重复问基础问题或误改业务事实。

因此项目需要一个默认可自动读取的架构规则，而不是每次在聊天里重新解释。

## 决策

影约云采用“三层楼架构 + 规格驱动开发”作为默认工程规则：

1. 表现层负责 UI、交互、动效和用户反馈。
2. 控制逻辑层负责校验、状态机、接口编排、第三方适配和业务规则。
3. 持久数据层负责数据库、对象存储、第三方平台事实 payload。

所有非平凡功能开工前必须先说明：

- 用户路径；
- Mermaid 数据流；
- 请求/响应/状态机/错误契约；
- 执行计划、影响文件、验证命令。

## 取舍

优点：

- AI 更容易按模块工作，减少大文件继续膨胀。
- 前后端、数据库、抖音平台之间的字段和责任更清楚。
- 可把需求拆给国产模型或其他 AI，主会话只做审核和集成。
- 复杂变更可以先被 `grill-me-codex` / Codex review 拷问，再进入实现。

代价：

- 小功能开工前多一步规格描述。
- 需要维护 `docs/contracts`、`docs/flows`、本地 `yiyue` 地图。
- 历史大文件不会自动变好，仍要按拆分计划逐步治理。

## 不变边界

- `yy_order` 仍是唯一订单/预约账本。
- `yy_booking_slot_inventory` 仍是真实时段和容量账本。
- 历史 `DOUYIN_LIFE` 订单没有真实时段字段时，不得写入每日排期。
- `DOUYIN_LIFE` 和 `DOUYIN_MINI_APP` 继续严格分离。
- 不能把视觉复刻当成功能完成，必须有接口、数据、状态和验证证据。

## 后续

- `AGENTS.md` 引用本 ADR 和三层规范。
- 重大计划优先写到 `docs/superpowers/plans`。
- 功能契约写到 `docs/contracts`。
- 数据流图写到 `docs/flows`。
- 本地交接地图更新到 `docs\yiyue`。
