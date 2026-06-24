# Studio Workbench Cache-Busted Login Copy Deploy 2026-06-16

## Result

`studio-workbench` has been rebuilt and redeployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, nginx site config, OSS configuration, miniapp builds, or the system admin site.

## What Changed

- API-mode login copy now says the current testing flow uses store account and password.
- Captcha remains supported but is shown only when `VITE_STUDIO_LOGIN_CAPTCHA=true` and the backend enables it.
- Vite build assets are now emitted under a release-scoped directory from `VITE_STUDIO_RELEASE_ID`, preventing stale browser caches from reusing an old route chunk with the same filename.

## Root Cause

After the first deploy, the server had the corrected `StaffLoginView` bundle, but the in-app browser still displayed the old text because the lazy route chunk URL stayed `/assets/StaffLoginView-BaA-UFMX.js`. The fix is not to ask users to clear cache; the production bundle now uses `/assets/studio-20260616-1044/...` URLs so each release can invalidate route chunks by URL.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-cachebust-login-copy-20260616-1044.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-cachebust-login-copy-20260616-1044.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-cachebust-login-copy-20260616-1044` |
| Backup | `/opt/yingyue/backups/20260616-104543-pre-studio-workbench-cachebust-login-copy-20260616-1044` |
| Release asset dir | `/assets/studio-20260616-1044/` |

## Verification

Local:

```text
npm test -- --run src/app/viteConfig.contract.test.ts src/features/auth/StaffLoginView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/shared/stores/appStore.contract.test.ts src/shared/api/backend.contract.test.ts
-> 8 files passed, 100 tests passed

powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-studio-api-contracts.ps1
-> studio api contracts: PASS

VITE_STUDIO_RELEASE_ID=studio-20260616-1044 npm run build
-> passed
```

Remote deploy output:

```text
release=/opt/yingyue/releases/studio-workbench-cachebust-login-copy-20260616-1044
backup=/opt/yingyue/backups/20260616-104543-pre-studio-workbench-cachebust-login-copy-20260616-1044
site=/var/www/studio.evanshine.me
site_files=92
asset_files=89
scoped_asset_files=89
index_marker=assets/studio-20260616-1044/index-Cra59_Q-.js
staff_bundle=/var/www/studio.evanshine.me/assets/studio-20260616-1044/StaffLoginView-CGxqOILX.js
old_login_copy=
nginx=ok
```

Public HTTP checks:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/dashboard/today -> 200 text/html
https://studio.evanshine.me/settings/logs -> 200 text/html
https://studio.evanshine.me/order/verification -> 200 text/html
```

Bundle markers:

```text
index has /assets/studio-20260616-1044/ -> true
/assets/studio-20260616-1044/StaffLoginView-CGxqOILX.js -> 200
current account/password copy -> true
old password+captcha-required copy -> false
```

Browser smoke:

```text
https://studio.evanshine.me/login?cb=studio-20260616-1044
side panel present -> true
form present -> true
new login copy visible -> true
old login copy visible -> false
captcha input visible -> false
release-scoped script loaded -> true
```

## Known Residual Risks

- Authenticated Dashboard/Orders/Channel Verification real-data smoke still requires a valid staff session and should not be marked full PASS from public route probes alone.
- Douyin Life final platform acceptance still requires real `X-Bytedance-Logid` or OpenAPI `extra.logid` evidence.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260616-104543-pre-studio-workbench-cachebust-login-copy-20260616-1044/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
