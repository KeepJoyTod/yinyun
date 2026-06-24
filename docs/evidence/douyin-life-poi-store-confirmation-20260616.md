# Douyin Life POI Store Confirmation

GeneratedAt: 2026-06-16 19:10 +08:00

## Result

PASS for POI identity confirmation.

The two `DOUYIN_LIFE` POI IDs found in production historical order payloads were confirmed through the official Douyin Life OpenAPI from the Hong Kong 2 server exit IP.

## Official API Evidence

```text
endpoint: GET https://open.douyin.com/goodlife/v1/shop/poi/query/
server: 103.24.216.8
credential source: production DOUYIN_LIFE client_token flow, values redacted
```

Confirmed rows:

```text
POI 7228779175929186363
poi_name: 一悦照相馆(滨州吾悦店)
address: 渤海十八路长江三路交汇处吾悦金街二楼s-235号
yy_store: 900000000000000200 / BZ-WUYUE / 滨州吾悦店
OpenAPI logid examples: 20260616190246A6F1AAC18B698B4E8A97, 2026061619024721D0866640431742B44C

POI 7555006097638393865
poi_name: 一悦照相馆(威海智慧谷店)
address: 皇冠街道浦东路9-15号
yy_store: 900000000000000300 / WH-ZHIGU / 威海智慧谷店
OpenAPI logid examples: 20260616190250D5DB9D18398098036A1E, 20260616190250167FF9C6D304ABF65466
```

The same API response also listed known real POIs for `BZ-WANDA` and `ZB-WANXIANGHUI`, but the current production mapping skeleton only contains historical order mappings for the two POIs above. This activation therefore only touches those two confirmed POIs.

## Activation SQL

```text
script: backend/script/sql/postgres/postgres_douyin_life_poi_store_activation_20260616.sql
scope:
  7228779175929186363 -> store_id 900000000000000200, mapping_status ACTIVE
  7555006097638393865 -> store_id 900000000000000300, mapping_status ACTIVE
order update method: POST /yy/channel/DOUYIN_LIFE/orders/backfill
```

Safety guards:

```text
requires yy_store BZ-WUYUE and WH-ZHIGU rows to exist
requires 13 active skeleton rows for POI 7228779175929186363 before activation
requires 1 active skeleton row for POI 7555006097638393865 before activation
does not directly update yy_order
does not activate unconfirmed POIs
```

## Production Execution

Completed on Hong Kong 2 production database.

```text
server: 103.24.216.8
database container: yingyue-postgres
database: yingyue_cloud
backup: /opt/yingyue/backups/douyin-life-poi-store-activation-20260616-1918/poi-store-activation-tables.sql
backup sha256: 16f529c429dcb4006fdf96460b0db1191b97cc402bbad49580b0a6f06c640467
```

Pre-check:

```text
yy_store:
  900000000000000200 / BZ-WUYUE / 滨州吾悦店 / status=0
  900000000000000300 / WH-ZHIGU / 威海智慧谷店 / status=0

yy_channel_product_mapping:
  POI 7228779175929186363 -> store_id=null, NEED_MAPPING, 13 rows
  POI 7555006097638393865 -> store_id=null, NEED_MAPPING, 1 row

yy_order:
  DOUYIN_LIFE total=1003
  NEED_MAPPING=1003
  BZ-WUYUE=0
  WH-ZHIGU=0
  old default store=1003
```

SQL activation result:

```text
yy_channel_product_mapping:
  POI 7228779175929186363 -> store_id=900000000000000200, ACTIVE, 13 rows
  POI 7555006097638393865 -> store_id=900000000000000300, ACTIVE, 1 row
```

Backfill:

```text
POST /yy/channel/DOUYIN_LIFE/orders/backfill {"maxTotal":5000}
result: SYNCED
total scanned: 1005
updated: 1003
failed: 2
message: 已扫描 1005 条映射，更新 1003 条，失败 2 条
```

The `failed=2` rows are orphan `yy_channel_order_mapping` rows without a local `yy_order` target. They do not affect the 1003 effective synchronized `DOUYIN_LIFE` orders.

## Production Verification

Final distribution:

```text
yy_channel_product_mapping:
  7228779175929186363 -> 900000000000000200 / ACTIVE / 13 rows
  7555006097638393865 -> 900000000000000300 / ACTIVE / 1 row

yy_order:
  DOUYIN_LIFE total: 1003
  POI 7228779175929186363 -> store_id 900000000000000200 / inventory_status blank / 1001 rows
  POI 7555006097638393865 -> store_id 900000000000000300 / inventory_status blank / 2 rows
  inventory_status NEED_MAPPING: 0
  old default store 2063619430924812290: 0
  status/pay_status: PENDING + PAID = 1003 rows

sync log:
  api_name=life_order_field_backfill
  success=1
  create_time=2026-06-16 19:19:15.094
```

## Boundary

This was a data activation and backfill step, not a backend deploy. The resolver already required `mapping_status='ACTIVE'`, so the original `NEED_MAPPING` skeleton rows were inert until this controlled activation.
