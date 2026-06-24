> owner: domestic-model-task-DM-API-002-report-snapshot-adapter
> canonical_for: 国产模型接入报表快照 API 到 studio-workbench 的单任务边界
> upstream: docs/contracts/studio-workbench-api-contract-20260615.md, docs/api/studio-workbench-openapi-skeleton-20260615.yaml
> downstream: studio-workbench/src/features/reports/DerivedReportModuleView.vue

# DM-API-002：报表快照 API 接入

## 目标

把已有后端 `GET /yy/reportSnapshot/list` 接入 `studio-workbench` 报表页。没有快照时保持真实空态或继续标明派生来源；有快照时展示真实快照。

## 允许修改

```text
studio-workbench/src/shared/api/backendTypes.ts
studio-workbench/src/shared/api/backend.ts
studio-workbench/src/features/reports/derivedReportModules.ts
studio-workbench/src/features/reports/derivedReportModules.test.ts
studio-workbench/src/features/reports/DerivedReportModuleView.vue
studio-workbench/src/features/reports/DerivedReportModuleView.contract.test.ts
docs/studio-workbench-api-route-map.md
docs/studio-workbench-feature-code-map-20260615.md
```

## 禁止

- 不伪造收入、退款、评分、渠道金额。
- 不把订单列表当完整月报快照。
- 不修改后端快照生成逻辑。
- 不把 `BLOCKED` 或平台验收状态改成 PASS。

## 实施步骤

1. 在 `backendTypes.ts` 增加 `ReportSnapshot` 和查询参数类型。
2. 在 `backend.ts` 增加 `listReportSnapshots(query)`，调用 `/yy/reportSnapshot/list`。
3. 在 `derivedReportModules.ts` 增加“快照优先、派生兜底但标明来源”的纯函数。
4. 页面展示快照更新时间、报表类型、门店、核心 JSON 摘要。
5. 测试锁定：没有快照时不展示假收入；有快照时显示真实来源。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- derivedReportModules
npm test -- DerivedReportModuleView
npm test -- backend
npm run build
```

## 交给国产模型时复制

```text
你只做 DM-API-002：报表快照 API 接入。
后端已有 GET /yy/reportSnapshot/list；你只接 studio-workbench adapter 和报表页真实快照/空态。
不伪造收入、退款、评价，不改后端生成逻辑，不部署。

先读：
docs/contracts/studio-workbench-api-contract-20260615.md
docs/api/studio-workbench-openapi-skeleton-20260615.yaml
docs/domestic-model-tasks/DM-API-002-report-snapshot-adapter.md

完成后运行任务单里的验证命令，按“结果 / 改动 / 验证 / 风险”回报。
```
