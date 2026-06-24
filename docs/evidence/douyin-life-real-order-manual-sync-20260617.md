# Douyin Life Real Order Manual Sync 2026-06-17

## Result

Production `DOUYIN_LIFE` real order compensation sync was executed through the backend business API, not by direct SQL inserts.

```text
POST https://api.evanshine.me/yy/channel/DOUYIN_LIFE/orders/sync
windowStart: 2026-06-16 14:38:17
windowEnd:   2026-06-17 14:38:17
syncStatus:  SYNCED
total:       7
created:     7
updated:     0
failed:      0
lastLogId:   202606171438160FAFC54FF2F9CD3CF6F0
```

The API call used the local staff workbench account file. No password, token, phone number, openid, or raw payload is recorded here.

## Before

Read-only diagnosis before the manual sync:

```text
evidence: docs/evidence/douyin-life-sync-diagnosis-20260617-143414.md
sampleMappingsFound: 0 / 7
sampleOrdersFound:   0 / 7
activePairMappingGap: 0
sampleOrdersWithReserveTime: 0
```

Meaning: `POI+SKU` mapping was ready, but the seven newly discovered real orders had not entered `yy_channel_order_mapping` or `yy_order`.

## After

Read-only diagnosis after the manual sync:

```text
evidence: docs/evidence/douyin-life-sync-diagnosis-20260617-143837-after-manual-sync.md
sampleMappingsFound: 7 / 7
sampleOrdersFound:   7 / 7
sampleOrdersMissingLocal: 0
activePairMappingGap: 0
sampleOrdersWithReserveTime: 0
```

Store assignment from `yy_order`:

```text
7342410951733282851 -> BZ-WANDA / 900000000000000100: 4 sample orders
7228779175929186363 -> BZ-WUYUE / 900000000000000200: 3 sample orders
```

Mapping gap after sync remains zero:

```text
evidence: docs/evidence/douyin-life-real-mapping-gap-20260617-after-manual-sync.json
gap: 0
```

Booking chain snapshot after sync:

```text
evidence: docs/evidence/yingyue-booking-chain-snapshot-20260617-after-douyin-manual-sync.json
30-day DOUYIN_LIFE yy_order count: 1010
today order count: 3
today order channel: JIANYUE only
paid orders with slot but no inventory: 0
```

## Boundary

The seven synced orders still do not contain real reservation date/time fields in the OpenAPI query payload. They were correctly written as paid `DOUYIN_LIFE` orders, but they were not written into `yy_booking_slot_inventory`.

Current operational rule remains:

```text
Only Webhook/SPI or future OpenAPI payloads with real slot_date + slot_start_time + slot_end_time may enter yy_booking_slot_inventory.
Do not infer appointment slots from product names, payment time, or order creation time.
```
