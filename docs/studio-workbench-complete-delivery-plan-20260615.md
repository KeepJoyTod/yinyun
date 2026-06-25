> owner: studio-workbench-complete-delivery-plan-20260615
> canonical_for: 门店工作台优先的完整优化、预实现、验收和交付执行计划
> upstream: docs/00-authoritative-friend-project-takeover-20260609.md, docs/handoff-current-status-20260612.md, docs/studio-workbench-route-implementation-status.md, docs/studio-workbench-api-route-map.md, studio-workbench/src/app/router/featureRegistry.ts
> downstream: docs/studio-workbench-feature-code-map-20260615.md, docs/studio-workbench-optimization-map-20260615.md, docs/studio-workbench-preimplementation-solutions-20260615.md, docs/studio-workbench-acceptance-checklist-20260615.md

# 影约云门店工作台完整优化与交付计划

日期：2026-06-15

## 结论

本轮以 `studio-workbench` 为主线，把网页工作台做成门店员工每天能用的生产入口。仓库 `docs/` 是权威源，桌面目录只做镜像交接。

权威工程目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

桌面镜像目录：

```text
docs\yiyue\studio-workbench-complete-delivery-20260615
```

技术栈不更换：`Vue 3 + TypeScript + Vite + Tailwind + Vitest` 前端，`Spring Boot + RuoYi-Vue-Plus + PostgreSQL + Redis + Aliyun OSS` 后端，`mobile-uniapp` 继续承接 H5/微信/抖音小程序。`yy_order` 继续作为唯一订单/预约主账本。

## 当前事实

| 项 | 当前状态 |
| --- | --- |
| 工作台包 | `studio-workbench` |
| 本地开发端口 | `127.0.0.1:5190` |
| 线上域名 | `https://studio.evanshine.me` |
| 功能注册源 | `studio-workbench/src/app/router/featureRegistry.ts` |
| 已注册功能 | 55 个 |
| 源码规模 | `studio-workbench/src` 共 191 个文件，48 个 Vue 文件，70 个测试文件 |
| 菜单状态 | 全量路由已注册，核心页 READY，部分平台页 PARTIAL，派生页 DERIVED |
| 最新部署证据 | `docs/evidence/studio-workbench-photo-mutation-refresh-deploy-20260615.md` |
| 总交付状态 | `docs/evidence/yingyue-delivery-status.json` 仍为 `BLOCKED`，阻塞来自小程序真机验收和抖音来客真实 logid |

## 工作边界

| 边界 | 决策 |
| --- | --- |
| 订单 | 不新建第二套预约/订单账本，所有预约、渠道订单、活动订单、售券线索都回到 `yy_order` |
| 派生页 | 能从现有账本真实派生就展示；没有正式表/API 时必须真实空态或写清接入方案 |
| 渠道 | `DOUYIN_LIFE` 和 `DOUYIN_MINI_APP` 分开，不把来客支付和小程序 `tt.pay` 混用 |
| OSS | 私有 OSS 不改 public-read，客户访问走后端鉴权签名或 stream |
| 登录 | 门店员工登录独立于客户取片登录；API 模式下后端失败不降级 demo |
| 角色 | 门店工作台展示门店权限和缺失项，全局 RuoYi 角色仍在系统后台维护 |
| 文档 | 仓库 `docs/` 是权威源，桌面 `yiyue` 只镜像无密钥文档 |

## Requirements Traceability Matrix

| ID | 需求 | 当前状态 | 相关代码/文档 | 现有测试 | 缺口 | 建议任务 |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-001 | 员工登录、工作台壳层、侧边导航逻辑符合门店工作台 | DONE | `StaffLoginView.vue`, `Sidebar.vue`, `Header.vue`, `router/index.ts` | `StaffLoginView.contract.test.ts`, `Sidebar.access.contract.test.ts`, `router.contract.test.ts` | 继续做视觉细节回归 | T07 |
| REQ-002 | 订单/预约日常处理闭环 | PARTIAL | `OrdersView.vue`, `orderOperations.ts`, `backend.ts` | `OrdersView.contract.test.ts`, `orderOperations.test.ts` | 渠道日志摘要、复制排障、改期库存预检、真实后端导出入口、导出筛选等价性拦截、导出前同步提示、导出 keyword/bookingMethod 精准映射已补；剩余 API 模式下载 smoke 和真实 API 改期校验 | T01 |
| REQ-003 | 今日排期和库存冲突可处理 | PARTIAL | `ScheduleView.vue`, `InventoryView.vue`, `backend.ts` | `ScheduleView.contract.test.ts`, `InventoryView.contract.test.ts`, `inventoryOperations.test.ts` | 改期入口已展示目标容量和冲突；库存服务组筛选已补；摄影师筛选等待排期/库存源提供明确摄影师字段，当前不做假映射 | T02 |
| REQ-004 | 客片上传、整理、取片入口闭环 | PARTIAL | `PhotoMgmtView.vue`, `photoMgmtOperations.ts`, `backend.ts`, `appStore.ts` | `PhotoMgmtView.contract.test.ts`, `photoMgmtOperations.test.ts`, `appStore.albumPhotos.test.ts` | 上传错误复制、批量选片状态持久化、删除/重命名后刷新一致性已补；剩余真实 OSS 浏览器验收和 API 模式真实相册写库 smoke | T03 |
| REQ-005 | 在线选片、客户已选导出、二维码入口可用 | PARTIAL | `OnlineSelectionView.vue`, `selectionExport.ts`, `ShareLinksView.vue` | `OnlineSelectionView.contract.test.ts`, `selectionExport.test.ts`, `shareLinkOperations.test.ts` | 访问统计目前多为派生，真实访问日志待后端接入 | T03, T12 |
| REQ-006 | 商品、服务组、库存配置可维护 | PARTIAL | `ProductConfigView.vue`, `ServiceGroupsView.vue`, `InventoryView.vue`, `DerivedProductModuleView.vue` | `ProductConfigView.contract.test.ts`, `derivedProductModules.test.ts` | 附加/团单/冲印仍从统一产品派生，正式细分字段需方案 | T04, T11 |
| REQ-007 | 抖音/美团渠道产品、核销和日志能排障 | PARTIAL | `DouyinProductsView.vue`, `ChannelVerificationView.vue`, `channelVerificationOperations.ts`, `LogsView.vue` | `DouyinProductsView.contract.test.ts`, `ChannelVerificationView.contract.test.ts`, `channelVerificationOperations.test.ts`, `LogsView.contract.test.ts` | 验收用例与最近 DOUYIN_LIFE 日志关联、复制排障包已补；真实核销动作和真实平台 logid 仍依赖平台业务触发 | T05, T13 |
| REQ-008 | 会员、营销、报表不伪造数据 | DONE | `DerivedMemberModuleView.vue`, `DerivedMarketingModuleView.vue`, `DerivedReportModuleView.vue` | 对应 `derived*Modules.test.ts` 与 contract tests | 可以继续替换为真表/API，但当前边界明确 | T06, T11 |
| REQ-009 | 协作/工单有可用的派生流程 | PARTIAL | `WorkExecutionOverviewView.vue`, `WorkOrdersView.vue`, `workExecution.ts`, `workOrders.ts`, `YyWorkOrder*`, `backendApi.listWorkOrders()` | `workExecution.test.ts`, `workOrders.test.ts`, `workOrderStats.test.ts`, `backend.contract.test.ts`, `YyWorkOrderServiceImplTest` | 正式 `yy_work_order` / `yy_work_order_event` 后端骨架和前端 API facade 已补；页面仍需从派生切真接口，生产迁移/权限菜单未执行 | T08, T11 |
| REQ-010 | 小程序、OSS、抖音来客真实验收有证据 | PARTIAL | `mobile-uniapp`, `tools/*photo-pickup*`, `docs/evidence/*` | 现有 smoke 和构建证据 | 微信/抖音开发者工具或真机验收，抖音来客真实 logid | T13 |
| REQ-011 | 代码地图、优化地图、预实现方案和验收清单可交接 | DONE | 本文档包 | `git diff --check`、文档安全检索 | 需要随实现继续更新 | T14 |

## 执行阶段

### P0：门店每天要用的主链路

| 任务 | 范围 | 文件入口 | 完成标准 | 验证 |
| --- | --- | --- | --- | --- |
| T01 订单处理最终收口 | 今日待处理、详情抽屉、状态流转、改期、渠道摘要、导出边界 | `OrdersView.vue`, `orderOperations.ts`, `backend.ts` | 店员能按今日、门店、渠道、状态处理订单；失败原因可复制；Demo 不展示假导出；API 模式走 `/yy/order/export`；无法等价表达的前端筛选不能扩大导出范围；导出前明确本地同步边界 | `npm test -- OrdersView orderOperations backend`; 浏览器 `/order/appointment`。2026-06-15 已完成订单渠道同步摘要、复制排障、改期库存预检、真实后端导出入口、导出筛选等价性拦截、导出前同步提示、导出 keyword/bookingMethod 精准映射，证据见 `docs/evidence/studio-workbench-order-channel-diagnostics-20260615.md`、`docs/evidence/studio-workbench-reschedule-inventory-precheck-20260615.md`、`docs/evidence/studio-workbench-order-export-boundary-20260615.md`、`docs/evidence/studio-workbench-export-filter-parity-20260615.md`、`docs/evidence/studio-workbench-export-sync-notice-20260615.md`、`docs/evidence/studio-workbench-export-query-precision-20260615.md` |
| T02 排期和库存收口 | 今日排期、服务组、库存冲突、改期入口联动 | `ScheduleView.vue`, `InventoryView.vue`, `backend.ts` | 冲突和容量来自真实库存；改期入口不绕过订单状态；库存页按服务组精确筛选并透传 `serviceGroupId` | `npm test -- ScheduleView inventoryOperations InventoryView backend`; 浏览器 `/dashboard/today`, `/merchant/inventory`。2026-06-15 已完成库存服务组筛选并部署，证据见 `docs/evidence/studio-workbench-inventory-service-group-filter-20260615.md`、`docs/evidence/studio-workbench-inventory-service-group-filter-deploy-20260615.md` |
| T03 客片/选片闭环 | 上传、底片整理、缩略图状态、客户已选导出、取片入口 | `PhotoMgmtView.vue`, `OnlineSelectionView.vue`, `ShareLinksView.vue` | OSS 上传错误可定位；批量选片写回 `yy_photo_asset.is_selected`；删除/重命名后重载后端权威相册；已选 CSV 只含真实已选；二维码参数带 `storeId` | `npm test -- PhotoMgmtView photoMgmtOperations OnlineSelectionView shareLinkOperations backend appStore`; 浏览器 `/service/photos`, `/service/selection`。2026-06-15 已完成客片批量选片持久化并部署，删除/重命名刷新一致性已补并部署，证据见 `docs/evidence/studio-workbench-photo-batch-selection-persistence-20260615.md`、`docs/evidence/studio-workbench-photo-batch-selection-persistence-deploy-20260615.md`、`docs/evidence/studio-workbench-photo-mutation-refresh-20260615.md`、`docs/evidence/studio-workbench-photo-mutation-refresh-deploy-20260615.md` |
| T04 商品/服务配置闭环 | 服务产品、服务组、时段库存、渠道商品映射只读 | `ProductConfigView.vue`, `ServiceGroupsView.vue`, `DouyinProductsView.vue` | 可维护现有产品和服务组；渠道映射缺字段可复制 | `npm test -- ProductConfigView DouyinProductsView`; 浏览器 `/product/service`, `/product/douyin` |
| T05 日志/渠道排障闭环 | 操作日志、渠道同步日志、logid、requestId、同步健康 | `LogsView.vue`, `logsOperations.ts`, `ChannelVerificationView.vue`, `channelVerificationOperations.ts`, `ChannelsView.vue` | 平台排障所需 ID 可搜索、复制、关联到验收用例；验收详情可复制排障包 | `npm test -- channelVerificationOperations.test.ts ChannelVerificationView.contract.test.ts LogsView.contract.test.ts logsOperations.test.ts`; 浏览器 `/settings/logs`, `/order/verification`。2026-06-15 已完成验收用例与最近渠道日志关联，证据见 `docs/evidence/studio-workbench-channel-verification-log-relations-20260615.md` |

### P1：业务域补全和稳健重构

| 任务 | 范围 | 文件入口 | 完成标准 | 验证 |
| --- | --- | --- | --- | --- |
| T06 会员/营销/报表真实化 | 保持派生页真实，逐步接真表/API | `DerivedMemberModuleView.vue`, `DerivedMarketingModuleView.vue`, `DerivedReportModuleView.vue` | 不伪造余额、券、评分、收入；有接口时替换派生 | `npm test -- derivedMember derivedMarketing derivedReport` |
| T07 UI 规范与响应式 | 登录在侧边、侧栏层级、按钮/表格/空态统一 | `style.css`, `StaffLoginView.vue`, `Sidebar.vue`, `StateView.vue` | 桌面和移动无横向溢出，文案不重叠，操作位置符合业务逻辑 | Browser 截图 `/login`, `/`, `/settings/workbench` |
| T08 协作工单预实现 | 当前派生工单保留，后端预留 `yy_work_order` / `yy_work_order_event` 接入点，前端 facade 已预接 | `workExecution.ts`, `workOrders.ts`, `WorkOrdersView.vue`, `YyWorkOrder*`, `backend.ts`, `backendTypes.ts` | 页面能用；后端骨架支持 CRUD、状态流转和事件查询；前端可调用正式接口；未来真表接入不改路由和大交互 | `npm test -- backend.contract workExecution workOrders workOrderStats`; `mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyWorkOrderServiceImplTest" ... test` |
| T09 Store/API 继续拆分 | `appStore.ts` 和 `backend.ts` 按业务域拆分 | `shared/stores/*`, `shared/api/*` | 单文件复杂度下降，外部导入兼容，测试不降级 | `npm test`; `npm run build` |
| T10 权限矩阵固化 | feature registry、权限、状态、菜单一致 | `featureRegistry.ts`, `studioAccessStore.ts`, `RolesView.vue` | 新增菜单必须有权限、状态、路由、测试 | `npm test -- featureRegistry studioAccessStore RolesView` |

### P2：平台验收和生产发布

| 任务 | 范围 | 文件入口 | 完成标准 | 验证 |
| --- | --- | --- | --- | --- |
| T11 缺失后端能力预实现 | 工单、优惠券、评价、报表快照、访问日志 | `docs/studio-workbench-preimplementation-solutions-20260615.md` | 每个缺口有表、API、前端接入和验收方案 | 文档审查 |
| T12 小程序取片验收 | 微信/抖音小程序导入、登录、列表、预览、保存 | `mobile-uniapp`, `tools/new-miniapp-acceptance-package.ps1` | 开发者工具或真机通过，证据写入 `docs/evidence` | 小程序人工验收 |
| T13 抖音来客真实验收 | 发券 SPI、创单/支付回调、接单、核销 logid | 后端渠道模块、`docs/evidence/douyin-life-*` | 四类真实 logid 可复查，工作台可查到同步状态 | 平台后台 + 工作台日志 |
| T14 部署与交接 | GitHub 提交、香港2服务器部署、证据归档 | `docs/evidence/*`, `dist` | 静态资源上线，核心路由 200，回滚路径明确 | `npm test`, `npm run build`, curl/browser smoke |

## 技术栈和重构原则

| 层 | 当前技术 | 后续原则 |
| --- | --- | --- |
| 工作台前端 | Vue 3, TypeScript, Vite, Vue Router, Tailwind, Vitest | 以 `featureRegistry.ts` 为菜单/路由唯一源；按业务域拆 store/API，不改栈 |
| 后端 | Spring Boot, RuoYi-Vue-Plus, PostgreSQL, Redis | 新能力优先映射现有 `yy_*` 表；确需新增表必须写迁移和验收脚本 |
| 客户端 | uni-app H5/微信/抖音 | 取片、预约、小程序支付仍在 `mobile-uniapp`，不塞进工作台 |
| 文件 | Aliyun OSS 私有桶 | 不公开桶；员工上传后创建 `yy_photo_asset`，客户通过鉴权访问 |
| 测试 | Vitest, PowerShell smoke, 手工平台验收 | 每个功能任务带单元/契约测试；平台能力保留人工证据 |

## 完成标准

1. `studio-workbench` 核心页面：登录、首页、订单、排期、库存、客片、选片、商品、员工、权限、日志、渠道配置均可用。
2. 派生页明确边界：会员、营销、报表、协作、资源不出现假余额、假券、假评分、假收入、假核销。
3. 代码地图和优化地图能让后续 agent 按自然语言定位文件。
4. 预实现方案覆盖缺失后端能力，并给出表、API、前端入口和验收方式。
5. 验收清单覆盖本地测试、浏览器 smoke、小程序真机/开发者工具、抖音来客 logid、香港2部署。
6. `docs/evidence/yingyue-delivery-status.json` 只有在小程序和抖音来客真实证据齐全后才能从 `BLOCKED` 改为 `PASS`。
