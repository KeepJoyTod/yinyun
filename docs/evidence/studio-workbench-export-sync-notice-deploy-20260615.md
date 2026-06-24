# Studio Workbench Export Sync Notice Deploy 2026-06-15

## Result

`f9c8150 feat(studio): show order export sync boundary` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-f9c8150.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-f9c8150.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-f9c8150` |
| Backup | `/opt/yingyue/backups/20260615-095617-pre-studio-workbench-f9c8150` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- Order export area now shows `导出范围`.
- Demo mode explains that real reconciliation requires API mode and synchronized Douyin Life orders.
- API-mode helper text keeps the hard boundary that Excel includes only locally synchronized `yy_order` rows.
- The UI does not trigger synchronization automatically and does not add a fake sync action.

## Verification

Local:

```text
npm test -> 66 files, 356 tests passed
npm run build -> passed; 2828 modules transformed; built in 3.83s
git diff --check -> passed; only Windows LF/CRLF notices before commit
Browser local smoke -> export scope notice visible, Demo export button disabled, consoleErrors=0
```

Remote deploy output:

```text
commit=f9c8150
release=/opt/yingyue/releases/studio-workbench-f9c8150
backup=/opt/yingyue/backups/20260615-095617-pre-studio-workbench-f9c8150
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
hasNewIndexAsset=true
hasExportScope=true
hasSyncNotice=true
buttonText=Demo 模式不可导出
buttonDisabled=true
title=Demo 模式不可导出，请连接 API 后使用真实 yy_order 导出
hasLegacyText=false
consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-095617-pre-studio-workbench-f9c8150/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Remaining T01 Work

- Production API-mode real download smoke still needs an authenticated API session.
- Backend export query can later be expanded to support keyword, service, booking method, amount, and multi-status filters exactly.
