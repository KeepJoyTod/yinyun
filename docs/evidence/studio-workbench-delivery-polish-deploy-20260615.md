# Studio Workbench Delivery Polish Deploy 2026-06-15

## Result

`ea721ac feat(studio): finish workbench delivery polish` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Release | `/opt/yingyue/releases/studio-workbench-ea721ac` |
| Backup | `/opt/yingyue/backups/20260615-010203-pre-studio-workbench-ea721ac` |
| Uploaded files | `91` |

## What Changed

- Login page now uses a logical desktop side-panel layout: work scope on the left, staff login panel on the right.
- Studio visual primitives were consolidated across order, photo, selection, settings, product, member, marketing, report, and collaboration pages.
- Derived product, member, marketing, and report pages now keep clearer real-data boundaries and construction states.
- Added the studio workbench entry map document for faster page-to-code navigation.

## Verification

Local:

```text
studio-workbench npm test -> 64 files, 341 tests passed
studio-workbench npm run build -> passed
git diff --check -> passed; only Windows LF/CRLF notices
```

Remote deploy output:

```text
release=/opt/yingyue/releases/studio-workbench-ea721ac
backup=/opt/yingyue/backups/20260615-010203-pre-studio-workbench-ea721ac
site=/var/www/studio.evanshine.me
uploaded=91
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

Browser smoke:

```text
https://studio.evanshine.me/login
hasLoginTitle=true
hasSideCopy=true
viewportWidth=929
formLeft=514
formTop=32
hasHorizontalOverflow=false
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-010203-pre-studio-workbench-ea721ac/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
