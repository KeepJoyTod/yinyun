# Studio Workbench 订单导出筛选等价性证据

日期：2026-06-15

## 结论

本切片继续收口 T01 订单导出边界：当前前端存在关键词、服务产品、预约方式、金额区间、多状态等筛选时，后端 `/yy/order/export` 暂不能等价表达这些条件。为避免导出范围比页面筛选结果更宽，工作台现在直接禁用导出并提示 `筛选不可导出`。

已保持的边界：

- Demo 模式仍优先显示 `Demo 模式不可导出`，不提供假导出。
- API 模式只允许后端可等价表达的筛选导出。
- 不把关键词、服务、预约方式、金额、多状态硬塞进后端 query。
- `DOUYIN_LIFE` 对账仍以本地 `yy_order` 已同步订单为准。

## 改动范围

- `studio-workbench/src/features/orders/orderOperations.ts`
  - 新增 `getUnsupportedOrderExportFilters(...)`。
  - 标记无法等价导出的筛选：关键词、服务产品、预约方式、金额区间、多状态。

- `studio-workbench/src/features/orders/OrdersView.vue`
  - 导出按钮在不支持筛选存在时禁用。
  - 按钮文案显示 `筛选不可导出`。
  - title 显示具体阻塞筛选：`...暂不支持等价导出，请清除后再导出`。
  - 点击保护显示：`当前筛选暂不支持等价导出：...`。

- `studio-workbench/src/features/orders/orderOperations.test.ts`
  - 覆盖不支持筛选识别。
  - 覆盖只使用后端可表达筛选时允许导出。

- `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
  - 锁定页面接入 `getUnsupportedOrderExportFilters`。
  - 锁定 `筛选不可导出` 与 `暂不支持等价导出` 文案。

## 验证

### 浏览器 smoke

目标：

```text
http://localhost:5190/order/appointment?q=YY202606100001&quick=all
```

结果：

```json
{
  "mode": "demo",
  "url": "http://localhost:5190/order/appointment?q=YY202606100001&quick=all",
  "buttonSummary": [
    {
      "disabled": true,
      "text": "Demo 模式不可导出",
      "title": "Demo 模式不可导出，请连接 API 后使用真实 yy_order 导出"
    }
  ],
  "hasDemoExportText": true,
  "hasUnsupportedText": false,
  "consoleErrors": []
}
```

说明：本地默认 Demo 模式，Demo 禁用提示优先级高于筛选等价性提示；筛选等价性由单元测试和契约测试覆盖，生产 API 模式待部署后继续 smoke。

### 全量测试

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
```

结果：

```text
Test Files 66 passed (66)
Tests 355 passed (355)
```

### 生产构建

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run build
```

结果：

```text
vue-tsc -b && vite build
2828 modules transformed
✓ built in 3.71s
```

### 补丁检查

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git diff --check
```

结果：

```text
无 whitespace error；仅有 Windows 工作区 LF/CRLF 提示。
```

## 剩余风险

- T01 尚未完成：仍需生产 API 模式真实下载 smoke、导出前同步提示、后端导出 query 精准化。
- 如果后端后续支持关键词、服务、预约方式、金额、多状态导出，需要同步更新 `getUnsupportedOrderExportFilters(...)` 和测试。
