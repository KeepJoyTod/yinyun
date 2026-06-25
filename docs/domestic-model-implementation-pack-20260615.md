> owner: domestic-model-implementation-pack-20260615
> canonical_for: 国产模型接手影约云剩余工程的任务分级、执行顺序、代码骨架和验收边界
> upstream: docs/studio-workbench-complete-delivery-plan-20260615.md, docs/studio-workbench-feature-code-map-20260615.md, docs/studio-workbench-optimization-map-20260615.md, docs/evidence/yingyue-delivery-status.json
> downstream: docs/domestic-model-tasks/*, tools/new-studio-workbench-acceptance-evidence.ps1, docs\yiyue\domestic-model-implementation-pack-20260615.md

# 国产模型接手实现包

日期：2026-06-15

## 结论

项目不是“代码没铺开”，而是“核心代码已铺开，最后生产验收和平台真实证据还没闭环”。

最新状态详见：

```text
docs/domestic-model-current-status-20260615.md
docs/domestic-model-batch-prompt-20260615.md
docs/domestic-model-tasks/README.md
```

按当前仓库事实估算：

| 范围 | 完成度 | 说明 |
| --- | --- | --- |
| `studio-workbench` 门店工作台前端 | 86% - 88% | 55 个功能已注册，核心页可用；访问日志/报表快照已接真实加载，剩余主要是 API 模式 smoke、少量 UI 边缘态 |
| 后端核心账本和抖音来客代码 | 70% - 75% | `yy_order`、客片账本、渠道日志、来客同步/核销入口已实现；真实平台能力和真实 logid 仍要验收 |
| 小程序取片链路 | 65% - 70% | 构建产物和基础链路已有；还缺微信/抖音开发者工具或真机最终 PASS |
| 项目整体生产交付 | 73% | `docs/evidence/yingyue-delivery-status.json` 仍为 `BLOCKED`，阻塞来自外部验收证据，不只是代码量 |

剩余工作里，约 8% - 12% 是可以交给国产模型填的代码和文档；另有约 12% - 18% 必须由 Codex/负责人/平台后台完成，包括生产部署、密钥、真实支付/核销、真机验收、抖音来客 logid。

## 交给国产模型的总原则

优先只给国产模型“一张任务单 + 指定文件范围 + 指定验证命令”。如果确实要一口气跑一遍，只复制 `docs/domestic-model-batch-prompt-20260615.md` 里的批量提示词。

固定规则：

- 只改任务单允许的文件。
- 不读取、打印、提交密钥、token、服务器密码、`.env.local`。
- 不提交 GitHub、不部署服务器，除非负责人明确授权。
- 不新增第二套订单、相册、会员、优惠券、工单、报表账本。
- 不把 19 位雪花 ID 转成 `number`。
- 不让 API 模式失败后 fallback demo。
- 不伪造支付、核销、优惠券、评价、收入、访问日志。
- 完成后必须按“结果 / 改动 / 验证 / 风险”回报。

## 可交付分级

### A 类：可以直接交给国产模型

这些任务失败风险低，主要靠页面、helper、测试和文档收口。

| 任务 | 文件 | 交付信号 |
| --- | --- | --- |
| Dashboard UI 精修 | `docs/domestic-model-tasks/DM-UI-001-dashboard-polish.md` | 首页层级、图标、卡片、提示条更稳定，测试和构建通过 |
| 订单页密度和状态精修 | `docs/domestic-model-tasks/DM-UI-002-order-page-density-polish.md` | 筛选区、详情抽屉、失败态更清楚，不改订单语义 |
| 客片页空态/错误态精修 | `docs/domestic-model-tasks/DM-UI-003-photo-page-state-polish.md` | 上传、缩略图、批量选择的反馈更清楚 |
| 日志搜索/复制文案增强 | `docs/domestic-model-tasks/DM-LOG-001-logs-query-skeleton.md` | logid/requestId 搜索和复制文本更容易排障 |
| 代码地图维护 | `docs/domestic-model-tasks/DM-DOC-001-feature-map-refresh.md` | 每次功能改动后更新自然语言代码地图 |

### B 类：可以让国产模型写骨架，Codex/负责人审查后合并

这些任务可以让对方搭结构、补类型、写测试，但不能直接碰生产语义。

| 任务 | 文件 | 交付信号 |
| --- | --- | --- |
| 工作台验收证据工具扩展 | `docs/domestic-model-tasks/DM-SK-001-studio-acceptance-evidence-tool.md`, `tools/new-studio-workbench-acceptance-evidence.ps1` | 在现有脚本骨架上补路由探针，不带密钥 |
| 客片访问日志 UI 预留 | `docs/domestic-model-tasks/DM-SK-002-photo-visit-log-ui-placeholder.md` | 页面只展示真实空态和未来 API 入口，不造访问量 |
| Store/API facade 拆分 | `docs/domestic-model-tasks/DM-RF-001-store-api-facade-split.md` | 先拆只读纯函数或 API slice，外部 facade 不变 |
| 客片访问日志 API 接入 | `docs/domestic-model-tasks/DM-API-001-photo-access-log-adapter.md` | 已接页面真实加载；后续只剩权限 smoke、细节体验和证据补齐 |
| 报表快照 API 接入 | `docs/domestic-model-tasks/DM-API-002-report-snapshot-adapter.md` | 已接页面/Store 真实加载；后续只剩快照 smoke、真实数据与证据补齐 |
| 后端业务接口骨架 | `docs/domestic-model-tasks/DM-API-003-backend-skeleton-contracts.md` | `workOrder` CRUD + transition + event list + 前端 API facade 已生成；下一步不要重复做 workOrder，只能转向 coupon/member/customerReview 单域骨架或工单页面切线评估 |
| 支付接口文档整理 | `docs/domestic-model-tasks/DM-API-004-payment-contract-docs-only.md` | 只整理契约，不实现真实支付 |

### C 类：不要交给国产模型独立处理

这些必须由 Codex/负责人/平台后台做，国产模型最多写只读文档或测试草稿。

| 禁区 | 原因 |
| --- | --- |
| 香港2服务器部署、nginx/Caddy、Docker、数据库迁移应用 | 生产风险和凭据风险高 |
| `.env.local`、APPID、APPSecret、OSS AccessKey、服务器密码 | 严禁泄露或被模型打印 |
| 抖音来客真实 SPI/OpenAPI/logid 验收 | 需要真实平台能力、真实订单、真实 logid |
| 支付、退款、核销、发券的真实行为 | 不能由模型猜接口或伪造成功 |
| 私有 OSS 策略和客户图片权限 | 隐私安全边界，不能改 public-read |
| 总交付状态从 `BLOCKED` 改为 `PASS` | 只能在小程序和抖音来客真实证据齐全后改 |

## 执行顺序

推荐按这个顺序派发，一次只派一个任务：

1. `DM-SK-001`：先跑/完善工作台验收证据工具。
2. `DM-RF-001`：继续拆一个只读 API/helper slice。
3. `DM-API-003`：按一个新业务域补后端接口骨架；`workOrder` 后端和前端 facade 不要重复做，只能继续做权限菜单、页面切真表方案或 smoke。
4. `DM-DOC-001`：每轮最后更新地图。
5. UI/日志任务只在发现具体边缘问题时小范围派发。
6. `DM-API-004`：支付接口只整理契约，等待平台能力和负责人确认。

每个任务交付后，Codex 需要做一次 review，再决定是否合并、提交和部署。

## 当前阻塞和剩余完成计划

| 阶段 | 剩余内容 | 谁做 | 完成标准 |
| --- | --- | --- | --- |
| P0 工作台收口 | UI 精修、API 模式 smoke、真实错误提示 | Codex + 国产模型补少量边缘项 | `npm test`、`npm run build`、浏览器 smoke 通过 |
| P1 业务真实化 | 会员、优惠券、评价、报表、工单从派生页逐步接真表/API | Codex 主导，国产模型可写类型和页面骨架 | 不伪造数据，表/API/验收方案齐全 |
| P2 小程序取片 | 微信/抖音小程序开发者工具或真机验收 | 负责人/平台后台 + Codex 记录证据 | `photo-pickup-release` 最终 PASS |
| P2 抖音来客验收 | 发券 SPI、创单/支付回调、接单、整单核销 logid | 负责人/平台后台 + Codex | `get-douyin-life-acceptance-status.ps1` 必要项 PASS |
| P3 部署交付 | GitHub、香港2部署、线上 smoke、回滚证据 | Codex/负责人 | 线上核心路由 200，证据落 `docs/evidence` |

## 国产模型回报格式

要求对方固定用下面格式：

```text
结果：完成了什么，入口在哪。
改动：列出文件和每个文件的核心变化。
验证：列出命令和通过/失败摘要，不要只写“已测试”。
风险：没接后端、没权限、需人工配置、未部署等情况。
```

## 通用派发提示词

```text
你只执行当前任务单，不做无关重构，不读取或打印任何密钥，不部署，不提交 GitHub。

工作目录：
D:\OtherProject\CameraApp\yingyue-cloud-repo

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/studio-workbench-feature-code-map-20260615.md
docs/studio-workbench-optimization-map-20260615.md
<本次任务单路径>

必须遵守：
- 不新增第二套业务账本
- 不伪造支付、核销、优惠券、评价、收入、访问日志
- 不把业务 ID 转 number
- 不让 API 模式失败后 fallback demo
- 只改任务单允许的文件

完成后执行任务单要求的验证命令，并按“结果 / 改动 / 验证 / 风险”回报。
```
