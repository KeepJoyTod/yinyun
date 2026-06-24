# Studio Workbench Export Query Precision Deploy 2026-06-15

## Result

`2f1eddf feat(studio): export orders with precise backend filters` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-2f1eddf.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-2f1eddf.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-2f1eddf` |
| Backup | `/opt/yingyue/backups/20260615-103500-pre-studio-workbench-2f1eddf` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- Order export query now forwards `keyword` to `/yy/order/export`.
- Supported booking method labels now map to backend `bookingMethod` values: `人工预约/H5预约/小程序/App/渠道同步`.
- Unsupported front-end-only filters remain blocked: service product, amount range, and multi-status.
- Demo mode still blocks export and keeps the local `yy_order` synchronization notice visible.

## Verification

Local:

```text
npm test -- orderOperations.test.ts backend.contract.test.ts -> 2 files, 27 tests passed
npm test -> 66 files, 356 tests passed
npm run build -> passed; 2828 modules transformed; built in 2.65s
git diff --check -> passed; only Windows LF/CRLF notices before commit
Browser local smoke -> export scope notice visible, Demo export button disabled, consoleErrors=0
```

Remote deploy output:

```text
commit=2f1eddf
release=/opt/yingyue/releases/studio-workbench-2f1eddf
backup=/opt/yingyue/backups/20260615-103500-pre-studio-workbench-2f1eddf
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
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/service/photos -> 200 text/html
https://studio.evanshine.me/settings/logs -> 200 text/html
```

Production browser smoke:

```text
https://studio.evanshine.me/order/appointment?quick=all
mode=demo
asset=https://studio.evanshine.me/assets/index-ClwwzIQr.js
hasExportScope=true
hasSyncNotice=true
buttonText=Demo 模式不可导出
buttonDisabled=true
buttonTitle=Demo 模式不可导出，请连接 API 后使用真实 yy_order 导出
hasLegacyText=false
consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-103500-pre-studio-workbench-2f1eddf/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Remaining T01 Work

- Production API-mode real download smoke still needs an authenticated API session.
- Real API reschedule final validation still needs an authenticated API session and suitable order state.
- Service product, amount range, and multi-status export should stay blocked until backend query support is exact.
