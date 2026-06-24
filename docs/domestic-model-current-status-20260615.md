> owner: domestic-model-current-status-20260615
> canonical_for: 2026-06-15 国产模型接手前的项目现状、剩余比例、可派发范围和阻塞边界
> upstream: docs/domestic-model-implementation-pack-20260615.md, docs/domestic-model-tasks/README.md, docs/studio-workbench-feature-code-map-20260615.md
> downstream: docs/domestic-model-batch-prompt-20260615.md, C:\Users\Administrator\Desktop\yiyue\domestic-model-current-status-20260615.md

# 国产模型接手前项目现状

日期：2026-06-15

## 结论

项目已经进入“核心工作台真实接线基本完成，剩余以平台验收、生产部署和后续业务域真实化为主”的阶段。

## 2026-06-15 本轮交互收口

| 项 | 当前结论 |
| --- | --- |
| 首页路径口径 | `/` 是“经营概况/门店运营看板”，`/dashboard/today` 是“今日预约/门店排期”，两者不要混为一个页面 |
| 经营概况聚合入口 | 今日待拍、待上传、待选片、待交付、服务订单状态、产品排行、渠道汇总、库存冲突和快捷入口已改成真实深链 |
| 交付页承接 | `/service/photos?date=YYYY-MM-DD&needsUpload=1` 已按日期和缺底片承接；`/service/selection?date=YYYY-MM-DD&stage=...` 已按日期和业务阶段承接 |
| 排期页交互 | `/dashboard/today` 的排期卡片、预约入口、调整容量、工位点击已能跳真实订单/库存/工具页 |
| 运行时告警 | 订单详情抽屉 `StatusBadge` 组件缺 import 的 Vue 警告已修复；重新加载订单页无新增 warn/error |
| 小交互 | 首页快捷入口卡内“复制”按钮已阻止冒泡，不会误触发整卡跳转 |

| 范围 | 当前状态 | 估算完成度 | 说明 |
| --- | --- | ---: | --- |
| 门店工作台 `studio-workbench` | 核心页可用，UI/接口/日志已多轮收口 | 90% | 登录、首页、订单、排期、客片、选片、日志、渠道验收页已有测试和地图；首页/排期聚合入口已验证真实深链；预约订单状态分组已抽共享规则并被首页共用；客片访问日志和报表快照已接真实加载 |
| 工作台 API facade | 主 facade 可用，已拆第一刀并预接工单接口 | 85% | `backendChannelInsights.ts` 已拆出渠道验收/同步健康映射；`appStore` 已接 `loadPhotoAccessLogs()`、`loadReportSnapshots()`；`backendApi` 已接 `workOrder` 列表/详情/事件/流转 |
| 客片访问日志 | 后端已有，前端 adapter、Store 和页面已接 | 90% | `PhotoMgmtView.vue` 已有加载态、失败态、真实空态和脱敏摘要；剩余线上权限/API smoke |
| 报表快照 | 后端已有，前端 adapter、Store 和报表页已接 | 88% | `DerivedReportModuleView.vue` 优先读 `yy_report_snapshot`，无快照时回退派生来源说明 |
| 正式工单 | 后端 CRUD、状态流转、事件列表和前端 API facade 已生成，SQL 是 review-only | 76% | 还缺权限菜单、页面从派生切真接口、生产迁移和线上 smoke |
| 支付接口 | 契约和 OpenAPI 骨架已写 | 35% | 真实支付受平台能力、商户配置、密钥和验签约束，不交给国产模型独立完成 |
| 抖音来客闭环 | 代码能力多项已有，真实验收依赖平台 logid | 70% | `DOUYIN_LIFE` 不能和 `DOUYIN_MINI_APP` 混用 |
| 项目整体交付 | 代码侧约 84% - 87%，生产验收侧仍有阻塞 | 74% | 小程序真机、平台 logid、香港2部署证据决定最终 PASS |

## 已完成到可让国产模型继续填的骨架

| 骨架 | 已有内容 | 国产模型下一步 | Codex/负责人复查点 |
| --- | --- | --- | --- |
| UI 精修 | Dashboard、订单页、客片页、日志页测试和文案已收口 | 小范围修边缘态，不动账本语义 | 浏览器 `/login`、`/order/appointment`、`/service/photos` |
| 验收证据脚本 | `tools/new-studio-workbench-acceptance-evidence.ps1` 有 `-ProbeHttp/-AsJson` | 跑公开路由探针，补 evidence 文档 | 401/403/500 不能当通过 |
| 客片访问日志 | `PhotoAccessLog` 类型、`listPhotoAccessLogs()`、`appStore.loadPhotoAccessLogs()`、安全摘要函数、页面真实加载 | 只剩线上权限/API smoke | 不暴露手机号/IP/签名 URL，不造访问量 |
| 报表快照 | `ReportSnapshot` 类型、`listReportSnapshots()`、`appStore.loadReportSnapshots()`、`buildSnapshotAwareReportItems()`、页面快照优先展示 | 只剩真实快照数据 smoke 和后端定时生成任务 | 不伪造收入、退款、评分 |
| 工单后端/前端 facade | `YyWorkOrder*`、`YyWorkOrderEvent*`、transition/events、`backendApi.listWorkOrders()` 等、review-only SQL | 页面切真表前先补权限菜单和 smoke；国产模型不要重复生成后端或 facade | 不执行生产迁移，不新建订单账本 |
| 预约订单/首页/同步订单 | `buildOrderStatusGroupCounts()`、`matchesOrderStatusGroup()`、`syncDouyinLifeOrdersAndRefresh()`、`POST /yy/channel/DOUYIN_LIFE/orders/sync` | 不要重复实现状态分组；下一步只做 API smoke、浏览器验收和证据补齐 | 不绕过 `yy_order`，不直接从前端调抖音 OpenAPI |
| API 契约 | `docs/contracts/*` 和 OpenAPI 骨架 | 按 `SKELETON` 单域填 DTO/Controller/adapter | `EXTERNAL_BLOCKED` 不能标 PASS |

## 还差多少

按“能交给员工真实用 + 平台能验收 + 能部署回滚”口径：

| 类别 | 剩余占比 | 说明 |
| --- | ---: | --- |
| 国产模型可填代码/文档 | 8% - 12% | UI 边缘态、只读 API slice 拆分、单域 CRUD 骨架、任务地图 |
| Codex review 和工程收口 | 6% - 9% | 合并冲突、全量测试、构建、代码地图、部署包、证据文件 |
| 负责人/平台/服务器动作 | 12% - 18% | 密钥、生产迁移审批、香港2部署、小程序真机、抖音来客真实 logid |

项目总体还差约 21% - 26%。其中真正“写普通代码”的部分继续下降，主要风险在真实平台验收、生产环境和敏感能力。

## 可以交给国产模型的任务

优先派发：

1. `DM-SK-001`：跑验收证据工具并补 evidence。
2. `DM-RF-001` 下一刀：继续拆一个只读 API/helper slice。
3. `DM-API-003` 下一域：`coupon`、`member`、`customerReview` 三选一，只做 review-only 骨架。
4. `DM-DOC-001`：每轮后更新地图。

低优先级派发：

- UI 微调：只允许按现有视觉规范修小问题。
- 日志复制文本：只增强排障，不改变 logid 来源。
- OpenAPI 文档补字段：只补 `SKELETON`，不写真实支付逻辑。

## 不交给国产模型独立做的任务

| 任务 | 原因 |
| --- | --- |
| 香港2部署、nginx/Caddy、服务器路径替换 | 生产风险高，需要凭据和回滚 |
| `.env.local`、APPID、APPSecret、OSS key、服务器密码 | 严禁模型读取或输出 |
| 真实支付、退款、核销、发券 | 不能伪造成功，且涉及平台签名和资金 |
| 执行生产数据库迁移 | 需要 DBA/负责人确认 |
| 抖音来客最终验收 PASS | 必须用真实 `X-Bytedance-Logid` 或 OpenAPI `extra.logid` |
| OSS 权限策略 | 客户隐私边界，不能改 public-read |

## 推荐下一轮顺序

```text
1. Codex 继续按功能地图补 P0/P1 剩余真实能力
2. 需要分派时只把 `DM-RF-001`、`DM-API-003`、`DM-DOC-001` 等低风险任务交给国产模型
3. Codex review diff、跑 npm test/build、跑后端 targeted tests
4. 负责人确认是否提交 GitHub
5. 有明确授权后再部署香港2
6. 部署后写 docs/evidence/*
```

## 验证底线

每轮收口至少跑：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-studio-api-contracts.ps1
git diff --check

cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
npm run build
```

后端骨架改动还要跑：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest,YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```
