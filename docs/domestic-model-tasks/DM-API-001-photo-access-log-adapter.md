> owner: domestic-model-task-DM-API-001-photo-access-log-adapter
> canonical_for: 国产模型接入客片访问日志 API 到 studio-workbench 的单任务边界
> upstream: docs/contracts/studio-workbench-api-contract-20260615.md, docs/api/studio-workbench-openapi-skeleton-20260615.yaml
> downstream: studio-workbench/src/features/albums/PhotoMgmtView.vue

# DM-API-001：客片访问日志 API 接入

## 目标

把已有后端 `GET /yy/photoAccessLog/list` 接入 `studio-workbench` 客片页。没有访问日志时展示真实空态；有日志时展示真实列表和摘要。

## 允许修改

```text
studio-workbench/src/shared/api/backendTypes.ts
studio-workbench/src/shared/api/backend.ts
studio-workbench/src/features/albums/photoMgmtOperations.ts
studio-workbench/src/features/albums/photoMgmtOperations.test.ts
studio-workbench/src/features/albums/PhotoMgmtView.vue
studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts
docs/studio-workbench-api-route-map.md
docs/studio-workbench-feature-code-map-20260615.md
```

## 禁止

- 不伪造访问量、下载量、客户已看、IP。
- 不暴露客户完整手机号、token、签名 URL。
- 不改客户鉴权逻辑。
- 不新增后端表。

## 实施步骤

1. 在 `backendTypes.ts` 增加 `PhotoAccessLog` 和查询参数类型，所有 ID 用 `string`。
2. 在 `backend.ts` 增加 `listPhotoAccessLogs(query)`，调用 `/yy/photoAccessLog/list`。
3. 在 `photoMgmtOperations.ts` 增加访问日志归一化和空态文案纯函数。
4. 在 `PhotoMgmtView.vue` 的相册详情区展示访问日志入口、加载态、空态、失败态。
5. 补测试：空数组不显示假次数；真实 rows 显示 action/time/status。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- photoMgmtOperations
npm test -- PhotoMgmtView
npm test -- backend
npm run build
```

## 交给国产模型时复制

```text
你只做 DM-API-001：客片访问日志 API 接入。
后端已有 GET /yy/photoAccessLog/list；你只接 studio-workbench 前端 adapter 和页面真实空态/列表。
不伪造访问量，不暴露 token/签名 URL，不改后端表。

先读：
docs/contracts/studio-workbench-api-contract-20260615.md
docs/api/studio-workbench-openapi-skeleton-20260615.yaml
docs/domestic-model-tasks/DM-API-001-photo-access-log-adapter.md

完成后运行任务单里的验证命令，按“结果 / 改动 / 验证 / 风险”回报。
```
