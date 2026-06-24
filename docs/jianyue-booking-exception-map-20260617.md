# JianYue Booking Exception Map 2026-06-17

## Conclusion

The workbench must make data exceptions visible and operable. It should not hide bad mapping, fake missing slot times, or silently overbook capacity.

## Exception Categories

| Code | Meaning | Primary owner | UI location |
| --- | --- | --- | --- |
| `NEED_MAPPING` | External POI/SKU cannot map uniquely to store/product | Operator/admin | Dashboard anomaly, mapping page, order list filter |
| `CONFLICT` | Order has a slot but capacity is exceeded or reservation failed | Store manager/front desk | Today schedule, order detail, anomaly filter |
| `MISSING_SLOT` | Valid order has no trustworthy appointment date/time | Front desk/operator | Order list, anomaly card; not slot board |
| `SYNC_FAILED` | Platform sync/OpenAPI/SPI failed | Operator/admin | Channel sync logs |
| `PERMISSION_DENIED` | Staff tries to view/operate out-of-scope data | Admin/store manager | UI message and audit log |
| `PAYMENT_MISMATCH` | Service status and payment/refund state conflict | Store manager/operator | Order detail and reports |
| `DUPLICATE_EXTERNAL_ORDER` | External order maps to more than one local row | Operator/admin | Sync health |
| `STALE_INVENTORY` | Slot inventory not refreshed recently | Store manager/operator | Schedule warning |

## Handling Rules

| Exception | Rule |
| --- | --- |
| `NEED_MAPPING` | Do not assign a default store. Create/activate `yy_channel_product_mapping`, then run backfill. |
| `CONFLICT` | Keep the order visible. Let staff reschedule, accept over-capacity with remark if policy allows, or cancel. |
| `MISSING_SLOT` | Keep in order list/accounting. Only write slot fields when a trusted source provides them or staff manually schedules. |
| `SYNC_FAILED` | Show last error and logid/request id. Retry from Hong Kong 2 when IP whitelist is required. |
| `PAYMENT_MISMATCH` | Do not auto-complete. Require operator review or platform re-sync. |
| `DUPLICATE_EXTERNAL_ORDER` | Stop sync for affected channel until idempotency is fixed. |
| `STALE_INVENTORY` | Keep existing slot data but show warning; do not reset counts blindly. |

## Detection Queries

```sql
select count(*)
from yy_order
where del_flag = '0'
  and inventory_status = 'NEED_MAPPING';
```

```sql
select count(*)
from yy_order
where del_flag = '0'
  and inventory_status = 'CONFLICT';
```

```sql
select count(*)
from yy_order
where del_flag = '0'
  and channel_type = 'DOUYIN_LIFE'
  and order_time >= now() - interval '30 day'
  and (slot_date is null or slot_start_time is null or slot_end_time is null);
```

```sql
select channel_type, sync_status, count(*)
from yy_channel_order_mapping
where del_flag = '0'
group by channel_type, sync_status
order by channel_type, sync_status;
```

## UI Requirements

| Surface | Required exception display |
| --- | --- |
| Dashboard | Small anomaly area: missing slot, mapping needed, capacity conflict, recent sync failure |
| Today schedule | Conflict badge on affected slot; full badge independent from conflict badge |
| Order list | Filters for mapping/conflict/missing slot/sync issue |
| Order detail | Raw reason, last sync log reference, actionable next step |
| Mapping page | DOUYIN_LIFE-only mapping view with store/product/POI/SKU status |

## Retry Policy

| Operation | Retry policy |
| --- | --- |
| Douyin order sync | Time-window retry, server/HK2 preferred, log every run |
| Backfill mapping | Retry after mapping change, idempotent by order id |
| SPI event processing | Use event inbox retry if persisted; preserve original logid |
| Staff booking reserve | Do not blind retry if capacity conflict; require user action |
| Reschedule | Retry only after reloading slot version |

## Evidence To Capture

- Order id or external order id, masked if needed.
- Store id/code, POI/SKU ids when relevant.
- `yy_channel_sync_log.request_id` or platform logid.
- Before/after `inventory_status`.
- Operator action and remark for manual overrides.
