# Studio Workbench Joe666 Merchant UI Deploy - 2026-06-17

## Result

`studio-workbench` release `prod-f718bc5-joe666-merchant-20260617-1650` has been deployed to Hong Kong 2 at `https://studio.evanshine.me`.

This deployment updates only the studio workbench static files. It does not change backend services, database schema, Douyin OpenAPI configuration, nginx site config, OSS configuration, miniapp builds, or the admin site.

## Git

| Item | Value |
| --- | --- |
| Branch | `yingyue-closed-loop-optimization-20260603` |
| Code commit | `f718bc5 feat(studio): extract Joe666 merchant chrome UI` |
| Previous remote | `248cafb` |
| Pushed range | `248cafb..f718bc5` |

## Local Verification

```text
npm run test -- src/features/merchant/MerchantModuleChrome.contract.test.ts src/features/merchant/MerchantOverviewView.contract.test.ts src/features/stores/StoreView.contract.test.ts src/app/router/featureRegistry.contract.test.ts src/app/router/featureRegistry.access.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/api/backend.contract.test.ts src/shared/stores/appStore.contract.test.ts
-> 11 files, 128 tests passed

npm run build
-> passed
```

Build note: Vite reported the existing large chunk warning for `echarts-vendor`; this is not a build failure.

## Production Build

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-f718bc5-joe666-merchant-20260617-1650
npm run build
-> passed
```

Local package:

```text
C:\Users\Administrator\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-f718bc5-joe666-merchant-20260617-1650.zip
sha256=59475375143CDD22777827A60A55C0F9923B7ADCED5C0D6448F654351B1134FF
```

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Remote package | `/opt/yingyue/releases/studio-workbench-prod-f718bc5-joe666-merchant-20260617-1650.zip` |
| Release dir | `/opt/yingyue/releases/studio-workbench-prod-f718bc5-joe666-merchant-20260617-1650` |
| Backup | `/opt/yingyue/backups/20260617-165038-pre-studio-workbench-prod-f718bc5-joe666-merchant-20260617-1650` |
| Asset files | `79` |
| Frontend marker | `prod-f718bc5-joe666-merchant-20260617-1650` |

Remote deploy output:

```text
nginx -t -> successful
systemctl reload nginx -> successful
index_marker=6
asset_count=79
```

## Public HTTP Verification

```text
https://studio.evanshine.me/ -> 200, marker=True
https://studio.evanshine.me/login -> 200, marker=True
https://studio.evanshine.me/merchant/overview -> 200, marker=True
https://studio.evanshine.me/merchant/store -> 200, marker=True
https://studio.evanshine.me/order/appointment -> 200, marker=True
https://studio.evanshine.me/dashboard/today -> 200, marker=True
```

## Authenticated Browser Smoke

The smoke used the local workbench account file. No password or token is recorded.

```text
/merchant/overview:
- hasMerchantOverview=true
- hasQuickAccess=true
- hasRealDataMarker=true
- hasForbidden=false
- hasLogin=false

/merchant/store:
- hasMerchantChrome=true
- hasStoreManagement=true
- hasForbidden=false
- hasLogin=false
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-165038-pre-studio-workbench-prod-f718bc5-joe666-merchant-20260617-1650/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
