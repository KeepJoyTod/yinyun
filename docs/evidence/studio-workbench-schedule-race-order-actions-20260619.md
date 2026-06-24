# Studio Workbench Schedule Race And Order Actions - 2026-06-19

## Summary

- Scope: dashboard appointment slot count, order detail cancel/reschedule reasons, operation log refresh.
- Production symptom reproduced before fix:
  - URL: `/dashboard/today?date=2026-06-18&storeId=900000000000000100&slotStart=18:00&slotEnd=18:30`
  - UI showed `18:00-18:30`, `orders=0`, `capacity=1/1`, full.
  - Read-only production API showed the same store/date/slot has `total=1`.
- First production deploy `prod-12cbe6c-schedule-race-order-actions-20260619-1100` fixed the stale request race but the same deep link still showed `orders=0`.
- Second root cause was field priority: imported JianYue orders can have `arrival_time=00:00:00` while the real appointment slot is stored in `slot_date + slot_start_time + slot_end_time`.
- Second production deploy `prod-fd16523-slot-priority-20260619-111532` fixed field priority, but browser verification still showed `orders=0`.
- Third root cause was global bootstrap prefetch: `appStore.bootstrap()` still loaded `todayKey()` schedule and could overwrite the route-scoped `2026-06-18` schedule after the dashboard deep link had loaded.

No secrets, tokens, raw payloads, or full customer phone numbers are recorded here.

## Root Cause

The dashboard immediate watcher could start loading the default current date before route query parsing applied the deep-linked date/store/slot. If the stale request resolved later, it overwrote the shared `appStore.scheduleItems` for the correct route scope. Inventory was already loaded for the routed date, so the slot could show capacity/full state without the matching order count.

After the race fix was deployed, the remaining mismatch came from the frontend mapping layer. `mapYyOrder` and `mapOrder` preferred `arrival_time` over the real slot fields. For JianYue imported order `JY-12138444`, `arrival_time` is midnight, but `slot_date=2026-06-18`, `slot_start_time=18:00`, and `slot_end_time=18:30`. The schedule grid therefore grouped the order under `00:00` instead of the visible `18:00-18:30` slot.

After the field priority fix was deployed, production API checks showed both full-day and exact-slot order queries returned the correct row, but the browser still showed zero orders. DOM inspection showed the dashboard selected `06月18日` and `滨州万达店`, while the grid contained inventory for `18:00-18:30` only. The remaining overwrite came from `appStore.bootstrap()` preloading `loadSchedule(todayKey())`. When that default schedule response returned after the dashboard route-scoped load, shared `scheduleItems` was overwritten with the current-day schedule. Bootstrap should load core data and coarse stats only; each page must load schedule data for its own route date and store.

## Changes

| Area | File | Result |
| --- | --- | --- |
| Schedule load ordering | `studio-workbench/src/shared/stores/appStore.ts` | Added `scheduleLoadSeq`; stale `loadSchedule` responses no longer overwrite current `scheduleItems`. |
| Order cache separation | `appStore.ts` | `loadSchedule` no longer writes `reportOrders`, so schedule refresh cannot overwrite dashboard/order report cache. |
| Dashboard deep link | `studio-workbench/src/features/dashboard/DashboardView.vue` | Calls `applyFromQuery()` before the immediate dashboard refresh watcher. |
| Cancel/reschedule UX | `studio-workbench/src/features/orders/OrdersView.vue` | Added quick cancel reasons and quick reschedule reasons in the order drawer. |
| Operation logs | `OrdersView.vue` | Added manual `刷新日志` action next to the operation timeline. |
| Slot field priority | `studio-workbench/src/shared/api/yingyueAdapter.ts` | `slotDate + slotStartTime` now takes priority over `arrivalTime` when mapping orders and schedule items. |
| Workbench order display | `studio-workbench/src/shared/stores/appStoreTransforms.ts` | `BookingOrder.arrivalDate/arrivalClock/arrivalTime` use the same slot-first priority as the schedule grid. |
| Bootstrap schedule ownership | `studio-workbench/src/shared/stores/appStore.ts` | Removed global `loadSchedule(todayKey())` from `bootstrap()` so route-scoped pages own their schedule scope. |

## Verification

```powershell
npm --prefix studio-workbench run test -- src/shared/stores/appStore.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts
# 2 files / 52 tests passed

npm --prefix studio-workbench run test -- src/features/dashboard/dashboardOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/stores/appStore.contract.test.ts src/shared/api/yingyueAdapter.test.ts src/features/albums/PhotoMgmtView.contract.test.ts
# 10 files / 199 tests passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning remains

npm --prefix studio-workbench run test -- src/shared/api/yingyueAdapter.test.ts src/shared/stores/appStoreTransforms.test.ts
# 2 files / 11 tests passed

npm --prefix studio-workbench run test -- src/features/dashboard/dashboardOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/stores/appStore.contract.test.ts src/shared/api/yingyueAdapter.test.ts src/shared/stores/appStoreTransforms.test.ts src/features/albums/PhotoMgmtView.contract.test.ts
# 11 files / 204 tests passed

npm --prefix studio-workbench run test -- src/shared/stores/appStore.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/shared/api/yingyueAdapter.test.ts src/shared/stores/appStoreTransforms.test.ts
# 4 files / 64 tests passed

npm --prefix studio-workbench run test -- src/features/dashboard/dashboardOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/stores/appStore.contract.test.ts src/shared/api/yingyueAdapter.test.ts src/shared/stores/appStoreTransforms.test.ts src/features/albums/PhotoMgmtView.contract.test.ts
# 11 files / 205 tests passed
```

## Production API Evidence

Read-only production API check with the local staff account:

```text
GET /yy/order/list?pageNum=1&pageSize=20&storeId=900000000000000100&slotDate=2026-06-18&slotStartTime=18:00&slotEndTime=18:30
code=200
total=1
row: id=910000000012138444, orderNo=JY-12138444, status=PENDING, slot=2026-06-18 18:00-18:30, channelType=JIANYUE, customer/phone redacted
```

## Deploy

First deploy:

```text
release=prod-12cbe6c-schedule-race-order-actions-20260619-1100
backup=/opt/yingyue/backups/20260619110213-pre-studio-workbench-prod-12cbe6c-schedule-race-order-actions-20260619-1100
nginx=ok
yingyue-admin.service=active
smoke=release/dashboard/order/photos/micro-pages/card-management ok
browser follow-up=dashboard slot still showed orders=0, so slot field priority fix was required
```

Second deploy:

```text
release=prod-fd16523-slot-priority-20260619-111532
backup=/opt/yingyue/backups/20260619111709-pre-studio-workbench-prod-fd16523-slot-priority-20260619-111532
nginx=ok
yingyue-admin.service=active
smoke=release/dashboard/order/photos/micro-pages/card-management ok
browser follow-up=dashboard slot still showed orders=0, so bootstrap schedule prefetch removal was required
```

Third deploy:

```text
release=prod-935bd74-bootstrap-schedule-scope-20260619-112636
backup=/opt/yingyue/backups/20260619112728-pre-studio-workbench-prod-935bd74-bootstrap-schedule-scope-20260619-112636
zip_sha256=4976fa4e42f648b29439cbddeaf98a825630423bab6a42a7970c9b1ca07c8e0e
nginx=ok
yingyue-admin.service=active
/release.txt=200 marker=true
/dashboard/today?date=2026-06-18&storeId=900000000000000100&slotStart=18:00&slotEnd=18:30=200 marker=true
/order/appointment?quick=all&storeId=900000000000000100&start=2026-06-18&end=2026-06-18&slotStart=18:00&slotEnd=18:30=200 marker=true
/service/photos=200 marker=true
/merchant/micro-pages=200 marker=true
/product/card-management=200 marker=true
```

## Browser Acceptance

Real logged-in browser session, release `prod-935bd74-bootstrap-schedule-scope-20260619-112636`:

```text
Dashboard deep link:
  url=/dashboard/today?date=2026-06-18&storeId=900000000000000100&slotStart=18:00&slotEnd=18:30
  selected date=06月18日
  selected store=滨州万达店
  slot=晚上 18:00-18:30
  result=订单 1, 工位 1/1, full badge visible

Slot detail:
  opened from 18:00 slot
  order visible=JY-12138444
  detail action visible=查看该时段订单

Appointment order page:
  url includes storeId=900000000000000100, start=2026-06-18, end=2026-06-18, slotStart=18:00, slotEnd=18:30, q=JY-12138444
  order visible=JY-12138444
  visible controls=到店, 服务中, 已完成, 改期, 取消预约, 刷新日志, 去客片管理
  destructive actions=not executed

Photos:
  /service/photos opened from order detail
  visible controls include upload/photo delivery/notification-confirm-deliver wording

Micro pages:
  /merchant/micro-pages loads
  published/offline states visible

Card products:
  /product/card-management loads but current filtered store has no card rows
  /product/card-catalog loads and shows 新增卡项 / 批量上架 entry points
```

## Follow-up: Order Operation Log Detail

Scope: 预约订单详情抽屉里的取消、改期、状态流转操作记录。

Change:

- `OperationLogInfo` now carries backend `operParam` and `jsonResult` as `requestPayload` / `responsePayload`.
- `mapOperationLog` maps Ruoyi operation-log request/response payloads for frontend read-only summaries.
- `buildOrderDetailTimeline` now summarizes order operation logs with operator, department, target status, target slot, reason, and failure message.
- The frontend extracts only whitelisted fields: `targetStatus`, `slotDate`, `slotStartTime`, `slotEndTime`, and `remark`. It does not render raw payloads.

Verification:

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts
# 1 file / 38 tests passed

npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/features/settings/logsOperations.test.ts
# 3 files / 88 tests passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning remains
```

Deploy:

```text
commit=50e267a fix(studio): show order action audit details
release=prod-50e267a-order-audit-20260619-20260619-114202
zip_sha256=E6673C8A790AC7384A902DC6641BFE814CF5A4273D640E4FAF2D5245DA1D0EE2
backup=/opt/yingyue/backups/20260619114252-pre-studio-workbench-prod-50e267a-order-audit-20260619-20260619-114202
nginx=ok
yingyue-admin.service=active
/release.txt=200 marker=true
dashboard/order/photos/micro-pages/card-management/card-catalog routes=200
```

Real logged-in browser acceptance after deploy:

```text
Dashboard:
  url=/dashboard/today?date=2026-06-18&storeId=900000000000000100&slotStart=18:00&slotEnd=18:30
  visible=滨州万达店, 上午/下午/晚上分段
  slot=晚上 18:00-18:30, 订单 1, 工位 1/1

Order detail:
  url=/order/appointment?...q=JY-12138444
  drawer visible=JY-12138444, 改期, 取消预约, 刷新日志, 资料发送
  operation timeline visible=状态流转 · store-admin
  operation detail visible=研发部门, POST /yy/order/910000000012138444/transition, 目标状态：已确认, 原因：工作台状态流转：待确认 -> 已确认
  destructive actions=not executed

Other routes:
  /service/photos visible=客片管理, 上传底片, 交付
  /merchant/micro-pages visible=微页面, 发布, 下线, 预览
  /product/card-catalog visible=新增卡项, 批量上架, 发布状态
```
