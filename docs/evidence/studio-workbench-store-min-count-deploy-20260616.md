# Studio Workbench Store Count Semantics Deploy 2026-06-16

## Result

`studio-workbench` has been rebuilt and redeployed to `https://studio.evanshine.me` with the store-count wording fixed to mean "minimum expected available stores" rather than a hard cap.

## What Changed

- Real API mode now uses `VITE_STUDIO_MIN_STORE_COUNT` as the primary env var, with `VITE_STUDIO_EXPECTED_STORE_COUNT` kept as fallback for compatibility.
- Store bootstrap now validates only a minimum available store count.
- The store page now says "真实可用门店" instead of "四个真实门店".
- Store page now shows a Douyin Life binding summary card built from `appStore.channelProductMappings`.

## Verification

Local tests:

```text
npm test -- --run src/shared/stores/appStore.contract.test.ts src/shared/stores/appStore.albumPhotos.test.ts src/features/stores/StoreView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
-> 6 files passed, 69 tests passed
```

Local build:

```text
npm run build
-> passed
```

Remote deploy:

```text
release=/opt/yingyue/releases/studio-workbench-store-min-count-20260616-005004
backup=/opt/yingyue/backups/20260616-005051-pre-studio-workbench-store-min-count-20260616-005004
site=/var/www/studio.evanshine.me
site_files=92
asset_files=89
site_index_mtime=2026-06-16 00:47:50 +0800
nginx=ok
```

Public HTTP:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/dashboard/today -> 200 text/html
https://studio.evanshine.me/merchant/store -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/schedule -> 200 text/html
```

Remote bundle markers:

```text
真实可用门店以 /yy/store/list 为主数据 -> assets/StoreView-BIxIEy59.js
至少需要 -> assets/index-i5VNoNRF.js
同步订单 -> assets/orderOperations-Dbdr4lGJ.js, assets/OrdersView-L9_kO1ZL.js
全部有效订单 -> assets/orderOperations-Dbdr4lGJ.js, assets/OrdersView-L9_kO1ZL.js
今日预约排期承接 -> assets/ScheduleView-BjzaEc_j.js
```

## Notes

- `VITE_STUDIO_MIN_STORE_COUNT=4` is a floor, not a cap.
- The real store list can contain more than four entries and will be rendered as-is.
- The browser connection dropped during visual checking, so this deploy is verified with HTTP and bundle markers instead of a screenshot.
