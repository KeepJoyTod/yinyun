# Studio Workbench Settings Current Store Copy Deploy - 2026-06-19

## Release

```text
commit: 97ffcb6 fix(studio): align settings default schedule scope copy
release: prod-97ffcb6-settings-current-store-copy-20260619-092939
site: https://studio.evanshine.me
branch: yingyue-closed-loop-optimization-20260603
```

## Scope

- Frontend-only `studio-workbench` deployment.
- No backend jar replacement.
- No database migration.
- No Douyin OpenAPI/SPI call.
- No business data write during smoke.

## Change

| Area | Files | Result |
| --- | --- | --- |
| Settings runtime copy | `studio-workbench/src/features/settings/SettingsView.vue` | Replaced outdated "default schedule opens today + all stores" wording with "today + current store". |
| Contract test | `studio-workbench/src/features/settings/SettingsView.contract.test.ts` | Locks that the settings page no longer describes the staff schedule as an all-store default. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/settings/SettingsView.contract.test.ts
# Test Files 1 passed
# Tests 6 passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-97ffcb6-settings-current-store-copy-20260619-092939.zip
size bytes: 699324
sha256: AA7C11DAF5492EAAFCF0918CC2A4B87C59BFB6660F189C7008552C25FE6CA455
remote zip: /opt/yingyue/releases/studio-workbench-prod-97ffcb6-settings-current-store-copy-20260619-092939.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-97ffcb6-settings-current-store-copy-20260619-092939
backup: /opt/yingyue/backups/20260619-093022-pre-studio-workbench-prod-97ffcb6-settings-current-store-copy-20260619-092939
site dir: /var/www/studio.evanshine.me
site files: 5
release.txt: prod-97ffcb6-settings-current-store-copy-20260619-092939
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/settings/workbench?cb=prod-97ffcb6-settings-current-store-copy-20260619-092939 -> 200, marker=True
https://studio.evanshine.me/merchant/micro-forms/new?cb=prod-97ffcb6-settings-current-store-copy-20260619-092939 -> 200, marker=True
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-093022-pre-studio-workbench-prod-97ffcb6-settings-current-store-copy-20260619-092939/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
