# 影约云门店工作台完整交付计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `studio.evanshine.me` 收口到可交付状态：主工作台能真用，派生页有真实边界或真实数据，平台验收证据齐全，国产模型接手时有清晰地图。

**Architecture:** 继续使用现有 `Vue 3 + TypeScript + Tailwind + Vitest + Vite` 前端和 `Spring Boot + PostgreSQL + Redis + OSS` 后端，不换栈。`featureRegistry.ts` 继续作为唯一菜单/路由源；`OrdersView`、`PhotoMgmtView`、`OnlineSelectionView`、`EmployeesView`、`RolesView`、`LogsView`、`ChannelsView`、`SettingsView` 作为工作台核心。`Derived*` 系列页面逐个替换为真实业务页或带明确边界的空态页。所有平台验收、真实订单同步和 OSS 取片证据放在独立任务里，不假装完成。

**Tech Stack:** Vue 3、TypeScript、Vitest、Vite、Tailwind CSS、Spring Boot、RuoYi-Vue-Plus、PostgreSQL、Redis、Aliyun OSS、Playwright、微信/抖音开发者工具。

---

## 当前状态

| 区域 | 状态 | 说明 |
| --- | --- | --- |
| 订单 / 预约 | PARTIAL | 页面、筛选和详情抽屉已很强，还要继续收口改期、冲突、导出边界和交互细节 |
| 客片 / 选片 | PARTIAL | 已可用，但还要继续抬 UI、批量操作和真实保存 / 预览体验 |
| 员工 / 权限 / 日志 | PARTIAL | 基础闭环已通，仍要补可操作性、权限边界和日志检索体验 |
| 商品 / 会员 / 营销 / 报表 | PARTIAL | 菜单完整，派生页还需要逐个接真接口或明确建设中边界 |
| 小程序 / OSS / 平台验收 | BLOCKED | 仍缺微信、抖音真机验收、真实 OSS 取片证据、真实订单 / 回调证据 |
| 本地验证 | DONE | `npm test` 与 `npm run build` 已通过；构建只有 `@vueuse/core` 的 rolldown annotation warning，非阻断 |

## 还差多少

从交付角度看，现在还差 7 组大项：

1. 订单核心页最终收口。
2. 客片 / 在线选片体验最终收口。
3. 员工管理 / 角色权限 / 系统日志 / 工作台设置 / 渠道配置闭环。
4. 商品页、会员页、营销页、报表页逐个替换派生内容。
5. 协作 / 工单页补真实流程。
6. 微信 / 抖音小程序、OSS、真实订单同步的验收证据。
7. 文档地图和国产模型交接包。

---

### Task 1: 订单核心页最终收口

**Files:**
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/api/backend.contract.test.ts`
- Modify: `studio-workbench/src/features/schedule/ScheduleView.vue`
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify: `studio-workbench/src/shared/components/data/StatusBadge.vue`

- [x] **Step 1: 把订单列表的生效筛选做成唯一真相**
  - 常用筛选保留在 URL 中：按天、状态、门店、渠道、关键词。
  - 列表、标签、详情抽屉都从同一份 query 读值，刷新后状态不丢。
- [x] **Step 2: 把改期、冲突、状态流转收紧**
  - 订单详情抽屉里保留改期、确认、取消、完成等动作。
  - 冲突提示只读真实库存和真实状态，不伪造成功。
- [x] **Step 3: 保留导出禁用态直到真接口到位**
  - 导出按钮在接口没接入前继续显示明确禁用态。
  - 不提供假导出，不下载空文件。
- [ ] **Step 4: 补契约测试和浏览器验收**
  - 运行 `npm test`。
  - 运行 `npm run build`。
  - 浏览器复查 `/order/appointment` 和 `/dashboard/today`。

2026-06-14 收尾记录：订单页已保留 URL 筛选、详情抽屉、状态流转、改期冲突反馈和导出禁用态；库存冲突提示已收紧为优先匹配 `inventorySlotId` / `serviceGroupId` / `externalSkuId`，避免同一门店同一时间不同服务组被误判。已验证 `npm test` 64 个测试文件、330 个测试通过；`npm run build` 通过，仅有 `@vueuse/core` Rolldown pure annotation warning。

### Task 2: 客片 / 在线选片最终收口

**Files:**
- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.vue`
- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts`
- Modify: `studio-workbench/src/features/selection/OnlineSelectionView.vue`
- Modify: `studio-workbench/src/features/selection/OnlineSelectionView.contract.test.ts`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/components/feedback/StateView.vue`

- [ ] **Step 1: 把上传、预览、保存、批量操作做顺**
  - 照片管理继续保留真实上传失败横幅、复制错误、重试入口。
  - 在线选片保留二维码、访问状态、加片提示和进度反馈。
- [ ] **Step 2: 把空态、加载态、失败态统一成可执行边界**
  - 没有相册、没有图片、接口未接入三类状态分开写。
  - 不再让用户面对空白页。
- [ ] **Step 3: 补浏览器验证**
  - 复查 `/service/photos`、`/service/selection`、`/photo-mgmt`、`/online-selection` 的跳转兼容。
  - 确认照片相关按钮有清晰反馈。
- [ ] **Step 4: 跑回归**
  - 运行 `npm test`。
  - 运行 `npm run build`。

### Task 3: 员工 / 权限 / 日志 / 工作台设置 / 渠道配置闭环

**Files:**
- Modify: `studio-workbench/src/features/settings/EmployeesView.vue`
- Modify: `studio-workbench/src/features/settings/RolesView.vue`
- Modify: `studio-workbench/src/features/settings/LogsView.vue`
- Modify: `studio-workbench/src/features/settings/ChannelsView.vue`
- Modify: `studio-workbench/src/features/settings/SettingsView.vue`
- Modify: `studio-workbench/src/shared/components/layout/Header.vue`
- Modify: `studio-workbench/src/shared/components/layout/Sidebar.vue`
- Modify: `studio-workbench/src/shared/components/layout/SidebarItem.vue`

- [ ] **Step 1: 让店员真的能用**
  - 员工列表、角色权限、系统日志都保留清晰的搜索、筛选、复制和详情入口。
  - 只显示本门店需要的业务，不让普通店员看到系统总后台噪音。
- [ ] **Step 2: 把渠道配置收口成真实配置页**
  - 域名、SPI、Webhook、复制状态和参数校验继续保留。
  - 真实未接入项显示建设中，不伪装已完成。
- [ ] **Step 3: 把左上角品牌和侧边层次做完**
  - 顶部品牌、侧栏激活态、分组、卡片层次继续统一。
  - 保持影楼工作台气质，但不要再像模板站。
- [ ] **Step 4: 复测权限边界**
  - 管理员、门店主管、普通员工三个角色都要能进相应页面。
  - 复查 `/settings/employees`、`/settings/roles`、`/settings/logs`、`/settings/channels`、`/settings/workbench`。

### Task 4: 商品 / 会员 / 营销 / 报表派生页逐个替换

**Files:**
- Modify: `studio-workbench/src/features/products/DerivedProductModuleView.vue`
- Modify: `studio-workbench/src/features/products/DouyinProductsView.vue`
- Modify: `studio-workbench/src/features/products/ProductConfigView.vue`
- Modify: `studio-workbench/src/features/member/DerivedMemberModuleView.vue`
- Modify: `studio-workbench/src/features/member/CustomersView.vue`
- Modify: `studio-workbench/src/features/marketing/DerivedMarketingModuleView.vue`
- Modify: `studio-workbench/src/features/reports/DerivedReportModuleView.vue`
- Modify: `studio-workbench/src/features/reports/derivedReportModules.ts`

- [ ] **Step 1: 商品页先收口**
  - 服务、附加、团单、冲印、抖音、美团商品各自明确数据边界。
  - 没有接口的项继续保留真实空态和待补字段清单。
- [ ] **Step 2: 会员页补真实客户视图**
  - 客户档案、会员账户、标签、消费记录逐项接真实数据。
  - 最近订单、最近相册、最近消费要能回跳到订单或客片页。
- [ ] **Step 3: 营销页只保留能用的入口**
  - 优惠券、活动、参与记录能查到就展示，不能查到就明确建设中。
  - 不伪造发券、参与和转化数字。
- [ ] **Step 4: 报表页保持真实空态**
  - 日报、月报、产品、员工、修图、渠道、客户、评价、转化分开处理。
  - 没有正式数据源的页必须写清楚后续接口名，不编造评分或收入。

### Task 5: 协作 / 工单页补真实流程

**Files:**
- Modify: `studio-workbench/src/features/collaboration/WorkExecutionOverviewView.vue`
- Modify: `studio-workbench/src/features/collaboration/WorkOrdersView.vue`
- Modify: `studio-workbench/src/features/collaboration/WorkOrderExportView.vue`
- Modify: `studio-workbench/src/features/collaboration/WorkOrderStatisticsView.vue`
- Modify: `studio-workbench/src/features/collaboration/workExecution.ts`

- [ ] **Step 1: 把拍摄、初修、精修、选片、排版、交付的状态串起来**
  - 工单页面只展示真实流转，不给假状态。
- [ ] **Step 2: 把导出和统计做成闭环**
  - 导出必须可按门店、员工、环节过滤。
  - 统计只展示真实聚合或明确空态。
- [ ] **Step 3: 复查工作执行概况**
  - 确认超时、待处理、数量汇总都能对应到真实工单。

### Task 6: 微信 / 抖音小程序、OSS、真实订单同步验收

**Files:**
- Modify: `mobile-uniapp/src/pages/pickup/**`
- Modify: `mobile-uniapp/src/pages/**`
- Modify: `backend/**` 中与订单、回调、OSS、支付相关模块
- Modify: `docs/evidence/yingyue-delivery-status.json`
- Modify: `tools/*photo-pickup*`

- [ ] **Step 1: 微信小程序验收**
  - 在开发者工具或真机上确认 `request/uploadFile/downloadFile` 合法域名都指向 `https://api.evanshine.me`。
  - 确认手机号 + 取片码登录、相册列表、图片预览、保存图片能跑通。
- [ ] **Step 2: 抖音小程序验收**
  - 在抖音开发者工具或真机上确认合法域名、AppID、预览和保存流程。
  - 保留 `DOUYIN_LIFE` 与 `DOUYIN_MINI_APP` 的边界，不混用。
- [ ] **Step 3: 真实 OSS 取片验收**
  - 用真实图片验证预览 / 下载 / 保存路径。
  - 证明裸 OSS 403，只有后端签名或代理可以访问。
- [ ] **Step 4: 真实订单同步验收**
  - 真实抖音来客订单、支付回调、核销 logid、发券 logid 都要有证据。
  - 订单同步进自建库后，工作台和导出页能看见。
- [ ] **Step 5: 把 BLOCKED 变成 PASS**
  - 只有在以上证据齐全后，才能更新 `docs/evidence/yingyue-delivery-status.json`。

### Task 7: 文档地图和国产模型交接

**Files:**
- Modify: `docs/00-authoritative-friend-project-takeover-20260609.md`
- Modify: `docs/evidence/yingyue-delivery-status.json`
- Modify: `docs/superpowers/plans/2026-06-13-studio-reference-system-implementation.md`
- Modify: `docs/superpowers/plans/2026-06-14-studio-p0-correctness-refactor.md`
- Create: `docs/superpowers/plans/2026-06-14-yingyue-complete-delivery-plan.md`（本文件）

- [ ] **Step 1: 更新权威入口和状态文件**
  - 把当前完成项、剩余项、平台阻塞点写清楚。
  - 只保留一个权威来源，不让旧图互相打架。
- [ ] **Step 2: 给国产模型准备接手说明**
  - 说明主仓、主页面、主 API、必须保留的边界、不能乱改的地方。
  - 说明哪些页面已经可用，哪些页只能做真实空态。
- [ ] **Step 3: 更新最终验收清单**
  - 把浏览器验证、`npm test`、`npm run build`、miniapp 验收、OSS 验收写成统一表。
- [ ] **Step 4: 交接前再跑一次全量回归**
  - 前端：`npm test`、`npm run build`
  - 平台：`tools` 下的验证脚本
  - 浏览器：`/orders`、`/service/photos`、`/service/selection`、`/settings/*`

---

## 完成标准

- 订单、客片、选片、员工、权限、日志、渠道这 7 个高频页都能直接用。
- 商品、会员、营销、报表、协作页不再出现假数据和假完成态。
- 微信 / 抖音小程序、OSS、真实订单同步都留下可复查证据。
- `docs/evidence/yingyue-delivery-status.json` 从 `BLOCKED` 变成 `PASS`。
- `npm test` 和 `npm run build` 持续通过。
