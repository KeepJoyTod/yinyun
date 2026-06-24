# Studio Workbench Order Export Boundary Deploy 2026-06-15

## Result

`ae02bc1 feat(studio): export orders through backend` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-ae02bc1.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-ae02bc1.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-ae02bc1` |
| Backup | `/opt/yingyue/backups/20260615-090843-pre-studio-workbench-ae02bc1` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- Order export now calls the authoritative RuoYi Excel endpoint `POST /yy/order/export` in API mode.
- Demo mode keeps export disabled and says `Demo 模式不可导出`.
- The export query only includes supported backend filters: store, channel, order status, payment status, order time range, arrival time range, and page limit.
- Fuzzy keyword, multi-status, amount, service, and booking method filters remain UI-only until backend export query support is explicitly wired.

## Verification

Local:

```text
npm test -> 66 files, 354 tests passed
npm run build -> passed; 2828 modules transformed; built in 3.96s
git diff --check -> passed; only Windows LF/CRLF notices before commit
Browser local smoke -> Demo export button disabled, consoleErrors=0
```

Remote deploy output:

```text
commit=ae02bc1
release=/opt/yingyue/releases/studio-workbench-ae02bc1
backup=/opt/yingyue/backups/20260615-090843-pre-studio-workbench-ae02bc1
site=/var/www/studio.evanshine.me
uploaded=91
assets=88
nginx=ok
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
mode=demo
buttonText=Demo 模式不可导出
buttonDisabled=true
title=Demo 模式不可导出，请连接 API 后使用真实 yy_order 导出
hasLegacyText=false
consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-090843-pre-studio-workbench-ae02bc1/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
