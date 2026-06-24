# Studio Workbench Closed Loop Multiagent Evidence 2026-06-17

## Scope

This batch tightens the store workbench workflow around real schedule slots, appointment orders, and photo delivery actions.

Implemented user paths:

| Path | Result |
| --- | --- |
| Dashboard slot click | Shows slot detail with order count, capacity, remaining count, conflicts, order list, staff booking, order drilldown, and inventory drilldown |
| Slot order drilldown | Opens `/order/appointment` with date/store/slot scope and loads backend-scoped orders |
| Appointment cancel | Requires a cancel reason and calls order transition to `CANCELLED`; refund/return is explicitly left to Douyin/payment platform |
| Photo notify | Calls backend and writes `yy_notification_log` fallback evidence when no real notification provider is connected |
| Photo selection confirm | Calls backend selection confirm endpoint and refreshes album/order state |
| Photo deliver | Calls backend deliver endpoint after confirmed selection and deliverable asset checks |

## APIs

| API | Purpose |
| --- | --- |
| `GET /yy/order/list?slotDate=&slotStartTime=&slotEndTime=` | Exact slot-scoped order lookup |
| `POST /yy/order/{id}/transition` | Order status transition; cancel uses `targetStatus=CANCELLED` with remark |
| `POST /yy/photoAlbum/{id}/selection/confirm` | Confirm submitted photo selection |
| `POST /yy/photoAlbum/{id}/deliver` | Mark final delivery after confirmed selection and deliverable assets |
| `POST /yy/photoAlbum/{id}/notify` | Record auditable notification fallback |

## Tables

| Table | Usage |
| --- | --- |
| `yy_order` | Single appointment/order ledger; slot filters use `slot_date`, `slot_start_time`, `slot_end_time` |
| `yy_booking_slot_inventory` | Real schedule/capacity ledger; no fabricated historical Douyin slots |
| `yy_photo_album` | Selection and delivery state |
| `yy_photo_asset` | Deliverable asset check |
| `yy_notification_log` | Manual/fallback notification audit trail |

## Boundaries

- Historical `DOUYIN_LIFE` orders without real appointment time are not written into `yy_booking_slot_inventory`.
- Photo notify currently records fallback/manual follow-up only; it does not claim SMS or mini-program notification delivery.
- Frontend and backend must be deployed together because new `/yy/photoAlbum/{id}/...` endpoints are required.
- URL parameters still use readable `slotStart/slotEnd`; API requests are mapped to backend `slotStartTime/slotEndTime`.

## Verification

Executed locally:

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/albums/PhotoMgmtView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/api/yingyueAdapter.test.ts src/shared/api/backend.contract.test.ts
mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest,YyBookingSlotInventoryServiceImplTest,YyPhotoAlbumServiceImplTest,YyClientPhotoServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
npm --prefix studio-workbench run build
```

Results:

| Command | Result |
| --- | --- |
| `npm --prefix studio-workbench run test -- ...` | 8 test files, 152 tests passed |
| `mvn -f backend/pom.xml ... test` | BUILD SUCCESS, 62 tests, 0 failures |
| `npm --prefix studio-workbench run build` | Success; existing Vite chunk-size warning only |
