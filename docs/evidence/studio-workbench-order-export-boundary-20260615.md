# Studio Workbench 订单导出边界证据

日期：2026-06-15

## 结论

本切片把 `studio-workbench` 订单页导出从“未接入/占位”推进到真实后端入口：

- API 模式调用 `POST /yy/order/export`，复用 RuoYi Excel 导出。
- Demo 模式明确禁用导出，文案为 `Demo 模式不可导出`。
- 导出 query 只传当前后端可准确表达的筛选：门店、渠道、订单状态、支付状态、下单时间、到店时间、分页上限。
- 模糊搜索、多状态、金额、服务、预约方式等前端筛选暂不强行映射到导出 query，避免伪装能力。

## 改动范围

- `studio-workbench/src/shared/api/request.ts`
  - 新增 `apiRequestBlob` 和 `BlobResponse`。
  - 下载请求携带 `Authorization`、`clientid`。
  - 非 JSON 文件响应不走普通 JSON 解析。
  - JSON 错误响应会提取 `message/msg` 并抛错。
  - 从 `Content-Disposition` 读取下载文件名。

- `studio-workbench/src/shared/api/backend.ts`
  - 新增 `OrderExportQuery` 映射。
  - `backendApi.exportOrders(...)` 以 `application/x-www-form-urlencoded` 调用 `/yy/order/export`。

- `studio-workbench/src/shared/stores/appStore.ts`
  - Demo 模式导出直接抛出 `Demo 模式不可导出`。
  - API 模式转发到 `backendApi.exportOrders(...)`。

- `studio-workbench/src/features/orders/orderOperations.ts`
  - 新增 `buildOrderExportQuery(...)`。
  - `抖音来客` 映射为 `DOUYIN_LIFE`，不混成 `DOUYIN_MINI_APP`。
  - 时间范围按下单时间或到店时间写入对应 begin/end 字段。

- `studio-workbench/src/features/orders/OrdersView.vue`
  - 顶部导出按钮接真实导出动作。
  - Demo 模式显示 `Demo 模式不可导出` 并禁用。
  - API 模式按当前可表达筛选导出 Excel。

## 验证

### 浏览器 smoke

目标：

```text
http://localhost:5190/order/appointment?q=YY202606100001&quick=all
```

结果：

```json
{
  "storeMode": "demo",
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

### 全量测试

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
```

结果：

```text
Test Files 66 passed (66)
Tests 354 passed (354)
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
✓ built in 3.96s
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

## 后续

- T01 仍未等同于整个订单域完成：后续继续做导出前同步提示、后端 query 更细字段接入、真实 API 模式下载 smoke。
- `DOUYIN_LIFE` 对账前仍应先执行订单同步，导出只包含本地 `yy_order` 已同步订单。
