# Studio Workbench Reschedule Inventory Precheck Deploy 2026-06-15

## Result

`27d62a3 feat(studio): precheck reschedule inventory` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-27d62a3.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-27d62a3.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-27d62a3` |
| Backup | `/opt/yingyue/backups/20260615-084406-pre-studio-workbench-27d62a3` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- Order detail reschedule section now previews the target inventory slot.
- Full, conflicted, or inactive target slots block the save action before submitting.
- The conflict state shows slot time, capacity, confirmed count, conflict count, and existing slot remark.
- Safe slots remain submittable, with backend/API mode still responsible for final validation.

## Verification

Local:

```text
npm test -- orderOperations.test.ts OrdersView.contract.test.ts -> 4 files, 42 tests passed
npm test -> 66 files, 351 tests passed
npm run build -> passed; 2828 modules transformed; built in 3.34s
git diff --check -> passed; only Windows LF/CRLF notices before commit
```

Remote deploy output:

```text
commit=27d62a3
release=/opt/yingyue/releases/studio-workbench-27d62a3
backup=/opt/yingyue/backups/20260615-084406-pre-studio-workbench-27d62a3
site=/var/www/studio.evanshine.me
uploaded=91
assets=88
nginx -t -> successful
```

Public HTTP checks:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/service/photos -> 200 text/html
https://studio.evanshine.me/service/selection -> 200 text/html
https://studio.evanshine.me/settings/logs -> 200 text/html
```

Production browser smoke:

```text
https://studio.evanshine.me/order/appointment?q=YY202606100001&quick=all
rowCount=1
target reschedule time=15:30
hasConflictSlot=true
hasConflictCapacity=true
hasConflictHint=true
hasConflictRemark=true
buttonText=请先调整改期时段
buttonDisabled=true
consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-084406-pre-studio-workbench-27d62a3/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
