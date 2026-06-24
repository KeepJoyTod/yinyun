# Studio Workbench Dashboard Store Scope Deploy - 2026-06-17

## Release

- Commit: `81b01cd fix(studio): scope dashboard by selected store`
- Release: `prod-81b01cd-dashboard-store-scope-20260617`
- Scope: frontend only, `studio-workbench`
- Site dir: `/var/www/studio.evanshine.me`
- Remote package: `/opt/yingyue/releases/prod-81b01cd-dashboard-store-scope-20260617/studio-workbench.zip`
- Backup: `/opt/yingyue/backups/20260617-201340-pre-studio-workbench-prod-81b01cd-dashboard-store-scope-20260617`

## Changes

- Dashboard top now has an `all stores / selected store` scope control.
- Dashboard deep links sync `storeId` into the URL.
- Dashboard finance calls `GET /yy/dashboard/finance?date=...&storeId=...`.
- Schedule and booking inventory refresh with the same selected store scope.
- Local cached finance is only reused when both date and store scope match.

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/shared/stores/appStore.contract.test.ts
```

Result: `2 passed`, `41 passed`.

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_RELEASE_ID='prod-81b01cd-dashboard-store-scope-20260617'
npm --prefix studio-workbench run build
```

Result: `vue-tsc -b && vite build` passed. Existing Vite chunk-size warning remains.

## Browser Check

Local demo preview confirmed:

```text
http://127.0.0.1:5192/
- homepage renders 门店运营看板 / 经营概况
- store buttons visible: 全部门店, 影约云深圳旗舰店, 影约云香港交付点
- clicking 影约云深圳旗舰店 changes URL to ?storeId=1
- dashboard text changes from 全门店汇总 to 影约云深圳旗舰店
- finance and channel totals narrow from all-store demo totals to single-store demo totals
```

## Deploy

```text
release=prod-81b01cd-dashboard-store-scope-20260617
backup=/opt/yingyue/backups/20260617-201340-pre-studio-workbench-prod-81b01cd-dashboard-store-scope-20260617
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
cp -a /opt/yingyue/backups/20260617-201340-pre-studio-workbench-prod-81b01cd-dashboard-store-scope-20260617/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
