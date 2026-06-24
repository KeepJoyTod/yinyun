# Douyin Life Sync Diagnosis

generatedAt: 2026-06-17 06:38:36 +00:00
mode: READ_ONLY_DOUYIN_LIFE_SYNC_DIAGNOSIS
discoveryFile: douyin-life-real-account-discovery-20260617-140628.json

## Overall

| metric | value |
| --- | ---: |
| expectedSampleOrderCount | 7 |
| sampleMappingsFound | 7 |
| sampleOrdersFound | 7 |
| sampleOrdersMissingLocal | 0 |
| activePairMappingGap | 0 |
| sampleOrdersWithReserveTime | 0 |

## Sample Orders

| order | poi | sku | ext_status | mapping | local_order | slot |
| --- | --- | --- | --- | ---: | ---: | --- |
| 1110***5173 | 7228779175929186363 | 1765136728900670 | 201 | 1 | 1 | no |
| 1110***2377 | 7228779175929186363 | 1867489036547136 | 201 | 1 | 1 | no |
| 1110***2377 | 7228779175929186363 | 1768121210918952 | 201 | 1 | 1 | no |
| 1110***7156 | 7342410951733282851 | 1772297209231363 | 1 | 1 | 1 | no |
| 1110***5307 | 7342410951733282851 | 1765136728900670 | 201 | 1 | 1 | no |
| 1111***7156 | 7342410951733282851 | 1772297209231363 | 1 | 1 | 1 | no |
| 1111***4500 | 7342410951733282851 | 1834803890491392 | 201 | 1 | 1 | no |

## Pair Mapping

| poi | sku | expected_orders | mapping | active | local_orders | with_slot |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 7228779175929186363 | 1765136728900670 | 1 | 1 | 1 | 605 | 0 |
| 7228779175929186363 | 1768121210918952 | 1 | 1 | 1 | 6 | 0 |
| 7228779175929186363 | 1867489036547136 | 1 | 1 | 1 | 1 | 0 |
| 7342410951733282851 | 1765136728900670 | 1 | 1 | 1 | 1 | 0 |
| 7342410951733282851 | 1772297209231363 | 2 | 1 | 1 | 2 | 0 |
| 7342410951733282851 | 1834803890491392 | 1 | 1 | 1 | 1 | 0 |

## Recent Sync Logs

| time | api | success | requestId | summary |
| --- | --- | --- | --- | --- |
| 2026-06-17 14:38:16 | life_order_query | 1 | 202606171438160FAFC54FF2F9CD3CF6F0 | 接口请求成功，logid=202606171438160FAFC54FF2F9CD3CF6F0 |
| 2026-06-17 14:36:46 | life_order_auto_sync | 1 | 20260617143646E5EB08DB392C4DA2E0C2 | status=SYNCED, total=0, created=0, updated=0, failed=0, startTime=2026-06-17 13:56:44, endTime=2026-06-17 14:36:44, maxPages=2, maxTotal=80 |
| 2026-06-17 14:36:46 | life_order_query | 1 | 20260617143646E5EB08DB392C4DA2E0C2 | 接口请求成功，logid=20260617143646E5EB08DB392C4DA2E0C2 |
| 2026-06-17 14:31:44 | life_order_auto_sync | 1 | 2026061714314413D790DB13739B4C9A4A | status=SYNCED, total=0, created=0, updated=0, failed=0, startTime=2026-06-17 13:51:43, endTime=2026-06-17 14:31:43, maxPages=2, maxTotal=80 |
| 2026-06-17 14:31:44 | life_order_query | 1 | 2026061714314413D790DB13739B4C9A4A | 接口请求成功，logid=2026061714314413D790DB13739B4C9A4A |
| 2026-06-17 14:26:43 | life_order_auto_sync | 1 | 2026061714264374A95C34D452198C8B0B | status=SYNCED, total=0, created=0, updated=0, failed=0, startTime=2026-06-17 13:46:42, endTime=2026-06-17 14:26:42, maxPages=2, maxTotal=80 |
| 2026-06-17 14:26:43 | life_order_query | 1 | 2026061714264374A95C34D452198C8B0B | 接口请求成功，logid=2026061714264374A95C34D452198C8B0B |
| 2026-06-17 14:21:42 | life_order_auto_sync | 1 | 202606171421429366973C83C8C3B19EFB | status=SYNCED, total=0, created=0, updated=0, failed=0, startTime=2026-06-17 13:41:41, endTime=2026-06-17 14:21:41, maxPages=2, maxTotal=80 |

## Conclusion

- 当前发现样本已经全部落入本地 `yy_order`。
- `POI+SKU` 商品映射已具备 ACTIVE 覆盖。
- 样本订单仍没有真实预约时段，不能写 `yy_booking_slot_inventory`。
