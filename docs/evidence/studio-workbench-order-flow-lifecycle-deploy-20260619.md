# Studio Workbench Order Flow Lifecycle Deploy Evidence - 2026-06-19

## Release

```text
commit: ddd20c2 feat(studio): align order detail flow
release: prod-ddd20c2-order-flow-20260619-032133
site: https://studio.evanshine.me
```

## Local Verification Before Deploy

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/stores/appStoreTransforms.test.ts src/features/settings/logsOperations.test.ts
# 4 files / 87 tests passed

npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Deploy

```text
Uploaded: /tmp/studio-workbench-prod-ddd20c2-order-flow-20260619-032133.zip
Release dir: /opt/yingyue/releases/studio-workbench-prod-ddd20c2-order-flow-20260619-032133
Site dir: /var/www/studio.evanshine.me
release.txt: prod-ddd20c2-order-flow-20260619-032133
nginx -t: successful
yingyue-admin.service: active
```

The first deploy command failed before the remote script reliably ran because a PowerShell double-quoted here-string expanded the remote shell `$(date ...)` locally. The deploy was rerun with a fixed local timestamp and completed successfully.

## Smoke

```text
200 /release.txt
200 /order/appointment?quick=all
200 /dashboard/today
200 /service/photos
200 /merchant/micro-pages
200 /settings/logs
marker=prod-ddd20c2-order-flow-20260619-032133
```

## Boundary

- Frontend-only deployment.
- No database migration.
- No backend jar replacement.
- No Douyin/OpenAPI write operation.
