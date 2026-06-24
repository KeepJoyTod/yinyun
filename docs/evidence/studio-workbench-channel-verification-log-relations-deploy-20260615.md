# Studio Workbench Channel Verification Log Relations Deploy 2026-06-15

## Result

`d84b405 feat(studio): link channel verification logs` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, Douyin Life SPI callbacks, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `studio-workbench/dist/studio-workbench-d84b405.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-d84b405.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-d84b405` |
| Backup | `/opt/yingyue/backups/20260615-132046-pre-studio-workbench-d84b405` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- `/order/verification` now correlates Douyin Life acceptance cases with recent `DOUYIN_LIFE` channel sync logs.
- Exact `logid/requestId` matches are shown before API-category candidates.
- Acceptance case details now show the matched log evidence and a copyable troubleshooting package.
- The page remains read-only for real verification; it does not trigger real order verification from the staff workbench.

## Verification

Local:

```text
npm test -- channelVerificationOperations.test.ts -> 1 file, 4 tests passed
npm test -- channelVerificationOperations.test.ts ChannelVerificationView.contract.test.ts LogsView.contract.test.ts logsOperations.test.ts -> 4 files, 22 tests passed
npm test -> 70 files, 373 tests passed
npm run build -> passed; 2830 modules transformed; built in 3.36s
git diff --check -> passed; only Windows LF/CRLF notices before commit
Browser local smoke -> /order/verification has 渠道核销, 复制排障包, 日志匹配, consoleErrors=0
```

Remote deploy output:

```text
commit=d84b405
release=/opt/yingyue/releases/studio-workbench-d84b405
backup=/opt/yingyue/backups/20260615-132046-pre-studio-workbench-d84b405
site=/var/www/studio.evanshine.me
uploaded_files=91
asset_files=88
nginx=ok
site_index=ok
```

Public HTTP checks:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/order/verification -> 200 text/html
https://studio.evanshine.me/settings/logs -> 200 text/html
https://studio.evanshine.me/service/photos -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
```

Production browser smoke:

```text
https://studio.evanshine.me/order/verification
asset=https://studio.evanshine.me/assets/index-CCFuRX9m.js
hasHeading=true
hasCopyPackage=true
hasLogMatch=true
hasAcceptance=true
hasDemoNotice=true
consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-132046-pre-studio-workbench-d84b405/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Remaining T05 / Platform Work

- Production API-mode smoke still needs an authenticated staff session to verify real `/yy/channel/DOUYIN_LIFE/acceptance-cases`, `/sync-health`, and `/yy/channelSyncLog/list` responses.
- Douyin Life final acceptance still depends on real platform-triggered logids for SPI issuing, order creation/payment callbacks, confirmation, and whole-order verification.
- Real verification execution remains intentionally unavailable in the staff workbench until permission, ownership checks, idempotency, and audit requirements are complete.
