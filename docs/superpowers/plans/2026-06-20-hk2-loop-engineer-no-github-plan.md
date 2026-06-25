# HK2 Loop Engineer No-GitHub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `ralph-loop` plus `yiyue-jianyue-workbench-runner`; use `yingyue-douyin-life-runner` for all DOUYIN_LIFE/HK2/platform steps. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** While GitHub push is unavailable, continue closing 影约云 `studio-workbench` against the 简约网-style daily operations target using local code, HK2 deployment, real login smoke, reversible local DB writes, and read-first Douyin Life evidence.

**Architecture:** `yy_order` remains the only order/appointment ledger. `yy_booking_slot_inventory` remains the only schedule/capacity ledger. DOUYIN_LIFE data enters local business state only through existing backend APIs, SPI/Webhook, OpenAPI sync, or explicitly evidenced HK2 scripts; historical orders without real slot fields stay out of today's schedule.

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest for `studio-workbench`; Spring Boot/RuoYi + PostgreSQL + Redis for backend; PowerShell + Node/Playwright for smoke scripts; HK2 `103.24.216.8` through `tools/invoke-hk2.ps1`; maps under `docs\yiyue`.

---

## 0. Current Known State

| Area | Current state |
| --- | --- |
| Repo | `D:\OtherProject\CameraApp\yingyue-cloud-repo` |
| Branch | `yingyue-closed-loop-optimization-20260603`, ahead of origin by 1 |
| GitHub | Disabled for this loop. Do not push. Do not rely on remote fetch/push. |
| Current HK2 studio release | `prod-4ad8b11-studio-order-status-expected-20260620-075251` |
| Completed Loop A | Photo delivery gates and fallback truthfulness verified |
| Completed Loop B | Merchant decoration draft baseline, micro-page, micro-form, and card product synthetic write smoke passed |
| Active Loop | Runtime closure and UI/operation follow-up; DOUYIN_LIFE C/D read-only truth loop is currently verified |
| Latest route/login/write evidence | `docs/evidence/studio-real-click-smoke-20260620-080411/`, `docs/evidence/studio-photo-delivery-smoke-20260620-081637/`, `docs/evidence/studio-merchant-card-write-smoke-20260620-082548/` |

## 1. Hard Rules

- [ ] Do not push GitHub.
- [ ] Do not run `git reset --hard`, `git checkout --`, broad cleanup, or `git add .`.
- [ ] Do not print secrets, tokens, AppSecret, full phones, raw private payloads, or passwords.
- [ ] Reversible local DB writes are allowed only with synthetic identifiers and evidence.
- [ ] Douyin platform writes are allowed only after read-only evidence identifies the exact account, POI, SKU/order/book/certificate target and logid path.
- [ ] Never run refund, payment, irreversible verify, or real customer notification without an explicit safe target.
- [ ] Every loop ends with one of: PASS evidence, PARTIAL evidence, BLOCKED reason, or rollback/cleanup note.

## 2. Before Every Loop

- [ ] Confirm repo and worktree:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git rev-parse --show-toplevel
git status --short --branch
```

Expected:
- root is `D:/OtherProject/CameraApp/yingyue-cloud-repo`
- existing unrelated dirty files are not reverted

- [ ] Confirm current production release marker:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-studio-workbench-release.ps1 -ReleaseId prod-4ad8b11-studio-secure-env-20260620-012323 -AsJson
```

Expected:
- `markerMatched=true`
- `failureCount=0`

## 3. Loop C: Douyin Life HK2 Truth And Discovery Repair

**Objective:** Make the real-account discovery script reliable, then produce a read-only evidence file showing what the true account can query now.

**Files:**
- Modify only if needed: `tools/yingyue-douyin-real-account-discovery.ps1`
- Read: `tools/invoke-hk2.ps1`
- Evidence: `docs/evidence/douyin-life-real-account-discovery-<timestamp>.json|md`
- Maps: `docs\yiyue\api_map.md`, `callback_map.md`, `open_platform_setting_map.md`, `optimization_map.md`

- [ ] Reproduce current failure with a minimal, read-only command:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\yingyue-douyin-real-account-discovery.ps1 -SshPasswordFile 'C:\Users\Administrator\Desktop\服务器\香港2.txt' -RecentHours 1 -MaxPages 1 -PageSize 1 -SkipPoiQuery -SkipTimeStock
```

Expected:
- If it fails, capture the exact remote stdout/stderr without secrets.

- [ ] Patch the script only to preserve diagnostic output on remote failure.

Implementation boundary:
- Capture `2>&1` from `tools/invoke-hk2.ps1`.
- Redact `access_token`, `client_secret`, `Authorization`, full phone-like values, and raw payload blocks before writing evidence.
- Do not change OpenAPI request semantics in the same patch.

- [ ] Rerun minimal discovery.

Expected:
- Either PASS with a small evidence JSON, or a clear Python/OpenAPI exception showing the true failing line.

- [ ] Run full read-only discovery only after minimal passes:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\yingyue-douyin-real-account-discovery.ps1 -SshPasswordFile 'C:\Users\Administrator\Desktop\服务器\香港2.txt' -RecentHours 24 -MaxPages 2 -PageSize 50
```

Expected:
- account id present as metadata only
- POI/product/SKU/order summaries are脱敏
- no DB writes
- no platform writes

- [ ] Run sync diagnosis:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\get-douyin-life-sync-diagnosis.ps1 -SshPasswordFile 'C:\Users\Administrator\Desktop\服务器\香港2.txt' -AsJson
```

Expected:
- shows mapping gaps, latest sync logs, and whether new orders have real slot fields.

**Stop condition:** If three discovery runs fail in the same place after stderr is visible, stop and record the exact exception and next required credential/permission/platform state.

## 4. Loop D: Douyin Order Sync And Mapping, Local DB Only

**Objective:** Use the HK2 truth evidence to sync only valid DOUYIN_LIFE orders and fix mapping gaps without inventing store/time data.

**Files:**
- Backend code only if diagnosis exposes a real parser bug:
  - `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapter.java`
  - `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinOpenApiClient.java`
  - `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- Evidence: `docs/evidence/douyin-life-sync-diagnosis-<timestamp>.md`

- [ ] If mapping gaps exist, update mappings through existing APIs or SQL migration only for exact POI/SKU matches.
- [ ] Do not map `7407304729216157722` by guess; only use exact evidence or leave as unmapped.
- [ ] Run a bounded sync from HK2/backend for recent orders only:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile 'C:\Users\Administrator\Desktop\服务器\香港2.txt' -AsJson -OutputJsonPath docs\evidence\douyin-life-acceptance-status-20260620-loop-rerun.json
```

- [ ] If using backend sync API, keep time window bounded and evidence saved.

Expected:
- New/updated orders land in `yy_order`.
- `yy_booking_slot_inventory` is touched only if `slot_date/slot_start_time/slot_end_time` are truly present.
- All operations leave `yy_channel_sync_log` entries with request id/logid when available.

## 5. Loop E: Studio Workbench JianYue Interaction Closure

**Objective:** Finish the day-to-day staff operations: slot click, scoped orders, detail, cancel, reschedule, status, operator log, return to slot.

**Files:**
- `studio-workbench/src/features/dashboard/DashboardView.vue`
- `studio-workbench/src/features/orders/OrdersView.vue`
- `studio-workbench/src/features/orders/orderOperations.ts`
- `studio-workbench/src/features/orders/StaffBookingModal.vue`
- `studio-workbench/src/shared/stores/appStore.ts`
- Tests under `studio-workbench/src/features/**`

- [ ] Verify the UI still uses half-hour slots grouped by morning/afternoon/evening.
- [ ] Remove or avoid main horizontal wheel/drag slot rows.
- [ ] Normal store-scoped staff should not default to all stores.
- [ ] Slot card click must show:
  - capacity
  - booked count
  - remaining count
  - full/conflict state
  - scoped order list
  - add booking entry for empty/available slots
  - capacity adjustment entry if blocked
- [ ] Order detail must show:
  - customer summary
  - store/product/time/source/status/pay status
  - cancel/reschedule/status actions
  - reason input/presets
  - operator log with refresh
  - return-to-slot action
- [ ] Run targeted verification:

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/stores/appStore.contract.test.ts
npm --prefix studio-workbench run build
```

Expected:
- tests pass
- build passes
- no new large dependency is introduced

## 6. Loop F: Real Login Runtime Smoke For Staff Workflow

**Objective:** Prove the deployed workbench is actually clickable under real login.

**Files:**
- Existing smoke: `tools/run-studio-workbench-real-login-smoke.ps1`
- Optional extension: `tools/studio-workbench-real-login-smoke.mjs`
- Evidence: `docs/evidence/studio-real-acceptance-<timestamp>/`

- [ ] Run read-only login smoke:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-real-login-smoke.ps1 -BaseUrl https://studio.evanshine.me -ReleaseId prod-4ad8b11-studio-secure-env-20260620-012323
```

- [ ] If frontend changes were made and build passes, deploy only `studio-workbench`:

```powershell
$release = "prod-$(git rev-parse --short HEAD)-studio-loop-$(Get-Date -Format yyyyMMdd-HHmmss)"
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId $release -Build
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId $release -Deploy -ProbeHttp
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-real-login-smoke.ps1 -BaseUrl https://studio.evanshine.me -ReleaseId $release
```

Expected:
- release marker matches
- login succeeds
- key routes have no console/page errors
- screenshots/evidence saved

## 7. Loop G: Reversible Appointment And Inventory Write Smoke

**Objective:** Keep proving the most important business invariant: booking writes `yy_order`, occupies inventory, reschedule moves inventory, cancel releases inventory.

**Files:**
- Existing smoke: `tools/run-studio-workbench-appointment-write-smoke.ps1`
- Existing node runner: `tools/studio-workbench-appointment-write-smoke.mjs`
- Evidence: `docs/evidence/studio-appointment-write-smoke-<timestamp>/`

- [ ] Run only after release smoke passes:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-appointment-write-smoke.ps1 -ApiBaseUrl https://api.evanshine.me -ReleaseId <current-release-id> -ConfirmWriteLocalDb
```

Expected:
- synthetic order created
- old slot count increases then returns
- new slot count increases then returns
- order ends as cancelled synthetic test order
- operation logs include reschedule and transition operator

## 8. Loop H: Photo Delivery Runtime Closure

**Objective:** Move from contract-only proof to runtime proof for albums with photos, while avoiding real customer notification.

**Files:**
- `studio-workbench/src/features/albums/PhotoMgmtView.vue`
- `studio-workbench/src/features/albums/photoMgmtOperations.ts`
- `studio-workbench/src/features/orders/OrdersView.vue`
- Optional smoke evidence under `docs/evidence/`

- [ ] Read current real albums by store.
- [ ] If no safe test photos exist, create evidence that buttons correctly block and state exactly what is missing.
- [ ] If a safe synthetic album/test photo can be used, run notify/confirm/deliver only against that synthetic target.
- [ ] Do not notify real customers.
- [ ] Run:

```powershell
npm --prefix studio-workbench run test -- src/features/albums/photoMgmtOperations.test.ts src/features/albums/PhotoMgmtView.contract.test.ts src/features/orders/OrdersView.contract.test.ts
npm --prefix studio-workbench run build
```

Expected:
- no-photo state blocks actions
- fallback is displayed as manual follow-up, not fake success

## 9. Loop I: Merchant/Card Runtime Closure

**Objective:** Keep merchant and product operations proven without polluting public business state.

**Files:**
- Existing smoke: `tools/run-studio-workbench-merchant-card-write-smoke.ps1`
- Existing node runner: `tools/studio-workbench-merchant-card-write-smoke.mjs`

- [ ] Run smoke after relevant UI/API changes:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-merchant-card-write-smoke.ps1 -ApiBaseUrl https://api.evanshine.me -ReleaseId <current-release-id> -ConfirmWriteLocalDb
```

Expected:
- micro-page create/publish/public-read/offline/delete passes
- micro-form create/publish/public-submit/read/delete passes
- card product synthetic write passes and remains inactive if delete permission is missing
- no real customer notification

## 10. Loop J: Customer/Mobile API Closure, Payment Reserved

**Objective:** Ensure Joe's customer booking/order pages are backed by real public/customer APIs; payment remains explicit placeholder.

**Files:**
- `mobile-uniapp/src/api/*`
- `mobile-uniapp/src/pages/**`
- Backend customer public API services/controllers

- [ ] Verify production does not silently use demo fallback.
- [ ] Verify customer order create writes `yy_order`.
- [ ] Verify customer order with real slot occupies `yy_booking_slot_inventory`.
- [ ] Verify pay endpoint returns `paymentReady=false` and does not mark order paid.
- [ ] Run:

```powershell
node --test mobile-uniapp/tests/production-real-api-contract.test.cjs
npm --prefix mobile-uniapp run typecheck
npm --prefix mobile-uniapp run test
npm --prefix mobile-uniapp run build:h5
```

Expected:
- production fallback is blocked
- payment is not faked
- H5 build passes

## 11. Loop K: Backend Verification And Optional HK2 Backend Deploy

**Objective:** Only deploy backend when backend code or SQL changed and targeted tests pass.

- [ ] If backend changed, run targeted tests:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest,YyOrderServiceImplTest,YyClientPublicApiServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
mvn -pl ruoyi-admin -am -DskipTests package
```

- [ ] Deploy backend only if package succeeds and migration impact is clear.
- [ ] After deploy, run:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile 'C:\Users\Administrator\Desktop\服务器\香港2.txt' -AsJson
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-real-login-smoke.ps1 -BaseUrl https://studio.evanshine.me -ReleaseId <current-release-id>
```

Expected:
- service active
- health/smoke pass
- evidence records deployed backend artifact and rollback path

## 12. Loop L: Evidence, Maps, And Local Handoff

**Objective:** Leave the project understandable without chat history.

**Files:**
- `docs\yiyue\code_map.md`
- `docs\yiyue\api_map.md`
- `docs\yiyue\callback_map.md`
- `docs\yiyue\open_platform_setting_map.md`
- `docs\yiyue\function_map.md`
- `docs\yiyue\optimization_map.md`
- `docs/evidence/*`

- [ ] Append each completed loop with:
  - changed files
  - commands and results
  - release id if deployed
  - synthetic ids
  - cleanup status
  - remaining risks
- [ ] Secret scan before claiming done:

```powershell
rg -n "APPSecret|AccessKey|client_secret|password\s*=|密码\s*[:=]|token\s*[:=]|Authorization|Bearer" docs\evidence docs\yiyue\code_map.md docs\yiyue\api_map.md docs\yiyue\callback_map.md docs\yiyue\open_platform_setting_map.md docs\yiyue\function_map.md docs\yiyue\optimization_map.md
```

Expected:
- no real secrets; false positives may be documented if only field names appear

## 13. Parallel-Agent Split If Used

Use independent agents only where no shared file conflicts exist:

| Agent | Scope | Allowed files |
| --- | --- | --- |
| Agent 1 | Douyin HK2 diagnostics | `tools/yingyue-douyin-real-account-discovery.ps1`, evidence/maps only |
| Agent 2 | Studio schedule/orders UI contracts | `DashboardView.vue`, `OrdersView.vue`, schedule/order tests |
| Agent 3 | Photo/merchant/card smoke hardening | album/merchant/product tests and smoke scripts |
| Agent 4 | Mobile/customer public API verification | `mobile-uniapp`, customer API tests |
| Main controller | Merge/review/deploy/evidence | deployment scripts, maps, final smoke |

Do not let two agents edit the same Vue file or shared `appStore.ts` at the same time.

## 14. Overnight Execution Order

1. Loop C: repair Douyin discovery diagnostics and produce read-only truth evidence.
2. Loop D: if evidence allows, fix mapping/sync locally; no fake slots.
3. Loop E: finish schedule/orders interaction gaps with targeted tests.
4. Loop F: build, deploy studio-workbench to HK2, and run real login smoke.
5. Loop G: run reversible appointment/inventory write smoke.
6. Loop H/I: rerun photo and merchant/card closure smoke as needed.
7. Loop J/K only if files changed in mobile/backend and verification is bounded.
8. Loop L: update maps, secret-scan evidence, write final local handoff.

## 15. Stop Conditions

Stop and report if:

- HK2 deploy fails and rollback cannot be confirmed.
- Douyin platform operation would affect payment, refund, verify, or real notification without a synthetic target.
- The same area fails three times with no new evidence.
- A needed permission is missing, such as product delete permission or Douyin capability approval.
- The next step requires GitHub push.

## 16. Self-Review

- Spec coverage: covers no-GitHub mode, HK2 deploy, local code quality, evidence scripts, real login smoke, reversible order/inventory writes, DOUYIN_LIFE read/write boundaries, JianYue schedule/order workflow, customer/mobile API, maps, and handoff.
- Placeholder scan: no `TBD` or undefined owner steps.
- Boundary consistency: uses `yy_order`, `yy_booking_slot_inventory`, `DOUYIN_LIFE`, `studio-workbench`, HK2 helper, and existing smoke tools consistently.

## 17. 2026-06-20 02:30 Progress Update

This section is the latest execution state and supersedes the older "Current Known State" entries for Loop C/D.

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop A Photo delivery contract | DONE | `docs/evidence/studio-photo-delivery-loop-20260620-015547.md` |
| Loop B Merchant/card synthetic write smoke | DONE | `docs/evidence/studio-merchant-card-write-smoke-20260620-020538/merchant-card-write-smoke.json` |
| Loop C Douyin real-account discovery repair | DONE | `docs/evidence/douyin-life-real-account-discovery-20260620-021922.json`, `docs/evidence/douyin-life-real-account-discovery-20260620-021944.json` |
| Loop D Douyin mapping gap fix | DONE | `docs/evidence/douyin-life-sync-diagnosis-20260620-0224-after-mapping.json`, `docs/evidence/douyin-life-mapping-gap-write-20260620-0223.txt` |
| Loop E JianYue workbench interaction closure | NEXT | run focused UI/contract/build + real login click evidence |
| Loop F Real login runtime smoke | NEXT AFTER E | run or rerun after any frontend deploy |
| Loop G Reversible appointment/inventory smoke | NEXT AFTER F | run after release is verified |
| Loop H Photo runtime smoke | PENDING SAFE TEST ALBUM | only run notify/confirm/deliver on synthetic or approved test album |
| Loop I Merchant/card runtime smoke | AVAILABLE | rerun after related UI/API changes |
| Loop J Customer/mobile public API closure | PENDING TARGETED VERIFY | payment remains `paymentReady=false` |
| Loop K Backend verification/deploy | ONLY IF BACKEND CHANGES | no backend deploy unless tests and migration impact are clear |
| Loop L Evidence/maps/handoff | CONTINUOUS | update `docs\yiyue` after each loop |

Latest Douyin/HK2 facts:

- HK2 read-only discovery now works and observed 8 deduped recent DOUYIN_LIFE orders.
- All 8 sample orders already exist in local `yy_order`.
- Active POI/SKU mapping gap is now 0 after the idempotent HK2 DB write.
- The current samples still have no `slot_date`, `slot_start_time`, `slot_end_time`, or `buyer_reserve_info`; do not insert them into `yy_booking_slot_inventory`.
- Open platform acceptance remains `PENDING_EXTERNAL_ACCEPTANCE`; order auto/compensation sync is PASS, but 三方码发券 SPI, 预约创单/支付回调, 接单 OpenAPI, and 整单核销 OpenAPI still need real platform events or explicit safe test targets.

## 18. Updated Overnight Execution Plan

### Phase 1: stabilize current frontend state before editing

- [ ] Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
npm --prefix studio-workbench run build
```

Expected:
- build passes
- no ECharts chunk warning regression
- if chunk warnings appear, record exact chunk names and only split obvious heavy pages

- [ ] Run focused contracts:

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/stores/appStore.contract.test.ts
```

Expected:
- 5 files pass
- no broad suite unless shared contracts changed

### Phase 2: close JianYue-style staff workflow gaps

Files to inspect/edit only when a gap is proven:

- `studio-workbench/src/features/dashboard/DashboardView.vue`
- `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`
- `studio-workbench/src/features/orders/OrdersView.vue`
- `studio-workbench/src/features/orders/StaffBookingModal.vue`
- `studio-workbench/src/features/orders/orderOperations.ts`
- `studio-workbench/src/shared/stores/appStore.ts`

Acceptance path:

1. `/dashboard/today` shows one concrete store by default, not all stores for normal staff.
2. Morning/afternoon/evening contain half-hour slots and no horizontal wheel-drag dependency.
3. Click empty slot opens prefilled staff booking modal.
4. Click occupied slot opens scoped orders for that `date + storeId + slotStart + slotEnd`.
5. Detail drawer supports cancel, reschedule, status transition, operation-log refresh, and return-to-slot.
6. Any action refreshes `yy_order`, `yy_booking_slot_inventory`, dashboard stats, and operation logs.

### Phase 3: deploy only after local frontend verification

- [ ] Build with a fresh release id:

```powershell
$release = "prod-$(git rev-parse --short HEAD)-studio-loop-$(Get-Date -Format yyyyMMdd-HHmmss)"
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId $release -Build
```

- [ ] Deploy to HK2 and probe:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId $release -Deploy -ProbeHttp
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-studio-workbench-release.ps1 -ReleaseId $release -AsJson
```

Expected:
- `release.txt` matches `$release`
- route probes pass
- `nginx -t` and service checks pass

### Phase 4: real login click acceptance

- [ ] Run real login smoke:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-real-login-smoke.ps1 -BaseUrl https://studio.evanshine.me -ReleaseId $release
```

Evidence target:

```text
docs/evidence/studio-real-acceptance-20260620-loop-e/
```

Must cover:

- home slot
- scoped appointment orders
- order detail
- cancel/reschedule UI availability
- photo buttons
- merchant decoration
- micro pages/forms
- card product pages

### Phase 5: reversible write smoke

- [ ] Run appointment inventory write smoke only after Phase 4 passes:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-appointment-write-smoke.ps1 -ApiBaseUrl https://api.evanshine.me -ReleaseId $release -ConfirmWriteLocalDb
```

Expected:

- synthetic staff booking is created
- old slot and new slot inventory both return to original counts
- synthetic order ends as `CANCELLED`
- operation logs contain reschedule/cancel operator

### Phase 6: photo/merchant/customer follow-up

- [ ] Photo delivery:
  - if no safe test album with photos exists, leave actions blocked and write evidence;
  - if safe synthetic album exists, run notify/confirm/deliver only on that target.
- [ ] Merchant/card:
  - rerun `run-studio-workbench-merchant-card-write-smoke.ps1` after merchant/card edits;
  - do not publish real public content unless business content is approved.
- [ ] Customer/mobile:
  - verify `/api/public/*` and `/api/customer/*`;
  - keep online payment reserved with `paymentReady=false`;
  - production must not silently use demo fallback.

### Phase 7: evidence and maps

- [ ] Update:

```text
docs\yiyue\code_map.md
docs\yiyue\api_map.md
docs\yiyue\optimization_map.md
docs\yiyue\function_map.md
```

- [ ] Run a targeted secret scan before any DONE claim:

```powershell
rg -n "APPSecret|AccessKey|client_secret|password\s*=|密码\s*[:=]|token\s*[:=]|Authorization|Bearer" docs\evidence docs\yiyue\code_map.md docs\yiyue\api_map.md docs\yiyue\optimization_map.md
```

Expected:
- only field names or documented "do not print secret" text;
- no real token, AppSecret, password, full phone, or raw private payload.

## 19. Current Stop Rules

Stop and report instead of continuing if:

- GitHub push becomes the only next step.
- HK2 deploy fails and rollback cannot be confirmed.
- A platform write would verify, refund, pay, or notify a real customer.
- A DOUYIN_LIFE target lacks exact order/book/certificate/POI/SKU identity.
- The same workflow fails three times with no new evidence.

## 20. 2026-06-20 07:55 Progress Update

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop E JianYue workbench interaction closure | DONE | `docs/evidence/studio-real-click-smoke-20260620-075405/real-click-smoke.json` |
| Loop F HK2 deploy + real login smoke | DONE | release `prod-4ad8b11-studio-order-status-expected-20260620-075251`; `docs/evidence/studio-real-login-smoke-20260620-075338/real-login-smoke.json` |
| Loop G reversible appointment/inventory smoke | DONE | `docs/evidence/studio-appointment-write-smoke-20260620-075439/appointment-write-smoke.json` |
| Loop I merchant/card runtime smoke | DONE | `docs/evidence/studio-merchant-card-write-smoke-20260620-075456/merchant-card-write-smoke.json` |
| Loop H photo runtime smoke | PARTIAL SAFE | contracts 83 passed; `photo-pickup-smoke.ps1 -PreviewAccount -AllowEmptyAlbum -SkipStream` passed; no real customer notification executed |
| Loop L maps/handoff | IN PROGRESS | `docs\yiyue\code_map.md`、`api_map.md`、`function_map.md`、`optimization_map.md` updated |

Fixes made in this loop:

- `ScheduleView` restores `slotStart/slotEnd` deep links on `/dashboard/today`.
- `backendApi.updateOrderStatus()` no longer requires the order to exist in its internal today/ledger cache when the caller provides `expectedStatus`.
- `appStore.updateOrderStatus()` passes the current displayed status as `expectedStatus`.
- `studio-workbench-real-click-smoke.mjs` now restores DOM after screenshot redaction and records transition request diagnostics.

Verification:

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/stores/appStore.contract.test.ts src/shared/api/backend.contract.test.ts
npm --prefix studio-workbench run build
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-studio-workbench-release.ps1 -ReleaseId prod-4ad8b11-studio-order-status-expected-20260620-075251 -AsJson
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-real-login-smoke.ps1 -BaseUrl https://studio.evanshine.me -ReleaseId prod-4ad8b11-studio-order-status-expected-20260620-075251
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-real-click-smoke.ps1 -BaseUrl https://studio.evanshine.me -ApiBaseUrl https://api.evanshine.me -ReleaseId prod-4ad8b11-studio-order-status-expected-20260620-075251 -ConfirmWriteLocalDb
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-appointment-write-smoke.ps1 -ApiBaseUrl https://api.evanshine.me -ReleaseId prod-4ad8b11-studio-order-status-expected-20260620-075251 -ConfirmWriteLocalDb
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-merchant-card-write-smoke.ps1 -ApiBaseUrl https://api.evanshine.me -ReleaseId prod-4ad8b11-studio-order-status-expected-20260620-075251 -ConfirmWriteLocalDb
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Latest remaining gaps:

- UI is functionally closer to JianYue but not final 1:1 polish.
- Runtime `客片通知 / 客片确认 / 资料发送` still needs a safe test album with non-customer photos.
- Full production UI flow to `COMPLETED` is not run automatically because completed synthetic orders cannot be safely cancelled; backend status-machine tests cover the serving/completed chain without production writes.
- Decoration save/publish needs an approved existing draft or business-approved content.
- DOUYIN_LIFE historical orders still have no true slot fields, so they remain out of today schedule.
- GitHub push intentionally skipped by user request.

## 21. 2026-06-20 08:04 Progress Update

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop E/F real click runtime | DONE+ | `docs/evidence/studio-real-click-smoke-20260620-080411/real-click-smoke.json` |

Additional real-login write smoke coverage:

- Created one synthetic staff booking in 滨州万达店 for `2026-06-21 10:00-10:30`.
- Real UI path passed: `login -> dashboard slot detail -> scoped appointment orders -> order detail -> 确认订单 -> 标记到店 -> 取消预约 -> inventory rollback -> return to slot`.
- Status flow: `PENDING -> CONFIRMED -> ARRIVED -> CANCELLED`.
- Inventory flow: `paidCount 0 -> 1 -> 0`.
- Console/page errors: `0`.
- Cleanup: `NOT_NEEDED`; synthetic order ended `CANCELLED`.

Script update:

- `tools/studio-workbench-real-click-smoke.mjs` now verifies UI status transitions before cancellation.
- The smoke intentionally stops before `SERVING/COMPLETED`; backend allows `SERVING -> COMPLETED`, but `SERVING` cannot be safely cancelled in production smoke.

Photo runtime follow-up from read-only audit:

- `通知客户` currently writes fallback notification/audit state and does not truly notify a customer, so it is safe against a synthetic album.
- `客片确认` and `资料发送` mutate `yy_photo_album` state and must only run against a synthetic or explicitly approved test album.
- Minimum safe target: preview/test customer, dedicated synthetic album, at least two non-customer test assets, and customer-side selection submission before staff confirmation/delivery.
- Added safe smoke entry:
  - `tools/run-studio-workbench-photo-delivery-smoke.ps1`
  - `tools/studio-workbench-photo-delivery-smoke.mjs`
- Default run is read-only discovery; targeted writes require `-AlbumId -ConfirmWriteLocalDb` and the target album must be visibly synthetic/test-marked.
- Current read-only evidence: `docs/evidence/studio-photo-delivery-smoke-20260620-080957/photo-delivery-smoke.json`.
- Current result: `SKIPPED_SAFE_TARGET_REQUIRED`; no synthetic/test-marked album candidate found, no album state write, no customer notification.

## 22. 2026-06-20 08:16 Progress Update

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop H photo runtime smoke | DONE SYNTHETIC | `docs/evidence/studio-photo-delivery-smoke-20260620-081637/photo-delivery-smoke.json` |

Implemented and verified the safe synthetic photo delivery flow:

- Extended `tools/studio-workbench-photo-delivery-smoke.mjs`.
- Extended `tools/run-studio-workbench-photo-delivery-smoke.ps1`.
- Command used:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-photo-delivery-smoke.ps1 -ApiBaseUrl https://api.evanshine.me -CreateSyntheticAlbum -UploadFixtureAssets -SubmitSyntheticSelection -Notify -ConfirmSelection -Deliver -ConfirmWriteLocalDb
```

Verified runtime path:

- Create `CODEx_SYNTHETIC_PHOTO_*` album through `POST /yy/photoAlbum`.
- Upload 2 fixture PNGs through `POST /resource/oss/upload`.
- Create visible assets through `POST /yy/photoAsset`.
- Client-side pickup login through `POST /client/photo/auth/verify`.
- Client-side selection submit through `POST /client/photo/albums/{id}/selection`.
- Staff notify through `POST /yy/photoAlbum/{id}/notify`; result is fallback audit, no real customer notification.
- Staff confirm through `POST /yy/photoAlbum/{id}/selection/confirm`.
- Staff deliver through `POST /yy/photoAlbum/{id}/deliver`.

Result:

- `status=PASS`
- final album `status=DELIVERED`
- final `selectionStatus=DELIVERED`
- `assetCount=2`
- `selectedAssetCount=2`
- no real customer album was used.

## 23. 2026-06-20 08:22 Progress Update

This section supersedes the Loop I evidence in the 07:55 update.

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop I merchant/card runtime smoke | DONE | `docs/evidence/studio-merchant-card-write-smoke-20260620-082548/merchant-card-write-smoke.json` |

Merchant/card result:

- Decoration draft: `BZ-WANDA / 900000000000000100` now has a default draft baseline. The latest smoke saved a synthetic draft and restored the default config in normal mode; the first baseline creation required explicit `-AllowCreateDecorationDraft`. It did not publish a public snapshot.
- Micro page: synthetic page create, publish, public read, offline, delete all passed.
- Micro form: synthetic form create, publish, public read, submit, backend read, submission delete all passed, then form offline and delete passed.
- Card product: synthetic single-times card write passed; current account lacks product delete permission, so the reusable synthetic card remains archived/inactive.
- Cleanup failures: none.

## 24. 2026-06-20 08:28 DOUYIN_LIFE Read-Only Recheck

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop C/D Douyin read-only truth | VERIFIED | `docs/evidence/douyin-life-sync-diagnosis-20260620-0828.json`, `docs/evidence/douyin-life-acceptance-status-20260620-0828-loop.json` |

Result:

- Acceptance status remains `PENDING_EXTERNAL_ACCEPTANCE`.
- Order auto/compensation sync is PASS with latest logid `20260620082521C5E4315B75BAE9E78D47`.
- Read-only sync diagnosis found 8 sample orders, 8 local `yy_order` matches, and `activePairMappingGap=0`.
- `sampleOrdersWithReserveTime=0` and `buyer_reserve_info=0`; do not write these orders into `yy_booking_slot_inventory`.
- Event inbox still has 2 older `LIFE_ORDER_QUERY` failures from 2026-06-13 because `x-life-sign` was missing; this is not a current auto-sync blocker.

Next DOUYIN_LIFE actions:

- Wait for real platform event or exact safe test target for: 三方码发券 SPI, 预约创单/支付回调, 接单 OpenAPI, 整单核销 OpenAPI.
- If a new paid/reserved order includes real slot fields, verify it enters `yy_order.slot_*` and `yy_booking_slot_inventory` through the existing pipeline.
- Do not invent slot time from pay time, create time, product name, or store name.

## 25. 2026-06-20 08:50 Micro Form -> Staff Booking Smoke + Orphan Album Fix

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop J micro form booking prefill | DONE DEPLOYED | `docs/evidence/studio-micro-form-booking-smoke-20260620-085012/micro-form-booking-smoke.json` |
| Loop J real login route check | DONE DEPLOYED | `docs/evidence/studio-real-login-smoke-20260620-085012/real-login-smoke.json` |

Implemented:

- Added `tools/studio-workbench-micro-form-booking-smoke.mjs`.
- Added `tools/run-studio-workbench-micro-form-booking-smoke.ps1`.
- Fixed frontend album mapping so `yy_photo_album.order_id` may be empty:
  - `studio-workbench/src/shared/api/yingyueAdapter.ts`
  - `studio-workbench/src/shared/api/backendTypes.ts`
  - `studio-workbench/src/shared/stores/appStoreTransforms.ts`
- Added tests for standalone/orphan photo albums:
  - `studio-workbench/src/shared/api/yingyueAdapter.test.ts`
  - `studio-workbench/src/shared/stores/appStoreTransforms.test.ts`

Runtime path verified:

- Create synthetic micro form through `POST /yy/microForm`.
- Publish through `POST /yy/microForm/{id}/publish`.
- Public submit through `POST /yy/client/microForm/{id}/submit`.
- Real logged-in UI opens `/order/forms?formId=<id>`.
- Click `转预约`.
- Verify `/order/staff-booking?fromSubmissionId=<submissionId>` pre-fills customer, store, service group, requested date/time, and exposes `按该时段录入`.
- The smoke does not call `POST /yy/order/staff-booking`; no order or inventory write occurs.
- Cleanup deletes the synthetic submission, offlines the synthetic form, then deletes the form.

Deployment:

- HK2 frontend release: `prod-local-album-orphan-mfform-20260620-0849`.
- Release verification PASS.
- Real-login smoke PASS: 9 routes, token present, console/page errors 0.
- Micro-form booking smoke PASS: cleanup failures 0, console/page errors 0.

Verification commands run:

```powershell
node --check tools\studio-workbench-micro-form-booking-smoke.mjs
$tokens = $null; $parseErrors = $null; $null = [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path 'tools\run-studio-workbench-micro-form-booking-smoke.ps1'), [ref]$tokens, [ref]$parseErrors); if ($parseErrors.Count) { $parseErrors | ForEach-Object { $_.Message }; exit 1 } else { 'PowerShell parser OK' }
npm --prefix studio-workbench run test -- src/shared/api/yingyueAdapter.test.ts src/shared/stores/appStoreTransforms.test.ts
npm --prefix studio-workbench run build
.\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId 'prod-local-album-orphan-mfform-20260620-0849' -Build -Deploy -ProbeHttp
.\tools\run-studio-workbench-real-login-smoke.ps1 -ReleaseId 'prod-local-album-orphan-mfform-20260620-0849'
.\tools\run-studio-workbench-micro-form-booking-smoke.ps1 -ReleaseId 'prod-local-album-orphan-mfform-20260620-0849' -ConfirmWriteLocalDb
```

Next loop candidates:

- Add a read-only stale event inbox report for the two old `x-life-sign` failures.
- Continue real UI affordance checks for card product customer link / Douyin mapping disabled explanations.

## 26. 2026-06-20 09:02 Micro Form -> Staff Booking Full Reversible Smoke

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop K micro form booking full reversible path | DONE LIVE VERIFIED | `docs/evidence/studio-micro-form-booking-smoke-20260620-090215/micro-form-booking-smoke.json` |

Implemented:

- Added a focused smoke-script contract test:
  - `studio-workbench/src/shared/tooling/studioWorkbenchSmokeScripts.contract.test.ts`
- Extended `tools/studio-workbench-micro-form-booking-smoke.mjs`:
  - default behavior remains prefill-only;
  - `STUDIO_MF_CREATE_BOOKING=1` enables the full reversible write path;
  - waits for real UI requests to `POST /yy/order/staff-booking` and `PUT /yy/microFormSubmission/follow`;
  - records inventory before/create/final snapshots;
  - cancels the synthetic order and checks inventory rollback;
  - cleanup still deletes synthetic submission/form.
- Extended `tools/run-studio-workbench-micro-form-booking-smoke.ps1`:
  - added explicit `-CreateBooking` switch;
  - kept `-ConfirmWriteLocalDb` required for all write paths.

Runtime path verified on `https://studio.evanshine.me` release `prod-local-album-orphan-mfform-20260620-0849`:

- Create synthetic micro form.
- Publish and submit public form.
- Real login opens `/order/forms`.
- Click `转预约`.
- Verify `/order/staff-booking` prefill.
- Close undecided booking modal.
- Click `按该时段录入`.
- Uncheck `发送通知`.
- Save synthetic local booking.
- Verify `yy_micro_form_submission.followStatus=FOLLOWED` and `orderId` exists.
- Verify inventory `paidCount 0 -> 1`.
- Cancel synthetic order.
- Verify inventory `paidCount 1 -> 0`.
- Delete synthetic submission and form.

Verification commands run:

```powershell
npm --prefix studio-workbench run test -- src/shared/tooling/studioWorkbenchSmokeScripts.contract.test.ts
node --check tools\studio-workbench-micro-form-booking-smoke.mjs
$tokens = $null; $parseErrors = $null; $null = [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path 'tools\run-studio-workbench-micro-form-booking-smoke.ps1'), [ref]$tokens, [ref]$parseErrors); if ($parseErrors.Count) { $parseErrors | ForEach-Object { $_.Message }; exit 1 }; 'OK'
.\tools\run-studio-workbench-micro-form-booking-smoke.ps1 -ConfirmWriteLocalDb -CreateBooking
```

Result:

- PASS.
- `paidCount 0->1->0`.
- `cleanupFailures=[]`.
- `consoleErrorCount=0`.
- `pageErrorCount=0`.
- No GitHub push.

Next loop candidates:

- Add a read-only stale event inbox report for the two old `x-life-sign` failures.
- Continue UI affordance checks for card product customer link / Douyin mapping disabled explanations.
- Add operation-log evidence to the micro-form booking smoke if product wants the form-to-order action timeline visible in `/order/appointment`.

## 27. 2026-06-20 09:10 DOUYIN_LIFE Event Inbox Stale Failure Report

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop L event inbox read-only report | DONE HK2 READ ONLY | `docs/evidence/douyin-life-event-inbox-report-20260620-091024.md` |

Implemented:

- Added `tools/get-douyin-life-event-inbox-report.ps1`.
- The script reads HK2 `yingyue-postgres/yingyue_cloud` and queries only `yy_channel_event_inbox`.
- The output is aggregated and redacted:
  - status counts;
  - failure buckets;
  - stale failure rows with masked event/order identifiers;
  - no raw payload output.
- No retry endpoint is called, no event state is changed, no Douyin OpenAPI is called.

Runtime result:

- `summary.status=STALE_SIGNATURE_NO_CURRENT_BLOCKER`.
- `total=2`, `failed=2`, `retry=0`, `dead=0`.
- `staleFailures=2`.
- `staleXLifeSignFailures=2`.
- Both stale failures are old `2026-06-13 LIFE_ORDER_QUERY` rows with missing `x-life-sign`.

Conclusion:

- These rows are stale signature evidence, not a current order-sync blocker.
- Do not retry blindly. If the admin health panel should stop warning on these historical rows, design an explicit archive/ignore operation with audit.

Verification commands run:

```powershell
$tokens=$null; $parseErrors=$null; $path=(Resolve-Path 'tools\get-douyin-life-event-inbox-report.ps1'); $null=[System.Management.Automation.Language.Parser]::ParseFile($path,[ref]$tokens,[ref]$parseErrors); if ($parseErrors.Count) { $parseErrors | ForEach-Object { $_.Message }; exit 1 } else { 'PowerShell parser OK' }
.\tools\get-douyin-life-event-inbox-report.ps1 -OutputJsonPath docs/evidence/douyin-life-event-inbox-report-20260620-091024.json -OutputMarkdownPath docs/evidence/douyin-life-event-inbox-report-20260620-091024.md -StaleDays 3 -Limit 20
npm --prefix studio-workbench run test -- src/shared/tooling/studioWorkbenchSmokeScripts.contract.test.ts
```

Next loop candidates:

- UI affordance checks for card product customer link and Douyin mapping disabled explanations.
- Add operation-log evidence to the micro-form booking smoke if product wants the form-to-order action timeline visible in `/order/appointment`.
- If product wants a clean health panel, implement a separate archived/ignored state for stale invalid-signature events instead of using retry.

## 28. 2026-06-20 09:17 Product Card / Douyin Mapping Affordance Deploy

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop M product affordance | DONE DEPLOYED | `docs/evidence/studio-workbench-production-deploy-product-affordance-20260620-0917.md` |

Implemented:

- `ProductCardManagementView.vue`
  - `客户链接` now shows the explicit backend gap instead of sitting as a dead disabled button.
  - `抖音映射` navigates to `/product/douyin`.
- `DouyinProductsView.vue`
  - Added `复制入口`.
  - If `landingUrl/landingPath` exists, it copies the real Douyin Life entry.
  - If missing, it explains the missing landing entry and keeps `复制待补清单` available.
- Contract tests updated:
  - `ProductCardManagementView.contract.test.ts`
  - `DouyinProductsView.contract.test.ts`

Verification commands run:

```powershell
npm --prefix studio-workbench run test -- src/features/products/ProductCardManagementView.contract.test.ts src/features/products/DouyinProductsView.contract.test.ts
npm --prefix studio-workbench run build
.\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId 'prod-product-affordance-20260620-0917' -Build -Deploy -ProbeHttp
.\tools\run-studio-workbench-real-login-smoke.ps1 -BaseUrl https://studio.evanshine.me -ReleaseId 'prod-product-affordance-20260620-0917'
```

Result:

- Product tests: 2 files / 15 tests passed.
- Build: PASS, no ECharts chunk warning.
- HK2 deploy: PASS, `nginx -t` successful, route verification PASS.
- Real login smoke: PASS, 9 routes, token present, console/page errors 0.
- No GitHub push.

Next loop candidates:

- Add operation-log evidence to the micro-form booking smoke so `/order/appointment` shows "from micro form -> staff booking" in the timeline.
- Continue UI parity work for today's schedule and order detail once the remaining data contracts are stable.

## 29. 2026-06-20 09:22 Micro Form Booking Operation-log Evidence

| Loop | Status | Evidence |
| --- | --- | --- |
| Loop N micro form operation-log evidence | DONE LIVE VERIFIED | `docs/evidence/studio-micro-form-booking-smoke-20260620-092153/micro-form-booking-smoke.json` |

Implemented:

- Extended `tools/studio-workbench-micro-form-booking-smoke.mjs` with `collectOperationLogEvidence(stage)`.
- The smoke now reads `/monitor/operlog/list` after creating the synthetic booking and again after cancellation.
- Evidence records only compact/redacted log fields:
  - title;
  - request method;
  - URL with long numeric IDs redacted by existing `safe()`;
  - `operatorPresent`;
  - department;
  - status/error/time.
- It does not persist raw `operParam` or `jsonResult`.
- Tooling contract now asserts the micro-form smoke contains operation-log evidence collection.

Verification commands run:

```powershell
node --check tools\studio-workbench-micro-form-booking-smoke.mjs
npm --prefix studio-workbench run test -- src/shared/tooling/studioWorkbenchSmokeScripts.contract.test.ts
.\tools\run-studio-workbench-micro-form-booking-smoke.ps1 -ReleaseId 'prod-product-affordance-20260620-0917' -ConfirmWriteLocalDb -CreateBooking
```

Result:

- Full smoke: PASS.
- `paidCount 0->1->0`.
- `cleanupFailures=[]`.
- `consoleErrorCount=0`.
- `pageErrorCount=0`.
- `operationLogs.status=PASS`.
- Matched: `staffBooking=true`, `follow=true`, `cancel=true`, `operatorPresent=true`.
- No deploy needed; this changed smoke tooling/evidence only.
- No GitHub push.

Next loop candidates:

- Continue UI parity work for today's schedule and order detail once the remaining data contracts are stable.
- Optionally expose "来源微表单 -> 店员预约 -> 取消/改期" more prominently inside the order detail timeline UI.
