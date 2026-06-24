# Studio Workbench 订单导出查询精度证据

日期：2026-06-15

## 结论

本切片继续收口 T01 订单导出查询精度：前端导出参数现在会把后端 `/yy/order/export` 已能等价表达的 `keyword` 和 `bookingMethod` 传给 RuoYi 导出接口，减少“页面看见的是筛选后订单，导出却扩大范围”的风险。

已保持的边界：

- 导出仍只走 `/yy/order/export`，数据源仍是本地统一主账本 `yy_order`。
- `keyword` 只匹配后端已支持的订单号、客户姓名、手机号、外部订单号。
- 预约方式只放开后端枚举可精确表达的 `人工预约/H5预约/小程序/App/渠道同步`。
- 服务产品、金额区间、多状态仍继续拦截，避免导出范围被静默扩大。
- 不修改后端 SQL，不新增假同步、假支付、假核销、假优惠券数据。

## 改动范围

- `studio-workbench/src/features/orders/orderOperations.ts`
  - `buildOrderExportQuery(...)` 新增 `keyword` 和 `bookingMethod`。
  - `getUnsupportedOrderExportFilters(...)` 不再把关键词标为不可导出。
  - 预约方式仅在标签可映射为后端枚举时放行；`在线预约` 这类非后端枚举标签仍标为不可导出。

- `studio-workbench/src/shared/api/backendTypes.ts`
  - `OrderListQuery` / `OrderExportQuery` 增加 `keyword`、`bookingMethod`。

- `studio-workbench/src/shared/api/backend.ts`
  - `mapOrderListQuery(...)` 和 `mapOrderExportQuery(...)` 转发 `keyword`、`bookingMethod`。

- `studio-workbench/src/features/orders/orderOperations.test.ts`
  - 覆盖关键词进入导出 query。
  - 覆盖 `渠道同步 -> CHANNEL`、`人工预约 -> MANUAL`。
  - 覆盖关键词和精确预约方式不再触发不可导出拦截。

- `studio-workbench/src/shared/api/backend.contract.test.ts`
  - 锁定 API 类型和请求映射层必须保留 `keyword`、`bookingMethod`。

## 后端等价性依据

后端 `YyOrderServiceImpl.buildQueryWrapper(...)` 已支持：

- `keyword`：like `orderNo/customerName/customerPhone/externalOrderId`
- `bookingMethod`：eq `yy_order.booking_method`

本切片未放开的字段：

- 服务产品：前端标签到 `serviceGroupId` 的反查可能不唯一，暂不放行。
- 金额区间：后端当前未提供 `amountMin/amountMax` 等价查询。
- 多状态：后端当前只接单个 `status`，不扩成前端多选。

## 验证

### RED

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- orderOperations.test.ts backend.contract.test.ts
```

结果：

```text
Test Files 2 failed (2)
Tests 3 failed | 24 passed (27)
失败点：导出 query 缺 keyword/bookingMethod；关键词仍被标为不可导出；API 类型缺 keyword/bookingMethod。
```

### GREEN

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- orderOperations.test.ts backend.contract.test.ts
```

结果：

```text
Test Files 2 passed (2)
Tests 27 passed (27)
```

### 全量测试

命令：

```powershell
npm test
```

结果：

```text
Test Files 66 passed (66)
Tests 356 passed (356)
```

### 构建

命令：

```powershell
npm run build
```

结果：

```text
2828 modules transformed
✓ built in 2.65s
```

### 空白检查

命令：

```powershell
git diff --check
```

结果：

```text
exit 0
仅有 LF/CRLF 工作区提示，无 whitespace error
```

### 本地浏览器 smoke

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
  "exportButtons": [
    {
      "disabled": true,
      "text": "Demo 模式不可导出"
    }
  ],
  "consoleErrors": []
}
```

## 剩余风险

- API 模式真实下载 smoke 仍需在生产/登录态下验证下载文件。
- 服务产品导出要等前端标签能稳定映射到唯一 `serviceGroupId` 后再放开。
- 金额区间、多状态需要后端查询能力明确支持后才能解除拦截。
