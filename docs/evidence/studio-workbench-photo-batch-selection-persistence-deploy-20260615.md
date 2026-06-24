# Studio Workbench Photo Batch Selection Deploy 2026-06-15

## Result

`ea1546c feat(studio): persist batch photo selections` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS bucket permissions, miniapp builds, customer photo access rules, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `studio-workbench/dist/studio-workbench-ea1546c.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-ea1546c.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-ea1546c` |
| Backup | `/opt/yingyue/backups/20260615-120219-pre-studio-workbench-ea1546c` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- `/service/photos` batch mark selected and batch unmark selected now persist through `markAlbumPhotosSelected(...)`.
- Demo mode updates each photo's `selected` field and recalculates album `selectedCount` from real per-photo state.
- API mode updates `yy_photo_asset.is_selected` by reading `/yy/photoAsset/{id}` and writing the preserved DTO through `PUT /yy/photoAsset`.
- `buildPhotoItems(...)` now reads each negative's `selected` state instead of guessing selected photos from album `selectedCount`.
- `buildPhotoSelectionUpdateTargets(...)` skips unchecked, invisible, or already-matching photos.

## Verification

Local:

```text
npm test -- photoMgmtOperations.test.ts PhotoMgmtView.contract.test.ts backend.contract.test.ts appStore.contract.test.ts -> 4 files, 43 tests passed
npm test -> 68 files, 365 tests passed
npm run build -> passed; 2829 modules transformed; built in 2.51s
git diff --check -> passed; only Windows LF/CRLF notices before commit
Browser local smoke -> mark chen-04.jpg selected, unmark chen-01.jpg, toolbar reset, consoleErrors=0
```

Remote deploy output:

```text
commit=ea1546c
release=/opt/yingyue/releases/studio-workbench-ea1546c
backup=/opt/yingyue/backups/20260615-120219-pre-studio-workbench-ea1546c
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
asset=https://studio.evanshine.me/assets/index-ccJSyJ2y.js
initial -> tiles=8, selected=3, selected counter=3/8, consoleErrors=0
after batch mark chen-04.jpg -> selected=4, selected counter=4/8, toolbar reset, consoleErrors=0
after batch unmark chen-01.jpg -> selected=3, selected counter=3/8, toolbar reset, consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-120219-pre-studio-workbench-ea1546c/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Remaining T03 Work

- Production API-mode write smoke still needs an authenticated staff API session and a real album to verify `PUT /yy/photoAsset`.
- Real OSS browser validation remains open after an actual production image upload.
- Delete and rename refresh consistency in API mode still needs a focused slice.
- Customer access log stats, notification send, photo confirmation, material delivery, extra purchase, and revenue remain intentionally unimplemented until real backend tables/APIs exist.
