# 影约云门店工作台 PC 端代码地图

更新时间：2026-06-14

## 结论

`studio-workbench` 是从 `photoshop-master/frontend` 直接迁入的门店工作台 PC 端，定位是给影楼/门店员工使用，不是 RuoYi 系统总后台，也不是客户小程序。

正式目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
```

本地预览：

```text
http://127.0.0.1:5190/
```

## 权威框架文档

后续开发和交接优先看这些文档，避免只依赖聊天记录：

| 文档 | 用途 |
| --- | --- |
| `docs/studio-workbench-entry-map.md` | 门店工作台入口索引：先从登录、主控台、订单、客片、设置等入口定位到文件 |
| `docs/studio-workbench-architecture-framework.md` | 门店工作台大框架、账本边界、硬规则 |
| `docs/studio-workbench-api-route-map.md` | 前端路由、页面、store、backendApi、后端接口映射 |
| `docs/studio-workbench-route-implementation-status.md` | 每个工作台路由的 READY / DERIVED / PARTIAL / PLANNED 状态 |
| `docs/domestic-model-handoff-small-features.md` | 交给国产模型或小模型的小功能任务池和禁区 |
| `docs/domestic-model-task-template.md` | 单个小功能任务的可复制交接模板 |

## 技术栈

| 项 | 内容 |
| --- | --- |
| 框架 | Vue 3 |
| 构建 | Vite |
| 语言 | TypeScript |
| 路由 | Vue Router |
| 样式 | Tailwind CSS / 项目自定义 token |
| 图标 | `src/assets/icons/*.svg` |
| API 封装 | `src/shared/api/request.ts`、`src/shared/api/backend.ts` |

## 入口文件

| 功能 | 文件 |
| --- | --- |
| HTML 标题和根节点 | `studio-workbench/index.html` |
| Vite 端口与代理 | `studio-workbench/vite.config.ts` |
| 包配置 | `studio-workbench/package.json` |
| Vue 入口 | `studio-workbench/src/main.ts` |
| 应用布局 | `studio-workbench/src/app/App.vue` |
| 路由表 | `studio-workbench/src/app/router/index.ts` |

## 页面功能地图

| 页面 | 路由 | 文件 | 当前用途 |
| --- | --- | --- | --- |
| 预约概况 | `/` | `src/features/dashboard/DashboardView.vue` | 门店经营概览、今日待拍、待上传、待选片、待交付、趋势和状态 |
| 员工登录 | `/login` | `src/features/auth/StaffLoginView.vue` | 门店员工/门店管理员登录入口，桌面端左侧展示工作范围，右侧为顶部对齐登录侧栏，和客户取片入口隔离 |
| 预约订单 | `/orders` | `src/features/orders/OrdersView.vue` | 预约订单列表、门店处理顺序看板、快捷筛选、状态查看 |
| 日程管理 | `/schedule` | `src/features/schedule/ScheduleView.vue` | 门店/影棚排期、今日排期承接、待确认/已确认快捷筛选 |
| 门店管理 | `/store` | `src/features/stores/StoreView.vue` | 门店信息、营业状态、联系人、门店承接概况和快捷筛选 |
| 在线选片配置 | `/config` | `src/features/products/ProductConfigView.vue` | 套餐/产品、选片规则、产品配置承接和快捷筛选 |
| 附加产品 | `/product/addon` | `src/features/products/DerivedProductModuleView.vue` | 从统一产品表派生加片、加急、造型等附加产品视图，不建立第二套附加产品账本 |
| 团单产品 | `/product/group` | `src/features/products/DerivedProductModuleView.vue` | 从统一产品表派生企业、团体、多人拍摄产品视图，订单仍进入统一订单页 |
| 冲印产品 | `/product/print` | `src/features/products/DerivedProductModuleView.vue` | 从统一产品表派生冲印、加洗、相纸、打印和证照交付产品视图 |
| 抖音产品 | `/product/douyin` | `src/features/products/DouyinProductsView.vue` | 查看 DOUYIN_LIFE 商品映射、SKU、POI、落地页和可投放状态 |
| 美团产品 | `/product/meituan` | `src/features/products/DerivedProductModuleView.vue` | 查看 MEITUAN 商品映射、SKU、POI、入口和授权状态；不伪造未授权投放 |
| 渠道核销 | `/order/verification` | `src/features/orders/ChannelVerificationView.vue` | 查看抖音来客验收记录、同步健康、核销排障清单和 logid |
| 活动订单 | `/order/campaign` | `src/features/orders/CampaignOrdersView.vue` | 从统一 `yy_order` 派生活动订单，按渠道、支付、今日到店和待跟进筛选 |
| 冲印订单 | `/order/print` | `src/features/orders/DerivedOrderModuleView.vue` | 从统一订单和相册派生冲印/加洗/交付视图，按门店、支付和关键词跟进 |
| 企业团单 | `/order/enterprise` | `src/features/orders/DerivedOrderModuleView.vue` | 从统一订单派生企业、团体、多人订单视图，不建立第二套企业订单账本 |
| 售卡订单 | `/order/card` | `src/features/orders/DerivedOrderModuleView.vue` | 从统一订单派生会员卡、年卡、次卡、储值卡订单视图，权益账本后续在会员模块维护 |
| 售券订单 | `/order/coupon` | `src/features/orders/DerivedOrderModuleView.vue` | 从统一订单派生优惠券、兑换券、抖音/美团团购券视图，真实核销仍由渠道适配器处理 |
| 表单管理 | `/order/forms` | `src/features/orders/DerivedOrderModuleView.vue` | 从统一订单派生客户表单和资料跟进视图，重点处理缺资料、待支付、待确认 |
| 客片管理 | `/photo-mgmt` | `src/features/albums/PhotoMgmtView.vue` | 客片相册、底片、上传照片入口、批量选择、缩略图状态 |
| 在线选片 | `/online-selection`、`/service/selection` | `src/features/selection/OnlineSelectionView.vue` | 客户选片链接、选片状态、访问数据、二维码与客户已选照片 CSV 导出 |
| 工作执行概况 | `/collaboration/overview` | `src/features/collaboration/WorkExecutionOverviewView.vue` | 从订单、相册和选片链接派生唯一当前环节，支持日期/门店/环节筛选和处理跳转 |
| 工单管理 | `/collaboration/work-orders` | `src/features/collaboration/WorkOrdersView.vue` | 从执行队列派生工单池，支持阻塞/超时/进行中筛选、负责人查看和现有业务页面跳转 |
| 工单数据导出 | `/collaboration/export` | `src/features/collaboration/WorkOrderExportView.vue` | 从同一派生工单池按状态、环节、门店和关键词筛选导出 CSV |
| 环节统计 | `/collaboration/statistics` | `src/features/collaboration/WorkOrderStatisticsView.vue` | 从派生工单池统计拍摄、上传、客户选片、精修交付的数量、阻塞、超时和平均进度 |
| 文件资源 | `/resource/files` | `src/features/resources/DerivedResourceModuleView.vue` | 从相册底片派生文件资源视图，查看私有 OSS 归属、访问状态和业务用途 |
| 样片作品 | `/resource/samples` | `src/features/resources/DerivedResourceModuleView.vue` | 从客户已选照片派生样片候选，正式公开前仍需客户授权和后台审核 |
| 客户档案 | `/member/customers` | `src/features/member/CustomersView.vue` | 查看客户资料、来源、标签、消费、最近订单和回访备注 |
| 会员账户 | `/member/accounts` | `src/features/member/DerivedMemberModuleView.vue` | 从 `yy_customer` 和 `yy_order` 派生会员等级、订单次数和累计消费，不建立第二套积分余额账本 |
| 客户标签 | `/member/tags` | `src/features/member/DerivedMemberModuleView.vue` | 从 `yy_customer.tags` 派生客户分群和回访线索，标签维护仍回到客户档案 |
| 消费记录 | `/member/consumption` | `src/features/member/DerivedMemberModuleView.vue` | 从统一 `yy_order` 派生客户消费、退款和待支付记录 |
| 营销中心 | `/marketing/center` | `src/features/marketing/MarketingCenterView.vue` | 聚合展示营销能力开关、渠道承接、活动订单联动和固定优先级试算入口 |
| 优惠券 | `/marketing/coupons` | `src/features/marketing/MarketingCouponsView.vue` | 展示券模板、发券记录、券实例、核销记录和退单恢复脚手架，优先调用营销域接口并回落本地 scaffold |
| 活动清单 | `/marketing/campaigns` | `src/features/marketing/MarketingCampaignsView.vue` | 展示活动清单、时间窗、商品绑定和活动订单桥接脚手架 |
| 活动参与记录 | `/marketing/participations` | `src/features/marketing/MarketingParticipationsView.vue` | 展示客户参与、转化、退款、失效状态和固定优先级试算结果 |
| 门店业绩日报/月报 | `/report/store-daily`、`/report/store-monthly` | `src/features/reports/DerivedReportModuleView.vue` | 从统一订单按最近营业日或月份聚合门店订单、收入和待处理记录 |
| 产品/渠道/收支统计 | `/report/products`、`/report/channels`、`/report/finance` | `src/features/reports/DerivedReportModuleView.vue` | 按服务、来源或门店聚合订单金额、已支付、待收和退款 |
| 员工/修图统计 | `/report/employees`、`/report/retouch` | `src/features/reports/DerivedReportModuleView.vue` | 从员工档案、相册摄影师归属和底片数量派生工作量 |
| 客户分析/评价 | `/report/customers`、`/report/reviews` | `src/features/reports/DerivedReportModuleView.vue` | 客户分析读取 `yy_customer`；评价未接表/API 时显示真实空态 |
| 订单转化分析 | `/report/conversion` | `src/features/reports/DerivedReportModuleView.vue` | 从下单、支付、确认服务和进入选片四个节点派生转化漏斗 |
| 客户预约入口 | `/tools/booking-entry` | `src/features/tools/ShareLinksView.vue` | 生成带门店参数的微信小程序预约入口、小程序码参数和 H5 引导链接 |
| 取片入口 | `/tools/pickup-entry` | `src/features/tools/ShareLinksView.vue` | 生成客户取片入口、取片 H5 兜底链接和店内桌牌文案 |
| 二维码与分享链接 | `/tools/share-links` | `src/features/tools/ShareLinksView.vue` | 管理现场预约通道、底片下载、我的订单等店内二维码物料 |
| 角色与权限 | `/settings/roles` | `src/features/settings/RolesView.vue` | 展示门店角色模板、当前账号门店范围、菜单权限矩阵和缺失权限复制 |
| 渠道配置 | `/settings/channels` | `src/features/settings/ChannelsView.vue` | 展示微信/抖音 AppID、合法域名、抖音来客 Webhook/SPI 地址和上线检查 |
| 系统日志 | `/settings/logs` | `src/features/settings/LogsView.vue` | 汇总 RuoYi 操作日志和影约云渠道同步日志，支持失败、可重试、requestId/logid 排查 |
| 系统设置 | `/settings` | `src/features/settings/SettingsView.vue` | 员工会话、接口模式、客户取片隔离、入口边界和运行设置 |

## 未接入正式路由的参考残留

以下文件来自参考项目迁入时的页面级占位，目前不在 `src/app/router/index.ts` 路由表内，也不属于门店工作台 P0/P1 验收入口：

| 文件 | 当前内容 | 处理结论 |
| --- | --- | --- |
| `src/features/customers/CustomersView.vue` | 仅标题 `客户管理` | 暂不作为正式页面，后续如做客户 CRM 再重新设计 |
| `src/features/finance/FinanceView.vue` | 仅标题 `财务管理` | 暂不作为正式页面，后续结算/报表进入 P2 再设计 |
| `src/features/packages/PackagesView.vue` | 仅标题 `套餐管理` | 暂不作为正式页面，现有套餐配置先看 `/config` |

当前正式路由仍以“主控台、订单、日程、门店、配置、客片、在线选片、设置”为准。

## 通用组件地图

| 组件 | 文件 | 说明 |
| --- | --- | --- |
| 左侧导航 | `src/shared/components/layout/Sidebar.vue` | 品牌、主导航、账号区域 |
| 导航项 | `src/shared/components/layout/SidebarItem.vue` | 菜单图标和激活态 |
| 顶部栏 | `src/shared/components/layout/Header.vue` | 面包屑、搜索、处理订单入口；不再提供客户预约创建表单 |
| 统计项 | `src/shared/components/dashboard/StatItem.vue` | 主控台指标卡片 |
| 趋势图 | `src/shared/components/dashboard/TrendChart.vue` | 主控台趋势图；由 `DashboardView.vue` 异步加载，避免 ECharts 阻塞首屏 |
| 排期槽位 | `src/shared/components/schedule/ReservationSlots.vue` | 日程管理的预约槽位 |

## 数据层地图

| 文件 | 作用 |
| --- | --- |
| `src/shared/api/request.ts` | 请求封装、token 缓存、自动登录、错误处理、资源 URL 拼接 |
| `src/shared/api/backend.ts` | 工作台 API facade；真实模式接 `/yy/*`，demo 模式由 store 兜底；已从约 `1300` 行拆到约 `907` 行 |
| `src/shared/api/backendTypes.ts` | 工作台后端 DTO、payload、分页查询和 bootstrap 类型契约 |
| `src/shared/api/backendId.ts` | 后端业务 ID 边界；雪花 ID 统一保持字符串，禁止进入 JavaScript `number` |
| `src/shared/api/yingyueAdapter.ts` | 影约云 RuoYi 数据到工作台 DTO 的映射层 |
| `src/shared/api/backend.contract.test.ts` | 锁定今日/范围订单分离、创建后回查真实记录和禁止伪造数据库 ID |
| `src/shared/api/backendId.test.ts` | 锁定 19 位雪花 ID 不丢精度 |
| `src/shared/api/yingyueAdapter.test.ts` | adapter 映射测试 |
| `src/shared/auth/staffSession.ts` | 门店员工前端会话，独立于客户手机号取片登录 |
| `src/shared/auth/staffSession.test.ts` | 员工会话隔离测试 |
| `src/features/auth/StaffLoginView.contract.test.ts` | 员工登录页契约测试，锁定员工入口、工作范围、安全边界和登录去向 |
| `src/features/dashboard/DashboardView.contract.test.ts` | 主控台契约测试，锁定今日运营指标、现有 store 数据来源和趋势图异步加载边界 |
| `src/app/viteConfig.contract.test.ts` | 构建分包契约测试，锁定 Vue 框架与 ECharts 独立分包及 ECharts 分包体积上限 |
| `src/features/albums/PhotoMgmtView.contract.test.ts` | 客片页契约测试，锁定批量操作工具栏和缩略图加载/失败态 |
| `src/features/orders/orderOperations.ts` | 预约订单运营纯规则：快捷筛选、今日处理看板、下一步动作、日期解析和库存冲突识别 |
| `src/features/orders/orderOperations.test.ts` | 订单运营规则单元测试，锁定今日待处理、异常缺资料、状态流转和日期解析 |
| `src/features/orders/OrdersView.contract.test.ts` | 订单页契约测试，锁定订单处理看板、快捷筛选、helper 边界和现有订单数据来源 |
| `src/features/schedule/ScheduleView.contract.test.ts` | 日程页契约测试，锁定今日排期承接看板、快捷筛选和现有日程数据来源 |
| `src/features/stores/StoreView.contract.test.ts` | 门店页契约测试，锁定门店承接概况、快捷筛选、现有门店/订单/相册/排期数据来源，并防止操作卡出现占位 scope |
| `src/features/products/ProductConfigView.contract.test.ts` | 产品配置页契约测试，锁定产品配置承接、快捷筛选和现有产品/选片统计数据来源 |
| `src/features/products/derivedProductModules.test.ts` | 派生商品模块分类测试，锁定附加、团单、冲印和美团四类来源、状态和数据边界 |
| `src/features/products/DerivedProductModuleView.contract.test.ts` | 派生商品模块页面契约，锁定四个剩余商品入口共用真实页面、统一产品/渠道映射数据源和不创建预约边界 |
| `src/features/settings/SettingsView.contract.test.ts` | 设置页契约测试，锁定员工会话、接口模式、客户取片隔离和入口边界说明 |
| `src/features/settings/RolesView.contract.test.ts` | 角色与权限页契约测试，锁定门店角色模板、bootstrap 权限体检、菜单权限矩阵和 RuoYi 后台边界 |
| `src/features/settings/ChannelsView.contract.test.ts` | 渠道配置页契约测试，锁定 `api.evanshine.me`、微信/抖音 AppID、合法域名和来客 SPI 地址 |
| `src/features/settings/LogsView.contract.test.ts` | 系统日志页契约测试，锁定 `/monitor/operlog/list`、`/yy/channelSyncLog/list`、logid 复制和部分加载失败处理 |
| `src/features/products/DouyinProductsView.contract.test.ts` | 抖音产品页契约测试，锁定 `/yy/channelProductMapping/list`、商品映射就绪字段和只读排障边界 |
| `src/features/orders/ChannelVerificationView.contract.test.ts` | 渠道核销页契约测试，锁定 `/yy/channel/DOUYIN_LIFE/acceptance-cases`、`/sync-health`、logid 和不直接真实核销边界 |
| `src/features/orders/CampaignOrdersView.contract.test.ts` | 活动订单页契约测试，锁定统一 `yy_order` 数据源、渠道归因和店员只跟进不创建预约边界 |
| `src/features/orders/derivedOrderModules.test.ts` | 派生订单模块分类测试，锁定冲印、企业团单、售卡、售券、表单五类来源和统一订单跳转 |
| `src/features/orders/DerivedOrderModuleView.contract.test.ts` | 派生订单模块页面契约，锁定五个剩余订单入口共用真实页面、统一数据源和不创建预约边界 |
| `src/features/selection/OnlineSelectionView.contract.test.ts` | 在线选片运营契约，锁定选择结果导出状态和底片 selected 字段 |
| `src/features/selection/selectionExport.test.ts` | 选择结果 CSV 单元测试，锁定只导出客户已选照片及 CSV 转义 |
| `src/features/albums/photoMgmtOperations.ts` | 客片页纯规则：相册进度、下一步、照片网格、批量标记和缩略图状态集合 |
| `src/features/albums/photoMgmtOperations.test.ts` | 客片页规则单元测试，锁定无占位照片、已选计数和缩略图集合清理 |
| `src/features/collaboration/workExecution.test.ts` | 执行队列推导测试，锁定一单一环节、下游优先、超时和处理入口 |
| `src/features/collaboration/WorkExecutionOverviewView.contract.test.ts` | 工作执行概况页面契约，锁定统一数据源、四环节和不创建预约边界 |
| `src/features/collaboration/workOrders.test.ts` | 工单派生测试，锁定一单一工单、优先级、阻塞原因和操作入口 |
| `src/features/collaboration/WorkOrdersView.contract.test.ts` | 工单管理页面契约，锁定统一数据源、可用路由和不创建预约边界 |
| `src/features/collaboration/workOrderExport.test.ts` | 工单 CSV 导出测试，锁定 BOM、字段顺序、筛选结果和 CSV 转义 |
| `src/features/collaboration/WorkOrderExportView.contract.test.ts` | 工单导出页面契约，锁定统一数据源、只读导出和不创建预约边界 |
| `src/features/collaboration/workOrderStats.test.ts` | 环节统计聚合测试，锁定四环节完整返回、阻塞/超时/平均进度和进行中比例 |
| `src/features/collaboration/WorkOrderStatisticsView.contract.test.ts` | 环节统计页面契约，锁定统一数据源、只读统计和不创建预约边界 |
| `src/features/resources/derivedResourceModules.test.ts` | 派生资源模块测试，锁定文件资源和样片候选均来自相册底片及私有 OSS 归属 |
| `src/features/resources/DerivedResourceModuleView.contract.test.ts` | 派生资源页面契约，锁定资源组共用真实页面、只读相册照片数据源和不发布样片边界 |
| `src/features/member/derivedMemberModules.test.ts` | 派生会员模块测试，锁定会员账户、客户标签和消费记录均来自客户与统一订单数据 |
| `src/features/member/DerivedMemberModuleView.contract.test.ts` | 派生会员页面契约，锁定会员组三个入口共用真实页面、只读客户/订单数据源和不创建会员第二账本 |
| `src/features/marketing/marketingScaffoldData.test.ts` | 营销脚手架数据测试，锁定券模板、活动、参与记录和试算回落数据的最小契约 |
| `src/features/marketing/promotionPricingFacade.test.ts` | 固定优先级试算 facade 测试，锁定兑换券、活动类、优惠券/优惠码、卡项权益的优先级和互斥结果 |
| `src/features/marketing/MarketingModuleViews.contract.test.ts` | 营销模块页面契约，锁定四个正式 owner、能力开关空态和营销桥接入口 |
| `src/features/reports/derivedReportModules.test.ts` | 派生报表测试，锁定门店、产品、员工、修图、财务、客户、渠道和转化均来自现有业务账本 |
| `src/features/reports/DerivedReportModuleView.contract.test.ts` | 派生报表页面契约，锁定统计组十个入口共用真实页面、评价真实空态和只读边界 |
| `src/features/tools/ShareLinksView.contract.test.ts` | 入口物料页契约测试，锁定店内旧二维码替换、门店参数、小程序路径和 H5 兜底边界 |
| `src/features/tools/shareLinkOperations.ts` | 入口物料纯规则：微信/抖音 AppID、门店 entry/channel 参数、小程序 path、scene、H5 兜底 URL 和路由默认入口 |
| `src/features/tools/shareLinkOperations.test.ts` | 入口物料规则单元测试，锁定四类入口的 path、scene、H5 URL 和 route name 默认值 |
| `src/shared/stores/appStore.ts` | 门店、产品、订单、相册、选片链接、日程等页面状态；默认提供 demo fallback；已从约 `2385` 行拆到约 `1731` 行 |
| `src/shared/stores/appStoreTypes.ts` | 工作台前端业务模型类型：门店、商品、订单、相册、选片、员工、客户、渠道诊断等 |
| `src/shared/stores/appStoreTransforms.ts` | DTO 到工作台模型的纯映射、日期/金额格式化、demo ID 与产品 payload 转换 |
| `src/app/main.contract.test.ts` | 锁定入口不在鉴权前预加载工作台数据，并等待初始路由后再挂载，避免登录页闪工作台壳层 |
| `src/app/router/router.contract.test.ts` | 锁定 API 模式路由必须同时校验员工会话和 API token |

真实模式当前已接入：

```text
/yy/store/list
/yy/product/list
/yy/order/list
/yy/photoAlbum/list
/yy/photoAsset/list
/resource/oss/upload
/resource/oss/listByIds/{ossId}
/yy/photoAsset
/yy/channelProductMapping/list
/yy/channel/DOUYIN_LIFE/acceptance-cases
/yy/channel/DOUYIN_LIFE/sync-health
/yy/channelSyncLog/list
/monitor/operlog/list
```

工作台派生能力：

- 选片链接：由相册 `publicToken/accessCode` 派生。
- 日程：由订单 `arrivalTime` 派生。
- 主控台统计：由订单、相册和选片链接派生；当前已展示今日待拍、待上传、待选片、待交付。
- 订单处理看板：由 `src/features/orders/orderOperations.ts` 从 `appStore.orders` 派生今日到店、待确认、待拍摄、选片跟进；快捷筛选继续叠加在原搜索/日期/高级筛选上。
- 订单查询范围：`appStore.orders` 只保存今日运营订单；`appStore.reportOrders` 保存显式范围订单，会员消费和订单类报表默认按当前月加载，避免把今日数据误当月报。
- 日程排期承接：由 `appStore.scheduleItems` 和 `appStore.studios` 派生今日预约、待确认时段、已占用工位、可接待工位；快捷筛选可切全部时段、只看待确认、只看已确认。
- 门店承接概况：由 `appStore.stores`、`appStore.orders`、`appStore.albums`、`appStore.scheduleItems` 派生门店总数、营业中、待服务单、本月订单、今日预约、待上传、排期；快捷筛选可切全部门店、有待服务、营业中、预约制。
- 门店操作卡：待服务单 scope 使用 `SERVICE`，不再保留占位语义。
- 产品配置承接：由 `appStore.products` 和 `appStore.selectionStats` 派生在售产品、待补规则、本月加片营收、平均加片张数；快捷筛选可切全部产品、在售产品、已下架、待补规则。
- 派生商品模块：`/product/addon`、`/product/group`、`/product/print`、`/product/meituan` 共用 `DerivedProductModuleView.vue` 和 `buildDerivedProductItems()`；前三个从 `yy_product` 派生附加、团单、冲印产品，美团从 `/yy/channelProductMapping/list` 读取 `MEITUAN` 映射，页面只读并跳转服务产品或渠道配置。
- 系统设置边界：由 `getStaffSession`、`STAFF_SESSION_KEY` 和 `appStore.demoMode/apiError/stores/products/orders/albums/selectionLinks` 派生员工会话、接口模式、客户取片、可运营数据；快捷筛选可切全部设置、安全边界、运行模式。
- 客片批量选择：`PhotoMgmtView.vue` 调用 `photoMgmtOperations.ts` 派生照片网格、选择计数和缩略图状态；当前是工作台前端交互态，用于整理门店已选精修片，不新增后端接口，不改变 OSS 上传链路。
- 入口物料管理：`ShareLinksView.vue` 调用 `shareLinkOperations.ts` 从 `appStore.stores` 派生门店二维码参数，生成微信小程序页面路径、`scene`、客户网页 H5 兜底链接和店内桌牌文案；`/tools/booking-entry`、`/tools/pickup-entry`、`/tools/share-links` 共用同一真实页面。
- 角色与权限：`/settings/roles` 读取 `studioAccessStore` 和 `workbenchFeatures`，展示系统管理员、门店主管、前台店员、摄影师、修图师五类模板；新增/修改 RuoYi 系统角色仍在系统后台完成。
- 渠道配置：`/settings/channels` 展示微信/抖音小程序合法域名、`api.evanshine.me` 正式 API、抖音来客 Webhook/SPI 地址和上线前人工检查清单；新增回调仍优先使用 `api.evanshine.me`。
- 系统日志：`/settings/logs` 调用 `appStore.loadOperationLogs()` 和 `appStore.loadChannelSyncLogs()`，分别读取 `/monitor/operlog/list` 与 `/yy/channelSyncLog/list`；操作日志缺权限时允许渠道同步日志继续展示，并提示需要补 `monitor:operlog:list`。
- 抖音产品：`/product/douyin` 调用 `appStore.loadChannelProductMappings('DOUYIN_LIFE')`，读取 `/yy/channelProductMapping/list`；门店员工只查看和复制商品入口，新增/编辑映射仍在系统后台完成。
- 渠道核销：`/order/verification` 调用 `appStore.loadDouyinAcceptanceCases()`、`appStore.loadDouyinSyncHealth()` 和 `appStore.loadChannelSyncLogs()`；工作台只展示验收、健康状态和 logid，不直接执行真实核销。
- 活动订单：`/order/campaign` 读取 `appStore.orders`，按订单来源归因到抖音来客、微信、美团、门店线索等活动渠道；只提供筛选、统计和跳转统一订单跟进，不建立第二套活动订单账本。
- 派生订单模块：`/order/print`、`/order/enterprise`、`/order/card`、`/order/coupon`、`/order/forms` 共用 `DerivedOrderModuleView.vue` 和 `buildDerivedOrderItems()`，按服务名、来源、相册和资料状态从 `yy_order` 派生冲印、企业团单、售卡、售券和表单跟进视图；页面只读并跳转统一订单处理。
- 在线选片：`/service/selection` 按链接定位真实相册并刷新底片详情，保留 `is_selected` 标记，只将客户已选照片导出为带 BOM 的 CSV。
- 工作执行概况：`/collaboration/overview` 调用 `buildWorkExecutionItems()`，按订单关联相册和选片链接，以下游证据决定唯一当前环节；页面只派生视图并跳转原业务模块。
- 工单管理：`/collaboration/work-orders` 调用 `buildWorkOrders()`，在执行队列上派生工单号、负责人、优先级、阻塞原因和操作入口；当前不写 `yy_work_order`，真实订单状态仍通过 `appStore.updateOrderStatus()` 回写 `yy_order`。
- 工单数据导出：`/collaboration/export` 复用 `buildWorkOrders()`，再由 `buildWorkOrderCsv()` 生成带 UTF-8 BOM 的 CSV；导出只读，不创建预约、不写工单事件。
- 环节统计：`/collaboration/statistics` 复用 `buildWorkOrders()` 和 `buildWorkOrderStageStats()`，生成拍摄、上传、客户选片、精修交付四个固定环节的只读统计；后续接 `yy_work_order_event` 后再扩展耗时和员工产能。
- 派生资源模块：`/resource/files`、`/resource/samples` 共用 `DerivedResourceModuleView.vue` 和 `buildDerivedResourceItems()`；文件资源从 `yy_photo_album`/`yy_photo_asset` 展示私有 OSS 归属，样片作品只从客户已选照片派生候选，正式公开发布前仍需客户授权。
- 派生会员模块：`/member/accounts`、`/member/tags`、`/member/consumption` 共用 `DerivedMemberModuleView.vue` 和 `buildDerivedMemberItems()`；页面挂载和模块切换时通过 `ensureCustomersLoaded()` 按需加载客户，账户/消费读取 `reportOrders`，客户标签只读 `yy_customer.tags`，不创建积分、余额、标签或消费第二账本。
- 营销模块：`/marketing/center`、`/marketing/coupons`、`/marketing/campaigns`、`/marketing/participations` 已切到独立 owner；前端通过 `backendMarketingApi.ts`、`promotionPricingFacade.ts`、`campaignOrderBridge.ts` 接营销域脚手架接口，后端补了 `yy_coupon_*`、`yy_campaign*`、`yy_promotion_*` 相关实体、控制器、服务和固定优先级试算策略，当前仍属于 scaffold 阶段，未完成真实 CRUD 与真实账本闭环。
- 派生统计模块：全部 `/report/*` 共用 `DerivedReportModuleView.vue` 和 `buildDerivedReportItems()`；页面通过 `ensureReportDataLoaded()` 按来源加载当前月订单、员工或客户，员工与修图读取 `yy_employee`、`yy_photo_album`、`yy_photo_asset`，客户评价没有正式表或渠道 API 时保持空态，不伪造评分。
- 创建结果一致性：服务组、员工、客户、通知模板、订单和产品在 POST 成功后重新查询服务端记录并读取真实 ID；demo 临时 ID 使用 `demo-*` 前缀，不伪装数据库雪花 ID。

## 店内二维码替换边界

- 旧的 `yuyue123.cn` 或别人微信小程序码不能接管，必须重新生成影约云自己的微信小程序码并替换桌牌。
- 微信 AppID：`wx2a1a34748f56a6c6`；抖音 AppID：`tta3c8d5753dac3aae01`。
- 每家店二维码必须带 `storeId`，入口类型使用 `entry=STORE|BOOKING|PICKUP|ORDER`，渠道提示使用 `channel=STORE|WECHAT|DOUYIN|MEITUAN`。
- 正式预约下单优先进入微信/抖音小程序；`client-web` 只做官网、取片和小程序预约引导，不在电脑网页里新建预约。
- 小程序合法域名继续保持 `https://api.evanshine.me`。

真实化边界：

- RuoYi 登录已接入：API 模式走 `/auth/code` + `/auth/login`，提交默认租户 `000000`、真实账号密码、生产验证码 `code/uuid`，并缓存到 `yingyue_studio_workbench_access_token`。
- 线上生产包已切为 API 模式：无 API token 访问 `/orders`、`/schedule` 等工作台路由会回到 `/login?redirect=...`。
- API 模式下后端请求失败不会降级到 demo 数据，页面会显示后端连接失败，避免员工误以为已写库。
- 生产门店工作台账号已建：`store-admin`，角色 `studio_staff`，密码沿用通用演示密码；拥有门店/产品/订单/相册/底片/OSS 上传查询的最小工作台权限。
- Demo 模式仍可用 `store-admin` / `demo123456` 做本地纯 UI 演示，不写生产数据库。
- 生产上传/订单验收：真实 OSS 上传闭环已在工作台接入，后续用 `store-admin` 账号输入验证码后，验证订单状态写库、OSS 上传、底片创建、刷新后返回真实底片 ID。

为保证当前页面可演示，`appStore.bootstrap()` 本地默认使用 demo 数据，不请求未适配的 `/api/v1/*`。真实 adapter 接好后，可设置：

```text
VITE_STUDIO_DEMO=false
```

此时才会走真实后端请求；demo fallback 只作为离线兜底。

## 与其他前端边界

| 目录 | 定位 | 是否同一套 UI |
| --- | --- | --- |
| `admin-ui` | RuoYi 系统后台/平台管理后台 | 不是 |
| `studio-workbench` | 门店工作台 PC 端 | 是本地图直接迁入的新正式入口 |
| `mobile-uniapp` | 客户取片 H5 / 微信小程序 / 抖音小程序 | 不是 |
| `client-web` | 客户电脑网页官网/取片/小程序预约引导端 | 已创建，端口 `5200` |
