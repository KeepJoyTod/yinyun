# Studio Workbench collaboration store scope deploy evidence

Date: 2026-06-19

## Scope

This deploy publishes the store-scope fix for the Studio Workbench collaboration pages:

- `/collaboration/overview`
- `/collaboration/work-orders`
- `/collaboration/export`

The release removes the invalid "all stores" operating scope from these pages and keeps the selected scope bound to real `yy_store.id` values. Store names remain display-only.

No backend service, database migration, Douyin OpenAPI call, order write, inventory write, or photo delivery write was executed in this deploy.

## Git

- Branch: `yingyue-closed-loop-optimization-20260603`
- Commit deployed: `dab93e7 fix(studio): scope collaboration work orders by store`
- Remote: `https://github.com/dengzhekun/yingyue-cloud.git`

## Build artifact

- Release: `prod-dab93e7-collab-store-scope-20260619-0752`
- Local zip: `D:\OtherProject\CameraApp\yingyue-cloud-repo\dist\studio-workbench-prod-dab93e7-collab-store-scope-20260619-0752.zip`
- Remote zip: `/opt/yingyue/releases/studio-workbench-prod-dab93e7-collab-store-scope-20260619-0752.zip`
- SHA256: `77924BCF1E9A8C7F3C14CC52D764FD8AAB9D5D7ACEC4EA2B4B1E1D44C8CAEC2D`

## HK2 deploy

- Host label: HK2
- Server hostname: `ser4594579490`
- Site directory: `/var/www/studio.evanshine.me`
- Backup directory: `/opt/yingyue/backups/20260619075407-pre-studio-workbench-prod-dab93e7-collab-store-scope-20260619-0752`
- Nginx check: `nginx -t` passed
- Nginx reload: `systemctl reload nginx` executed
- Published release marker: `prod-dab93e7-collab-store-scope-20260619-0752`

## Verification

Targeted tests before deploy:

```powershell
npm --prefix studio-workbench run test -- src/features/collaboration/WorkExecutionOverviewView.contract.test.ts src/features/collaboration/WorkOrdersView.contract.test.ts src/features/collaboration/WorkOrderExportView.contract.test.ts
```

Result: 3 files passed, 12 tests passed.

Related collaboration tests before deploy:

```powershell
npm --prefix studio-workbench run test -- src/features/collaboration/WorkExecutionOverviewView.contract.test.ts src/features/collaboration/WorkOrdersView.contract.test.ts src/features/collaboration/WorkOrderExportView.contract.test.ts src/features/collaboration/WorkOrderStatisticsView.contract.test.ts src/features/collaboration/workExecution.test.ts src/features/collaboration/workOrders.test.ts src/features/collaboration/workOrderExport.test.ts src/features/collaboration/workOrderStats.test.ts
```

Result: 8 files passed, 23 tests passed.

Production build before deploy:

```powershell
npm --prefix studio-workbench run build
```

Result: passed. Only the existing `echarts-vendor` chunk-size warning appeared.

Remote artifact verification:

```text
sha256=77924BCF1E9A8C7F3C14CC52D764FD8AAB9D5D7ACEC4EA2B4B1E1D44C8CAEC2D
release_txt=prod-dab93e7-collab-store-scope-20260619-0752
```

Online smoke:

| URL | Status | Release marker |
| --- | ---: | --- |
| `https://studio.evanshine.me/release.txt` | 200 | matched |
| `https://studio.evanshine.me/collaboration/overview?cb=deploy-dab93e7` | 200 | present |
| `https://studio.evanshine.me/collaboration/work-orders?cb=deploy-dab93e7` | 200 | present |
| `https://studio.evanshine.me/collaboration/export?cb=deploy-dab93e7` | 200 | present |
| `https://studio.evanshine.me/dashboard/today?cb=deploy-dab93e7` | 200 | present |
| `https://studio.evanshine.me/order/appointment?quick=all&cb=deploy-dab93e7` | 200 | present |

## Follow-up

Continue with the next Studio Workbench batch after this deployment:

1. Use a real login session to verify the three collaboration pages no longer expose an "all stores" operating state.
2. Keep appointment and schedule pages store-scoped by `yy_store.id`.
3. Continue the JianYue benchmark workflow work only after the data contract is stable.
