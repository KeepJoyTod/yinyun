# Douyin Life All Confirmed POI Anchor Evidence

GeneratedAt: 2026-06-16 19:50 +08:00

## Result

PASS.

All confirmed Douyin Life POIs that match the current four real `yy_store` rows now have active store mappings.

## Scope

Existing active POI/SKU mappings:

```text
7228779175929186363 -> BZ-WUYUE / 900000000000000200 / 13 SKU rows
7555006097638393865 -> WH-ZHIGU / 900000000000000300 / 1 SKU row
```

New POI-only anchors:

```text
7342410951733282851 -> BZ-WANDA / 900000000000000100 / anchor row
7628187182788544538 -> ZB-WANXIANGHUI / 900000000000000400 / anchor row
```

Not activated:

```text
7407304729216157722 -> 一悦照相馆(滨州店)
```

Reason: this POI is not one of the current four seeded `yy_store` rows. It must not be guessed into `BZ-WANDA` or `BZ-WUYUE`.

## Production Execution

```text
script: backend/script/sql/postgres/postgres_douyin_life_all_confirmed_poi_anchor_20260616.sql
server: 103.24.216.8
database container: yingyue-postgres
database: yingyue_cloud
backup: /opt/yingyue/backups/douyin-life-all-confirmed-poi-anchor-20260616-1950/poi-anchor-tables.sql
backup sha256: 73fe7a6b81874ca0bb38749a14308ab9df0e0e84b77235d8b1c962aba8cceed6
```

## Verification

Production mapping verification:

```text
7228779175929186363 -> store=900000000000000200, ACTIVE, 13 SKU rows
7342410951733282851 -> store=900000000000000100, ACTIVE, POI anchor
7555006097638393865 -> store=900000000000000300, ACTIVE, 1 SKU row
7628187182788544538 -> store=900000000000000400, ACTIVE, POI anchor
```

Production order safety verification:

```text
DOUYIN_LIFE orders: 1003
NEED_MAPPING: 0
BZ-WUYUE: 1001
WH-ZHIGU: 2
BZ-WANDA: 0
ZB-WANXIANGHUI: 0
old default store: 0
```

The anchor rows did not rewrite existing orders. They only allow future/newly synced orders with those POIs to resolve to the correct real store when no exact POI+SKU mapping exists yet.
