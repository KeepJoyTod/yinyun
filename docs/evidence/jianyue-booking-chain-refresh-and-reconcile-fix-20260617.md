# Jianyue Booking Chain Refresh And Reconcile Fix - 2026-06-17

## Result

Hong Kong 2 booking-chain data is back in the expected state after re-running the aggregate Jianyue inventory reconciliation.

## What Happened

- A guarded refresh script was added for future Jianyue schedule/order refreshes.
- The first execution used existing local SQL because the Jianyue account login failed, but the script did not stop on the native `node` exit code.
- The schedule SQL refreshed slot capacity and reset today's `paid_count/conflict_count`.
- The aggregate reconcile SQL was then re-run to restore occupied/conflict counts from `yy_order`.
- The production backup created before that write is under `/opt/yingyue/runtime/jianyue-refresh/20260617-123328/`.

## Fix Applied

- `tools/refresh-jianyue-production-booking-chain.ps1` now calls Jianyue exporters through `Invoke-NodeExport`.
- `Invoke-NodeExport` checks `$LASTEXITCODE` and throws before any production upload/write if export fails.
- Re-ran `backend/script/sql/postgres/postgres_jianyue_inventory_reconcile_20260617.sql` on Hong Kong 2.

## Production Reconcile Output

```text
inserted_inventory_slots: 0
updated_inventory_slots: 341
updated_orders: 372
```

## Current Production Snapshot

Saved to:

```text
docs/evidence/yingyue-booking-chain-snapshot-20260617-after-reconcile-fix.json
```

Key values:

```text
todaySlots: 63
todayCapacity: 77
todayPaid: 2
todayConflicts: 1
todayOrders: 3
todayOrdersWithSlot: 3
windowOrders: 1357
windowMissingSlot: 1003
paidOrdersWithSlotNoInventory: 0
```

## Interpretation

- Today's homepage and appointment schedule can render from real `yy_booking_slot_inventory + yy_order`.
- Historical `DOUYIN_LIFE` rows still do not have real appointment time fields and must not be fabricated into the schedule board.
- Future refreshes must use `-Execute` only after Jianyue credentials are verified; exporter failure now stops before production writes.
