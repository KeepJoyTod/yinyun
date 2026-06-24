> owner: domestic-model-tasks-index
> canonical_for: 国产模型单任务文件索引
> upstream: docs/domestic-model-implementation-pack-20260615.md
> downstream: future domestic model handoff runs

# 国产模型任务单索引

默认一次只派一个任务单给执行模型；如果要让国产模型“一口气跑一遍”，使用
`docs/domestic-model-batch-prompt-20260615.md`，并要求它按下表顺序执行、每完成一项就跑对应验证。

| 顺序 | 任务单 | 类型 | 当前状态 | 下一步 |
| --- | --- | --- | --- | --- |
| 1 | `DM-DOC-001-feature-map-refresh.md` | 文档和代码地图 | `READY` | 后续每轮改动都先更新地图 |
| 2 | `DM-UI-001-dashboard-polish.md` | 前端 UI | `CODEX_REVIEWED` | 国产模型只做小视觉微调 |
| 3 | `DM-UI-002-order-page-density-polish.md` | 前端 UI | `CODEX_REVIEWED` | 国产模型只补边缘文案/测试 |
| 4 | `DM-UI-003-photo-page-state-polish.md` | 前端 UI | `CODEX_REVIEWED` | 国产模型只补空态/错误态细节 |
| 5 | `DM-LOG-001-logs-query-skeleton.md` | 日志排障 | `CODEX_REVIEWED` | 国产模型可补 query 参数和复制文案 |
| 6 | `DM-SK-001-studio-acceptance-evidence-tool.md` | 验收脚本骨架扩展 | `READY_FOR_VERIFY` | 跑 `-ProbeHttp/-AsJson` 并补证据 |
| 7 | `DM-SK-002-photo-visit-log-ui-placeholder.md` | 未来 API UI 预留 | `SUPERSEDED_BY_REAL_API` | 已被 DM-API-001 真实加载替代 |
| 8 | `DM-RF-001-store-api-facade-split.md` | 稳健重构 | `FIRST_SLICE_DONE` | 已拆 `backendChannelInsights`，下一刀继续只读 slice |
| 9 | `DM-API-001-photo-access-log-adapter.md` | 接口接入 | `CODEX_DONE` | 已接 `appStore.loadPhotoAccessLogs()`，后续只做线上权限 smoke |
| 10 | `DM-API-002-report-snapshot-adapter.md` | 接口接入 | `CODEX_DONE` | 已接 `appStore.loadReportSnapshots()`，后续只做快照数据 smoke |
| 11 | `DM-API-003-backend-skeleton-contracts.md` | 后端接口骨架 | `WORK_ORDER_BACKEND_AND_FACADE_READY` | 国产模型不要重复做 workOrder；可继续 coupon/member/review 单域骨架，或只做 workOrder 权限/页面切线/smoke 文档 |
| 12 | `DM-API-004-payment-contract-docs-only.md` | 支付接口文档 | `DOC_READY` | 等支付能力和密钥配置后再实现 |

总规则见：

```text
docs/domestic-model-implementation-pack-20260615.md
docs/domestic-model-current-status-20260615.md
docs/domestic-model-batch-prompt-20260615.md
docs/contracts/studio-workbench-api-contract-20260615.md
docs/api/studio-workbench-openapi-skeleton-20260615.yaml
```
