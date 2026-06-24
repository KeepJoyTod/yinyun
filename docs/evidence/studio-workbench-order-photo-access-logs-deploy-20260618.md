# Studio Workbench Order Photo Access Logs Deploy - 2026-06-18

## Result

`studio-workbench` release `prod-4958f93-order-photo-access-20260617-170245` has been deployed to Hong Kong 2 at `https://studio.evanshine.me`.

This release shows recent real photo access logs in the appointment order detail drawer when the order has a linked album.

## Scope

- Frontend only: `studio-workbench/dist` deployed to `/var/www/studio.evanshine.me`.
- Backend/database/nginx config/miniapp builds: unchanged.
- Existing backend API reused:
  - `GET /yy/photoAccessLog/list?pageNum=1&pageSize=...&albumId=...`

## Code

```text
Commit: 4958f93 ci(studio): limit hk2 deploy triggers
Feature commit: bbedac4 feat(studio): show photo access logs in order drawer
Branch: yingyue-closed-loop-optimization-20260603
GitHub Actions run: https://github.com/dengzhekun/yingyue-cloud/actions/runs/27705998266
```

Changed files:

```text
studio-workbench/src/features/orders/OrdersView.vue
studio-workbench/src/features/orders/OrdersView.contract.test.ts
.github/workflows/studio-deploy-hk2.yml
```

Workflow trigger note:

```text
Push deployment is now limited to:
- studio-workbench/**
- .github/workflows/studio-deploy-hk2.yml

Docs-only evidence commits no longer redeploy the frontend.
```

## Behavior

In `/order/appointment` order detail drawer:

- Shows `最近访问` under the linked album section.
- Loads current album access logs through `appStore.loadPhotoAccessLogs(albumId)`.
- Displays the latest five access records from `yy_photo_access_log`.
- Handles loading, error, and empty states.
- Reuses `summarizePhotoAccessLogs` from `features/albums/photoMgmtOperations.ts`.

## Verification

Local verification before deployment:

```text
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts
-> 36 passed

npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts
-> 24 passed

npm --prefix studio-workbench run build
-> passed, existing Vite chunk-size warning only

git diff --check
-> passed, CRLF warnings only
```

GitHub Actions deployment:

```text
Run: 27705998266
Conclusion: success
Head SHA: 4958f938f7d287e233e4ce2ded118e65d9eedebd
Event: push
Job: deploy
Package: studio-workbench-prod-4958f93-order-photo-access-20260617-170245.zip
Package SHA256: 37bf83ee5ed8b89f9de5af705a1cd348a8ff5c9925b0adafd1dea82ae2cc41f9
Uploaded artifact digest: e23896b543c38fe36b0c8c673354297c80af58ed2aec013389013e0cef4dfa02
```

Deployment:

```text
release=prod-4958f93-order-photo-access-20260617-170245
release_dir=/opt/yingyue/releases/prod-4958f93-order-photo-access-20260617-170245
backup=/opt/yingyue/backups/20260618-010327-pre-studio-workbench-prod-4958f93-order-photo-access-20260617-170245
marker_count=79
asset_count=79
nginx -t -> successful
systemctl reload nginx -> successful
```

Production HTTP:

```text
GET https://studio.evanshine.me/order/appointment?cb=prod-4958f93-order-photo-access-20260617-170245
-> 200, marker=True

GET https://studio.evanshine.me/service/photos?cb=prod-4958f93-order-photo-access-20260617-170245
-> 200, marker=True

GET https://studio.evanshine.me/dashboard/today?cb=prod-4958f93-order-photo-access-20260617-170245
-> 200, marker=True

HEAD https://api.evanshine.me/auth/code
-> 200, application/json, server=nginx/1.22.1
```

## Local Maps Updated

```text
C:\Users\Administrator\Desktop\yiyue\function_map.md
C:\Users\Administrator\Desktop\yiyue\optimization_map.md
C:\Users\Administrator\Desktop\yiyue\jianyue_benchmark_map.md
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260618-010327-pre-studio-workbench-prod-4958f93-order-photo-access-20260617-170245/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Notes

- Deployment was completed through GitHub Actions because local SSH/SFTP to HK2 closed before SSH identification.
- The failed CI upload was caused by an incorrect `HK2_PASSWORD` secret value; the secret was refreshed from the local HK2 credential file without printing or committing the secret.
- No token, password, customer phone number, raw access log payload, or private photo data is recorded in this file.
