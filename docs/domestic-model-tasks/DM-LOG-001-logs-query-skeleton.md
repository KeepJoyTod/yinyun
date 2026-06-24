> owner: domestic-model-task-DM-LOG-001-logs-query-skeleton
> canonical_for: 国产模型增强系统日志页搜索和排障文本的单任务边界
> upstream: docs/studio-workbench-feature-code-map-20260615.md, C:\Users\Administrator\Desktop\yiyue\callback_map.md
> downstream: studio-workbench/src/features/settings/LogsView.vue

# DM-LOG-001：日志搜索和排障文本增强

## 目标

让 `/settings/logs` 更容易按 `logid`、`requestId`、接口名和渠道类型定位问题，并复制给平台或后端排查。

## 允许修改

```text
studio-workbench/src/features/settings/LogsView.vue
studio-workbench/src/features/settings/LogsView.contract.test.ts
studio-workbench/src/features/settings/logsOperations.ts
studio-workbench/src/features/settings/logsOperations.test.ts
docs/studio-workbench-feature-code-map-20260615.md
```

## 禁止

- 不改 `DOUYIN_LIFE` SPI 响应形状。
- 不改后端日志字段语义。
- 不伪造 logid。
- 不把 `DOUYIN_MINI_APP` 支付混进 `/api/douyin/life/*`。
- 不读取或输出平台密钥。

## 实施要点

1. 在 `logsOperations.ts` 增强纯函数：关键词匹配 `logid/requestId/apiName/channelType/status/error`。
2. 复制排障文本包含：时间、渠道、接口名、状态、requestId/logid、错误摘要。
3. 页面只负责输入、展示和复制，不把匹配规则写回 Vue 大文件。
4. 如果后端暂不支持对应 query 参数，前端只能本地过滤已加载日志，并在文案里说明“当前列表范围内搜索”。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- logsOperations
npm test -- LogsView
npm test
npm run build
```

验收标准：

- 输入真实 `logid` 或 `requestId` 可在当前列表内命中。
- 复制文本不含 secret/token。
- DOUYIN_LIFE 和 DOUYIN_MINI_APP 边界不混用。

## 交给国产模型时复制

```text
你只做 DM-LOG-001：日志页搜索和排障文本增强。
不改后端语义、不伪造 logid、不碰密钥、不部署。

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/studio-workbench-feature-code-map-20260615.md
docs/domestic-model-tasks/DM-LOG-001-logs-query-skeleton.md

完成后运行：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- logsOperations
npm test -- LogsView
npm test
npm run build

按“结果 / 改动 / 验证 / 风险”回报。
```
