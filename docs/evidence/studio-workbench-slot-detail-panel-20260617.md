# Studio Workbench Slot Detail Panel Evidence - 2026-06-17

## Scope

This batch improves the JianYue-style schedule workflow in `studio-workbench`:

- Click a schedule slot to open an inline slot detail panel.
- Show time range, store, service group, order count, capacity, remaining count, full/conflict state.
- Allow staff to create a prefilled appointment from the selected slot.
- Allow staff to jump to scoped appointment orders for the selected slot.
- Allow staff to jump to inventory/capacity adjustment for the selected slot.

## Source Files

| File | Purpose |
| --- | --- |
| `studio-workbench/src/features/schedule/ScheduleView.vue` | Slot detail panel, selected-slot state, scoped order/inventory navigation, prefilled staff booking |
| `studio-workbench/src/features/schedule/ScheduleView.contract.test.ts` | Contract checks for the slot detail panel and actions |

## Data Boundary

- Schedule/capacity source remains `yy_booking_slot_inventory`.
- Appointment/order source remains `yy_order`.
- Historical `DOUYIN_LIFE` orders without real slot fields are not converted into daily schedule entries.
- This batch does not change backend APIs or database schema.

## Verification

Commands to run from `D:\OtherProject\CameraApp\yingyue-cloud-repo`:

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
npm --prefix studio-workbench run build
```

Expected result:

- Focused frontend contract tests pass.
- Production build completes.
- Vite may print the existing chunk-size warning.

Actual local result:

```text
npm --prefix studio-workbench run test -- src/features/schedule/ScheduleView.contract.test.ts
1 passed, 14 passed

npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
3 passed, 73 passed

npm --prefix studio-workbench run build
passed; existing Vite large chunk warning only
```

## Production Deploy

```text
commit=0d6d394 feat(studio): add schedule slot detail panel
release=prod-0d6d394-slot-detail-panel-20260617
target=HK2 /var/www/studio.evanshine.me
backup=/opt/yingyue/backups/20260617-214155-pre-studio-workbench-prod-0d6d394-slot-detail-panel-20260617
nginx config test=successful
yingyue-admin.service=active
release marker=present
```

Public smoke:

```text
https://studio.evanshine.me/?cb=slot-detail -> 200, marker=True
https://studio.evanshine.me/login?cb=slot-detail -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=slot-detail -> 200, marker=True
https://studio.evanshine.me/schedule?cb=slot-detail -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=slot-detail -> 200, marker=True
```

Rollback:

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-214155-pre-studio-workbench-prod-0d6d394-slot-detail-panel-20260617/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
