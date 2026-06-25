# Studio Workbench Master Plan Design

## Goal

把 `studio-workbench` 的推进方式从“零碎修点”切换为“香港2唯一主线 + 主地图治理 + 多 agent 并行 + 分阶段交付”的稳定模式。目标不是先做视觉，而是先把真实数据链、预约排期链、订单履约链和外围业务模块做成可持续推进、可接手、可验收的工程体系。

## Decisions Confirmed

- 香港2 `103.24.216.8` 是唯一标准联调、验收和证据出口。
- `yy_order` 是唯一订单账本。
- `yy_booking_slot_inventory` 是唯一排期和容量账本。
- 历史 `DOUYIN_LIFE` 订单没有真实 `slot_date/slot_start_time/slot_end_time` 时，禁止伪造进入排期。
- `DOUYIN_LIFE` 和 `DOUYIN_MINI_APP` 严格分线，不混用接口、回调和账本语义。
- 后续只持续维护 8 份主文档，其余旧规划文档全部归档，不再继续扩写。
- 项目执行改为 1 个主控 + 5 条并行 agent 子线。
- 测试策略以定向 contract test、`npm --prefix studio-workbench run build` 和香港2 smoke 为主，不做无差别慢测试。

## Current Project Fit

当前仓库主线位于：

- Repo: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
- Branch: `yingyue-closed-loop-optimization-20260603`

当前项目已经具备以下基础：

- `DOUYIN_LIFE` 订单查询、同步、历史回填、POI/SKU 映射、Webhook/SPI、同步日志、`logid` 记录已经成形。
- `studio-workbench` 已经完成大量单门店视角、订单详情、时段深链、操作日志、微页面/微表单、商户模块和门店权限收口工作。
- 真实阻塞集中在两类问题：
  - 历史抖音订单大多缺少真实预约时段，无法自动进入 `yy_booking_slot_inventory`。
  - 文档和推进方式过于分散，导致“做了很多但主线不清楚”。

## Document Governance

后续只保留并持续更新下面 8 份主文档：

1. `docs\yiyue\code_map.md`
2. `docs\yiyue\function_map.md`
3. `docs\yiyue\optimization_map.md`
4. `docs\yiyue\api_map.md`
5. `docs\yiyue\callback_map.md`
6. `docs\yiyue\jianyue_benchmark_map.md`
7. `docs\yiyue\studio-workbench-master-plan-20260619.md`
8. `docs\yiyue\hk2-runbook-20260619.md`

旧规划文档统一归档到：

`docs\yiyue\archive\legacy-plans\20260619\`

归档后只保留索引，不再继续更新旧文件。

## Multi-Agent Topology

### Main Controller

主控 agent 负责：

- 维护总计划、依赖关系和合并顺序。
- 审核每条子线是否符合 `yy_order` / `yy_booking_slot_inventory` / 香港2 / 门店权限边界。
- 统一更新 8 份主文档。
- 决定何时提交、部署和回滚。

### Agent A: Maps and Handoff

范围：

- `docs\yiyue\` 下的主地图
- 旧规划文档归档
- handoff、runbook、acceptance checklist

交付：

- 主地图持续可读
- 归档索引稳定
- 每次开发后自动回写地图

### Agent B: HK2 and Douyin Life

范围：

- 香港2 helper、smoke、只读发现
- `DOUYIN_LIFE` 订单查询、同步、回填
- POI/SKU/商品映射
- Webhook/SPI/inbox/logid
- 真实能力状态核验

交付：

- 香港2成为唯一标准验收出口
- 每个能力都能明确标记“已真实验证 / 仅代码已接 / 平台受限”

### Agent C: Schedule and Order Fulfillment

范围：

- 今日预约
- 半小时格
- 上午/下午/晚上
- 时段详情
- 店员录入
- 改期、取消、状态流转
- 订单详情回流

交付：

- 首页时段 -> 时段订单 -> 订单详情 -> 动作 -> 刷新回流闭环
- 排期和容量账本契约稳定

### Agent D: Photo Delivery and Merchant Surfaces

范围：

- 客片上传、通知、确认、资料发送
- 微页面公开渲染、编辑器、CTA
- 微表单提交 -> 人工转预约
- 商户装修、门店资料、卡产品、抖音产品映射

交付：

- 每个页面有真实入口、真实 API、真实错误态和真实回跳

### Agent E: JianYue Benchmark and UI Finish

范围：

- 简约网交互对标
- 信息密度
- 中文化
- 素材补齐
- UI 收口

约束：

- 只能在 C、D 主链稳定后集中推进
- 不允许用视觉包装掩盖逻辑没接通

## Phase Plan

### Phase 0: Governance Reset

目标：

- 归一主地图、主计划和香港2 runbook

输出：

- 8 份主文档
- 旧文档归档索引
- 后续执行规则

### Phase 1: HK2 Truth Table

目标：

- 用香港2把抖音来客能力现状一次说清楚

范围：

- `client_token`
- 订单查询 / 同步 / backfill
- POI 查询
- SKU / 商品映射
- `time_stock/get`
- Webhook/SPI/inbox/logid

输出：

- 真实可用性矩阵
- 香港2 smoke 和证据路径

### Phase 2: Real Schedule Ledger

目标：

- 把“今日预约”做成真实工具

范围：

- 单门店视角
- 上午/下午/晚上
- 半小时格
- 空时段录入
- 非空时段看订单
- 容量、剩余、满员、冲突

输出：

- 稳定的 `yy_order + yy_booking_slot_inventory` 作用分工

### Phase 3: Fulfillment Action Chain

目标：

- 把预约订单做成可操作履约工作流

范围：

- 订单详情抽屉
- 确认 / 到店 / 服务中 / 完成
- 取消 / 改期 / 原因
- 操作日志、时间线、操作人
- 退款/退单展示

输出：

- 首页时段到订单动作的完整回流闭环

### Phase 4: Peripheral Module Closure

目标：

- 把客片、微页面、微表单、商户模块补到可验收

输出：

- 页面、API、错误态、权限、回跳都明确

### Phase 5: JianYue Benchmark Finish

目标：

- 在主链稳定后做对标和 UI 收口

输出：

- 简约网式的清晰度、信息密度和日用感

## Hard Boundaries

- 香港2结果优先于本地宽带结果。
- 历史抖音订单无真实时段时不进排期。
- 只有真实 `slot_date + slot_start_time + slot_end_time` 或店员手动录入的预约才能进入每日排期。
- 多门店权限以后端 `yy_employee_store` 限制为准，前端门店筛选只是体验层。
- 不在日志、文档、地图、提交中暴露 secret、token、完整手机号、原始私有 payload。
- 不做无关大重构；重构必须服务于当前 phase。

## Risks

### Platform Status vs Real Availability

开放平台页面显示的“已开通 / 接入中 / 限流”不能直接当结论。判定规则必须是：

- 香港2真实调用结果
- 平台 `logid`
- 本地落库结果

### Historical Data Gap

历史 `DOUYIN_LIFE` 订单大多没有真实预约时段，这是平台 payload 限制，不是前端或后端 UI bug。

### Parallel Change Collisions

多 agent 并行时容易在 `appStore`、`OrdersView`、`DashboardView` 和主地图文件上冲突。地图主版本只允许主控或 Agent A 回写。

### UI-Only Drift

任何只调整文案、布局、按钮样式但没有真实动作的改动，都不算完成。

## Verification Rules

每个批次都必须给出：

- 改动文件列表
- 影响页面
- 对应 API / 表
- 验证命令
- 香港2 smoke 或只读证据
- 是否部署、release marker、回滚点
- 对应主地图更新记录

验证优先级：

1. 定向 contract test
2. `npm --prefix studio-workbench run build`
3. 必要的后端定向测试
4. 香港2 smoke / 真实登录态只读验收

## Completion States

- `DONE`: 页面、动作、API、落库、权限、验证都完成
- `PARTIAL`: 页面和接口存在，但链路未闭环
- `BLOCKED`: 受平台能力或真实数据源限制，代码侧暂不可继续
- `NOT STARTED`: 尚未进入开发

某个 phase 只有同时满足下面 3 条才算完成：

1. 代码链路完成
2. 验证完成
3. 主地图已回写

## Explicit Non-Goals

- 不把本地宽带或手工白名单作为主流程依赖
- 不用历史抖音订单创建时间、支付时间、商品名推断预约时段
- 不用视觉包装替代真实动作
- 不继续扩写重复 handoff / plan / takeover 文档
