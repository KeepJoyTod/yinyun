# 影约云功能地图

更新时间：2026-06-24

## 2026-06-26 product-function-inventory-84-scaffold-acceptance

### 已完成
- 产品功能清单第 3 节的 21 项“脚手架”条目，已统一收口到可验收脚手架标准，不再散落在占位页、派生说明和历史注释中。
- 商品 9 项固定映射到商品 7 子域与 3 个兼容入口；会员/营销 7 项固定映射到既有 owner；平台 5 项固定映射到平台设置 owner。
- 工作台共享 scaffold 页已统一展示 `inventoryCodes / acceptanceLabel / boundaryNotes / nextActions`；客户端 `我的/卡券` 也补齐相同口径。

### 仍需注意
- 本次完成定义是“脚手架验收完成”，不是生产闭环 `ready`。
- 未新增真实支付、退款、库存扣减、权益扣减/回滚、抖音/美团/微信真实授权写链路。

## 2026-06-25 consumer-merchant-p1-scaffold

### 已完成
- 新增 P1 消费者体验脚手架：商品详情页展示服务组、资料项、卡券/权益候选和不可用原因；卡券页从 Phase 0 占位升级为权益状态页；我的页新增会员资产 P1 入口；新增服务评价脚手架页。
- 消费者预约增强契约已补到下单链路：`serviceGroupId` 透传到既有订单服务组字段，并已加门店归属/启用状态校验；`customFields` 写入 `yy_order.order_attribute_json`；可用 `entitlement*` 只创建 `yy_entitlement_reservation` scaffold 预占草稿，未做真实权益核销或扣减。
- 新增商户端消费者运营 P1 聚合 owner，覆盖 `B-011/B-013/B-030/B-033/B-039/B-083/B-088/B-093/B-094/B-109` 的现有 owner、缺失能力、下一步和风险。
- 新增前后端 P1 契约骨架和只读接口，返回 `scaffold/building/not_connected` 状态，不伪装为生产闭环。

### 仍需注意
- 本轮状态只代表脚手架 owner 已落地；真实权益核销、支付退款、通知 SDK、评价账本、导出任务和端到端验收仍待后续任务。

## 2026-06-25 product-function-inventory-recheck

### 已完成
- 复核 `docs/product-function-inventory(产品功能清单).md` 中所有“待实现”条目，按当前仓库实际 owner、接口、路由和读写链路排除已落地的部分实现项。
- 将 `C-009`、`C-012`、`C-013`、`C-015`、`C-019`、`C-028`、`B-109`、`R-015`、`P-014`、`X-004` 从“待实现”修正为“当前项目部分实现”，避免把已有后台、读侧或只读骨架误算进真待办。
- 保留真正未开发清单，并按 `P0/P1/P2/P3` 输出组合支付、权益预占、储值消费、提现、复制订单、异步任务中心、订购分析、登录风控、开放 API、美团差评溯源和数据备份恢复的分期计划。

### 仍需注意
- 这次只是清单复核和规划整理，不新增业务代码，不改变真实链路。
- 后续若要把任一条从 `partial/building` 升级为 `ready`，仍需补真实接口、权限、审计和 smoke 证据。

## 2026-06-25 merchant-readiness-scaffold

### 已完成
- 商户分组新增 `/merchant/readiness` 闭环脚手架入口，统一展示商家模块未完成项、状态、优先级、阻塞原因、下一步动作和证据引用。
- 后端新增五个只读 readiness 接口，返回统一 DTO；前端通过 `backendMerchantReadinessApi.ts` 归一化消费。
- 产品清单 P0/P1 缺口已落到四个 owner：
  - `schedule-governance`：`B-016`、`B-017`、`X-013`
  - `channel-readiness`：`B-026`、`B-027`、`B-045`、`B-046`
  - `governance`：`P-003`、`P-004`、`P-005`、`P-006`
  - `dependency-readiness`：`X-001`、`X-002`、`X-003`、`X-004`、`B-068`、`B-069`、`R-014`、`R-015`
- 四个 owner 已落为独立路由和独立模块目录：
  - `/merchant/schedule-governance`
  - `/merchant/channel-readiness`
  - `/merchant/governance`
  - `/merchant/dependency-readiness`

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
  - `/platform/login-risk`
  - `/platform/open-api`
  - `/platform/task-center`
  - `/platform/booking-policy`
  - `/platform/print-settings`
  - `/platform/score-settings`
  - `/platform/meituan-review-trace`
  - `/platform/email-settings`
  - `/platform/notification-center`
  - `/platform/backup-recovery`
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

## 2026-06-25 platform-enterprise-scaffold

### 已完成
- 平台设置新增 5 个企业级 owner 入口：
  - `/platform/login-risk`
  - `/platform/open-api`
  - `/platform/task-center`
  - `/platform/backup-recovery`
  - `/platform/meituan-review-trace`
- 前端统一复用 `platformSettingsScaffolds + usePlatformSettingsList + backendPlatformApi`，不再落到通用建设页。
- 后端 `YyPlatformSettingsController/YyPlatformSettingsService` 新增 5 个只读 facade：
  - `GET /yy/platform-settings/login-risk-policies`
  - `GET /yy/platform-settings/open-api-apps`
  - `GET /yy/platform-settings/async-tasks`
  - `GET /yy/platform-settings/backup-recovery-plans`
  - `GET /yy/platform-settings/meituan-review-traces`

### 仍需继续
- 登录风控仍缺设备指纹、异常登录事件、二次校验和告警闭环。
- 开放 API 仍缺 API key 发放/吊销、签名校验、限流审计和开放文档门户。
- 任务中心仍缺真实任务账本、下载过期、失败重试和统一审计。
- 备份恢复仍缺真实备份计划执行、恢复演练证据和告警。
- 美团差评溯源仍缺评价拉取、差评归因、处理工单和插件授权闭环。
- 订单、支付、库存、权益只完成 readiness 骨架，未接真实高风险写链路。
## 2026-06-25 P0 交易安全第一包

### 已落地
- `/merchant/order-attributes` 已补成真实 owner：门店页“订单属性”跳转到该页后，可按 `storeId=<yy_store.id>` 维护 `TEXT/TEXTAREA/PHONE/DATE/NUMBER/SELECT/CHECKBOX` 模板；店员录单和订单详情共用同一份模板快照。
- 服务组已补显式 `serviceMode`：`/merchant/service-groups` 创建和编辑时必须选择 `HORIZONTAL` 或 `VERTICAL`，工作台不再按名称/时长猜测模式。
- `/merchant/schedule-governance` 已从 readiness 壳升级为可操作面板：支持门店、服务组、日期范围、时间段、`CLOSE/REOPEN/CAPACITY_OVERRIDE`、预览和提交；审批回跳后可自动回填查询并重新预览当前结果。
- `/merchant/governance` 已从 readiness 壳升级为审批列表：支持按状态、类型、门店筛选，并执行通过/驳回；`SLOT_CLOSE_WITH_PAID_ORDER` 会展示作用范围摘要、审批结果摘要，并提供 deeplink 回档期治理页查看已应用结果。
- 订单详情新增内部退款审批入口：只提交 `ORDER_REFUND` 审批，不触发真实出款。
- 会员充值创建 `PENDING_APPROVAL` 时返回并展示审批编号；审批通过后才允许复用确认到账逻辑。
- `feature-scope` 对 `merchant-schedule-governance`、`merchant-governance`、`order-refund`、`member-recharge` 返回真实审批态，不再固定为 `not_applicable`。

### 边界
- 本包不调用抖音/美团/微信真实退款或渠道写接口。
- 本包不做提现、组合支付、权益引擎重构和 WarmFlow 接入。
- `SLOT_CLOSE_WITH_PAID_ORDER` 审批通过后会自动把 `yy_schedule_exception_rule` 从 `PENDING_APPROVAL` 转 `ACTIVE`，并批量更新命中时段库存；驳回则把规则置为 `REJECTED` 且不改库存。

## 2026-06-25 transaction-safety-scaffold

### 已落地
- `X-003 权益预占`
  - 已有预占账本、幂等键、过期时间和工作台 owner。
- `C-016 / X-011 组合支付`
  - 已有组合支付拆账模型、统一前后端 owner 和草稿状态机。
- `X-009 储值消费`
  - 已有储值消费单、余额快照校验、冻结状态机和工作台 owner。
- `B-069 / X-010 会员提现`
  - 已有提现申请单、账户脱敏校验、风险审批挂接和工作台 owner。

### 当前边界
- 本次是交易安全第一批脚手架，不等于真实资金闭环。
- 未接第三方真实收款、退款、出款。
- 未补余额真实扣减、超时释放执行器、退款逆向和财务对账。

### 下一阶段建议
- P0.1：真实支付确认、余额扣减、提现出款状态机。
- P0.2：退款逆向、预占超时释放、财务对账字段与审计口径。
- P1：消费者侧明细、异常补偿、监管报表和更细风控规则。
## 2026-06-25 order-copy-closed-loop

### 已完成
- 复制订单入口已落在订单详情抽屉和操作摘要面板，`OrderCopyPanel` 独立成叶子组件。
- `useOrderCopyActions` 负责组装复制参数、判断是否复用档期、提交复制请求并回跳新单详情。
- 后端已落 `copyOrder` 控制层、服务层和工厂层，真写链路会创建新的 `yy_order` 并按需确认库存。

### 仍需注意
- 不包含异步任务中心、权益迁移、外部平台订单克隆、支付迁移和退款迁移。

## 2026-06-25 order-card-batch-scaffold

### 已完成
- `/order/card-batch` 已新增独立 owner，统一承接批量开卡申请、审批状态、金额预估和执行边界说明。
- 前端不再把批量开卡塞进派生只读的 `售卡订单` 页，而是单独暴露 `order-card-batch` feature，权限收口到 `yy:order:add`。
- 后端新增 `GET/POST /yy/card-batch-orders`，统一把批量开卡申请投影到 `yy_risk_approval`，`businessType=CARD_BATCH_ORDER_APPLY`。

### 当前边界
- 当前只落审批脚手架，不生成真实卡项订单，不发放权益，不写 `yy_order` 或会员资产账本。
- 审批通过只代表允许后续人工执行，不代表系统已经自动批量开卡。

## 2026-06-26 order-analysis-scaffold

### 已完成
- `R-013 订购分析` 已从“未发现同名 owner”升级成独立工作台 owner：`/report/order-analysis`。
- 页面不再复用共享派生报表页，而是单独承接订购、支付、退款、渠道四类口径脚手架。
- 前后端已补 `GET /yy/reportOrderAnalysis/overview`，默认读取本月范围，返回概览、漏斗、渠道拆分和退款拆分。

### 当前边界
- 只读分析优先读取 `yy_payment_record`，缺失时回退 `yy_order.paidAmountCent/refundAmountCent`。
- 当前不接导出、不接异步任务中心、不接财务对账、不发起订单/支付/退款写操作。
- 退款拆分只反映现有账本事实，不代表第三方退款链路已闭环。

## 2026-06-26 order-forms-owner-upgrade

- `B-047 表单管理 / B-102 表单提交跟进` 已从“派生只读”提升为独立 `order-forms` owner。
- 前端入口：`/order/forms` -> `studio-workbench/src/features/orders/modules/form-submissions/OrderFormSubmissionsOwnerView.vue`
- 当前闭环覆盖：微表单提交查询、姓名/手机号/跟进状态筛选、跟进状态更新、备注维护、导出、转预约。
- 数据边界：继续读取 `yy_micro_form_submission`，转预约仍复用订单 owner 的真实写链路，不新造第二套表单账本。

## 2026-06-26 transaction-safety-local-adapter-closed-loop

### 状态更新
- P0 交易安全 owner 已从“草稿脚手架”推进到本地适配器闭环：组合支付确认/失败、权益预占释放/核销、储值消费确认/逆向、提现审批后标记出款均有前后端动作入口。
- 组合支付确认会更新 `yy_order.payStatus/paidAmountCent/paidTime`、插入 `yy_payment_record`，并核销订单下 `RESERVED` 权益预占；组合支付失败会释放预占。
- 储值消费确认会扣减 `yy_member_account.balance_amount` 并插入 `yy_member_balance_ledger`；储值逆向和退款审批通过会回补余额并写逆向流水。
- 退款审批通过后，除订单/支付退款状态和库存释放外，已联动释放 `yy_entitlement_reservation` 预占并逆向 `yy_stored_value_consume_order`。

### 当前边界
- 本地适配器闭环不代表真实微信/抖音/美团收款、退款、出款、短信通知已联调。
- 预占超时释放执行器、真实平台回调验签、财务对账、监管报表和异常补偿仍需后续任务包。
- 2026-06-26 补充：已新增权益预占超时释放 worker，支持按 `expireTime` 自动批量释放 `RESERVED` 预占，并在工作台 owner 提供手动“释放过期预占”验收入口。

## 2026-06-26 member-assets-acceptance-upgrade

### 已完成
- `member-accounts` 已升级为会员详情工作台 owner，不再只是只读资产面板。
- 当前页统一提供：
  - 编辑会员
  - 删除会员
  - 预约
  - 办卡（受控跳转）
  - 发券
  - 查看交易明细
  - 会员充值
- `member-consumption` 支持按 `customerId` 预选客户，进入后直接查看订单、积分、成长值、余额四类流水。
- `marketing-coupons` 支持从会员详情带 `customerId` 进入并预填发券客户。

### 当前边界
- 办卡仍复用 `/order/card-batch`，该模块状态还是 `building`，所以办卡仅算受控跳转，不算完整业务闭环。
- 不在会员详情页重复实现发券、办卡写链路；仍复用营销 owner 与订单卡批次 owner。
## 2026-06-26 report-finance-reconciliation

### 状态更新
- `R-015 财务对账报表` 已从共享派生收支统计升级为独立 `/report/finance` owner。
- 前端已落地筛选、订单视角、资金流水视角、差异与待关注、异步导出任务列表。
- 后端已新增 `GET /yy/reportFinanceReconciliation/overview`、`POST /yy/reportFinanceReconciliation/export`、`GET /yy/reportFinanceReconciliation/export/tasks`。

### 数据边界
- 不新增第二套财务主账本。
- 当前统一读取 `yy_order`、`yy_payment_record`、`yy_member_balance_ledger`、`yy_stored_value_consume_order`、`yy_member_withdraw_order`、`yy_composite_payment_order`、`yy_entitlement_reservation`。
- 当前导出为本地任务骨架，可验收创建、状态、下载地址和过期时间；真实持久化任务队列、对象存储下载、失败重试和跨实例任务中心仍需后续任务包。
- 不代表真实微信/抖音/美团退款、支付回调、银行或微信提现回单已联调。
## 2026-06-26 platform-async-task-ledger

### 已完成
- `R-014` 报表导出任务补齐统一异步任务账本一期：`POST /yy/reportFinanceReconciliation/export` 创建的财务对账导出任务会写入 `yy_async_task`。
- `P-010` 异步任务中心从纯脚手架升级为可读取真实任务账本：`GET /yy/platform-settings/async-tasks` 优先按 `taskType` 聚合 `yy_async_task`，无记录时保留原脚手架兜底。
- SQL 初始化脚本已补 `yy_async_task` MySQL/PostgreSQL 表结构、任务编号唯一索引和任务类型/门店查询索引。

### 仍需继续
- 真实 worker 调度、对象存储文件落盘、下载鉴权、失败重试、过期清理、跨实例领取和任务详情抽屉仍未落地。
