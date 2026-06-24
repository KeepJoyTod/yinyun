# Studio Workbench Booking Chain Deploy - 2026-06-19

## Release

```text
commit: f057781 feat(workbench): stabilize staff booking inventory handoff
includes:
  - 69394f9 fix(workbench): preserve slot return context and log refresh
  - f057781 feat(workbench): stabilize staff booking inventory handoff
release: prod-f057781-workbench-booking-chain-20260619-182531
site: https://studio.evanshine.me
branch: yingyue-closed-loop-optimization-20260603
```

## Scope

- Frontend-only `studio-workbench` deployment.
- No backend jar replacement.
- No database migration.
- No Douyin OpenAPI/SPI write call.
- No order, appointment, inventory, schedule, product, album, employee, or channel data write during smoke.

## Changes

| Area | Files | Result |
| --- | --- | --- |
| Dashboard -> Orders 回跳 | `DashboardView.vue`, `OrdersView.vue` | 首页时段 deep link 带 `slotOriginDate/slotOriginStoreId`；订单页本地筛选不会丢失“返回原时段”上下文。 |
| 订单详情日志刷新 | `OrdersView.vue` | 订单状态推进、取消、改期后，如果首次日志加载仍在进行，会排队补刷一次后台操作日志。 |
| 店员录单阻断 | `StaffBookingModal.vue` | 已满/冲突时段不直接创建预约，先跳 `/merchant/inventory` 处理容量。 |
| 库存页返回录单 | `StaffBookingEntryView.vue`, `InventoryView.vue` | 店员录单和库存页统一使用 `slotStart/slotEnd` 返回上下文；处理容量后可回到原时段继续录单。 |
| 合同测试 | `DashboardView.contract.test.ts`, `OrdersView.contract.test.ts`, `StaffBookingEntryView.contract.test.ts`, `StaffBookingModal.contract.test.ts`, `InventoryView.contract.test.ts` | 锁定时段回跳、日志补刷标记、库存阻断和库存返回录单路径。 |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/merchant/InventoryView.contract.test.ts
# Test Files 6 passed
# Tests 149 passed

npm --prefix studio-workbench run build
# passed
```

Production build used:

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-f057781-workbench-booking-chain-20260619-182531'
npm --prefix studio-workbench run build
# passed
```

## Package

```text
local zip: C:\Users\Administrator\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-f057781-workbench-booking-chain-20260619-182531.zip
sha256: 8F23D2BA7E9A1F2FB5C7C972F92A96A9E7BEC6CE87ACB880954973DAAA0B5B6F
remote zip: /opt/yingyue/releases/studio-workbench-prod-f057781-workbench-booking-chain-20260619-182531.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/prod-f057781-workbench-booking-chain-20260619-182531
backup: /opt/yingyue/backups/20260619-182531-pre-prod-f057781-workbench-booking-chain-20260619-182531
site dir: /var/www/studio.evanshine.me
site files: 109
release.txt: prod-f057781-workbench-booking-chain-20260619-182531
nginx -t: successful
systemctl reload nginx: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=prod-f057781-workbench-booking-chain-20260619-182531
https://studio.evanshine.me/dashboard/today?cb=prod-f057781-workbench-booking-chain-20260619-182531 -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-f057781-workbench-booking-chain-20260619-182531 -> 200, marker=True
https://studio.evanshine.me/order/staff-booking?cb=prod-f057781-workbench-booking-chain-20260619-182531 -> 200, marker=True
https://studio.evanshine.me/merchant/inventory?date=2026-06-19&cb=prod-f057781-workbench-booking-chain-20260619-182531 -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-182531-pre-prod-f057781-workbench-booking-chain-20260619-182531/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
