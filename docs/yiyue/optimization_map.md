# 影约云优化地图

更新时间：2026-06-24

## 2026-06-25 merchant-readiness-scaffold

### 已完成优化
- 商户未完成项从散落在产品清单和多个派生页面的描述，收敛为 `/merchant/readiness` 一个只读入口。
- readiness 状态、优先级、证据、阻塞原因和下一步动作统一由后端 DTO 返回，页面不再散写判断。
- 前端新增独立 `merchant/modules/readiness` owner，避免继续往 `MerchantOverviewView.vue`、`MerchantConfigView.vue` 或历史 facade 堆逻辑。

### 仍需注意
- 本次按要求未执行测试流程、未构建、未部署，只能算模块化脚手架落地。
- 当前后端 readiness 数据是只读契约聚合，不是从真实审批、插件、报表任务、权益预占账本动态计算。
- 后续把 `BLOCKED/PARTIAL/BUILDING` 提升为 `READY` 前，必须补真实接口、权限、审计、数据表/mapper、回滚和生产 smoke 证据。

## 2026-06-24 dashboard-wave1-module-split

### 宸插畬鎴愪紭鍖?
- Dashboard Wave 1 宸叉寜 owner 妯℃澘鏀跺彛锛?`DashboardView.vue` 鍙綔涓鸿杽澹筹紝棣栭〉缂栨帓銆佸鍑恒€佽矾鐢便€乭ome state 宸叉敹鍙ｅ埌 `modules/home/*`銆?
- `YyDashboardServiceImpl.java` 宸蹭粠 940 琛屾媶鍒?300 琛屽唴锛屽苟鏂板 `order-query / metrics / schedule / export` 鍥涗釜鍚庣 owner锛屽悗绔?file-size guard 宸查€氳繃銆?
- Dashboard 鍓嶅悗绔叕寮€澶栬鏈敼锛?`DashboardView.vue`銆乣backend.ts`銆乣appStore.ts`銆乣YyDashboardController`銆乣IYyDashboardService` 缁х画鍏煎銆?

### 浠嶉渶娉ㄦ剰
- Wave 1 鍙敹鍙?dashboard 锛屼笅涓€鎵?Wave 2/3 浠嶉渶缁х画澶勭悊 `appStoreTransforms.ts` 鍜屽叾浠栧ぇ owner锛屽綋鍓嶄笅涓€浼樺厛绾ф槸 `YyClientPhotoServiceImpl`銆乣YyPhotoAssetServiceImpl`銆乣YyClientPublicApiServiceImpl`銆乣YyMerchantMicroPageServiceImpl`銆?
- Dashboard helper test 宸茶ˉ榻愶紝浣嗛〉闈㈢┖鐧借矾寰勭殑娴忚鍣?smoke 浠嶅睘鍚庣画 UX/楠屾敹浠诲姟鑼冨洿銆?

## 2026-06-24 marketing-phase2-merchant-closed-loop

### 已完成优化
- 营销前端从单页 scaffold 展示拆为券、活动、参与三个真实后台 owner。
- 页面层只组合 leaf component、选中状态和抽屉开关；真实 DTO 到 payload 的转换收口到 composable/API 层。
- `backendMarketingApi.ts` 保持兼容 facade，营销细节拆到 coupons/campaigns/participations/capabilities 子域 API。
- 真实模式接口失败不再静默降级为本地假数据，减少验收误判。

### 仍需注意
- 完整前端 build 当前被资源模块 `src/features/resources/composables/useResourceTagMutations.ts` 的既有未闭合字符串阻塞，营销相关 `vue-tsc -b` 和契约测试已通过。
- 后端本轮目标测试只覆盖现有 `PromotionPriorityPolicyTest`；券模板、发券、活动 CRUD、参与查询 service 专项测试仍需补齐。
- 桌面同步目录 `C:\Users\Administrator\Desktop\yiyue` 当前不存在，未执行桌面副本同步。

## 2026-06-24 full-product-closed-loop-phase234-scaffold

### 已完成优化
- Phase 2~4 域不再只靠页面注释记 owner，已补统一 `phase234ModuleScaffolds.ts` 聚合注册。
- `platform/account/finance` 不再停留在“路由 loader 已有、feature registry 缺失”的半接线状态。
- 聚合契约测试改为 1 个 `Phase234Scaffolds.contract.test.ts`，避免再为每个域复制一份重复测试结构。
- 样片作品从兼容路径分离出正式入口 `/tools/sample-works`，旧地址只做跳转。
- 共享脚手架页不再固定显示 Phase 0，已改为按模块配置展示 Phase 3/4 和三层 owner。
- 工具中心样片作品、精准投放已补独立 `backendToolsApi.ts` 和 `backendTypesTools.ts`，后续接真实接口时可直接替换 stub 数据源。

### 仍需注意
- Phase 3/4 多数入口仍是脚手架态 `building`，真实账本和写链路需要后续独立任务包继续落。
- `platform/account/finance` 当前权限码是依据仓库里已存在的 `dashboard/channel/bookingConfig/notification/photoAsset` 权限口径就近映射，后续若后端补专属权限，应同步替换。

## 2026-06-24 docs-yiyue-integration

### 已完成优化
- `docs\yiyue` 已作为影约云地图目录的仓库内主入口。
- 原桌面目录未发现 `jianyue_benchmark_map.md`，本次已补齐最小入口。

### 仍需注意
- 迁移时发现本文件历史内容含少量无效 UTF-8 字节；已转成有效 UTF-8 并保留可读内容，后续按功能变更逐步校正旧段落。

## 2026-06-24 product-module-fulfillment-evidence

### 已完成优化
- 入册商品不再只展示配置是否完整，已增加订单、选片、交付三类履约证据回读。
- 履约证据规则已收敛到 `albumProductFulfillmentEvidence.ts`，页面只消费结果，不在模板里散写匹配逻辑。
- 本轮复用现有 `ProductConfig / BookingOrder / Album / SelectionLink` 前端状态，不新增后端接口和库表。

### 仍需注意
- 当前仍属于本地代码闭环，未替代真实生产订单端到端 smoke。
- `B-098` 暂不提升为“已实现/已观察”，需要目标环境真实订单样本确认后再改状态。

## 2026-06-24 full-product-closed-loop-phase1

### 已完成优�?- `订单 / 支付 / 库存 / 审计` 从历史混�?slice 中先拆成独立 owner，降低后续继续往 `backendOrdersApi.ts`、`backendMerchantConfigApi.ts`、`backendMerchantOpsApi.ts` 堆逻辑的风险�?- 通过 `backendApi` 兼容 facade 保持现有页面不大改，适合�?Phase 继续填真实账本能力�?- 订单详情抽屉的证据刷新补齐到“操作日�?+ 渠道同步日志”同刷，确认收款、改期、取消后 `requestId/logid` 会跟随工作台局部刷新一起回显�?
### 仍需注意
- 当前 Phase 1 仍未新增退款写接口；退款闭环依旧只读回�?`yy_order.refundStatus/refundAmountCent` 和渠道证据�?
## 2026-06-24 full-product-closed-loop-phase0

### 已完成优�?- 全产品完美复刻先收口 Phase 0 脚手架，不再把平台设置、账号中心、费用中心继续塞进旧 `settings` owner�?- 工作台新�?`平台设置 / 账号中心 / 费用中心` 导航分组，便于后续按 Phase 独立落地�?- 客户端新�?`coupons / profile` 域占位页，避免后续把卡券和资料继续混�?`pages/my/index.vue`�?- 共享 API 类型按域拆出 `platform / account / finance`，避免继续往 `backendTypesCore.ts` 堆字段�?
### 待补
- `docs\yiyue\jianyue_benchmark_map.md` 当前不存在�?- 在该文件补齐前，简约网对标差异统一先登记在本文件和 `docs/contracts/full-product-closed-loop-contract.md`�?
## 2026-06-24 product-module-close-gap

### 已完成优�?- 商品模块入口不再缺失：`/product/album` 已补齐�?- 商品业务分类不再混写�?  - `GROUP_BUY` 作为统一写入口径
  - `GROUP` 保留兼容读取
  - `ALBUM` 进入正式商品目录 owner
- 路由、派生模块、DTO、store、后台商品类型选项已对齐�?- 入册商品规格/张数不再只存在前端内存，已通过 `album_product_name` codec 稳定写回和回读�?- 入册订单履约不再继续塞商品备注，已复�?`yy_product_collaboration_config` 独立持久化�?- `ProductCardCatalogView.vue` 已压�?500 行内，继续保�?owner 边界可控�?
### 后续可继续优�?- �?`ProductCardCatalogView.vue` 增加更细粒度的入册规格模板�?- �?`yy_product` 后端管理页补充入册专属字段校验文案�?- 真实订单链路还需补香�? 或目标环�?smoke，确认履约节点是否按配置生效�?
## 2026-06-24 customer-payment-inventory-closed-loop part4/part5 收口记录

### 已完�?
- 移动端支付从页面内联调用收敛为独�?owner�?  - 降低详情页和订单页重复逻辑
  - 统一 fallback 与支付失败提�?- 工作台确认收款条件从多处散落判断收敛为单一规则模块�?  - `studio-workbench/src/features/orders/orderPaymentRules.ts`
  - 降低详情上下文和动作 owner 判断漂移风险
- 为移动端补充页面级治理测试，锁定“共�?owner + 成功跳单�?+ 订单页刷新”契约�?
### 仍需外部验收

- 微信小程序真实导入与支付环境验证
- 抖音小程序真实导入与支付环境验证
- 客户取片 real OSS 最�?PASS 证据更新
- 抖音来客真实平台验收 logid 闭环
## 2026-06-24 dashboard-export

### 已完成优�?- 首页导出从“待实现”补齐为同步 Excel 下载，不引入异步任务中心�?- 导出按钮放在经营概况标题工具区，复用当前首页门店和日期上下文，并允许临时调整日期范围和渠道�?- 服务层复用首页经营统计口径，避免前端二次金额换算和隐私明细外泄�?- 首页转化率、产品排行、今日预约、订单状态和趋势均已切到真实后端只读聚合接口，前端不再依�?Promise 脚手架兜底�?
### 仍需注意
- 前端全量 `npm --prefix studio-workbench run build` 已通过�?- 后端�?`backend/pom.xml` 默认 `skipTests=true`；需要用 `-DskipTests=false -Dmaven.test.skip=false` 显式打开目标测试�?
## 2026-06-24 service-production-closed-loop

### 已完成优�?
- 服务模块从“入口可�?/ 流程待确认”收口为真实专表契约，不再把协作设置塞进历史 JSON 壳或备注字段�?- 三方修图中心直接复用 `yy_photo_album` 已确认选片结果派生任务，减少店员重复录入�?- 服务商、中央修图策略、开通许可证都收敛到统一 facade：`backendServiceProductionApi.ts`�?
### 仍需外部验收

- 真实租户下的修图任务派生数量和人工排障话术�?- 多门店权限下的服务商可见范围与许可证绑定范围�?- 香港2 smoke：三方修图中心、三方修图服务商、中央修图设置、开通设置四个入口�?## 2026-06-24 marketing-domain-scaffold

### 已完成优�?- 营销模块不再继续往 `DerivedMarketingModuleView.vue` 堆逻辑，已拆成 4 个正�?owner 和独立营销 API slice�?- 固定优先级优惠试算已抽成前后端共用口径：
  - `兑换券`
  - `活动类最优价`
  - `优惠�?优惠码互斥`
  - `卡项权益互斥`
- `/order/campaign` 已补营销桥接和试算面板，避免订单页内散写营销规则�?- 后端新增营销域实体、控制器、服务、策略与 SQL 草案，后续可继续灌真�?CRUD 和真实账本能力�?
### 仍需继续
- 当前营销接口仍是 scaffold 数据，不代表真实券模�?CRUD、真实发券、真实核销、真实活动参与已完成�?- 平台侧授权当前只做到能力开关、菜单显隐和 API 鉴权，未接购买计费、试用、费用中心�?## 2026-06-24 member-module-phase1

### 下一步建�?- 写链路按顺序补：
  1. `yy_member_recharge_order` + 充值确�?  2. 余额流水与退款回�?  3. 积分/成长值规则引�?  4. 会员卡核销与权益扣�?- 优惠券门槛金额当前返�?`0`，后续需要和营销域模板门槛字段对齐�?- 会员资产总览当前依赖 `yy_member_account` 聚合余额，后续应补自动汇总或事件驱动回写机制�?
## 2026-06-24 member-recharge-closed-loop

- 已完成：
  - `yy_member_recharge_order` 手工充值建单与确认到账
  - `yy_member_account.balance_amount` / `pending_recharge_count` 回写
  - `yy_member_balance_ledger` 充值流水写�?  - 工作台资产页充值入�?- 后续待补�?  1. 充值单列表与补确认
  2. 提现/退款回滚对余额流水的反向冲�?  3. 审批流、店员权限细化、门店维度对�?## 2026-06-24 auth-foundation-phase1

### 已完成优�?- 新增统一授权底座 owner：`studio-workbench/src/features/system/featureGate.ts`
- 统一 gate 先解决前端各域各写一套门禁判断的问题，把权限、角色、门店范围、插件、许可证、审批收口成同一返回模型
- marketing 已作为首个接入域完成替换，后续域可以直接复用相同 facade 和测试口�?
### 后续建议
- 下一个接入域优先�?`collaboration-open-settings`，因为这里已经有真实许可证与门店绑定数据
- 后端需要补真实 `license/plugin/feature-scope` owner API，避免前端长期停留在 `unknown` 占位�?- 高风险审批态当前只有统一字段，还没有真实审批流数据源，后续接退款、发券、提现、重派工单时优先落表和错误码

## 2026-06-24 auth-foundation-phase2-collaboration

### 已完成优化
- 授权底座从前端占位推进到第一个前后端闭环：`feature-scope` 可读取协作许可证账本并返回真实 `active/missing/expired`。
- 协作开通页不再跨域调用 `serviceProduction` composable，页面写链路统一落到协作域 facade。
- 共享 `FeatureGateStatusCard` 已可复用展示许可证、插件、审批三类门禁摘要，marketing 能力卡改为薄包装。
- 前端新增独立 `backendTypesAccess.ts`，没有继续向 `backendTypesCore.ts` 堆授权类型。

### 后续建议
- 下一包可把资源/协同或会员域接入 `feature-scope`，每域只补真实解析规则，不新增跨域写链路。
- 审批、插件与套餐能力需要等真实账本或稳定来源落地后再从 `not_applicable` 升级为真实状态。

## 2026-06-24 internal-collaboration-work-order-stage-sla

### 已完成优化
- 工单岗位不再只靠前端文本推断，`stageCode` 作为后端真实契约进入实体、VO、查询和前端 DTO。
- 工单超时不再只能按固定岗位 SLA 推算，`dueTime` 作为真实 SLA 截止时间优先驱动工作执行概况和工单排序。
- 列表查询已支持 `stageCode`，便于后续把环节统计、岗位看板、员工待办继续收口到同一工单主链。
- 新增 MySQL / Postgres SQL 草案，避免继续把字段隐含在备注或前端派生逻辑里。

### 仍需注意
- 本轮没有执行生产迁移；上线前必须确认 `yy_work_order` 已补 `stage_code`、`due_time` 和组合索引。
- 旧工单没有 `stage_code/due_time` 时，前端仍会兼容推断；迁移后建议补一次历史数据回填脚本。
## 2026-06-25 member-recharge-read-side

### 宸插畬鎴愪紭鍖?
- 先补齐充值单读侧可见性，避免“能写充值、看不到最近充值单”的操作割裂。
- 充值历史继续挂在既有 `member/accounts` owner 下，不单独再造一个 stored-value 页面或第二套本地聚合口径。

### 鍚庣画寤鸿
- 下一包优先补 `PENDING/PENDING_APPROVAL` 的人工补确认、审批轨迹和退款冲正，而不是继续堆页面占位。
- 若后续要做正式储值中心，可复用本次的 `listMemberRechargeOrders` 事实链，避免重复读取 `yy_member_recharge_order`。

## 2026-06-24 phase3-center-api-owner

## 2026-06-24 resource-collaboration-closed-loop-phase1

### 已完成优化
- 资源管理、资源标签、资源用量、协同工单页统一复用 `FeatureGateStatusCard` 与 `useFeatureScopeGate`，避免各页面重复写权限、门店范围、许可证、插件、审批判断。
- 资源页写链路从 `backendApi` 聚合外观收口到 `resourcesApi` owner，页面不再依赖派生资源主路径。
- 协同工单页写链路从 `backendApi` 聚合外观收口到 `workOrdersApi` owner，并补齐 `yy_work_order_event` 事件明细读取。
- 后端工单状态机增加非法跳转保护，避免从 `PENDING` 直接完成等绕过执行过程的写入。

### 仍需注意
- 本包没有新增生产表和迁移 SQL；上线前仍需确认既有 `yy_work_order.stage_code/due_time` 已完成生产迁移。
- 资源容量清理仍是用量和回填层闭环，真实清理任务、审批和回滚证据需后续单独任务包。
- 工单事件已进入页面详情，但员工产能、平均耗时、事件级导出仍未完成。


### 已完成优化
- 工具中心不再只停留在前端本地数组，已新增 `YyToolCenterController / IYyToolCenterService / YyToolCenterServiceImpl`。
- 账号中心和费用中心也补齐后端 owner，前端 slice 改为 `apiRequest` 接线并保留 Demo 兜底。
- 后端测试合并为 Phase 3 center 聚合测试，避免每个脚手架页复制同构测试。
- 工具脚手架三层 owner 元数据已从 `backendPlatformApi.ts` 修正为 `backendToolsApi.ts`。

### 仍需注意
- 本包没有新增真实发布表、账号资料表、品牌默认表或财务账户表。
- 后续如要把这些从响应级动作升级为持久动作，需要先补契约、审计、幂等和权限数据范围。

## 2026-06-25 product-module-full-chain-scaffold

### 已完成优化
- 商品模块从旧的 `ProductCardCatalogView.vue` / `DerivedProductModuleView.vue` 承载方式扩展为 7 个子域 owner：目录、SKU、分类、关联、预约规则、渠道、卡项。
- 前端新增独立商品配置 API facade 和 `productCatalogStore`，避免继续向历史 `backendApi` 聚合外观堆字段。
- 后端新增商品目录聚合和扩展配置 CRUD 脚手架，后续可按子域逐步替换真实表单。
- `yy_product` 主账本边界保持不变，扩展表只承载 SKU、分类、展示、关联、预约、渠道、履约配置。

### 仍需注意
- 本轮没有执行 SQL、没有跑测试、没有做真实登录态验收。
- 不代表真实生产验收完成；上线前必须补目标测试、迁移审核、真实租户 smoke 和渠道/支付/权益边界验收。
