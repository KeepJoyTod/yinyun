# Studio Workbench Polish Deploy 2026-06-16

## Result

`studio-workbench` has been rebuilt in real API mode and deployed to `https://studio.evanshine.me`.

This deploy updates only the static files under `/var/www/studio.evanshine.me`. It does not deploy the backend work-order skeleton, does not execute the review-only SQL, and does not change database schema, nginx site config, OSS configuration, miniapp builds, or the admin site.

## Git

| Item | Value |
| --- | --- |
| Branch | `yingyue-closed-loop-optimization-20260603` |
| Deployed commit | `ac0e89e feat(yy): add work order skeleton` |
| Previous remote commit before push | `bad2d96 fix(studio): load all synchronized orders from appointment view` |
| Push | `bad2d96..ac0e89e` pushed to GitHub |

## Build

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-ac0e89e-studio-polish-20260616
npm run build
-> passed
```

Local artifact:

```text
C:\Users\Administrator\AppData\Local\Temp\yingyue-deploy\studio-workbench-polish-ac0e89e-20260616-152223.zip
sha256=430B329D7DC48A0E3E6CAE3CE934629EA0BD2D06CB019BA3D3A9274FED178F81
```

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Remote package | `/opt/yingyue/releases/studio-workbench-polish-ac0e89e-20260616-152223.zip` |
| Release dir | `/opt/yingyue/releases/studio-workbench-polish-ac0e89e-20260616-152223` |
| Backup | `/opt/yingyue/backups/20260616-152507-pre-studio-workbench-polish-ac0e89e-20260616-152223` |
| Site files | `92` |
| Asset dir | `prod-ac0e89e-studio-polish-20260616` |
| Site index mtime | `2026-06-16 15:21:12 +0800` |

Remote deploy output:

```text
nginx -t -> successful
systemctl reload nginx -> successful
```

## Public HTTP

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/dashboard/today -> 200 text/html
https://studio.evanshine.me/service/photos -> 200 text/html
https://studio.evanshine.me/settings/logs -> 200 text/html
```

HTTP probe evidence:

```text
docs/evidence/studio-workbench-acceptance-20260616-polish.md
docs/evidence/studio-workbench-acceptance-20260616-polish.json
```

## Browser Smoke

Checked `https://studio.evanshine.me/login?cb=prod-ac0e89e-studio-polish-20260616` in the in-app browser.

```text
title=影约云门店工作台
release asset present=yes
script=/assets/prod-ac0e89e-studio-polish-20260616/index-Buhh8hP7.js
style=/assets/prod-ac0e89e-studio-polish-20260616/index-CPs9nHEy.css
captcha text visible=no
console errors=0
login form visible=yes
```

The browser smoke did not submit login credentials.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260616-152507-pre-studio-workbench-polish-ac0e89e-20260616-152223/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
