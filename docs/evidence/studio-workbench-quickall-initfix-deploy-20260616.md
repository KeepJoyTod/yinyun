# Studio Workbench Quick-All Init Fix Deploy Evidence

GeneratedAt: 2026-06-16 16:42 +08:00

## Result

PASS.

Production `https://studio.evanshine.me/order/appointment?quick=all` now loads the real synchronized order ledger after login:

```text
release: studio-workbench-quickall-initfix-20260616-163750
static marker: prod-quickall-initfix-20260616
route: /order/appointment?quick=all&cb=quickall-initfix-20260616
visible order count: 1003
table rows observed: 1003
api mode: API 已连接
console errors: 0
```

## What Changed

- Fixed `OrdersView.vue` direct-open behavior for `quick=all`.
- Root cause: the first quick-all load could run before `appStore.bootstrap()` finished. Bootstrap then reloaded today's orders and overwrote the all-order cache with 0 rows.
- Fix: `loadAllOrdersFromQuery()` now waits for `appStore.initialized`, skips demo mode, and uses `lastAllOrdersQueryKey` to avoid duplicate loads for the same URL.
- Added contract coverage in `OrdersView.contract.test.ts`.
- Added missing audit columns to `postgres_yy_employee_store_migration_20260616.sql`.
- Added production hotfix SQL for store-admin scope and DOUYIN_LIFE mapping fields.

## Verification

```text
npm test -- --run src/features/orders/OrdersView.contract.test.ts
26 passed

npm test -- --run src/features/orders src/shared/stores/appStore.contract.test.ts src/shared/api/backend.contract.test.ts
92 passed

npm test
421 passed

VITE_STUDIO_DEMO=false VITE_API_BASE_URL=https://api.evanshine.me VITE_STUDIO_RELEASE_ID=prod-quickall-initfix-20260616 npm run build
build passed; only Vite large chunk warning
```

Production HTTP probes:

```text
/ -> 200
/login -> 200
/order/appointment?quick=all -> 200
/dashboard/today -> 200
/settings/workbench -> 200
```

Production API smoke with `store-admin`:

```text
loginOk: true
bootstrapStoreCount: 5
orderRows: 1003
orderTotal: 1003
douyinLifeRows: 1003
```

## Deployment

```text
server: 103.24.216.8
site: /var/www/studio.evanshine.me
package: C:\Users\ADMINI~1\AppData\Local\Temp\studio-workbench-quickall-initfix-20260616-163750.tar.gz
sha256: 8DD2D9EB02F1B0F7CA300FB2118B11F8E95552FD4142A35B011A87AE19F8DCBF
remote package: /opt/yingyue/releases/studio-workbench-quickall-initfix-20260616-163750.tar.gz
release dir: /opt/yingyue/releases/studio-workbench-quickall-initfix-20260616-163750
backup dir: /opt/yingyue/backups/studio-workbench-quickall-initfix-20260616-163750-pre
nginx -t: successful
systemctl reload nginx: successful
```

Rollback:

```bash
cp -a /opt/yingyue/backups/studio-workbench-quickall-initfix-20260616-163750-pre/. /var/www/studio.evanshine.me/
nginx -t && systemctl reload nginx
```

## Current Data State

- `yy_order` contains 1003 real `DOUYIN_LIFE` orders.
- All 1003 are `PENDING` and `PAID`.
- All 1003 currently lack arrival time, so the order page marks them as missing-arrival anomaly.
- All 1003 currently belong to `DY-LIFE-DEFAULT`, because production order rows do not yet carry enough external POI/SKU mapping data to safely assign them to the four real stores.
- Real stores visible in workbench: `BZ-WANDA`, `BZ-WUYUE`, `WH-ZHIGU`, `ZB-WANXIANGHUI`, plus `DY-LIFE-DEFAULT`.

## Remaining Work

Do not force these 1003 orders into four stores by guesswork. Next step is to obtain/confirm DOUYIN_LIFE POI/SKU mapping and then run a controlled remap:

1. Fill `yy_channel_product_mapping.external_poi_id` and `external_sku_id` for each real store/product.
2. Ensure incoming/synced orders preserve external POI/SKU on `yy_order`.
3. Re-run store resolver and remap only orders with unambiguous POI/SKU.
4. Re-check homepage business summary, today appointments, and appointment-order aggregation.
