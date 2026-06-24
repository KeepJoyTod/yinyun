# Studio Workbench Slot URL Cleanup Acceptance

- Time: 2026-06-19T16:38:51+08:00
- Release: `prod-54c20d4-slot-url-cleanup-20260619-163400`
- Overall: PASS
- Scope: `dashboard/today -> slot detail -> order/appointment` and direct open of stale slot-scoped order URL

## Checks

- Dashboard flow PASS: `13:30` 时段进入“查看该时段订单”后，最终 URL 不再包含 `q=JY-12118454`
- Slot-scoped list PASS: 搜索框为空；不存在 `搜索：JY-12118454` 标签；`13:30-14:00` 仍只显示该时段 1 条订单
- Order detail PASS: 点击 `JY-12118454` 仍可打开订单详情抽屉
- Direct stale URL PASS: 直接打开旧坏链接后，路由会自动清掉 `q`，保留 `storeId/slotStart/slotEnd`
- Local verification PASS: `npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts`
- Local build PASS: `npm --prefix studio-workbench run build`

## Final URLs

- Dashboard verification URL:
  - `https://studio.evanshine.me/dashboard/today?date=2026-06-19&storeId=900000000000000100&cb=prod-54c20d4-slot-url-cleanup-20260619-163400`
- Final scoped orders URL:
  - `https://studio.evanshine.me/order/appointment?quick=all&time=arrival&start=2026-06-19&end=2026-06-19&storeId=900000000000000100&dm=%E6%BB%A8%E5%B7%9E%E4%B8%87%E8%BE%BE%E5%BA%97&astore=%E6%BB%A8%E5%B7%9E%E4%B8%87%E8%BE%BE%E5%BA%97&slotStart=13:30&slotEnd=14:00`

## Safety

- 未提交取消、改期、客片通知等有副作用动作
- 未打印密码、token、cookie、手机号全量清单
