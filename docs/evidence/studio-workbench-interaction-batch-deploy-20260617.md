# Studio Workbench Interaction Batch Deploy 2026-06-17

## Result

- Git commit deployed: `d1f1f36 fix(studio): preserve store scope in workbench flows`
- Release marker: `prod-d1f1f36-studio-interaction-batch-20260617`
- Target: HK2 `/var/www/studio.evanshine.me`
- Backup: `/opt/yingyue/backups/20260617-210336-pre-studio-workbench-prod-d1f1f36-studio-interaction-batch-20260617`

## Scope

- Frontend-only deploy for `studio-workbench`.
- Backend jar, database, nginx site config, and Douyin OpenAPI settings unchanged.

## Changes

- Order console manual entry button now says `新增预约`.
- Advanced order store filter includes `全部门店`.
- Dashboard inventory entry carries the selected real `storeId`.
- Schedule order deep links carry `storeId=<yy_store.id>` while preserving `astore=<store name>`.

## Verification

```text
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
3 passed, 72 passed
```

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_RELEASE_ID=prod-d1f1f36-studio-interaction-batch-20260617
npm --prefix studio-workbench run build
passed; existing Vite chunk-size warning only
```

## Artifact

```text
studio-workbench-prod-d1f1f36-studio-interaction-batch-20260617.zip
size=584687
sha256=9df6117da7650091c89e602e0cf9d419350ea4ccec1dd20973fbe20f0f61260b
```

## Deploy Evidence

```text
release=prod-d1f1f36-studio-interaction-batch-20260617
backup=/opt/yingyue/backups/20260617-210336-pre-studio-workbench-prod-d1f1f36-studio-interaction-batch-20260617
sha256=9df6117da7650091c89e602e0cf9d419350ea4ccec1dd20973fbe20f0f61260b
nginx config test=successful
yingyue-admin.service=active
asset_marker=present
index_marker=present
```

## Public Smoke

```text
https://studio.evanshine.me/?cb=interaction-batch -> 200, marker=True
https://studio.evanshine.me/dashboard/today?storeId=900000000000000200&cb=interaction-batch -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&storeId=900000000000000200&cb=interaction-batch -> 200, marker=True
https://studio.evanshine.me/merchant/inventory?date=2026-06-17&storeId=900000000000000200&cb=interaction-batch -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-210336-pre-studio-workbench-prod-d1f1f36-studio-interaction-batch-20260617/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
