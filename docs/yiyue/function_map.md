# 影约云功能地图

更新时间：2026-06-24

## 2026-06-25 merchant-readiness-scaffold

### 已完成
- 商户分组新增 `/merchant/readiness` 闭环脚手架入口，统一展示商家模块未完成项、状态、优先级、阻塞原因、下一步动作和证据引用。
- 后端新增五个只读 readiness 接口，返回统一 DTO；前端通过 `backendMerchantReadinessApi.ts` 归一化消费。
- 产品清单 P0/P1 缺口已落到四个 owner：
  - `schedule-governance`：`B-016`、`B-017`、`X-013`
  - `channel-readiness`：`B-026`、`B-027`、`B-045`、`B-046`
  - `governance`：`P-003`、`P-004`、`P-005`、`P-006`
  - `dependency-readiness`：`X-001`、`X-002`、`X-003`、`X-004`、`B-068`、`B-069`、`R-014`、`R-015`

### 边界
- 本包只搭 readiness 脚手架，不代表商家模块真实业务已全部生产完成。
- 没有新增审批、提现、核销、渠道同步、库存写入、导出任务或第三方写调用。

## 2026-06-24 marketing-phase2-merchant-closed-loop

### 已完成
- 工作台营销券域从只读 scaffold 升级为真实商户后台 owner：券模板列表、创建、编辑、启停，商户发券，券实例、发券记录、核销记录读取。
- 工作台营销活动域从只读 scaffold 升级为真实商户后台 owner：活动列表、创建、编辑、上线、下线和商品绑定。
- 活动参与记录页改为真实只读查询：活动、客户、订单、参与状态、转化状态、退款状态、失效原因。
- API 模式接口失败显示错误态；只有 `appStore.demoMode` 继续使用本地 scaffold fallback。

### 说明
- 本批仍不做消费者侧领券、参与活动、下单用券写链路。
- `yy_order` 继续作为唯一订单账本，营销页不新增第二套营销订单主账本。

## 2026-06-24 full-product-closed-loop-phase234-scaffold

### 已完成
- 工作台补齐一级入口：
  - `平台设置`
  - `账号中心`
  - `费用中心`
- 工具中心样片作品改为正式入口：
  - `/tools/sample-works`
  - 旧 `/tools/photo/sample` 保留兼容跳转
- Phase 2 真功能域和 Phase 3/4 脚手架域，已统一登记到聚合 registry：
  - 会员
  - 营销
  - 资源
  - 报表
  - 服务生产
  - 内部协作
  - 平台设置
  - 账号中心
  - 费用中心
  - 工具扩展
- 建设态页面现在会展示真实 Phase、运行态和三层 owner，不再统一显示 `Phase 0 Scaffold`。

### 说明
- 本轮重点是骨架治理和模块 owner 收口，不代表 Phase 2~4 全部真实业务已经闭环完成。

## 2026-06-24 full-product-closed-loop-phase1

### 已完成
- 工作台 `确认收款`、`库存加载/更新`、`操作审计/渠道日志` 三条高风险链路已按独立 owner 收口。
- 订单详情的支付确认仍走真实 `POST /yy/order/{id}/payment/confirm`，但 owner 已独立到 payment slice。
- 排期库存继续以 `yy_booking_slot_inventory` 为唯一真实账本，不再挂在商户配置 slice 内。
- 审计证据继续统一读取 `sys_oper_log + yy_channel_sync_log`，为退款/渠道问题保留 logid 只读证据位。
- 订单详情抽屉点击“刷新证据”或执行确认收款、改期、取消后，会同步刷新操作审计和渠道同步日志，`requestId/logid` 不再依赖其他页面先预热。

### 说明
- 本轮是 Phase 1 的模块化落地，不代表退款、支付账本查询页、财务闭环已经全部完成。

## 2026-06-24 full-product-closed-loop-phase0

### 已完成
- 工作台新增 Phase 0 平台设置脚手架：
  - `/platform/brand-info`
  - `/platform/integration`
  - `/platform/booking-policy`
  - `/platform/print-settings`
  - `/platform/score-settings`
  - `/platform/email-settings`
  - `/platform/notification-center`
  - `/platform/service-packages`
- 工作台新增 Phase 0 账号中心脚手架：
  - `/account/profile`
  - `/account/brands`
  - `/account/help`
- 工作台新增 Phase 0 费用中心脚手架：
  - `/finance/overview`
  - `/finance/transactions`
- 工具中心补齐脚手架入口：
  - `/tools/photo/sample`
  - `/tools/precision-delivery`
- 客户端补齐域注册和占位页：
  - `pages/coupons/index`
  - `pages/profile/index`

### 说明
- 本轮属于“先脚手架后填功能”，用户能进入新域入口，但只看到建设边界和下一 Phase 说明。

## 2026-06-24 product-module-close-gap

### 已完成
- 工作台商品模块补齐正式入口：
  - `/product/album`
  - 对应 `product-album -> product-card-catalog`
- 商品分类契约统一：
  - 新写入团单统一 `GROUP_BUY`
  - 前端兼容读取 `GROUP` / `GROUP_BUY`
  - 入册正式使用 `ALBUM`
- 商品目录 owner 已支持：
  - 入册产品新增
  - 入册产品编辑
  - 批量上架
  - 门店过滤
- 入册闭环检查已进入页面 owner：
  - `规格 / 入册张数`
  - `选片 / 加修联动`
  - `订单履约`
- 入册订单履约配置已补齐独立入口：
  - 页面弹窗 `AlbumProductFulfillmentModal`
  - 保存后写入真实 `yy_product_collaboration_config`
- 入册履约证据已进入商品卡片：
  - 订单关联
  - 选片证据
  - 交付证据

### 仍需注意
- 当前仍复用 `yy_product` 单账本，不新增第二套入册产品台账。
- 抖音/美团商品映射仍走各自渠道模块，不并入工作台手工编辑。
- 当前属于代码闭环补齐，不代表真实订单端到端履约已完成外部验收。

## 2026-06-24 customer-payment-inventory-closed-loop part4/part5

### 已完成收口

- 客户侧支付入口完成“真实接线脚手架”：
  - 商品详情页和订单页统一复用支付 flow owner。
  - 支付未就绪、环境不支持、取消/失败都有统一兜底文案。
  - 不再伪造本地已支付状态。
- 工作台订单详情新增“确认收款”动作：
  - 只对待支付、未取消、未退款、非抖音来客订单开放。
  - 走真实后端接口并复用工作台局部刷新链路。

### 未纳入本轮

- 第三方平台真实支付
- 退款闭环
- 会员/营销链路
- 抖音真实平台支付回调与核销
## 2026-06-24 dashboard-export

### 已完成
- 商户工作台首页新增汇总导出入口：`POST /yy/dashboard/export`。
- 导出筛选支持 `beginDate`、`endDate`、`storeId`、`channelType`。
- 导出内容为首页经营 + 排期容量汇总 Excel，不包含客户姓名、手机号、外部订单号等隐私明细。
- 后端按 `yy_order` 聚合订单收入/状态，按 `yy_booking_slot_inventory` 聚合时段容量、已约、剩余、冲突。
- 首页收口补齐 5 个只读聚合接口：`GET /yy/dashboard/order-status-stats`、`GET /yy/dashboard/trend-stats`、`GET /yy/dashboard/today-slots`、`GET /yy/dashboard/product-ranking`、`GET /yy/dashboard/conversion`。
- 首页转化率口径固定为“订单账本履约转化”：预约 -> 支付 -> 到店 -> 完成。
- 首页产品排行切到真实后端聚合，支持按预约量 / 按金额双口径。

## 2026-06-24 service-production-closed-loop

### 已完成

- 服务模块 4 个缺口已补齐真实全栈接线：
  - `B-103 三方修图中心`
  - `B-104 三方修图服务商`
  - `B-107 中央修图设置`
  - `B-108 通用设置 / 开通设置`
- 工作台新增服务入口：
  - `/service/retouch-center`
  - `/service/retouch-providers`
- 内部协作设置页改为真实专表契约：
  - `/collaboration/retouch-center-settings`
  - `/collaboration/common-settings`
  - `/collaboration/open-settings`

### 数据边界

- 三方修图任务从 `yy_photo_album + yy_photo_asset + yy_order` 自动派生，不新建第二套订单账本。
- 服务商、协作策略、许可证均落独立表：
  - `yy_retouch_provider`
  - `yy_retouch_task`
  - `yy_collaboration_policy`
  - `yy_service_license_binding`
## 2026-06-24 marketing-domain-scaffold

### 已完成
- 商户工作台营销模块已从只读派生页切到 4 个正式 owner：
  - `/marketing/center`
  - `/marketing/coupons`
  - `/marketing/campaigns`
  - `/marketing/participations`
- `/order/campaign` 已接入营销桥接与固定优先级试算面板，仍保持 `yy_order` 为唯一订单账本。
- 新营销页当前可展示：
  - 能力开关空态与到期提示
  - 券模板/发券记录/券实例/核销记录脚手架
  - 活动清单/商品绑定/参与记录脚手架
  - 固定优先级优惠试算结果、不可用原因、互斥来源、退单恢复策略

### 边界
- 当前属于营销域 scaffold 阶段，不代表真实券模板 CRUD、真实发券、真实核销、真实活动账本已全部闭环。
- 平台侧只做到能力开关级授权，不包含购买计费、费用中心扣费和试用订购。
## 2026-06-24 member-module-phase1

### 已完成
- 工作台会员模块拆出独立 owner：
  - `/member/accounts` -> `MemberAssetsView.vue`
  - `/member/consumption` -> `MemberTransactionsView.vue`
  - `/member/tags` 继续保留 `DerivedMemberModuleView.vue`
- 第一批只读能力已落脚手架：
  - 会员总览
  - 会员卡列表
  - 权益列表
  - 优惠券列表
  - 积分流水
  - 成长值流水
  - 余额流水
- 会员资产读取链路已按三层拆分：
  - 表现层：`studio-workbench/src/features/member/modules/*`
  - 控制逻辑层：`backendMemberApi.ts`、`memberStore.ts`、两个 composable
  - 持久层：`yy_member_account`、`yy_member_card_instance`、`yy_member_benefit_ledger`、`yy_member_points_ledger`、`yy_member_growth_ledger`、`yy_member_balance_ledger`

### 仍需继续
- 充值、退款回滚、余额扣减、积分发放、成长值升级仍未接入真实写链路。
- `yy_member_recharge_order` 目前只建了表脚手架，未开放 controller/service 写接口。

## 2026-06-24 member-recharge-closed-loop

- 工作台会员资产页已补 `会员充值` 入口
- 闭环能力：
  - 创建充值单
  - 确认到账
  - 回写会员余额汇总
  - 写会员余额流水
  - 充值后刷新会员资产摘要
- 当前边界：
  - 只支持门店手工充值
  - 不含提现、退款回滚、审批流、三方支付对账
## 2026-06-24 auth-foundation-phase1

### 已完成
- 工作台已新增统一授权底座 facade：`studio-workbench/src/features/system/featureGate.ts`
- 统一门禁结果已收口这些字段：
  - 页面权限码
  - 角色命中
  - 门店范围
  - 运行态
  - 插件态
  - 许可证态
  - 高风险审批态
- marketing 域已先接入这套共享门禁：
  - `useMarketingCapabilityGate.ts` 不再直接把后端能力 DTO 原样抛给页面
  - `MarketingCapabilityGateCard.vue` 已展示统一门禁态、权限码、门店范围、许可证/插件/审批占位态

### 仍需继续
- collaboration、service-production、member、resource 仍未切到统一 gate facade
- 插件态、许可证态、高风险审批态目前只完成前端统一契约和状态口径，尚未全部对接真实后端授权账本

## 2026-06-24 auth-foundation-phase2-collaboration

### 已完成
- `/collaboration/open-settings` 已接入统一 `feature-scope` 门禁聚合。
- 协作开通页许可证读写已收回协作域 owner：`collaborationApi.listLicenses/saveLicense/bindLicenseStore/unbindLicenseStore`。
- `licenseState=missing/expired` 在协作开通页为提示态，页面仍允许新建、编辑、续期和门店绑定。
- `pluginState` 与 `approvalState` 对协作开通页固定返回 `not_applicable`，不再停留在 `unknown`。
- `yy_service_license_binding` 继续作为唯一协作许可证账本，本包未新增第二套许可证表。

### 仍需继续
- 会员、营销、资源、报表等域后续再逐步接入后端 `feature-scope` 真实解析规则。
- 高风险审批仍只有统一契约位，未接入真实审批流来源。

## 2026-06-24 internal-collaboration-work-order-stage-sla

### 已完成
- 工单管理、工单导出、环节统计、工作执行概况继续读取真实 `yy_work_order` 主链。
- `yy_work_order` 新增真实协作岗位字段 `stage_code` 和 SLA 截止字段 `due_time` 的实体、VO、查询、前端 DTO 与 mapper。
- 前端运行时优先使用后端返回的 `stageCode` / `dueTime`，只有旧数据缺字段时才按 `orderType/description/remark` 和岗位 SLA 回退推断。
- 后端新增工单默认岗位兜底：未传 `stageCode` 时按工单类型归入摄影、看片、修图、取件、审片、化妆或接待。

### 仍需继续
- 生产库需由 DBA 审核并执行本轮 SQL 草案后，真实租户才会持久化 `stage_code` / `due_time`。
- 工单事件明细的平均耗时、员工产能和完整审计导出仍需后续接 `yy_work_order_event` 聚合。
- 真实门店权限、许可证、岗位权限和外部对标站点 smoke 仍需单独验收。
## 2026-06-24 platform-settings-phase1

### Done
- `/platform/integration` reads the Phase 1 platform facade and shows channel authorization, webhook and sync evidence status.
- `/platform/notification-center` reads notification template/log status from the Phase 1 platform facade.
- `/platform/service-packages` reads package/license status from `yy_service_license_binding` through the Phase 1 platform facade.

### Boundary
- This phase is read-only. It does not create payment orders, renew packages, write channel inventory, or create external webhook subscriptions.
## 2026-06-24 phase3-center-api-owner

### 已完成
- 工具中心、账号中心、费用中心从前端本地 stub 推进为后端 API owner：
  - `/yy/tool-center/sample-works`
  - `/yy/tool-center/precision-delivery/summary`
  - `/yy/account-center/profile`
  - `/yy/account-center/brands`
  - `/yy/account-center/help/articles`
  - `/yy/finance-center/overview`
  - `/yy/finance-center/transactions`

## 2026-06-25 member-recharge-read-side

### Done
- `member/accounts` now reads recent recharge orders from the real member recharge ledger instead of only exposing the write modal.
- The member asset owner refreshes recharge orders after manual recharge create or confirm, so pending approval and confirmed rows stay visible on the same page.

### Boundary
- This task pack is read-side completion only for recharge history.
- Refund reversal, approval workflow, withdraw flow, and cross-channel recharge write paths are still not implemented here.

## 2026-06-24 resource-collaboration-closed-loop-phase1

### 已完成
- 资源管理、资源标签、资源用量、协同工单页已接入统一 `feature-scope` 门禁；无页面权限或无门店范围时不加载真实列表、不展示写表单。
- 资源写链路收口到 `resourcesApi` owner：列表、批量更新、删除、标签 CRUD、用量统计、历史大小回填均不再依赖派生页主路径。
- 协同工单写链路收口到 `workOrdersApi` owner：工单列表、状态流转、事件明细读取均走 `yy_work_order` / `yy_work_order_event`。
- 工单详情侧栏新增真实事件明细入口，支持查看 `yy_work_order_event` 的流转记录。
- 后端工单状态机已限制非法跳转；有效流转继续写入事件表，陈旧状态或非法跳转不写事件。

### 仍需继续
- 资源用量当前仍以现有 `file_size_bytes` 与配置聚合为准，清理计划实际执行任务需另开包。
- 工单事件明细已可读，但平均耗时、员工产能、事件审计导出仍需后续聚合。
- 本包 `license/plugin/approval` 对资源/工单页仍为 `not_applicable`，后续有真实授权账本后再升级解析规则。
- `backendApi` 兼容外观保持不变，旧页面继续调用原方法名。
- Demo 模式保留空态兜底；API 模式不再静默返回本地假数据。

### 仍需继续
- 工具样片发布、账号资料保存、品牌切换仍未持久化。
- 费用中心仅从 `yy_payment_record` 只读聚合，不包含充值、开票、提现、退款审批或导出任务。
- Phase 2 会员/营销真账本和 Phase 4 开放 API/审批/插件商城仍需独立任务包。

## 2026-06-25 product-module-full-chain-scaffold

### 已完成
- B-018 到 B-025、B-028 已补商品侧全链路脚手架，状态为“脚手架补齐/待真实验收”。
- B-026、B-027 已补渠道插件配置骨架，状态为“渠道插件配置骨架已补齐/真实授权待验收”。
- B-098 已补入册链路骨架，状态为“入册链路骨架补齐/真实订单端到端待验收”。
- B-099 已补分类与批量运营骨架，状态为“分类与批量运营骨架补齐/批量写入待验收”。
- `yy_product` 继续作为唯一商品主账本；SKU、分类、展示、预约、关联、渠道、履约均为扩展配置表。

### 仍需继续
- 真实商品表单、批量写入、历史商品迁移和生产数据验收需单独任务包。
- 抖音/美团授权、真实商品同步、真实渠道核销和 logid 证据需单独验收。
- 订单、支付、库存、权益只完成 readiness 骨架，未接真实高风险写链路。
