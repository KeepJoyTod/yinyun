# Loop Engineer Studio Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continue optimizing Yingyue Studio Workbench while GitHub push is unavailable: use HK2 as the real runtime, keep evidence local, deploy when verified, and close the remaining JianYue-style appointment/order/photo/merchant loops.

**Architecture:** `yy_order` remains the only order and appointment ledger. `yy_booking_slot_inventory` remains the only schedule and capacity ledger. The workbench must read and write through backend APIs, and every production/HK2 write must leave an evidence artifact with release marker, route/API, affected store, affected synthetic order/card/page id, and rollback or cleanup status.

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest for `studio-workbench`; Spring Boot/RuoYi + PostgreSQL + Redis for backend; HK2 `103.24.216.8` via `tools/invoke-hk2.ps1`; PowerShell scripts for deploy/smoke/evidence; local maps under `docs\yiyue`.

---

## Current State

| Item | State |
| --- | --- |
| Branch | `yingyue-closed-loop-optimization-20260603` |
| Local commit | branch is ahead of origin by 1 local commit; do not push during this loop |
| GitHub | Do not push for this loop because GitHub network is unstable |
| HK2 release | `prod-4ad8b11-studio-secure-env-20260620-012323` deployed to `https://studio.evanshine.me` |
| Server status | `yingyue-admin.service active`; `nginx -t` successful |
| Latest deployment evidence | `docs/evidence/studio-workbench-secure-env-deploy-20260620-012323.md` |
| Latest login evidence | `docs/evidence/studio-real-login-smoke-20260620-014005/` |
| Latest appointment write evidence | `docs/evidence/studio-appointment-write-smoke-20260620-014821/appointment-write-smoke.json` |
| Maps updated | `docs\yiyue\code_map.md`, `api_map.md`, `function_map.md`, `optimization_map.md` |

## Already Completed In This Loop

| Loop | Result | Evidence |
| --- | --- | --- |
| Secure environment build | Frontend no longer expands full `import.meta.env`; login defaults no longer embed demo credentials; dist credential scan passed | `docs/evidence/studio-workbench-secure-env-deploy-20260620-012323.md` |
| HK2 studio deploy | `studio-workbench` deployed only to `https://studio.evanshine.me`; backup created before replacement; `release.txt` marker verified | `/opt/yingyue/backups/20260620-013432-pre-studio-workbench-prod-4ad8b11-studio-secure-env-20260620-012323` |
| Real login smoke | Real login succeeds; 9 logged-in routes pass; console/page errors are 0 | `docs/evidence/studio-real-login-smoke-20260620-014005/` |
| Appointment write smoke | Synthetic staff booking was created, rescheduled, cancelled; old/new slot inventory counts restored; operation log includes reschedule and transition operator | `docs/evidence/studio-appointment-write-smoke-20260620-014821/appointment-write-smoke.json` |
| Photo delivery contract loop | No-album/no-photo/no-selection/delivered gates verified; fallback notification is shown as manual follow-up, not fake success | `docs/evidence/studio-photo-delivery-loop-20260620-015547.md` |
| Merchant/card write smoke | Synthetic micro-page and micro-form publish/public-read/offline/delete passed; synthetic card product write passed and remains inactive because current account lacks product remove permission | `docs/evidence/studio-merchant-card-write-smoke-20260620-020538/merchant-card-write-smoke.json` |

## Current Worktree Guardrail

Before every new loop, run:

```powershell
git status --short --branch
```

Current known intentional local changes include:

- secure login/API environment edits under `studio-workbench/src/features/auth`, `studio-workbench/src/shared/api`, `studio-workbench/src/shared/stores`, and `studio-workbench/src/shared/components/layout`;
- deployment and verification scripts under `tools/`;
- smoke scripts and evidence under `docs/evidence/`;
- untracked temporary/live evidence files from previous verification.

Do not run broad cleanup. Do not revert unrelated files. Do not use `git add .`.

## Execution Rules

- Do not push GitHub in this loop.
- Do not use `git add .`.
- Use local commits when a batch is verified; keep commits small and recoverable.
- Deployment is allowed when tests/build pass and `release.txt` is written.
- HK2 database/order/inventory writes are allowed, but must use synthetic test names or reversible state transitions.
- Douyin platform writes are allowed only when the target operation is explicitly identified, logid can be captured, and the operation is not refund/payment destructive.
- Never print or commit passwords, tokens, full phones, AppSecret, AccessKey, or raw private payloads.
- Historical DOUYIN_LIFE orders without real slot fields must not be inserted into today's schedule grid.
- Every loop must finish with one of: verified evidence, blocked reason, or rollback/cleanup note.

## File Ownership Map

| Area | Primary Files |
| --- | --- |
| Workbench state/API | `studio-workbench/src/shared/stores/appStore.ts`, `studio-workbench/src/shared/api/backend.ts`, `studio-workbench/src/shared/api/backendTypes.ts` |
| Dashboard/today | `studio-workbench/src/features/dashboard/DashboardView.vue`, `studio-workbench/src/features/schedule/ScheduleView.vue`, `studio-workbench/src/shared/components/schedule/*` |
| Orders/actions | `studio-workbench/src/features/orders/OrdersView.vue`, `studio-workbench/src/features/orders/orderOperations.ts`, `studio-workbench/src/features/orders/StaffBookingModal.vue` |
| Photo delivery | `studio-workbench/src/features/albums/PhotoMgmtView.vue`, `studio-workbench/src/features/albums/photoMgmtOperations.ts` |
| Merchant modules | `studio-workbench/src/features/merchant/*` |
| Card products | `studio-workbench/src/features/products/ProductCardManagementView.vue`, `ProductCardCatalogView.vue`, `components/CardProductModal.vue` |
| Backend order/inventory | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`, `YyBookingSlotInventoryServiceImpl.java` |
| Douyin Life | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/*`, `YyDouyinLifeSpiController.java` |
| Evidence/scripts | `tools/*.ps1`, `docs/evidence/*.md`, `docs/evidence/*.json` |
| Local maps | `docs\yiyue\*.md` |

## Loop 1: Make Deployment Repeatable

**Objective:** Turn the manual studio deploy sequence into one safe script so future agents do not accidentally deploy client-web/admin-ui or miss `release.txt`.

**Files:**
- Create: `tools/deploy-studio-workbench-hk2.ps1`
- Create: `tools/verify-studio-workbench-release.ps1`
- Create: `docs/evidence/studio-workbench-deploy-harness-20260620.md`

- [ ] Add `tools/deploy-studio-workbench-hk2.ps1` with parameters:
  - `-ReleaseId`
  - `-Build`
  - `-Deploy`
  - `-ProbeHttp`
  - `-DryRun`
  - `-SkipBuild`
- [ ] Script behavior:
  - When `-Build`, set `VITE_STUDIO_RELEASE_ID=$ReleaseId`, run `npm --prefix studio-workbench run build`, and write `studio-workbench/dist/release.txt`.
  - Package only `studio-workbench/dist/*` into `dist/studio-workbench-$ReleaseId.zip`.
  - Upload to `/opt/yingyue/releases/studio-workbench-$ReleaseId.zip`.
  - Deploy only `/var/www/studio.evanshine.me`.
  - Backup to `/opt/yingyue/backups/<timestamp>-pre-studio-workbench-$ReleaseId`.
  - Verify `index.html` contains `$ReleaseId`.
  - Run `nginx -t` before reload.
- [ ] Add `tools/verify-studio-workbench-release.ps1` to check:
  - `https://studio.evanshine.me/release.txt`
  - `/`, `/login`, `/dashboard/today`, `/order/appointment?quick=all`, `/service/photos`, `/merchant/decoration`, `/merchant/micro-pages`, `/merchant/micro-forms`, `/product/card-management`, `/product/card-catalog`
  - Each route HTTP 200 and HTML contains release id.
- [ ] Verification commands:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId dryrun-studio-verify -DryRun
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-studio-workbench-release.ps1 -ReleaseId prod-4ad8b11-studio-secure-env-20260620-012323 -AsJson
```

Expected:
- Dry run prints planned local/remote paths and exits 0.
- Verify script reports `markerMatched=true`, `failureCount=0`.

## Loop 2: Script Real Login Smoke Without Writing Data

**Objective:** Replace ad hoc screenshots with a repeatable non-write login smoke that proves the deployed workbench still opens the key modules.

**Files:**
- Create: `tools/run-studio-workbench-real-login-smoke.ps1`
- Create: `tools/studio-workbench-real-login-smoke.mjs`
- Modify: `docs/evidence/` via generated artifacts only

- [ ] PowerShell wrapper reads login credentials from existing local-only env/config, without printing them.
- [ ] Node/Playwright script logs into `https://studio.evanshine.me/login`.
- [ ] Script visits:
  - `/`
  - `/dashboard/today`
  - `/order/appointment?quick=all`
  - `/service/photos`
  - `/merchant/decoration`
  - `/merchant/micro-pages`
  - `/merchant/micro-forms`
  - `/product/card-management`
  - `/product/card-catalog`
- [ ] Script records:
  - `releaseTxt`
  - `markerMatched`
  - login result
  - visible route assertions
  - console errors
  - screenshot paths
- [ ] Verification command:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-real-login-smoke.ps1 -BaseUrl https://studio.evanshine.me -ReleaseId prod-4ad8b11-studio-secure-env-20260620-012323
```

Expected:
- JSON under `docs/evidence/studio-real-login-smoke-<timestamp>.json`.
- No secrets in output.
- No database writes.

## Loop 3: Controlled Appointment/Inventory Write Test

**Objective:** Prove the core JianYue-style daily loop with a synthetic staff booking: empty slot -> create booking -> show in slot -> reschedule -> inventory moves -> cancel -> inventory releases.

**Files:**
- Modify: `tools/run-studio-workbench-real-login-smoke.ps1`
- Create: `tools/run-studio-workbench-appointment-write-smoke.ps1`
- Create: `tools/studio-workbench-appointment-write-smoke.mjs`
- Generated: `docs/evidence/studio-appointment-write-smoke-<timestamp>.json`

- [ ] Use one real store id selected from bootstrap, preferably the first real visible store, not `DY-LIFE-DEFAULT`.
- [ ] Pick a future date/time slot with remaining capacity from `GET /yy/bookingSlotInventory/list`.
- [ ] Create synthetic order with a clearly searchable customer/order remark:
  - prefix: `CODEx_LOOP_STAFF_BOOKING_`
  - source: staff/manual local booking
  - no real customer notification
- [ ] Verify:
  - `yy_order` row appears in `/yy/order/list?storeId=&slotDate=`.
  - `yy_booking_slot_inventory.paid_count/booked_count` increases for the old slot.
- [ ] Reschedule to another available slot.
- [ ] Verify old slot count decreases and new slot count increases.
- [ ] Cancel the synthetic order.
- [ ] Verify final inventory returns to the original counts.
- [ ] Verification command:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\run-studio-workbench-appointment-write-smoke.ps1 -ApiBaseUrl https://api.evanshine.me -ReleaseId prod-4ad8b11-studio-secure-env-20260620-012323 -ConfirmWriteLocalDb
```

Expected:
- One synthetic order is created and then cancelled.
- Inventory is restored.
- Evidence includes order id, store id, old/new slot, before/after counts, and cleanup status.

## Loop 4: Orders Page Detail Actions

**Objective:** Make order detail actions feel complete and auditable: cancel reason, reschedule reason, status transitions, operation log refresh, operator display.

**Files:**
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/features/orders/orderOperations.ts`
- Modify: `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
- Add/modify: `studio-workbench/src/features/orders/orderOperations.test.ts`

- [ ] Add/verify visible reason presets for cancel and reschedule.
- [ ] Ensure submit buttons disable during pending request.
- [ ] After each action, call the existing refresh chain for:
  - current list
  - slot-scoped report orders
  - schedule/inventory
  - operation logs
- [ ] Operation log area must show:
  - operator name or fallback account
  - operation time
  - success/fail state
  - refresh button
- [ ] Verification:

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/stores/appStore.contract.test.ts
npm --prefix studio-workbench run build
```

Expected:
- Target tests pass.
- Build passes.

## Loop 5: Photo Delivery Realistic Closure

**Objective:** Stop treating photo delivery as just visible buttons; verify the real boundary for no-photo, uploaded-photo, notify, confirm, and deliver.

**Files:**
- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.vue`
- Modify: `studio-workbench/src/features/albums/photoMgmtOperations.ts`
- Modify: `studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts`
- Generated evidence under `docs/evidence/`

- [ ] For no-photo albums:
  - buttons remain visible but disabled or routed to upload
  - message says upload photos first
  - no notify/confirm/deliver API is called
- [ ] For test uploaded album:
  - upload or attach a harmless test image
  - verify preview/list refresh
  - run notify/confirm/deliver if backend supports it
  - if backend returns `fallback=true`, show "已记录，需要人工跟进"
- [ ] Verification:

```powershell
npm --prefix studio-workbench run test -- src/features/albums/PhotoMgmtView.contract.test.ts src/features/albums/photoMgmtOperations.test.ts
npm --prefix studio-workbench run build
```

Expected:
- No-photo state cannot fake success.
- Uploaded-photo state leaves evidence and audit rows.

## Loop 6: Merchant Decoration/Micro Page/Card Product Write Smoke

**Objective:** Finish the merchant-side real action loop while keeping public effects controlled.

**Files:**
- Modify as needed: `studio-workbench/src/features/merchant/*`
- Modify as needed: `studio-workbench/src/features/products/*`
- Tests: existing merchant/product contract tests
- Evidence: `docs/evidence/studio-merchant-card-write-smoke-<timestamp>.json`

- [ ] Merchant decoration:
  - save draft only
  - do not publish unless content is synthetic and reversible
  - verify draft reloads after refresh
- [ ] Micro page:
  - create or edit synthetic page `CODEx_LOOP_MICRO_PAGE_<timestamp>`
  - preview public route
  - if publish is used, immediately mark hidden/draft if API supports it
- [ ] Micro form:
  - create synthetic form bound to one real store
  - submit one synthetic response if public route allows
  - verify response appears in order/form submission list
- [ ] Card product:
  - create synthetic draft card `CODEx_LOOP_CARD_<timestamp>`
  - verify management list and catalog visibility
  - disable/archive the synthetic card if API supports it
- [ ] Verification:

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/MerchantDecorationView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/products/ProductCardManagementView.contract.test.ts src/features/products/ProductCardCatalogView.contract.test.ts
npm --prefix studio-workbench run build
```

Expected:
- All writes use synthetic names.
- Evidence records created ids and cleanup state.

## Loop 7: Douyin Life HK2 Truth Loop

**Objective:** Separate what is truly available through Douyin Life from what is local-only, and wire only trustworthy data into `yy_order` and `yy_booking_slot_inventory`.

**Files:**
- Existing: `tools/run-douyin-life-current-order.ps1`
- Existing: `tools/yingyue-douyin-real-account-discovery.ps1`
- Existing: `tools/get-douyin-life-acceptance-status.ps1`
- Modify only if needed: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/*`
- Evidence: `docs/evidence/douyin-life-hk2-loop-<timestamp>.json`

- [ ] Run HK2 read-only discovery:

```powershell
.\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -OutputJsonPath docs\evidence\douyin-life-hk2-loop-<timestamp>.json
```

- [ ] Confirm:
  - client token
  - POI list
  - SKU/product mapping candidates
  - order query
  - time stock get
  - latest callback/logid state
- [ ] If mappings are missing:
  - update local `yy_channel_product_mapping`
  - do not create fake store/product ids
- [ ] If order sync is run:
  - write only to `yy_order`
  - write to `yy_booking_slot_inventory` only when payload includes real `slot_date/start/end`
- [ ] Platform write operations allowed with evidence:
  - stock/time stock save only for a synthetic/test SKU or explicitly confirmed existing mapping
  - no refunds, no payment changes, no irreversible verification unless a concrete test order is selected
- [ ] Verification:

```powershell
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest,YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Expected:
- Evidence clearly says PASS/PARTIAL/BLOCKED per API.
- Every platform call includes logid if available.

## Loop 8: UI Parity After Data Contracts

**Objective:** Move toward JianYue clarity without visual-only fake work.

**Files:**
- `studio-workbench/src/features/dashboard/DashboardView.vue`
- `studio-workbench/src/shared/components/schedule/*`
- `studio-workbench/src/features/orders/OrdersView.vue`
- `studio-workbench/src/style.css`

- [ ] Keep half-hour slots.
- [ ] Keep morning/afternoon/evening sections, not horizontal drag rows for the main schedule.
- [ ] Slot card must show:
  - time
  - booked / capacity
  - remaining
  - full/conflict state
  - click action
- [ ] Slot detail must show:
  - scoped orders
  - add booking entry
  - capacity adjustment entry if allowed
- [ ] Verification:

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts
npm --prefix studio-workbench run build
```

Expected:
- Main daily schedule remains clear on 1280x720 and mobile-width screenshots.
- No page uses fake mock stores/products.

## Loop 9: Mobile/Customer Side Follow-Through

**Objective:** Ensure Joe/uniapp customer booking is not just a frontend shell.

**Files:**
- `mobile-uniapp/src/api/home.ts`
- `mobile-uniapp/src/api/customer.ts`
- `mobile-uniapp/src/pages/product/detail/index.vue`
- `mobile-uniapp/src/pages/customer/orders/index.vue`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyClientPublicApiServiceImpl.java`

- [ ] Verify production does not fallback to demo data.
- [ ] Verify customer create order writes `yy_order`.
- [ ] Verify customer order occupies `yy_booking_slot_inventory`.
- [ ] Verify payment remains placeholder: `paymentReady=false`.
- [ ] Verify customer cancel/reschedule updates inventory correctly.
- [ ] Verification:

```powershell
node --test mobile-uniapp/tests/production-real-api-contract.test.cjs
npm --prefix mobile-uniapp run typecheck
npm --prefix mobile-uniapp run test
npm --prefix mobile-uniapp run build:h5
```

Expected:
- No demo fallback in production.
- Payment does not fake success.

## Loop 10: Evidence, Maps, And Local Handoff

**Objective:** Keep the project operable for the next AI without relying on chat history.

**Files:**
- `docs\yiyue\code_map.md`
- `docs\yiyue\api_map.md`
- `docs\yiyue\function_map.md`
- `docs\yiyue\optimization_map.md`
- `docs/evidence/*.md`
- `docs/evidence/*.json`

- [ ] After each loop, append:
  - changed files
  - command results
  - release id if deployed
  - created synthetic ids
  - cleanup status
  - remaining risks
- [ ] Keep a final local handoff:
  - current branch and local commits not pushed
  - HK2 release
  - latest evidence
  - next safe command
- [ ] Verification:

```powershell
rg -n "APPSecret|AccessKey|password\s*=|密码\s*[:=]|token\s*[:=]|Authorization|Bearer" docs\evidence docs\yiyue\code_map.md docs\yiyue\api_map.md docs\yiyue\function_map.md docs\yiyue\optimization_map.md
git status --short --branch
```

Expected:
- No real secrets in evidence.
- Git status shows only intentional local commits and known unrelated untracked files.

## Overnight Execution Order From Current State

1. Loop A: photo delivery closure.
   - Verify no-photo albums block notify/confirm/deliver.
   - Verify uploaded-photo test album can notify, confirm, and mark delivered when backend supports it.
   - If notification is not wired, surface a truthful fallback state instead of fake success.
2. Loop B: merchant decoration, micro-page, micro-form, and card product write smoke.
   - Save draft decoration only.
   - Use synthetic micro-page, micro-form, and card names.
   - Public preview must open after refresh.
   - Disable/archive synthetic records if API supports cleanup.
3. Loop C: Douyin Life HK2 truth loop.
   - Run HK2 read-only discovery first.
   - Confirm account, POI, SKU, mapping, order query, callback/logid state.
   - Write local DB only for real mappings and real slot payloads.
   - Write platform inventory only with explicit target SKU/POI and captured logid.
   - No refund, charge, irreversible verify, or real customer notification.
4. Loop D: JianYue-style dashboard/order UI closure.
   - Keep half-hour slots.
   - Keep morning/afternoon/evening grouping.
   - Do not expose "all stores" to normal store-scope users.
   - Slot click opens capacity, orders, add-booking, and inventory actions.
   - Order detail shows reason, operator, log refresh, and slot return path.
5. Loop E: customer/mobile public API closure.
   - Joe `mobile-uniapp` pages must call real backend APIs, not demo fallback in production.
   - Client order/booking creates `yy_order`.
   - Real scheduled booking occupies `yy_booking_slot_inventory`.
   - Online payment stays pre-reserved with `paymentReady=false`.
6. Loop F: quality, maps, and final local handoff.
   - Run targeted tests plus build for touched module.
   - Deploy HK2 only after passing build.
   - Update local maps under `docs\yiyue`.
   - Record evidence path, release id, created synthetic ids, cleanup state, and next safe command.
   - Local commit is allowed after stabilization; GitHub push remains disabled.

## Stop Conditions

Stop and report instead of continuing if:

- GitHub push is requested again.
- HK2 deploy fails and rollback also fails.
- A platform write would refund, charge, verify, or notify a real customer without a synthetic test target.
- The same smoke fails three times in the same area with no new evidence.
- Required credentials or platform permissions are missing.

## Self-Review

- Spec coverage: Covers no-GitHub loop, HK2 deploy, local code quality, evidence scripts, read/write online probes, order/inventory writes, Douyin platform write boundary, JianYue-style schedule/orders/photo/merchant/card/mobile gaps.
- Placeholder scan: No placeholder markers; each loop has files, commands, expected evidence, and stop conditions.
- Type consistency: Uses existing project names: `yy_order`, `yy_booking_slot_inventory`, `DOUYIN_LIFE`, `studio-workbench`, HK2 helper `tools/invoke-hk2.ps1`.
