# Studio Workbench Deploy Evidence 2026-06-15

## Result

`studio-workbench` has been rebuilt with production API-mode environment and deployed to `https://studio.evanshine.me` on Hong Kong 2.

## Local Build

- `VITE_STUDIO_DEMO=false`
- `VITE_API_BASE_URL=https://api.evanshine.me`
- `VITE_STUDIO_EXPECTED_STORE_COUNT=4`

## Deployment

- Server: `103.24.216.8`
- Site dir: `/var/www/studio.evanshine.me`
- Release: `/opt/yingyue/releases/studio-workbench-1859293`
- Backup: `/opt/yingyue/backups/20260615-214053-pre-studio-workbench-1859293`
- Commit: `1859293`
- Local zip: `D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-1859293.zip`

## Verification

Local build:

```text
npm run build -> passed
```

Local tests:

```text
npm test -- StoreView.contract DouyinProductsView.contract appStore.contract -> 21 passed
npm test -- yingyueAdapter appStore.albumPhotos -> 7 passed
```

Public HTTP checks:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/merchant/store -> 200 text/html
```

Remote site check:

```text
site mtime: 2026-06-15 21:42:32 +0800
index bundle: /assets/index-qKs9VQW8.js
bundle marker: StoreView-
```

## Notes

- The login page and main routes are still available.
- The new store binding and real API-mode data path are present in the deployed bundle.
- This deployment only updates static frontend files.
