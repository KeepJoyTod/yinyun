# Douyin Life Order Fields Backend Deploy Evidence

GeneratedAt: 2026-06-16 17:12 +08:00

## Result

PASS.

Backend `api.evanshine.me` has been redeployed with commit `d76b6dd` so new DOUYIN_LIFE order sync writes external POI/SKU and reservation slot fields into `yy_order`.

## Deployment

```text
server: 103.24.216.8
service: yingyue-admin.service
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
release: /opt/yingyue/releases/yingyue-api-douyin-order-fields-d76b6dd-20260616-170602
backup: /opt/yingyue/backups/yingyue-api-douyin-order-fields-d76b6dd-20260616-170602-pre
remote sha256: c4eff7a4165a685a4a6ffffe6fde842c721ed5a4a39653712cf729ea4fb17693
```

## Verification

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest,DouyinLifeStoreResolverTest,DouyinOpenApiClientTest,YyOrderServiceImplTest,YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
76 tests passed

mvn -pl ruoyi-admin -am -DskipTests package
BUILD SUCCESS
```

Production service:

```text
systemctl is-active yingyue-admin.service -> active
https://api.evanshine.me/ -> 200
https://api.evanshine.me/prod-api/ -> 200 with RuoYi 404 JSON
store-admin API login -> success
GET /yy/order/list?pageNum=1&pageSize=5000&source=DOUYIN_LIFE -> total 1003
```

Current production order data after deploy:

```text
DOUYIN_LIFE rows: 1003
missing externalPoiId: 952
missing externalSkuId: 923
missing arrivalTime: 1003
top store group: 2063619430924812290 / 1003
```

Direct production database read-only check:

```text
order_time range: 2026-06-07 21:50:26.662 to 2026-06-12 16:04:04.872
create_time range: 2026-06-07 21:50:26.664 to 2026-06-12 16:04:04.872
POI distribution: blank 952, 7228779175929186363 51
SKU distribution: blank 923, 1765136728900670 43, 1765149825801219 30, 1765138590111751 5, 1765154542674967 2
store distribution: 2063619430924812290 / 1003
```

## Notes

- This deploy does not change database schema and does not remap historical orders by guesswork.
- New incoming or re-synced DOUYIN_LIFE orders can now preserve `external_poi_id`, `external_sku_id`, `slot_date`, `slot_start_time`, `slot_end_time`, and derived `arrival_time` when those fields are present in the platform payload.
- Historical 1003 orders still need a controlled compensation sync/backfill before the homepage and appointment screens can show real store-level grouping reliably. A safe next pass is to retry by small time windows or exact `order_id` batches and only remap rows with unambiguous POI/SKU mapping.

## 2026-06-16 18:26 Update: Backfill Endpoint Deployed And Run

Backend `api.evanshine.me` was redeployed again from branch
`yingyue-closed-loop-optimization-20260603` after GitHub sync:

```text
github head: 1e7cf881e15938a19aace30f18c50d25203756eb
service: yingyue-admin.service
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
release: /opt/yingyue/releases/yingyue-api-douyin-order-backfill-1e7cf88-20260616-remote
backup: /opt/yingyue/backups/yingyue-api-douyin-order-backfill-1e7cf88-20260616-pre
sha256: 913f8c7d9c9dbfc3332adc68393bc13acf52dba3ea6e546fd8161641a40e4c48
```

Verification:

```text
systemctl is-active yingyue-admin.service -> active
https://api.evanshine.me/ -> 200
https://api.evanshine.me/prod-api/ -> 200 with RuoYi 404 JSON
https://studio.evanshine.me/login -> 200
store-admin API login -> success, token redacted
POST /yy/channel/DOUYIN_LIFE/orders/backfill -> 200
```

Production backfill run:

```text
Initial small run:
POST /yy/channel/DOUYIN_LIFE/orders/backfill {"maxTotal":20}
result: SYNCED, total=20, updated=20, failed=0
missing externalPoiId: 923 -> 903
missing externalSkuId: 923 -> 903

Full run:
POST /yy/channel/DOUYIN_LIFE/orders/backfill {"maxTotal":5000}
result: SYNCED, total=1005, updated=503, failed=2
missing externalPoiId: 423 -> 0
missing externalSkuId: 423 -> 0
```

Current production DOUYIN_LIFE order snapshot after backfill:

```text
DOUYIN_LIFE rows: 1003
missing externalPoiId: 0
missing externalSkuId: 0
missing arrivalTime: 1003
inventoryStatus NEED_MAPPING: 1003
POI distribution: 7228779175929186363 / 1001, 7555006097638393865 / 2
top SKU distribution: 1765136728900670 / 606, 1765149825801219 / 169, 1769659221370883 / 50, 1768849478367259 / 45, 1772297209231363 / 33
store distribution: 2063619430924812290 / 1003
```

Important conclusion:

- The historical POI/SKU fields are now filled for all 1003 synchronized `DOUYIN_LIFE` orders.
- Store remapping intentionally did not guess: all rows remain `NEED_MAPPING` because the current product/POI/SKU mapping does not uniquely resolve those historical orders to the real four `yy_store` rows yet.
- The next data step is to configure or import unique `yy_channel_product_mapping` rows for `DOUYIN_LIFE` with real `store_id + external_poi_id + external_sku_id`, then rerun `orders/backfill` to safely move orders into real stores.
- `arrivalTime` is still blank because the saved platform payloads do not expose enough reservation slot fields for these historical rows; new syncs will fill it when Douyin payload includes slot date/start time.

## Rollback

```bash
cp /opt/yingyue/backups/yingyue-api-douyin-order-fields-d76b6dd-20260616-170602-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
chown yingyue:yingyue /opt/yingyue/backend/ruoyi-admin.jar
systemctl restart yingyue-admin.service
```
