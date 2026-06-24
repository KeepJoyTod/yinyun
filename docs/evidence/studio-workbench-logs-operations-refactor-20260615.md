# 门店工作台日志排障规则重构证据

日期：2026-06-15

## 结果

已把 `/settings/logs` 的日志归一化、筛选、统计卡片和复制排障文本从 `LogsView.vue` 抽到纯规则 helper：

```text
studio-workbench/src/features/settings/logsOperations.ts
studio-workbench/src/features/settings/logsOperations.test.ts
```

页面仍保留原交互：操作日志 + 渠道同步日志、requestId/logid 搜索、处理人/手机号/内容筛选、失败日志复制排障信息、URL query 同步。

## 改动范围

| 文件 | 说明 |
| --- | --- |
| `studio-workbench/src/features/settings/logsOperations.ts` | 新增日志事件归一化、筛选、统计、诊断文本纯函数 |
| `studio-workbench/src/features/settings/logsOperations.test.ts` | 新增日志排障规则单测 |
| `studio-workbench/src/features/settings/LogsView.vue` | 页面改为调用 helper，减少内联业务逻辑 |
| `studio-workbench/src/features/settings/LogsView.contract.test.ts` | 契约测试更新到“页面接入 helper + helper 保留排障能力”边界 |

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- logsOperations.test.ts LogsView.contract.test.ts
```

结果：

```text
Test Files  2 passed (2)
Tests       13 passed (13)
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
```

结果：

```text
Test Files  65 passed (65)
Tests       344 passed (344)
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run build
```

结果：

```text
vue-tsc -b && vite build
built in 2.63s
```

备注：构建仍有已知 `@vueuse/core` Rolldown pure annotation warning，不阻塞构建。

