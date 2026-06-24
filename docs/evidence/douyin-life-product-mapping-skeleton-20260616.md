# Douyin Life Product Mapping Skeleton Evidence

GeneratedAt: 2026-06-16 18:48 +08:00

## Result

PASS.

Production now has real `DOUYIN_LIFE` SKU/POI product mapping skeletons derived from saved `yy_channel_order_mapping.raw_payload`.

This was a data-only production update. It did not redeploy the backend JAR and did not change any order's real store assignment.

## SQL

```text
script: backend/script/sql/postgres/postgres_douyin_life_product_mapping_skeleton_20260616.sql
server: 103.24.216.8
database container: yingyue-postgres
database: yingyue_cloud
backup: /opt/yingyue/backups/douyin-life-product-mapping-skeleton-20260616-184848/product_mapping_tables.sql
backup sha256: 14daf027ce311fc95725f95cf345748b93bbd3b86a111534077ff3c0ff11c8fa
```

## Production Counts

Before:

```text
products: 0
douyinLifeProducts: 0
douyinLifeMappings: 0
activeMappings: 0
boundMappings: 0
```

After:

```text
products: 13
douyinLifeProducts: 13
douyinLifeMappings: 14
needMappingMappings: 14
activeMappings: 0
boundMappings: 0
poiCount: 2
skuCount: 13
```

## API Verification

```text
GET /yy/product/list?pageNum=1&pageSize=100&productType=DOUYIN_LIFE -> total 13
GET /yy/channelProductMapping/list?pageNum=1&pageSize=100&channelType=DOUYIN_LIFE -> total 14
mappingStatus distribution -> NEED_MAPPING: 14
boundMappingCount -> 0
```

Safety verification:

```text
POST /yy/channel/DOUYIN_LIFE/orders/backfill {"maxTotal":20}
result: SYNCED, total=20, updated=0, failed=0
DOUYIN_LIFE NEED_MAPPING orders: 1003 -> 1003
DOUYIN_LIFE default-store orders: 1003 -> 1003
```

## Extracted Production POI/SKU

The skeleton covers the current historical payload distribution:

```text
POI 7228779175929186363: 1001 orders across 13 SKU values
POI 7555006097638393865: 2 orders, SKU 1765136728900670
```

Top SKUs:

```text
1765136728900670: 606 total orders across 2 POIs
1765149825801219: 169
1769659221370883: 50
1768849478367259: 45
1772297209231363: 33
1765140171245581: 28
1770473343276035: 22
1765138590111751: 15
1770943384350776: 15
1765154542674967: 8
1769659946240043: 7
1768121210918952: 6
1834803890491392: 1
```

## Important Boundary

These mappings are intentionally not active for resolver use:

```text
store_id = null
mapping_status = NEED_MAPPING
```

`DouyinLifeStoreResolver` only uses `mapping_status='ACTIVE'` to resolve a real `yy_store`. Therefore this skeleton makes the real products visible in the workbench but does not guess store ownership.

## Next Step

Need external evidence for these two POIs:

```text
7228779175929186363 -> which real yy_store?
7555006097638393865 -> which real yy_store?
```

Once confirmed:

1. Update matching `yy_channel_product_mapping.store_id`.
2. Change matching rows to `mapping_status='ACTIVE'`.
3. Rerun `POST /yy/channel/DOUYIN_LIFE/orders/backfill {"maxTotal":5000}`.
4. Verify `yy_order.store_id` moves out of `DY-LIFE-DEFAULT` only for uniquely resolved mappings.

