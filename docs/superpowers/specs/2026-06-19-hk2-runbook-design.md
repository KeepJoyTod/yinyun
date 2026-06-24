# HK2 Runbook Design

## Goal

把香港2 `103.24.216.8` 固化为影约云 `DOUYIN_LIFE` 链路的唯一标准联调、验收和证据出口。后续所有关于抖音来客“是否真实可用”的判断，都必须优先以香港2结果为准，而不是本机直连结果。

## Decisions Confirmed

- 香港2是唯一标准出口；本地宽带只作为补充说明。
- 所有真实联调都优先复用现有 helper 和只读脚本，不额外制造第二套入口。
- 运行手册必须覆盖：只读发现、订单同步、历史回填、库存/时段库存核验、部署 smoke、证据落盘。
- 手册必须明确哪些操作是只读，哪些操作会写库，哪些操作会触发平台侧状态变化。

## Current Project Fit

当前已知资产：

- 香港2 helper: `D:\OtherProject\CameraApp\yingyue-cloud-repo\tools\invoke-hk2.ps1`
- 真实账户只读发现脚本：`tools\yingyue-douyin-real-account-discovery.ps1`
- 当前订单 smoke：`tools\run-douyin-life-current-order.ps1`
- 项目主文档：`C:\Users\Administrator\Desktop\yiyue\api_map.md`
- 配置和公网入口：`C:\Users\Administrator\Desktop\yiyue\open_platform_setting_map.md`
- 回调路由：`C:\Users\Administrator\Desktop\yiyue\callback_map.md`

当前项目已经可以通过香港2确认：

- `client_token`
- 订单查询
- POI 查询
- 部分库存与时段库存能力
- `DOUYIN_LIFE` 真实订单回填和真实门店归属

## Runbook Scope

运行手册应至少覆盖下面 6 类操作。

### 1. Environment Check

目标：

- 确认香港2服务状态、后端服务状态、当前 release marker、基础网络可达性。

最小检查项：

- `systemctl is-active` 结果
- API 域名可达
- 当前 `release.txt`
- 是否通过香港2出口访问开放平台

### 2. Read-Only Discovery

目标：

- 在不写库、不改库存、不创建订单的前提下，确认真实账户、POI、商品、SKU、订单、时段库存现状。

只读范围：

- `client_token`
- `trade/order/query`
- `shop/poi/query`
- `time_stock/get`

输出：

- 脱敏证据文件
- 能拿到什么、拿不到什么

### 3. Order Sync and Backfill

目标：

- 将真实抖音订单进入本地统一账本，并修复历史 POI/SKU/门店映射字段。

范围：

- `POST /yy/channel/DOUYIN_LIFE/orders/sync`
- `POST /yy/channel/DOUYIN_LIFE/orders/backfill`

规则：

- `sync` 是写库操作
- `backfill` 是写库操作
- 若历史订单没有真实时段，只能写 `yy_order`，不能写 `yy_booking_slot_inventory`

### 4. Webhook and SPI Verification

目标：

- 校验公网 SPI / Webhook 是否还通、响应格式是否正确、`logid` 是否记录。

范围：

- `/api/douyin/life/webhook`
- `/api/douyin/life/reservation/order-create`
- `/api/douyin/life/reservation/pay-notify`
- `/api/douyin/life/reservation/order-query`
- `/api/douyin/life/reservation/stock-query`
- 退款、发券、撤销核销等入口

输出：

- 最近 `logid`
- 最近 `yy_channel_sync_log`
- 若涉及订单类事件，确认 inbox 状态

### 5. Inventory and Time Stock Checks

目标：

- 用香港2确认平台侧库存接口现状，明确“真实通了什么，仍被平台卡住什么”。

范围：

- 库存 SKU
- 实时库存
- 时段库存保存
- 时段库存查询

边界：

- 若只是确认平台已有库存形态，优先只读 `time_stock/get`
- 任何会改平台库存或本地镜像的操作都必须明确标识为写操作

### 6. Deploy and Smoke

目标：

- 每次部署后，用香港2和线上地址做最小必需 smoke。

最小 smoke：

- 当前 release marker
- 登录页可达
- 指定页面 URL 可达
- 指定关键 API 可返回
- 若本次涉及 DOUYIN_LIFE，则补做至少一条香港2相关 smoke

## Operation Classes

运行手册必须给每个命令标明操作类型：

- `READ_ONLY`
- `WRITE_LOCAL_DB`
- `WRITE_PLATFORM`
- `DEPLOY`

任何会修改平台库存、订单状态、退款、核销、接单结果的命令，都不能被写成默认只读。

## Evidence Rules

每次香港2操作都需要明确：

- 执行时间
- 目的
- 操作类型
- 关键命令
- 关键结果摘要
- 证据文件路径
- 相关 `logid`

证据目录优先落在：

- Repo: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\`
- Local mirror: `C:\Users\Administrator\Desktop\yiyue\`

## Security Rules

- 不打印 client secret、token、完整手机号、原始私有 payload。
- 可以记录是否存在、是否成功、字段种类、脱敏后的证据摘要。
- `logid` 可以记录；`account_id` 和 `poi_id` 只在确有必要时以最小范围出现。

## Acceptance Rules

香港2相关结论只有在同时满足下面条件时才算有效：

1. 有明确命令或脚本入口
2. 有成功/失败摘要
3. 有 `logid` 或可追溯证据
4. 有本地或线上落点说明

如果只是“平台页面看起来已开通”，不算验收通过。

## Deliverables

最终 `hk2-runbook-20260619.md` 应包含：

- 环境检查
- 常用命令
- 只读发现
- 写库操作
- 库存/时段库存核验
- Webhook/SPI 核验
- 部署后 smoke
- 常见故障判断
- 证据模板

## Explicit Non-Goals

- 不把本地宽带直连步骤写成主流程
- 不把危险写操作伪装成只读命令
- 不在手册里堆积平台背景介绍，重点只保留执行口径
