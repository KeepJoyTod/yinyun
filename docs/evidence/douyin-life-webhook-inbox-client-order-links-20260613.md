# Douyin Life Webhook Inbox + Client Order Links Evidence - 2026-06-13

## Scope

- `DOUYIN_LIFE` order sync uses Webhook/SPI first, OpenAPI sync as compensation.
- `yy_channel_event_inbox` records order inbound events (`order-create/pay-notify/refund_notify/refund_notice`) and status-bearing open-platform webhooks for idempotency, retry evidence, and failure diagnosis.
- Stringified webhook `content` is parsed for `order_id/action/refund_amount`.
- Refund notify events map `REFUND_SUCCESS/REFUNDED/PARTIAL_REFUND` into local refund status and refund amount fields on `yy_order`.
- Certificate verify events map `verify_success` into local order `COMPLETED`.
- Client order lookup now verifies `storeId + full phone` through `POST /client/orders/auth/verify`, returns a 2-hour `clientOrderToken`, then reads list/detail through `X-Client-Order-Token`.
- Customer order detail URLs no longer carry `storeId`, full phone, secrets, or raw private payload.

## Implementation Evidence

| Area | Files |
| --- | --- |
| Event inbox domain/service | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyChannelEventInbox.java`, `YyChannelEventInboxServiceImpl.java` |
| Douyin SPI integration | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapter.java` |
| Admin health/inbox UI | `admin-ui/src/views/yy/channel/life/index.vue`, `admin-ui/src/api/yy/channel/index.ts` |
| PostgreSQL migration | `backend/script/sql/postgres/postgres_yy_channel_event_inbox_migration_20260612.sql` |
| Full PostgreSQL schema | `backend/script/sql/postgres/postgres_yy_cloud.sql` |
| Client order token API | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyClientOrderController.java`, `ClientOrderTokenVo.java`, `ClientOrderVerifyRequest.java` |
| Client web detail page | `client-web/src/views/CustomerOrderDetailView.vue` |
| Uni-app order query page | `mobile-uniapp/src/pages/order/query/index.vue` |

## Current Rules

- `RECEIVED`: event is accepted and can still be processed or retried.
- `PROCESSED`: event was processed successfully; later same event can be treated as duplicate.
- `FAILED`: processing failed and should remain visible for retry or manual diagnosis.
- `PROCESSING`: event was claimed by the inbox worker.
- `DONE`: worker processed the event successfully; later same event can be treated as duplicate.
- `RETRY`: worker saw a temporary failure and scheduled the next retry.
- `DEAD`: worker reached the retry threshold and requires manual diagnosis.
- `DUPLICATE`: event is known duplicate and should not create another local order.

Only `PROCESSED/DONE` counts as completed idempotency. `RECEIVED/FAILED/RETRY` must not skip processing.

Admin diagnosis endpoints now exposed:

```text
GET /yy/channel/DOUYIN_LIFE/sync-health
GET /yy/channel/DOUYIN_LIFE/event-inbox/status
GET /yy/channel/DOUYIN_LIFE/event-inbox/list
POST /yy/channel/DOUYIN_LIFE/event-inbox/{id}/retry
```

## Verification Run

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest,YyChannelEventInboxServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 22, Failures: 0, Errors: 0, Skipped: 0`.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm test -- --run clientPhotoApi.test.ts customerOrderDetailPageContract.test.ts
```

Result: `Test Files 2 passed`, `Tests 7 passed`.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test -- --run tests/client-order-query-contract.test.cjs
```

Result: `tests 110`, `pass 110`, `fail 0`.

2026-06-13 final refresh after client order token access:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyChannelEventInboxWorkerServiceTest,YyChannelEventInboxServiceImplTest,DouyinLifeChannelAdapterTest,YyOrderServiceImplTest,YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 75, Failures: 0, Errors: 0, Skipped: 0`.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm run build
```

Result: production build completed.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

Result: typecheck passed; WeChat and Douyin miniapp builds completed.

2026-06-13 refresh after production client order token config:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
node --test tests/deployment-config-contract.test.cjs
```

Result: `tests 1`, `pass 1`, `fail 0`.

2026-06-13 refresh after deployment config map update:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 20, Failures: 0, Errors: 0, Skipped: 0`.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test -- --test-name-pattern "client order|production env"
```

Result: `tests 111`, `pass 111`, `fail 0`.

## Full Verification Run

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyChannelEventInboxServiceImplTest,DouyinLifeChannelAdapterTest,YyOrderServiceImplTest,YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 60, Failures: 0, Errors: 0, Skipped: 0`.

2026-06-13 refresh after inbox worker:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyChannelEventInboxWorkerServiceTest,YyChannelEventInboxServiceImplTest,DouyinLifeChannelAdapterTest,YyOrderServiceImplTest,YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 70, Failures: 0, Errors: 0, Skipped: 0`.

2026-06-13 refresh after refund notify inbox mapping:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyChannelEventInboxWorkerServiceTest,YyChannelEventInboxServiceImplTest,DouyinLifeChannelAdapterTest,YyOrderServiceImplTest,YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 71, Failures: 0, Errors: 0, Skipped: 0`.

2026-06-13 refresh after open-platform string-content refund/verify webhook mapping:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyChannelEventInboxWorkerServiceTest,YyChannelEventInboxServiceImplTest,DouyinLifeChannelAdapterTest,YyOrderServiceImplTest,YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 73, Failures: 0, Errors: 0, Skipped: 0`.

2026-06-13 refresh after client order token access:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 20, Failures: 0, Errors: 0, Skipped: 0`.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm test -- --run src/shared/clientPhotoApi.test.ts src/shared/customerOrderDetailPageContract.test.ts
```

Result: `Test Files 2 passed`, `Tests 8 passed`.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test -- --test-name-pattern "client order"
```

Result: `tests 110`, `pass 110`, `fail 0`.

2026-06-13 refresh after admin health/inbox UI:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy -- --run src/views/yy/utils/douyinLifePageContract.test.ts
npm run build:dev
```

Result: `Test Files 10 passed`, `Tests 77 passed`; `vite build --mode development` completed.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyChannelEventInboxServiceImplTest,DouyinLifeChannelAdapterTest,YyOrderServiceImplTest,YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 62, Failures: 0, Errors: 0, Skipped: 0`.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm test
npm run build
```

Result: `Test Files 11 passed`, `Tests 34 passed`; production build completed.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm test
npm run build:mp-weixin
npm run build:mp-toutiao
```

Result: typecheck passed; `tests 110`, `pass 110`, `fail 0`; WeChat and Douyin miniapp builds completed.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
npm run build
```

Result: `Test Files 17 passed`, `Tests 49 passed`; production build completed.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

Result: build completed.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-admin -am -DskipTests package
```

Result: `BUILD SUCCESS`; `ruoyi-admin/target/ruoyi-admin.jar` was produced.

2026-06-13 refresh after deploy package migration closure:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
node --test mobile-uniapp/tests/real-oss-evidence-contract.test.cjs
```

Result: `tests 34`, `pass 34`, `fail 0`.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\yingyue-build-deploy-package.ps1 -OutputDir dist\yingyue-api-deploy-check -Clean
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\verify-yingyue-deploy-package.ps1 -PackageDir dist\yingyue-api-deploy-check -AsJson
```

Result: deploy package generated for commit `4473cf4`; package verification `PASS`, `failureCount=0`, and `file:sql/postgres/postgres_yy_channel_event_inbox_migration_20260612.sql` is present.

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test -- --test-name-pattern "production env|deploy package"
```

Result: `tests 111`, `pass 111`, `fail 0`.

## Hygiene Checks

```powershell
git diff --check
```

Result: no whitespace errors; only existing Windows line-ending warnings.

```powershell
rg -n "LTAI|AccessKeySecret|APPSecret|client_secret\\s*[:=]\\s*['\\\"][^'\\\"]+|BEGIN (RSA|OPENSSH|PRIVATE) KEY|api[_-]?key\\s*[:=]\\s*['\\\"][^'\\\"]+" --glob '!node_modules/**' --glob '!dist/**' --glob '!target/**' . docs\yiyue
```

Result: no matches.
