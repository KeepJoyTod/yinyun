> owner: studio-workbench-optimization-map-20260615
> canonical_for: 门店工作台优化路线、风险、优先级和重构边界
> upstream: docs/studio-workbench-complete-delivery-plan-20260615.md, docs/studio-workbench-feature-code-map-20260615.md
> downstream: docs/studio-workbench-acceptance-checklist-20260615.md

# 门店工作台优化地图

日期：2026-06-16

## 总目标

把 `studio.evanshine.me` 从“功能已经铺开”推进到“门店员工能稳定使用、平台能力有真实边界、后续 agent 能继续执行”的状态。

## 优先级总览

| 优先级 | 目标 | 当前判断 | 完成信号 |
| --- | --- | --- | --- |
| P0 | 订单、排期、客片、选片、日志可日常使用 | 大多 PARTIAL，需要最后收口 | 核心路由浏览器通过，失败可复制，写库不伪造 |
| P1 | 商品、会员、营销、报表、协作能真实派生或真实空态 | 大多 DERIVED/DONE | 派生页无假数据，接真接口有方案 |
| P2 | 缺失后端能力预实现和平台验收 | 受外部平台阻塞 | 小程序验收、真实 OSS、抖音来客 logid 证据齐全 |
| P3 | 稳健重构和交接 | 已做第一轮拆分 | 大文件继续分域，地图文档持续更新 |

## P0 优化清单

| 模块 | 现状 | 优化动作 | 涉及文件 | 验证 |
| --- | --- | --- | --- | --- |
| 登录页 | 已改为员工入口，API 模式校验 token | 保持右侧/侧边登录逻辑，移动端无溢出，错误态不遮挡 | `StaffLoginView.vue`, `style.css` | `npm test -- StaffLoginView`; 浏览器 `/login` |
| 侧边栏 | 菜单完整，按权限过滤 | 新增菜单必须有 group、permission、status、测试 | `featureRegistry.ts`, `Sidebar.vue` | `npm test -- featureRegistry Sidebar` |
| 首页经营概况 | 运营卡片、状态卡、排行、渠道汇总、库存冲突、快捷入口已能真实跳转；快捷入口复制不会误触发卡片跳转 | 继续收口 API 模式真实数据 smoke；不要把 `/` 和 `/dashboard/today` 混为同一页 | `DashboardView.vue`, `DashboardView.contract.test.ts` | `npm test -- DashboardView`; 浏览器 `/` 点击待上传/待交付 |
| 订单页 | 今日处理和状态流转可用；订单详情已补渠道同步日志摘要、复制排障、改期库存预检、`/yy/order/export` 真实导出入口、导出筛选等价性拦截、导出前同步提示、导出 keyword/bookingMethod 精准映射；简约网式状态分组已抽到 `buildOrderStatusGroupCounts()` / `matchesOrderStatusGroup()` 并被首页共用 | 继续收口 API 模式下载 smoke 和真实 API 改期校验；服务产品/金额区间/多状态等后端未等价支持筛选继续拦截；同步订单后的真实浏览器验收要补证据 | `OrdersView.vue`, `orderOperations.ts`, `DashboardView.vue`, `backend.ts` | `npm test -- OrdersView orderOperations DashboardView`; 浏览器 `/order/appointment`; 2026-06-16 选定 6 个测试文件 91 个用例通过，`npm run build` 通过；证据 `docs/evidence/studio-workbench-order-export-boundary-20260615.md`、`docs/evidence/studio-workbench-export-filter-parity-20260615.md`、`docs/evidence/studio-workbench-export-sync-notice-20260615.md`、`docs/evidence/studio-workbench-export-query-precision-20260615.md` |
| 排期/库存 | 今日排期和库存列表可用；排期卡片和工位点击已能跳订单/库存；改期前已展示目标容量和冲突；库存页已支持服务组筛选并透传 `serviceGroupId` | 继续收口真实 API 登录态库存查询 smoke；摄影师筛选需等排期/库存源提供明确摄影师字段后再做 | `ScheduleView.vue`, `scheduleOperations.ts`, `ReservationSlots.vue`, `InventoryView.vue`, `inventoryOperations.ts`, `backend.ts` | `npm test -- scheduleOperations ScheduleView ReservationSlots inventoryOperations InventoryView backend`; 浏览器 `/dashboard/today`, `/merchant/inventory`; 证据 `docs/evidence/studio-workbench-inventory-service-group-filter-20260615.md`、`docs/evidence/studio-workbench-inventory-service-group-filter-deploy-20260615.md` |
| 客片管理 | OSS 上传和底片创建已接；首页待上传能用 `date + needsUpload=1` 深链过滤；上传失败详情复制已接；批量标记已选/取消已写回 `yy_photo_asset.is_selected`；删除/重命名后重载权威相册；访问日志已通过 `appStore.loadPhotoAccessLogs()` 接真实 `/yy/photoAccessLog/list`，页面有加载态、失败态、真实空态和脱敏摘要 | 继续收口真实 OSS 浏览器验收、API 模式真实相册写库 smoke、线上访问日志权限 smoke | `PhotoMgmtView.vue`, `photoMgmtOperations.ts`, `backend.ts`, `appStore.ts` | `npm test -- PhotoMgmtView photoMgmtOperations backend appStore`; 浏览器 `/service/photos?date=YYYY-MM-DD&needsUpload=1`; 证据 `docs/evidence/studio-workbench-photo-batch-selection-persistence-20260615.md`、`docs/evidence/studio-workbench-photo-batch-selection-persistence-deploy-20260615.md`、`docs/evidence/studio-workbench-photo-mutation-refresh-20260615.md`、`docs/evidence/studio-workbench-photo-mutation-refresh-deploy-20260615.md` |
| 在线选片 | 链接和已选 CSV 可用；首页待选片/待交付能用 `date + stage` 深链过滤 | 访问数据接真表前保持派生边界，二维码入口关联门店 | `OnlineSelectionView.vue`, `selectionExport.ts` | `npm test -- OnlineSelectionView selectionExport`; 浏览器 `/service/selection?date=YYYY-MM-DD&stage=selecting` |
| 日志 | 操作日志和渠道同步日志可显示；日志归一化、筛选、统计和复制文本已抽到 `logsOperations.ts`；验收用例已通过 `channelVerificationOperations.ts` 关联最近 `DOUYIN_LIFE` 日志并支持复制排障包 | 后续接后端 query 参数、真实 API 模式生产登录态 smoke、平台真实 logid 复核 | `LogsView.vue`, `logsOperations.ts`, `ChannelVerificationView.vue`, `channelVerificationOperations.ts` | `npm test -- channelVerificationOperations.test.ts ChannelVerificationView.contract.test.ts LogsView.contract.test.ts logsOperations.test.ts`; 浏览器 `/order/verification`; 证据 `docs/evidence/studio-workbench-channel-verification-log-relations-20260615.md` |

## P1 业务页优化清单

| 模块 | 保留策略 | 后续优化 |
| --- | --- | --- |
| 附加/团单/冲印产品 | 当前从 `yy_product` 派生，不建第二账本 | 新增产品类型字段、规格字段、履约字段后替换派生规则 |
| 美团产品 | 当前从渠道映射读只读信息 | 平台授权完成后接商品同步、库存同步、核销日志 |
| 冲印/企业/售卡/售券/表单订单 | 当前从 `yy_order` 派生 | 对应正式业务表出现后只接关联表，不复制订单主账本 |
| 会员账户 | 当前只读客户等级、订单次数、消费额 | 积分/余额/卡项需要独立权益账本和审计流水 |
| 优惠券/活动 | 当前只读线索，不发券 | 券模板、券实例、发放、核销要有正式表和幂等流水 |
| 报表 | 已接 `/yy/reportSnapshot/list` 到 `appStore.reportSnapshots`，报表页优先展示真实 `yy_report_snapshot`，无快照时回退实时派生并标明来源 | 继续补真实快照生成任务、评价表/API 和财务流水边界 |
| 客户评价 | 当前无表/API 保持空态 | 接渠道评价 API 或本地评价表后再展示评分 |

## 稳健重构地图

| 目标 | 当前文件 | 建议拆分 | 保持不变 |
| --- | --- | --- | --- |
| Store 降复杂度 | `src/shared/stores/appStore.ts` | `orderStore.ts`, `albumStore.ts`, `customerStore.ts`, `settingsStore.ts` | 外部仍从 `appStore` 获取兼容 facade |
| API 降复杂度 | `src/shared/api/backend.ts`；已拆 `backendChannelInsights.ts` | 继续拆 `ordersApi.ts`, `albumsApi.ts`, `settingsApi.ts`, `channelsApi.ts`，一次只拆一个只读 slice | `backendApi` 继续 re-export，避免页面大改 |
| 派生逻辑收口 | `derived*Modules.ts` 已存在 | 保持纯函数化，新增业务先写测试 | 页面组件只负责交互和渲染 |
| 日志排障规则 | `LogsView.vue` 已拆出 `logsOperations.ts`；`ChannelVerificationView.vue` 已拆出 `channelVerificationOperations.ts` | 后续 logid 搜索、诊断文本、统计卡片先改 helper | 页面只保留加载、URL query、匹配展示和复制交互 |
| 路由权限一致 | `featureRegistry.ts` | 增加 registry validator 测试 | 菜单、路由、权限仍一个源 |
| UI 状态统一 | 各页面独立空态 | 复用 `StateView.vue`, `NoticeBanner.vue`, `SkeletonRows.vue` | 不引入新的 UI 框架 |

## 视觉和交互规范

| 项 | 规则 |
| --- | --- |
| 工作台气质 | 克制、密集、可扫读，不做营销站式 hero |
| 登录页 | 表单在侧边/右侧工作区，左侧展示门店工作范围或品牌，不放到底部 |
| 卡片 | 只用于重复项、工具和详情；不要把页面段落层层包卡 |
| 按钮 | 明确动作才用文字按钮；图标按钮要有 tooltip 或可理解文案 |
| 表格/列表 | 必须有加载态、空态、错误态；失败时能复制关键错误 |
| 数据 | 派生数据必须标明来源；未接接口不填假成功状态 |
| 响应式 | 390px 移动宽度和 929px/桌面宽度均无横向溢出 |

## 风险地图

| 风险 | 影响 | 防线 |
| --- | --- | --- |
| 派生页被误认为真业务闭环 | 错误决策、虚假交付 | 页面文案和 docs 均写清 `DERIVED`，无接口不展示假数据 |
| 订单多账本 | 对账混乱、渠道重复同步 | 所有订单入口回到 `yy_order`，关联表只存扩展事实 |
| 雪花 ID 精度丢失 | 写错记录或删除错记录 | `BackendId` 保持字符串，测试锁定 |
| Demo 数据误入生产判断 | 员工误判已写库 | API 模式失败不 fallback demo |
| OSS 暴露 | 客户隐私风险 | 裸 OSS 403，访问走后端鉴权 |
| 平台验收被口头通过 | 交付状态虚假 | 必须有 logid、截图、命令输出或证据文件 |

## 每轮优化执行顺序

1. 读 `featureRegistry.ts` 和本地图，确认目标路由。
2. 读对应页面、helper、store、backend API、测试。
3. 先补或调整纯函数/契约测试。
4. 做最小代码改动，不跨域重构。
5. 运行目标测试，再运行 `npm test`。
6. UI 相关改动必须浏览器验证目标路由和 `/login`。
7. 更新对应文档和证据。
8. 需要上线时再执行构建、提交、推送、部署和 smoke。
