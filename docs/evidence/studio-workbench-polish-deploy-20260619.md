# Studio Workbench Polish Deploy - 2026-06-19

## Release

```text
commit: 217b054 feat(studio): refine workbench operations polish
branch: yingyue-closed-loop-optimization-20260603
release: prod-217b054-workbench-polish-20260619-130931
site: https://studio.evanshine.me
scope: frontend-only studio-workbench
```

## Scope

- Frontend static deployment only.
- Backend jar, database, Douyin OpenAPI/SPI settings, and nginx site config were not changed.
- No order, appointment, inventory, product, album, or micro-form business data was written during deployment smoke.

## Change Summary

| Area | Result |
| --- | --- |
| Schedule/dashboard | Keeps half-hour slot grouping and clearer slot/order display. |
| Orders | Staff-facing labels are Chinese; order detail actions keep truthful cancel/reschedule/photo boundaries. |
| Photo management | Selection link actions route to `/service/selection`; no fake "sync to selection system" copy. |
| Merchant/product/tool pages | Visible internal labels such as `Next Action`, `Product Detail`, `Service Groups`, `Form Builder`, and `QR Preview` were replaced with staff-facing Chinese copy. |
| Fake data cleanup | Removed unused `merchantMockData.ts` so Joe/Figma sample merchant rows cannot leak into the real workbench. |

## Local Verification

```powershell
npm --prefix studio-workbench run test
# Test Files 107 passed
# Tests 683 passed

git diff --check
# exit 0; Windows line-ending warnings only

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-217b054-workbench-polish-20260619-130931'
npm --prefix studio-workbench run build
# vue-tsc + vite build passed
```

## Package

```text
local zip: D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-217b054-workbench-polish-20260619-130931.zip
size bytes: 520723
sha256: 1D092CC1DA3F8EA66DC02B3D3A87E1AE3E064A5ECA2DFAF41E1C55BCA1ECF017
remote zip: /opt/yingyue/releases/studio-workbench-prod-217b054-workbench-polish-20260619-130931.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-217b054-workbench-polish-20260619-130931
backup: /opt/yingyue/backups/20260619-131048-pre-studio-workbench-prod-217b054-workbench-polish-20260619-130931
site dir: /var/www/studio.evanshine.me
site files: 109
release.txt: prod-217b054-workbench-polish-20260619-130931
marker count: 8
yingyue-admin.service: active
nginx -t: successful
```

## Online Static Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/order/staff-booking?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/service/photos?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/service/selection?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/tools/share-links?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-pages?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/merchant/decoration?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/product/card-management?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
https://studio.evanshine.me/product/addon?cb=prod-217b054-workbench-polish-20260619-130931 -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-131048-pre-studio-workbench-prod-217b054-workbench-polish-20260619-130931/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
