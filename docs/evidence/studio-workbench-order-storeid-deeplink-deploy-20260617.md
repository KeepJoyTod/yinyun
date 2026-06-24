# Studio Workbench Order StoreId Deep Link Deploy 2026-06-17

## Result

- Git commit deployed: `db50ba3 fix(studio): honor store id in order deep links`
- Release marker: `prod-db50ba3-order-storeid-deeplink-20260617`
- Target: HK2 `/var/www/studio.evanshine.me`
- Backup: `/opt/yingyue/backups/20260617-204634-pre-studio-workbench-prod-db50ba3-order-storeid-deeplink-20260617`

## Scope

- Frontend-only deploy for `studio-workbench`.
- No backend jar, database, nginx site config, or Douyin OpenAPI setting change.

## Verification

```text
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts
31 passed
```

```text
npm --prefix studio-workbench run build
passed; existing Vite large chunk warning only
```

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_RELEASE_ID=prod-db50ba3-order-storeid-deeplink-20260617
npm --prefix studio-workbench run build
passed; existing Vite large chunk warning only
```

## Deploy Evidence

```text
release=prod-db50ba3-order-storeid-deeplink-20260617
backup=/opt/yingyue/backups/20260617-204634-pre-studio-workbench-prod-db50ba3-order-storeid-deeplink-20260617
site=/var/www/studio.evanshine.me
index_marker=present
asset_marker=present
yingyue-admin.service=active
nginx config test=successful
```

## Public Smoke

```text
https://studio.evanshine.me/?cb=order-storeid -> 200, marker=True
https://studio.evanshine.me/dashboard/today?storeId=900000000000000200&cb=order-storeid -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&storeId=900000000000000200&cb=order-storeid -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-204634-pre-studio-workbench-prod-db50ba3-order-storeid-deeplink-20260617/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
