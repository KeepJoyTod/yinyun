# Studio Workbench Interaction Batch Plan 2026-06-17

## Scope

This batch keeps the backend order and booking ledgers unchanged. It only fixes first-order staff-workbench interaction gaps:

- Order console manual entry is named as appointment creation, not generic order creation.
- Advanced order store filter can return to all stores.
- Dashboard inventory entry keeps the currently selected `yy_store.id`.
- Schedule-to-orders deep links prefer `storeId=<yy_store.id>` while preserving `astore=<store name>` compatibility.

## Verification

- Run targeted contract tests for orders, dashboard, and schedule.
- Run `studio-workbench` production build.
- Update local maps under `docs\yiyue`.

## Boundary

- Do not fabricate appointment slots from historical `DOUYIN_LIFE` orders.
- `yy_order` remains the single order ledger.
- `yy_booking_slot_inventory` remains the real schedule/capacity ledger.
- UI polish beyond broken interaction fixes is left for the next batch.
