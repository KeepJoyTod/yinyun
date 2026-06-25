# Studio Workbench Store Scoped Slots Deploy - 2026-06-18

## Result

`studio-workbench` release `prod-fffc079-store-scoped-slots-20260618` has been deployed to Hong Kong 2 at `https://studio.evanshine.me`.

## Scope

- Frontend only: `studio-workbench/dist` deployed to `/var/www/studio.evanshine.me`.
- Backend service, database, Douyin OpenAPI settings, OSS, miniapp builds and nginx site config were not changed.
- Main behavior:
  - Dashboard and schedule appointment grids are scoped to one concrete `yy_store.id`.
  - Dashboard no longer exposes an all-store appointment grid.
  - Schedule page does not load all-store inventory before a concrete store is selected.
  - JianYue-style slots merge by half-hour bucket to prevent duplicate cards for the same store/time.
  - Dashboard-derived schedule rows are de-duplicated by backend id, local id, and order number.

## Code

```text
Commit: fffc079 fix(studio): scope appointment slots by store
Branch: yingyue-closed-loop-optimization-20260603
```

Changed files:

```text
studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts
studio-workbench/src/features/albums/PhotoMgmtView.vue
studio-workbench/src/features/dashboard/DashboardView.contract.test.ts
studio-workbench/src/features/dashboard/DashboardView.vue
studio-workbench/src/features/dashboard/dashboardOperations.test.ts
studio-workbench/src/features/dashboard/dashboardOperations.ts
studio-workbench/src/features/orders/OrdersView.contract.test.ts
studio-workbench/src/features/orders/OrdersView.vue
studio-workbench/src/features/schedule/ScheduleView.contract.test.ts
studio-workbench/src/features/schedule/ScheduleView.vue
studio-workbench/src/features/schedule/scheduleOperations.ts
studio-workbench/src/shared/components/schedule/JianyueSlotGrid.contract.test.ts
studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue
```

## Verification

Local:

```text
npm --prefix studio-workbench run test -- src/features/dashboard/dashboardOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/albums/PhotoMgmtView.contract.test.ts
-> 7 files passed, 128 tests passed

git diff --check
-> no whitespace errors, CRLF warnings only

npm --prefix studio-workbench run build
-> passed, existing Vite echarts-vendor chunk warning only
```

Production build:

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_RELEASE_ID=prod-fffc079-store-scoped-slots-20260618
npm --prefix studio-workbench run build
-> passed, existing Vite echarts-vendor chunk warning only
```

Package:

```text
Local package: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-fffc079-store-scoped-slots-20260618.zip
SHA256: 5587322EE1427BD6B3208986AEFC8A192DD329897E9FFE5A25B90FC67DC4F5AC
Size: 672691 bytes
Remote package: /opt/yingyue/releases/studio-workbench-prod-fffc079-store-scoped-slots-20260618.zip
```

Deployment:

```text
release=prod-fffc079-store-scoped-slots-20260618
release_dir=/opt/yingyue/releases/prod-fffc079-store-scoped-slots-20260618
backup=/opt/yingyue/backups/20260618-184926-pre-studio-workbench-prod-fffc079-store-scoped-slots-20260618
asset_count=103
marker_count=3
nginx -t -> successful
systemctl reload nginx -> executed
```

Production HTTP smoke:

```text
GET https://studio.evanshine.me/?cb=prod-fffc079-store-scoped-slots-20260618 -> 200, marker=True
GET https://studio.evanshine.me/login?cb=prod-fffc079-store-scoped-slots-20260618 -> 200, marker=True
GET https://studio.evanshine.me/dashboard/today?storeId=900000000000000100&cb=prod-fffc079-store-scoped-slots-20260618 -> 200, marker=True
GET https://studio.evanshine.me/order/appointment?quick=all&cb=prod-fffc079-store-scoped-slots-20260618 -> 200, marker=True
GET https://studio.evanshine.me/schedule?storeId=900000000000000100&cb=prod-fffc079-store-scoped-slots-20260618 -> 200, marker=True
GET https://studio.evanshine.me/service/photos?cb=prod-fffc079-store-scoped-slots-20260618 -> 200, marker=True
```

## Local Maps Updated

```text
docs\yiyue\function_map.md
docs\yiyue\optimization_map.md
docs\yiyue\jianyue_benchmark_map.md
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260618-184926-pre-studio-workbench-prod-fffc079-store-scoped-slots-20260618/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Boundaries

- Historical `DOUYIN_LIFE` orders without real slot fields are still not fabricated into daily schedule slots.
- Backend employee store-scope enforcement should still be tightened in a later backend pass; this release fixes the frontend all-store leakage and duplicate slot symptom.
- No secrets, tokens, password files, full phone numbers, or raw private payloads are recorded here.
