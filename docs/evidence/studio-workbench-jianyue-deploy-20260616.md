# Studio Workbench JianYue Deploy Evidence 2026-06-16

## Result

`studio-workbench` 已以真实 API 模式重新构建，并部署到 `https://studio.evanshine.me`。

本次上线只更新香港2 `103.24.216.8` 上的静态前端目录 `/var/www/studio.evanshine.me`，不改后端服务、不改数据库、不改 nginx 站点配置、不改小程序构建产物。

## Git

| Item | Value |
| --- | --- |
| Branch | `yingyue-closed-loop-optimization-20260603` |
| Feature commit | `a2ded19 feat(studio): align jianyue workbench interactions` |
| Evidence commit | `41e6455 docs(evidence): record studio jianyue production deploy` |
| Push | `a2ded19..41e6455` pushed to GitHub |

## Build

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-a2ded19-studio-jianyue-20260616
npm run build
-> passed
```

Local artifact:

```text
C:\Users\Administrator\AppData\Local\Temp\studio-workbench-jianyue-a2ded19-20260616.zip
sha256=D596F0364473646457E0FC77A30EE6D1657E2C8F0B4D5D8143A4B11D0F7ACF66
```

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Remote package | `/opt/yingyue/releases/studio-workbench-jianyue-a2ded19-20260616-212643.zip` |
| Release dir | `/opt/yingyue/releases/studio-workbench-jianyue-a2ded19-20260616-212643` |
| Backup | `/opt/yingyue/backups/studio-workbench-jianyue-a2ded19-20260616-212643-pre` |
| nginx -t | successful |
| systemctl reload nginx | successful |

## Verification

Local tests:

```text
npm test -- --run src/shared/stores/appStore.contract.test.ts src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/stores/StoreView.contract.test.ts src/features/stores/storeDouyinBindings.test.ts src/shared/api/backend.contract.test.ts
-> 8 files passed, 109 tests passed
```

Targeted contracts:

```text
npm test -- --run src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts
-> 3 files passed, 52 tests passed
```

Public HTTP probes:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/dashboard/today -> 200 text/html
https://studio.evanshine.me/merchant/store -> 200 text/html
https://studio.evanshine.me/schedule -> 200 text/html
```

Browser smoke:

```text
url=https://studio.evanshine.me/login
title=影约云门店工作台
release asset present=yes: prod-a2ded19-studio-jianyue-20260616
captcha visible=no
login text visible=yes
```

Acceptance skeleton evidence:

```text
docs/evidence/studio-workbench-acceptance-20260616-2134.md
docs/evidence/studio-workbench-acceptance-20260616-2134.json
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/studio-workbench-jianyue-a2ded19-20260616-212643-pre/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Notes

- 这次上线聚焦简约网口径对齐：订单、首页、今日预约、门店页交互收口。
- 线上已确认新 release asset 命中；不是旧缓存包。
- 总交付状态仍不能直接改成 PASS，因为小程序真机/开发者工具验收和抖音来客真实 logid 仍属外部阻塞。
