# Jianyue Booking Chain Refresh Runbook 2026-06-17

## Goal

Keep the studio homepage and today appointment board backed by real schedule slots and real appointment orders.

## Data Rules

- `yy_order` remains the only appointment/order ledger.
- `yy_booking_slot_inventory` remains the local operational slot-capacity ledger.
- Jianyue provides the current reliable historical slot/order data for the reference-style daily board.
- `DOUYIN_LIFE` Webhook/SPI is the preferred real-time chain; active OpenAPI sync is only a compensation path.
- Historical `DOUYIN_LIFE` orders must not be assigned fake appointment times. They enter the today board only when payloads contain real POI/SKU/date/time fields.

## Safe Refresh

Dry run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\refresh-jianyue-production-booking-chain.ps1 -DryRun -Date 2026-06-17
```

Execute after setting Jianyue credentials in the current shell:

```powershell
$env:JIANYUE_ACCOUNT='<account>'
$env:JIANYUE_PASSWORD='<password>'
.\tools\refresh-jianyue-production-booking-chain.ps1 -Execute -Date 2026-06-17
```

The script:

- exports Jianyue schedule slots into `backend/script/sql/postgres/postgres_jianyue_booking_slot_inventory_seed_YYYYMMDD.sql`;
- exports Jianyue orders into `docs\yiyue\postgres_jianyue_orders_import_YYYYMMDD.sql`;
- backs up Hong Kong 2 PostgreSQL with `pg_dump`;
- applies schedule SQL, then order SQL;
- writes a masked booking-chain snapshot under `docs/evidence`.

## Verification

```powershell
node --test tools\export-jianyue-orders.test.mjs tools\export-jianyue-schedule.test.mjs tools\get-yingyue-booking-chain-snapshot.test.mjs tools\refresh-jianyue-production-booking-chain.test.mjs
.\tools\get-yingyue-booking-chain-snapshot.ps1 -Mode SshDocker -SshHost 103.24.216.8 -SshPasswordFile C:\Users\Administrator\Desktop\服务器\香港2.txt -Date 2026-06-17 -LookbackDays 30
```

Expected healthy signals:

- `todaySlots` is greater than zero.
- `todayOrdersWithSlot` equals `todayOrders` for operational appointment rows.
- `paidOrdersWithSlotNoInventory` is zero.
- `windowMissingSlot` may remain high when old `DOUYIN_LIFE` orders lack real appointment time fields.

## Current Production Snapshot

As of 2026-06-17:

- Today slots: 63.
- Today orders: 3.
- Today orders with slot: 3.
- Today conflicts: 1.
- 30-day window orders: 1357.
- 30-day missing slot orders: 1003, all from historical `DOUYIN_LIFE` rows without real appointment time fields.

This means the current daily board can be real for Jianyue-backed appointment operations, while old Douyin rows remain order-list/accounting data until new callbacks or payloads provide real time slots.
