# Studio Workbench Slot Real Jianyue Deploy - 2026-06-17

## Result

Deployed the real schedule/order chain to Hong Kong 2 and reconciled imported Jianyue orders into `yy_booking_slot_inventory`.

- Server: Hong Kong 2, `103.24.216.8`
- Release path: `/opt/yingyue/releases/slot-real-f279a1a-20260617-103002`
- Backup path: `/opt/yingyue/backups/slot-real-f279a1a-20260617-104010-pre`
- Backend JAR SHA256: `75b9729b74d0c8b34b493fd851f6625aeac45f9480c4087015afdd08c8c7e280`
- Studio workbench ZIP SHA256: `6d0b66573d2e8d2ecae02328bb9600189f14cf588c49c2f97c994dcf6e69676c`
- Frontend asset marker: `prod-f279a1a-slot-real-20260617`

## Data Import

Imported real Jianyue schedule inventory and real Jianyue appointment orders.

- `yy_order` Jianyue rows: `376`
- Jianyue effective paid rows with slots: `372`
- Jianyue inventory confirmed rows: `371`
- Jianyue inventory conflict rows: `1`
- `yy_booking_slot_inventory` rows after reconcile: `1999`
- Today slots: `63`
- Today appointment orders: `3`
- Today inventory occupied/conflict:
  - `2026-06-17 10:30-11:00`: `1/1`, conflict `0`
  - `2026-06-17 11:00-11:30`: `1/1`, conflict `1`

Store distribution for imported Jianyue orders:

- `900000000000000100`: `174`
- `900000000000000200`: `135`
- `900000000000000300`: `62`
- `900000000000000400`: `5`

## Verification

Backend and DB:

- `systemctl is-active yingyue-admin.service`: `active`
- `https://api.evanshine.me/auth/code`: `200`
- Authenticated `GET /yy/bookingSlotInventory/list?bizDate=2026-06-17`: `200`, `total=63`
- Authenticated `GET /yy/order/list` for `2026-06-17`: `200`, `total=3`

Frontend routes:

- `https://studio.evanshine.me/`: `200`
- `https://studio.evanshine.me/login`: `200`
- `https://studio.evanshine.me/dashboard/today`: `200`
- `https://studio.evanshine.me/schedule`: `200`
- `https://studio.evanshine.me/order/appointment`: `200`

Browser smoke:

- Login succeeded and redirected to `/`
- Dashboard showed today/schedule/full-or-conflict signals
- Schedule showed morning/afternoon/evening and full-or-conflict signals
- Appointment orders showed appointment plus pending/serving signals
- Screenshots:
  - `output/playwright/studio-dashboard-today-prod-20260617.png`
  - `output/playwright/studio-schedule-prod-20260617.png`
  - `output/playwright/studio-orders-prod-20260617.png`

Local tests:

- `node --test tools\export-jianyue-orders.test.mjs tools\export-jianyue-schedule.test.mjs`: `11/11 passed`

## Notes

- The cleartext Jianyue order import SQL contains customer PII and stays outside Git under `C:\Users\Administrator\Desktop\yiyue`.
- `backend/script/sql/postgres/postgres_jianyue_inventory_reconcile_20260617.sql` contains only aggregate slot/order reconciliation logic and no customer PII.
- Douyin Life historical `1003` orders still cannot receive real appointment slots unless the saved raw payload has slot fields; this deployment does not fabricate missing Douyin historical times.
