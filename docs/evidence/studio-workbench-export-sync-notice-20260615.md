# Studio Workbench 订单导出前同步提示证据

日期：2026-06-15

## 结论

本切片继续收口 T01 订单导出边界：订单页现在在导出按钮区域明确提示导出范围和同步前置事实，避免店员把本地未同步的 `yy_order` 当成完整对账数据。

已保持的边界：

- 不新增前端假同步按钮。
- 不强制导出前自动调用后端同步，避免页面刷新或导出动作造成宽窗口查单。
- Demo 模式继续禁用导出，只展示真实对账前置条件。
- API 模式导出仍走 `/yy/order/export`，只导出本地 `yy_order` 已同步订单。

## 改动范围

- `studio-workbench/src/features/orders/orderOperations.ts`
  - 新增 `getOrderExportSyncNotice(...)`。
  - 抖音来客来源提示：`导出范围：本地 yy_order 已同步订单。抖音来客对账前，先同步近24小时或指定时间窗口。`
  - 其他来源提示：`导出范围：本地 yy_order 已同步订单；跨渠道对账前请确认对应渠道已完成同步。`
  - Demo 模式提示连接 API 并先同步抖音来客订单。

- `studio-workbench/src/features/orders/OrdersView.vue`
  - 订单页顶部新增 `导出范围` 提示行。
  - 导出 query 和同步提示复用同一个 `orderExportSourceLabel`，避免来源口径不一致。

- `studio-workbench/src/features/orders/orderOperations.test.ts`
  - 覆盖抖音来客、其他渠道、Demo 三种提示口径。

- `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
  - 锁定页面接入 `getOrderExportSyncNotice`、`orderExportSyncNotice` 和 `导出范围` 文案。

## 验证

### RED

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- orderOperations.test.ts OrdersView.contract.test.ts
```

结果：

```text
Test Files 2 failed | 2 passed (4)
Tests 2 failed | 43 passed (45)
getOrderExportSyncNotice is not a function
OrdersView 不包含 getOrderExportSyncNotice
```

### GREEN

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- orderOperations.test.ts OrdersView.contract.test.ts
```

结果：

```text
Test Files 4 passed (4)
Tests 45 passed (45)
```

### 浏览器 smoke

目标：

```text
http://localhost:5190/order/appointment?quick=all
```

结果：

```json
{
  "mode": "demo",
  "hasExportScope": true,
  "hasSyncNotice": true,
  "exportScope": [
    {
      "text": "导出范围Demo 模式仅预览样例；真实对账请连接 API，并先同步抖音来客订单。",
      "title": "本地 yy_order 已同步订单"
    }
  ],
  "buttonSummary": [
    {
      "disabled": true,
      "text": "Demo 模式不可导出",
      "title": "Demo 模式不可导出，请连接 API 后使用真实 yy_order 导出"
    }
  ],
  "consoleErrors": []
}
```

## 剩余风险

- T01 尚未完成：仍需生产 API 模式真实下载 smoke、后端导出 query 精准化。
- 手动同步入口目前仍在系统后台和抖音来客联调页，`studio-workbench` 暂不新增同步动作，避免误触宽窗口查单。
