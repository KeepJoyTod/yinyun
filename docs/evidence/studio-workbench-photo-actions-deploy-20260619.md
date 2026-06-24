# Studio Workbench Photo Actions Deploy - 2026-06-19

## Summary

- Release: `prod-949e639-photo-actions-20260619-0155`
- Git commit: `949e639 feat(studio): gate photo delivery actions`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deployment adds delivery-stage guards for the photo album action buttons in both the photo management page and the appointment order drawer.

## Code Changes

| Area | File | Change |
| --- | --- | --- |
| Shared rule helper | `studio-workbench/src/features/albums/photoMgmtOperations.ts` | Adds `buildAlbumActionAvailability(album)` for `notify/confirm/deliver` readiness and reasons |
| Photo management page | `studio-workbench/src/features/albums/PhotoMgmtView.vue` | Disables invalid album actions, shows the reason, and rechecks before calling store APIs |
| Appointment order drawer | `studio-workbench/src/features/orders/OrdersView.vue` | Reuses the same album action availability rules before calling album APIs |
| Tests | `photoMgmtOperations.test.ts`, `PhotoMgmtView.contract.test.ts`, `OrdersView.contract.test.ts` | Covers no album, no photos, no selection, ready-to-deliver, and already-delivered states |

## Behavior

| Album state | Notify customer | Confirm selection | Deliver files |
| --- | --- | --- | --- |
| No album selected | disabled: `请先选择相册` | disabled: `请先选择相册` | disabled: `请先选择相册` |
| No photos uploaded | disabled: `请先上传底片` | disabled: `请先上传底片` | disabled: `请先上传底片` |
| Photos uploaded, no selected photos | enabled | disabled: `请先等待客户选片` | disabled: `请先等待客户选片` |
| Photos selected, not delivered | enabled | enabled | enabled |
| Already delivered | enabled | disabled: `已交付无需重复确认` | disabled: `已交付无需重复发送` |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/albums/photoMgmtOperations.test.ts src/features/albums/PhotoMgmtView.contract.test.ts src/features/orders/OrdersView.contract.test.ts
# Test Files 3 passed
# Tests 71 passed

npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# passed
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. This is an existing bundle-size warning, not a deployment blocker.

## Production Build

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-949e639-photo-actions-20260619-0155'
npm --prefix studio-workbench run build
```

Local package:

```text
C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-949e639-photo-actions-20260619-0155.tgz
SIZE_BYTES=603085
SHA256=b24f5522241da6315ceea320138d0cb1c8f75ec2ab549759b084990a5fefd323
```

## Deploy

Remote:

```text
SERVER=103.24.216.8
RELEASE_DIR=/opt/yingyue/releases/prod-949e639-photo-actions-20260619-0155
BACKUP=/opt/yingyue/backups/20260619-015534-pre-prod-949e639-photo-actions-20260619-0155
SITE=/var/www/studio.evanshine.me
MARKER=prod-949e639-photo-actions-20260619-0155
SITE_FILES=111
ASSET_FILES=107
yingyue-admin.service=active
```

Nginx:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Online Smoke

```text
https://studio.evanshine.me/service/photos?cb=prod-949e639-photo-actions-20260619-0155 -> 200, marker=True, oldMarker=False
https://studio.evanshine.me/order/appointment?cb=prod-949e639-photo-actions-20260619-0155 -> 200, marker=True, oldMarker=False
https://studio.evanshine.me/dashboard/today?cb=prod-949e639-photo-actions-20260619-0155 -> 200, marker=True, oldMarker=False
```

## Boundaries

- Frontend-only deployment.
- No backend restart.
- No database migration.
- No Douyin OpenAPI reads or writes.
- No order, appointment, inventory, schedule, or album data writes during deployment.
