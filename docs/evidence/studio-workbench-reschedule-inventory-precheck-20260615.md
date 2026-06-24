# 门店工作台改期库存预检证据

日期：2026-06-15

## 结果

已完成 T01 的改期库存预检切片：订单详情抽屉在店员修改目标日期、时间、时长时，会从现有 `bookingInventory` 中按门店、日期、重叠时段、服务组、外部 SKU 预览目标库存槽。

命中满容量、已有冲突或非 `ACTIVE` 状态时，前端显示冲突原因并禁用“保存改期”。无匹配库存槽时不在前端拦截，API 模式仍交给后端做最终校验。

## 改动范围

| 文件 | 说明 |
| --- | --- |
| `studio-workbench/src/features/orders/orderOperations.ts` | 新增改期目标库存槽匹配和冲突文案 helper |
| `studio-workbench/src/features/orders/orderOperations.test.ts` | 覆盖门店、服务组、SKU、时段重叠、满容量冲突文案 |
| `studio-workbench/src/features/orders/OrdersView.vue` | 订单详情改期区新增目标时段、容量、冲突提示和保存拦截 |
| `studio-workbench/src/features/orders/OrdersView.contract.test.ts` | 固化抽屉中的预检 computed、提示文案和按钮状态 |

## 验证

TDD 红灯：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- orderOperations.test.ts OrdersView.contract.test.ts
```

结果：

```text
Test Files  4 run
Tests       3 failed
原因：旧代码没有 getOrderRescheduleInventorySlot、buildOrderRescheduleConflictMessage 和 reschedulePreviewSlot
```

目标测试绿灯：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- orderOperations.test.ts OrdersView.contract.test.ts
```

结果：

```text
Test Files  4 passed (4)
Tests       42 passed (42)
```

本地浏览器 smoke：

```text
URL: http://localhost:5190/order/appointment?q=YY202606100001&quick=all
订单: YY202606100001
安全时段: 14:00 -> 显示 14:00-14:30，容量 6，已确认 4，冲突 0，按钮“保存改期”启用
冲突时段: 15:30 -> 显示 15:00-16:30，容量 3，已确认 3，冲突 1，按钮“请先调整改期时段”禁用
控制台错误: 0
```

全量测试：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
```

结果：

```text
Test Files  66 passed (66)
Tests       351 passed (351)
```

生产构建：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run build
```

结果：

```text
vue-tsc -b && vite build
2828 modules transformed
dist/assets/OrdersView-ClObx7-A.js 94.77 kB gzip 25.14 kB
✓ built in 3.34s
```

## 边界

- 不新增订单、预约、支付或库存账本。
- 不混淆 `DOUYIN_LIFE` 和 `DOUYIN_MINI_APP`。
- 不在前端伪造平台库存同步状态；当前预检只基于工作台已加载的库存事实。
- API 模式下后端仍必须做最终改期校验。
