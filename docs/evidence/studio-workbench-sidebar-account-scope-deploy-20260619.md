# Studio Workbench Sidebar Account Scope Deploy - 2026-06-19

## Release

```text
commit: ebc55cd fix(studio): clean sidebar account scope display
branch: yingyue-closed-loop-optimization-20260603
release: prod-ebc55cd-sidebar-account-scope-20260619-171430
site: https://studio.evanshine.me
scope: frontend-only studio-workbench
```

## Scope

- Frontend static deployment only.
- Backend jar, database schema, employee authorization rows, and Douyin OpenAPI/SPI config were not changed.
- No order, appointment, inventory, product, album, employee, or log business data was written during smoke.

## Change Summary

| Area | Result |
| --- | --- |
| Bootstrap visible store scope | `studioAccessStore` now filters `DY-LIFE-DEFAULT` / “默认门店” so sidebar and permission summaries only count real operating stores. |
| Sidebar account copy | Placeholder/demo-like names such as “演示账号” no longer surface in the live workbench account card; `STORE_MANAGER` and other role codes render as Chinese labels. |
| Store scope summary | Sidebar bottom card now shows `4 家门店 · 滨州万达店` instead of including the internal transition store. |
| Contract coverage | Added store-scope filter test and sidebar copy contract assertions. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/shared/stores/studioAccessStore.test.ts src/shared/components/layout/Sidebar.access.contract.test.ts
# Test Files 2 passed
# Tests 10 passed

npm --prefix studio-workbench run build
# passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-ebc55cd-sidebar-account-scope-20260619-171430'
npm --prefix studio-workbench run build
# passed
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-ebc55cd-sidebar-account-scope-20260619-171430.zip
sha256: 6C5921A12EAAC81964EE343459EF5FE2783ADE611F913D7221D2C0219027B137
remote zip: /opt/yingyue/releases/studio-workbench-prod-ebc55cd-sidebar-account-scope-20260619-171430.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-ebc55cd-sidebar-account-scope-20260619-171430
backup: /opt/yingyue/backups/20260619-171331-pre-studio-workbench-prod-ebc55cd-sidebar-account-scope-20260619-171430
site dir: /var/www/studio.evanshine.me
site files: 5
release.txt: prod-ebc55cd-sidebar-account-scope-20260619-171430
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=prod-ebc55cd-sidebar-account-scope-20260619-171430
sidebar paragraphs after reload:
- Studio Workbench
- 门店管理员
- 门店管理员
- 滨州万达店
- 4 家门店 · 滨州万达店
```

Acceptance result:

- PASS: old sidebar copy `门店工作台演示账号`
- PASS: old raw role code `STORE_MANAGER`
- PASS: old store count `5 家门店 · 滨州万达店`
- PASS: new sidebar copy `门店管理员`
- PASS: new store summary `4 家门店 · 滨州万达店`

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-171331-pre-studio-workbench-prod-ebc55cd-sidebar-account-scope-20260619-171430/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
