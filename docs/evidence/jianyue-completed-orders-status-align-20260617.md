# Jianyue Completed Orders Status Align - 2026-06-17

## Result

Two Jianyue appointment rows that were completed in the reference Jianyue system were aligned on Hong Kong 2 in the local `yy_order` ledger.

## Source Signal

The reference screenshot showed two `2026-06-17 11:00` appointments as `已完成` in Jianyue:

- One `A002` workstation row.
- One `A001` workstation row.

No full customer name or full phone number is recorded in this evidence.

## Production Check Before Align

Hong Kong 2 `yy_order` still had both corresponding `2026-06-17 11:00-11:30` Jianyue rows as `SERVING`.

## Production Update

Only these fields were changed:

- `yy_order.status`: `SERVING` -> `COMPLETED`
- `yy_order.update_time`: current timestamp

Fields intentionally not changed:

- amount
- store
- slot date/time
- pay status
- inventory status
- customer data

## Sanitized Verification

```text
updated|2
JY-12152059|JIANYUE|2026-06-17|11:00|11:30|COMPLETED|PAID|CONFIRMED|孙*|8853
JY-12152139|JIANYUE|2026-06-17|11:00|11:30|COMPLETED|PAID|CONFLICT|张*|2707
```

## Frontend Fix

`studio-workbench/src/shared/api/yingyueAdapter.ts` now maps backend `COMPLETED` to workbench label `已完成`, while keeping `选片中 -> COMPLETED` as a compatibility export/filter alias.

Verification:

```text
npm run test -- src/shared/api/yingyueAdapter.test.ts src/features/orders/orderOperations.test.ts src/features/schedule/scheduleOperations.test.ts
Test Files 3 passed
Tests 37 passed
```
