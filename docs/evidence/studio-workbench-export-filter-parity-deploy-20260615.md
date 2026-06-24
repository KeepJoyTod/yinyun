# Studio Workbench Export Filter Parity Deploy 2026-06-15

## Result

`6b5b5f7 feat(studio): guard unsupported order export filters` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-6b5b5f7.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-6b5b5f7.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-6b5b5f7` |
| Backup | `/opt/yingyue/backups/20260615-093431-pre-studio-workbench-6b5b5f7` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- Unsupported export filters are detected before calling `/yy/order/export`.
- API mode blocks export when keyword, service product, booking method, amount range, or multiple statuses are active.
- Demo mode still takes precedence and shows `Demo 模式不可导出`.
- The old placeholder text `导出接口未接入` remains absent.

## Verification

Local:

```text
npm test -> 66 files, 355 tests passed
npm run build -> passed; 2828 modules transformed; built in 3.71s
git diff --check -> passed; only Windows LF/CRLF notices before commit
Browser local smoke -> Demo export button disabled, consoleErrors=0
```

Remote deploy output:

```text
commit=6b5b5f7
release=/opt/yingyue/releases/studio-workbench-6b5b5f7
backup=/opt/yingyue/backups/20260615-093431-pre-studio-workbench-6b5b5f7
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
https://studio.evanshine.me/order/appointment?q=YY202606100001&quick=all
mode=demo
buttonText=Demo 模式不可导出
buttonDisabled=true
title=Demo 模式不可导出，请连接 API 后使用真实 yy_order 导出
hasNewIndexAsset=true
hasLegacyText=false
consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-093431-pre-studio-workbench-6b5b5f7/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Remaining T01 Work

- Production API-mode real download smoke still needs an authenticated API session.
- Export-before-sync guidance still needs to be surfaced in the UI.
- Backend export query can later be expanded to support keyword, service, booking method, amount, and multi-status filters exactly.
