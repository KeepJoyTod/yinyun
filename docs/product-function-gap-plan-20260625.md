# 产品功能缺口与完善计划（2026-06-25）

结论：当前项目模块功能没有全部完善。项目已补齐大量工作台 owner、只读聚合、派生页和脚手架，但仍有一批功能停留在“待实现、待验收、只读、建设中、未开通/未授权”状态，尤其是档期并发、支付退款权益一致性、渠道插件、会员储值合规、财务对账、开放 API、异步任务和插件商城计费。

## 1. 验证来源

### 1.1 参考站只读观察

- 观察时间：2026-06-25。
- 参考后台：`https://brand.yuyue123.cn/?vcode=319786#/home/dashboard`。
- 首页可见：经营概况、预约概况、产品分析、预约地址、预约二维码、美团核销地址、选片地址。
- 菜单可见：商户、商品、订单、服务、内部协作、资源、会员、相册、营销、统计、设置、应用商城、账号中心、费用中心。
- 应用商城可见：应用插件、营销插件、附加服务、小程序支撑、许可证产品，均有“购买&试用”入口。
- 抽查结果：
  - `#/product/douyin` 显示“【抖音小程序】未开通”。
  - `#/product/meituan` 显示“【美团核销工具】未开通”。
  - `#/customer/recharge` 和 `#/customer/recharge/config` 显示“【会员充值】未开通”。
  - `#/cost` 可见费用中心：消费账户、可用余额、预付款、欠费金额、充值、充值记录、消费概况、收益概况。
  - `#/cost/recharge/details` 可见收支明细：交易类型、时间范围、交易清单、导出。
  - `#/setting/platform` 可见微信、抖音、美团、小红书对接入口。
  - `#/setting/appointment/setting` 可见预约费用、未支付订单自动取消、自助改期、自助退单、阶梯退款、改期后退单规则。
  - `#/report/InterestCancel` 可见权益核销统计和导出入口。

### 1.2 本地项目证据

- 产品清单明确说明：“只读、派生、脚手架、建设中、待验收”不等同生产闭环完成：`docs/product-function-inventory(产品功能清单).md:5`、`docs/product-function-inventory(产品功能清单).md:7`、`docs/product-function-inventory(产品功能清单).md:15`。
- 总览已标注商户后台、第三方渠道、会员资产、报表分析、平台能力均为部分完成或骨架状态：`docs/product-function-inventory(产品功能清单).md:26`、`docs/product-function-inventory(产品功能清单).md:27`、`docs/product-function-inventory(产品功能清单).md:28`、`docs/product-function-inventory(产品功能清单).md:30`、`docs/product-function-inventory(产品功能清单).md:31`。
- 商户 readiness 已把 P0/P1 缺口归到四个 owner，但边界说明它只是脚手架，不代表生产完成：`docs/yiyue/function_map.md:8`、`docs/yiyue/function_map.md:11`、`docs/yiyue/function_map.md:12`、`docs/yiyue/function_map.md:13`、`docs/yiyue/function_map.md:14`、`docs/yiyue/function_map.md:17`。
- 工作台路由状态枚举包含 `derived`、`partial`、`building`，并把这些状态解释为派生只读、部分闭环、建设中：`studio-workbench/src/app/router/featureRegistry.ts:1`、`studio-workbench/src/app/router/featureRegistry.ts:50`、`studio-workbench/src/app/router/featureRegistry.ts:51`、`studio-workbench/src/app/router/featureRegistry.ts:53`。
- 商品、平台、账号、费用、部分报表和工具入口仍标为 `building`、`derived` 或 `partial`：`studio-workbench/src/app/router/featureRegistry.ts:176`、`studio-workbench/src/app/router/featureRegistry.ts:198`、`studio-workbench/src/app/router/featureRegistry.ts:245`、`studio-workbench/src/app/router/featureRegistry.ts:255`、`studio-workbench/src/app/router/featureRegistry.ts:268`。
- 费用中心当前仅从 `yy_payment_record` 只读聚合，不包含充值、开票、提现、退款审批或导出任务：`docs/yiyue/function_map.md:333`。
- 商品模块虽然补了脚手架，但真实商品表单、批量写入、历史迁移、生产数据验收、抖音/美团授权、渠道同步、核销和 logid 证据仍需独立验收：`docs/yiyue/function_map.md:339`、`docs/yiyue/function_map.md:340`、`docs/yiyue/function_map.md:345`、`docs/yiyue/function_map.md:346`、`docs/yiyue/function_map.md:348`。

## 2. 未完善功能清单

| 优先级 | 功能域 | 未完善点 | 已验证依据 | 完善目标 |
| --- | --- | --- | --- | --- |
| P0 | 档期与库存 | 节假日/临时关档、档期并发控制、容量超卖防护仍待实现 | `B-016/B-017/X-013` 标为待实现：`docs/product-function-inventory(产品功能清单).md:92`、`docs/product-function-inventory(产品功能清单).md:93`、`docs/product-function-inventory(产品功能清单).md:302` | 支持例外日期、批量关档、行锁/版本号扣减、冲突提示、释放和审计 |
| P0 | 支付/退款/权益/档期一致性 | 微信支付只是接线脚手架；组合支付、退款逆向、权益预占/核销明细未闭环 | `docs/product-function-inventory(产品功能清单).md:50`、`docs/product-function-inventory(产品功能清单).md:52`、`docs/product-function-inventory(产品功能清单).md:292`、`docs/product-function-inventory(产品功能清单).md:293`、`docs/product-function-inventory(产品功能清单).md:301` | 形成订单资金、权益、库存的一致事务边界 |
| P0 | 审批与审计覆盖 | 审批流待实现；操作审计有只读证据位但覆盖面需补齐 | `docs/product-function-inventory(产品功能清单).md:263`、`docs/product-function-inventory(产品功能清单).md:264` | 退款、提现、批量开卡、人工调账、导出接入审批和审计 |
| P0 | 权限与数据范围 | 当前已有门店范围/feature-scope，但完整品牌、服务组、本人订单、岗位工单隔离待验收 | `docs/product-function-inventory(产品功能清单).md:262`、`docs/yiyue/function_map.md:255`、`docs/yiyue/function_map.md:256`、`docs/yiyue/function_map.md:257` | 所有写链路和导出按租户、品牌、门店、岗位、角色收口 |
| P1 | 第三方渠道插件 | 抖音、美团产品、核销和真实授权待验收；参考站体验账号显示未开通 | `docs/product-function-inventory(产品功能清单).md:116`、`docs/product-function-inventory(产品功能清单).md:117`、`docs/product-function-inventory(产品功能清单).md:140`、`docs/product-function-inventory(产品功能清单).md:283` | 抖音/美团按插件授权、映射、同步、核销、退款逆向、logid 证据闭环 |
| P1 | 商品全链路 | 服务产品、SKU、二维码、关联产品、选片配置、附加/团单/冲印/入册/分类批量运营多为脚手架待真实验收 | `docs/product-function-inventory(产品功能清单).md:106` 到 `docs/product-function-inventory(产品功能清单).md:115` | 商品表单真实保存、批量操作、线上展示、预约履约、历史迁移、生产 smoke |
| P1 | 会员资产与储值 | 会员卡/权益/积分/成长值/余额多为只读；会员充值只支持门店手工充值+读侧，提现和储值消费需合规确认 | `docs/product-function-inventory(产品功能清单).md:174` 到 `docs/product-function-inventory(产品功能清单).md:184`、`docs/product-function-inventory(产品功能清单).md:298`、`docs/product-function-inventory(产品功能清单).md:299` | 会员资产写链路、余额流水、充值配置、退款回滚、提现审批、财务对账 |
| P1 | 营销卡券 | 优惠试算有固定优先级面板，但多级叠加、最佳组合、权益库存、退款回滚仍待实现 | `docs/product-function-inventory(产品功能清单).md:290`、`docs/product-function-inventory(产品功能清单).md:291`、`docs/product-function-inventory(产品功能清单).md:314` | 建立营销权益试算、预占、核销、回滚统一引擎 |
| P1 | 报表和财务对账 | 多数报表为派生只读；权益核销统计待核查；异步导出任务、财务对账报表待实现 | `docs/product-function-inventory(产品功能清单).md:240`、`docs/product-function-inventory(产品功能清单).md:244`、`docs/product-function-inventory(产品功能清单).md:251`、`docs/product-function-inventory(产品功能清单).md:252` | 统一订单、支付、退款、储值、优惠、渠道流水口径 |
| P2 | 平台设置/账号/费用中心 | 品牌信息、平台对接、预约设置、打印、评分、邮箱、通知、套餐、账号、费用多为 API 只读或脚手架 | `docs/product-function-inventory(产品功能清单).md:220` 到 `docs/product-function-inventory(产品功能清单).md:232`、`studio-workbench/src/app/router/featureRegistry.ts:255` 到 `studio-workbench/src/app/router/featureRegistry.ts:269` | 补真实保存、续费/升级、资源额度、账号安全校验、费用充值/导出/开票 |
| P2 | 开放 API 与事件订阅 | 开放 API、企业事件订阅、异步任务中心待实现；渠道入站已部分落地 | `docs/product-function-inventory(产品功能清单).md:266`、`docs/product-function-inventory(产品功能清单).md:267`、`docs/product-function-inventory(产品功能清单).md:268` | 对外 API key、签名、回调订阅、事件总线、重试、幂等和审计 |
| P2 | 通知中心 | 模板与日志已落地，但真实微信/短信 SDK、站内信、失败重试、退订待实现 | `docs/product-function-inventory(产品功能清单).md:269`、`docs/product-function-inventory(产品功能清单).md:319` | 多渠道触达、发送记录、余额/套餐扣减、失败重试、退订合规 |
| P2 | 文件生命周期与水印 | 水印部分待验收；文件生命周期、存储扩容、超限限制未闭环 | `docs/product-function-inventory(产品功能清单).md:94`、`docs/product-function-inventory(产品功能清单).md:276`、`docs/product-function-inventory(产品功能清单).md:279`、`docs/product-function-inventory(产品功能清单).md:320` | 原片/客片/下载/导出统一水印、对象存储生命周期、扩容计费 |
| P3 | 企业级稳定性 | 登录设备风控、备份恢复、可观测性待实现 | `docs/product-function-inventory(产品功能清单).md:265`、`docs/product-function-inventory(产品功能清单).md:271`、`docs/product-function-inventory(产品功能清单).md:272` | 设备/IP 风控、二次校验、PITR、恢复演练、trace/指标/告警 |

## 3. 完善计划

### Phase 0：先冻结口径和验收基线

- 范围：只做文档和测试基线，不改生产逻辑。
- 表现层：补齐每个缺口的用户入口、空态、加载、失败、权限不足状态说明。
- 控制逻辑层：按 `docs/contracts/contract-template.md` 定义接口契约、状态机、错误码、幂等规则。
- 数据层：列清读写表，禁止新增第二套订单、权益或商品主账本。
- 验证：
  - `npm --prefix studio-workbench run check:file-size`
  - `npm --prefix studio-workbench run test -- src/app/router/featureRegistry.contract.test.ts`

### Phase 1：P0 交易安全闭环

- 任务包 1：档期治理。
  - 表现层：`/merchant/schedule-governance` 从 readiness 升级为关档、例外日、并发冲突面板。
  - 控制逻辑层：新增 schedule governance API facade；后端 service 使用事务、版本号或行锁防止超卖。
  - 数据层：以 `yy_booking_slot_inventory` 为真实库存账本，补例外日/关档规则表或现有规则表扩展。
  - 验证：并发创建/改期测试，确保最后一个名额只能成功一单。
- 任务包 2：支付退款权益一致性。
  - 表现层：订单详情、客户支付页、会员资产页展示支付中、退款中、权益预占、回滚失败状态。
  - 控制逻辑层：统一订单状态机、支付流水、退款申请、权益预占、核销、库存释放。
  - 数据层：继续以 `yy_order` 为订单账本，`yy_payment_record` 为支付记录，补权益预占/核销 ledger。
  - 验证：支付成功、支付失败、超时关闭、退款、取消、改期释放、权益回滚契约测试。
- 任务包 3：审批、审计、权限数据范围。
  - 表现层：高风险动作统一弹出审批/拦截/审计说明。
  - 控制逻辑层：新增审批流 service 或接入 RuoYi workflow；所有写接口加 feature-scope 和数据范围校验。
  - 数据层：审批单、审批节点、审批事件、审计事件关联业务 ID。
  - 验证：无权限、跨门店、跨品牌、审批中、审批驳回、重复提交用例。

### Phase 2：P1 商业闭环

- 任务包 4：第三方渠道插件。
  - 从 `channel-readiness` 升级抖音/美团授权、商品映射、核销、退款逆向、同步 logid。
  - 抖音来客验收仍按项目规则走香港2白名单环境，本机不以 OpenAPI 失败判断代码错误。
- 任务包 5：商品全链路。
  - 将商品目录、SKU、分类、关联、预约规则、渠道配置、卡项从 building 升级为真实表单和批量写链路。
  - 历史商品迁移必须先产出迁移 SQL 审核和回滚方案。
- 任务包 6：会员和营销权益。
  - 建立会员资产写链路、充值配置、储值消费/提现、积分成长值发放、卡券叠加、权益预占和核销明细。
  - 储值、提现、余额消费需单独做合规/财务确认。
- 任务包 7：报表和财务对账。
  - 建立财务对账报表，统一经营概况、收支统计、订单明细、支付流水、退款、储值和优惠减免口径。
  - 首页同步导出保留，新增异步导出任务中心前先补权限、脱敏、下载过期和审计。

### Phase 3：P2/P3 平台化能力

- 任务包 8：平台/账号/费用中心真实写链路。
  - 补品牌资料保存、平台授权保存、预约策略保存、打印模板、评分配置、邮箱 SMTP、通知配置、套餐续费、费用充值、开票、导出。
- 任务包 9：开放 API、Webhook、异步任务、通知。
  - 补 API key、签名、事件订阅、重试、幂等、异步任务队列、多渠道通知发送和退订。
- 任务包 10：文件生命周期、风控、备份、可观测性。
  - 补对象存储生命周期、水印策略、容量扩容、登录设备风控、备份恢复演练、trace id、指标和告警。

## 4. 建议验收命令

先跑目标测试，不建议无目标全量慢测：

```powershell
npm --prefix studio-workbench run check:file-size
npm --prefix studio-workbench run test -- src/app/router/featureRegistry.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
npm --prefix studio-workbench run build
```

涉及后端共享逻辑、订单、库存、支付、会员、抖音来客或渠道同步时，再补对应 Maven 目标测试，例如：

```powershell
mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

## 5. 风险和边界

- 本次只做只读观察和文档落盘，没有执行参考站保存、支付、退款、核销、发券、充值、提现等写操作。
- 参考站“可见入口”只能作为需求基线，不代表当前项目已完成；本地“有 owner/API/脚手架”也不代表生产闭环完成。
- 真实抖音/美团/支付/短信/微信通知验收需要授权、白名单或生产/测试平台环境，不能只用本机失败判断代码错误。
- 当前工作区已有与商户 readiness 相关的未提交改动，本次没有覆盖或回滚。
## 2026-06-25 执行记录：P0 交易安全第一包

状态：执行中，已部分落地。

已完成：
- 库存治理：新增 `yy_schedule_exception_rule`，并提供 `/yy/bookingSlotInventory/governance/preview|apply`。
- 审批账本：新增 `yy_risk_approval`，支持 `SLOT_CLOSE_WITH_PAID_ORDER`、`ORDER_REFUND`、`MEMBER_RECHARGE_CONFIRM`。
- 内部退款：订单详情可发起退款审批，审批通过只更新内部订单/支付退款状态；全额退款释放已确认库存。
- 会员充值：保留 `PENDING_APPROVAL`，创建审批并在前端展示审批编号；审批通过后转 `PENDING`，再复用确认到账。
- 高风险门禁：`merchant-schedule-governance`、`merchant-governance`、`order-refund`、`member-recharge` 已返回真实审批态。

仍未完成：
- 不调用真实微信/抖音/美团退款 API。
- 不做提现、组合支付、权益引擎重构。
- `SLOT_CLOSE_WITH_PAID_ORDER` 审批通过后的自动关档执行器仍待下一包补齐。
