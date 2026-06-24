# Studio Workbench Photo Mutation Refresh Deploy 2026-06-15

## Result

`2807ace feat(studio): refresh album after photo mutations` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS bucket permissions, miniapp builds, customer photo access rules, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `studio-workbench/dist/studio-workbench-2807ace.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-2807ace.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-2807ace` |
| Backup | `/opt/yingyue/backups/20260615-123424-pre-studio-workbench-2807ace` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- `/service/photos` demo deletion now recalculates album `selectedCount` from remaining `negative.selected` values.
- `renameAlbumPhoto(...)` accepts both frontend id and backend id, then reloads the authoritative album in API mode.
- `deleteAlbumPhoto(...)` accepts both frontend id and backend id, then reloads the authoritative album in API mode.
- API mode now avoids showing stale photo names, sort order, total count, or selected count after photo mutation operations.

## Verification

Local:

```text
npm test -- appStore.albumPhotos.test.ts -> 1 file, 3 tests passed
npm test -- appStore.albumPhotos.test.ts appStore.contract.test.ts PhotoMgmtView.contract.test.ts photoMgmtOperations.test.ts -> 4 files, 33 tests passed
npm test -> 69 files, 368 tests passed
npm run build -> passed; 2829 modules transformed; built in 3.84s
git diff --check -> passed; only Windows LF/CRLF notices before commit
Browser local smoke -> /service/photos rendered 8 tiles, 3 selected, consoleErrors=0
```

Remote deploy output:

```text
commit=2807ace
release=/opt/yingyue/releases/studio-workbench-2807ace
backup=/opt/yingyue/backups/20260615-123424-pre-studio-workbench-2807ace
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
https://studio.evanshine.me/service/photos -> 200 text/html
https://studio.evanshine.me/service/selection -> 200 text/html
https://studio.evanshine.me/merchant/inventory -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
```

Production browser smoke:

```text
https://studio.evanshine.me/service/photos
asset=https://studio.evanshine.me/assets/index-CHEopkN_.js
tiles=8
selected=3
selected counter=3/8
consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-123424-pre-studio-workbench-2807ace/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Remaining T03 Work

- Production API-mode write smoke still needs an authenticated staff API session and a real album to verify `PUT /yy/photoAsset`, `DELETE /yy/photoAsset/{id}`, and `GET /yy/photoAlbum/{id}` together.
- Real OSS browser validation remains open after an actual production image upload.
- Customer access log stats, notification send, photo confirmation, material delivery, extra purchase, and revenue remain intentionally unimplemented until real backend tables/APIs exist.
