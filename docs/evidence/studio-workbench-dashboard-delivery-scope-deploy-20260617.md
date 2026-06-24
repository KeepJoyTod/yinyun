# Studio Workbench Dashboard Delivery Scope Deploy - 2026-06-17

## Release

- Commit: `49de635 fix(studio): scope dashboard delivery tasks by store`
- Release: `prod-49de635-dashboard-delivery-scope-20260617`
- Scope: frontend only, `studio-workbench`
- Site dir: `/var/www/studio.evanshine.me`
- Remote package: `/opt/yingyue/releases/prod-49de635-dashboard-delivery-scope-20260617/studio-workbench.zip`
- Backup: `/opt/yingyue/backups/20260617-203711-pre-studio-workbench-prod-49de635-dashboard-delivery-scope-20260617`

## Changes

- Dashboard delivery task cards now follow the selected store scope.
- `待上传` and `待选片` resolve store ownership through the linked order behind each album.
- `待交付` resolves store ownership through the linked order behind each selection link, falling back through the linked album.
- Single-store scope excludes albums/selection links when no linked order can prove store ownership.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts
```

Result: `1 passed`, `27 passed`.

```powershell
npm --prefix studio-workbench run build
```

Result: `vue-tsc -b && vite build` passed. Existing Vite chunk-size warning remains.

## Browser Check

Local demo preview:

```text
http://127.0.0.1:5192/?storeId=2
- scope text shows 影约云香港交付点
- 待上传 = 0
- 待选片 = 0
- 待交付 = 0
```

This confirms the delivery cards no longer include tasks from the Shenzhen demo store when the Hong Kong store is selected.

## Deploy

```text
release=prod-49de635-dashboard-delivery-scope-20260617
backup=/opt/yingyue/backups/20260617-203711-pre-studio-workbench-prod-49de635-dashboard-delivery-scope-20260617
asset_marker=present
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Public Smoke

```text
https://studio.evanshine.me/ -> 200, marker=True
https://studio.evanshine.me/?storeId=1 -> 200, marker=True
https://studio.evanshine.me/dashboard/today -> 200, marker=True
yingyue-admin.service=active
studio_asset=present
index_marker=present
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-203711-pre-studio-workbench-prod-49de635-dashboard-delivery-scope-20260617/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
