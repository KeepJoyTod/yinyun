# Studio Workbench Module Split Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for execution. Each task must be implemented in a fresh subagent or isolated worktree batch, then reviewed in the main session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the overgrown `studio-workbench` order, dashboard, API, and store files into stable modules without breaking the real appointment/order/capacity chain.

**Architecture:** Keep current behavior first, then move logic behind compatibility facades. `yy_order` remains the single order/appointment ledger, `yy_booking_slot_inventory` remains the only schedule/capacity ledger, and `backend.ts` / `appStore.ts` stay as temporary public facades until consumers are migrated. No visual redesign is part of this plan.

**Tech Stack:** Vue 3, TypeScript, Vite, Vitest, Java/RuoYi backend references, PowerShell deploy scripts, local canonical maps under `C:\Users\Administrator\Desktop\yiyue`.

---

## Current Findings

### Files Over Target

| Area | File | Current size | Risk |
| --- | --- | ---: | --- |
| Appointment orders page | `studio-workbench/src/features/orders/OrdersView.vue` | 2413 lines | One page owns route query, filters, detail drawer, mutation calls, operation logs, slot scoping, exports, and staff booking entry points. |
| Global store facade | `studio-workbench/src/shared/stores/appStore.ts` | 2067 lines | Several domain stores already exist, but the monolith still owns bootstrapping, demo fallback, real API hydration, mutations, and derived cache. |
| Backend API facade | `studio-workbench/src/shared/api/backend.ts` | 1918 lines | Mapping, payload building, row CRUD, public micro pages, merchant settings, orders, albums, Douyin sync, and reports are mixed. |
| Dashboard | `studio-workbench/src/features/dashboard/DashboardView.vue` | 1219 lines | 今日预约, 经营概况, route jumps, command cards, slot actions, and inventory scope are coupled. |
| Photo delivery | `studio-workbench/src/features/albums/PhotoMgmtView.vue` | 1149 lines | 客片上传/通知/确认/资料发送, access logs, selection links, and filters are coupled. |
| Order helpers | `studio-workbench/src/features/orders/orderOperations.ts` | 1087 lines | Status grouping, filters, export query, slot mapping, reschedule inventory, operation-log evidence, and channel sync diagnostics are mixed. |
| Order tests | `studio-workbench/src/features/orders/OrdersView.contract.test.ts` | 1010 lines | Contract tests protect too many unrelated behaviors in one file, making targeted changes slow. |

### Already Split But Not Fully Consumed

| Existing module | State |
| --- | --- |
| `shared/stores/ordersStore.ts` | Exists and should receive order-specific state/mutations from `appStore.ts`. |
| `shared/stores/albumsStore.ts` | Exists and should receive album/photo-delivery state from `appStore.ts` and `PhotoMgmtView.vue`. |
| `shared/stores/operationLogStore.ts` | Exists and should own operation-log read models. |
| `shared/stores/productStore.ts` | Exists and should own products/SKU/card catalog state. |
| `shared/stores/settingsStore.ts` | Exists and should own settings/employees/channels. |
| `shared/stores/storeIndex.ts` | Exists and should become the app-level compatibility aggregator. |
| `features/orders/Order*.vue` components | Detail drawer has already been partially componentized; `OrdersView.vue` should become orchestration, not the owner of all detail UI state. |

## Non-Negotiable Business Boundaries

- Do not rewrite order/capacity semantics during structural splitting.
- `yy_order` remains the only order and appointment ledger.
- `yy_booking_slot_inventory` remains the only capacity and time-slot ledger.
- Historical `DOUYIN_LIFE` orders without real `slot_date`, `slot_start_time`, and `slot_end_time` must not enter 今日预约排期.
- Keep `DOUYIN_LIFE` and `DOUYIN_MINI_APP` separate in APIs, mappings, tests, and UI labels.
- Do not remove current compatibility routes such as `/orders`, `/schedule`, `/photo-mgmt`, or public `/public/micro-page/:id`.
- Do not expose or commit secrets from `C:\Users\Administrator\Desktop\yiyue\APPID.txt`, `APPSecret.txt`, `backend\.env.local`, or server env files.
- Do not run `git add .`; evidence directories are noisy and must be selected explicitly.

## File Size Rules

| File type | Target | Temporary max during migration | Action when exceeded |
| --- | ---: | ---: | --- |
| Vue page view | <= 500 lines | 800 lines | Extract composables or child components. |
| Vue leaf component | <= 350 lines | 500 lines | Split visual sections or move pure logic to TS. |
| TypeScript helper | <= 500 lines | 800 lines | Split by domain function and tests. |
| Store module | <= 600 lines | 900 lines | Split domain stores and keep facade exports. |
| API module | <= 500 lines | 800 lines | Split by backend resource group. |
| Contract test file | <= 800 lines | 1000 lines | Split by behavior cluster. |

These limits are not style preferences. They are context-control rules so future agents can reason about one module at a time.

## Desired Module Boundaries

### Orders Page

Create these composables under `studio-workbench/src/features/orders/composables/`:

| New file | Responsibility |
| --- | --- |
| `useOrderRouteScope.ts` | Read/write URL query: quick filter, `storeId`, `slotStart`, `slotEnd`, `date`, `orderId`, search query. No API calls. |
| `useOrderFilters.ts` | Dropdown filters, advanced filters, date ranges, status tabs, effective filtered order list. No router mutation. |
| `useOrderDetailState.ts` | Selected order, selected album/product/source context computed state. No status mutation. |
| `useOrderMutations.ts` | Confirm/arrive/serve/complete/cancel/reschedule/sync calls. Must expose loading/error/result events. |
| `useOrderOperationLogs.ts` | Load operation logs, derive operation evidence cards, refresh after mutation. |
| `useOrderSlotScope.ts` | Slot-scoped order loading and reschedule route sync. Owns `slotRange` and `slotScopedDashboardContext`. |

`OrdersView.vue` should keep:

- template layout;
- importing composables/components;
- wiring events between route, list, drawer, and store;
- no large pure business functions.

### Order Helpers

Split `orderOperations.ts` into:

| New file | Move from current helper |
| --- | --- |
| `orderStatusOperations.ts` | `isRefundedOrder`, `isCancelledOrder`, `isEffectiveOrder`, `orderStatusGroupKeys`, `matchesOrderStatusGroup`, status counts, next actions, flow steps. |
| `orderFilterOperations.ts` | quick filters, search query guard, deep link matching, date filter helpers. |
| `orderSlotOperations.ts` | `OrderSlotRange`, schedule item mapping, slot-range matching, reschedule inventory slot/conflict logic. |
| `orderExportOperations.ts` | export query building, unsupported export filters, export sync notices. |
| `orderPhotoDeliveryOperations.ts` | photo delivery stage and related timeline helpers. |
| `orderOperationLogEvidence.ts` | operation-log filtering, source/operator formatting, evidence cards, channel sync diagnostics. |
| `orderOperations.ts` | compatibility barrel export only during migration. |

### Store Layer

`appStore.ts` should become a facade that delegates to existing domain stores:

| Store | Owns |
| --- | --- |
| `ordersStore.ts` | orders list, order status stats, order trend stats, order mutations, order sync timestamps. |
| `albumsStore.ts` | albums, photo assets, photo access logs, album actions. |
| `operationLogStore.ts` | operation logs and operation-log derived indexes. |
| `productStore.ts` | products, packages, card products, Douyin product mappings. |
| `settingsStore.ts` | employees, roles, channels, templates, workbench settings. |
| `channelStore.ts` | channel sync logs, channel health, Douyin-specific sync state. |
| `customersStore.ts` | customers and customer-facing lookup state. |
| `storeIndex.ts` | bootstrap order and compatibility aggregation for legacy consumers. |

Migration rule: no caller should be forced to change in the same PR as the extraction. First move data/functions behind existing `appStore` names, then migrate callers in later small batches.

### API Layer

Split `backend.ts` into resource APIs under `studio-workbench/src/shared/api/modules/`:

| New file | Owns |
| --- | --- |
| `ordersApi.ts` | `listOrders`, `updateOrderStatus`, `cancelOrder`, `rescheduleOrder`, `syncDouyinLifeOrders`, order stats/export. |
| `inventoryApi.ts` | booking inventory, stock query, slot capacity operations. |
| `albumsApi.ts` | albums, photo upload, photo action, photo access logs. |
| `merchantApi.ts` | decoration, micro pages/forms, service groups, store settings. |
| `productsApi.ts` | products, packages, card products, Douyin mapping list/update. |
| `settingsApi.ts` | employees, roles, channels, templates, logs. |
| `publicApi.ts` | public micro page/form/customer-side APIs. |
| `reportsApi.ts` | finance, snapshots, daily reports. |
| `backend.ts` | compatibility facade exporting `backendApi` with the same public shape. |

`backendTypes.ts` may stay longer, but type sections should later split into `ordersTypes.ts`, `merchantTypes.ts`, `albumsTypes.ts`, `publicTypes.ts`.

### Dashboard

Split `DashboardView.vue` into:

| New file | Responsibility |
| --- | --- |
| `dashboardOperations.ts` | Existing pure dashboard calculations; keep expanding here instead of page body. |
| `useDashboardRouteActions.ts` | Build route queries for orders, inventory, photos, reports, staff booking. |
| `useDashboardSlotBoard.ts` | Selected date/store, morning/afternoon/evening groups, half-hour slot actions. |
| `DashboardBusinessOverview.vue` | 经营概况 cards and status counts. |
| `DashboardSlotBoard.vue` | 今日预约 slot board; no global store mutation. |
| `DashboardCommandPanel.vue` | 快捷入口 and operational command cards. |

Dashboard cannot show `全部门店` in daily schedule interactions unless user role explicitly supports cross-store operation. Default daily schedule scope must be one concrete `yy_store.id`.

### Photo Delivery

Split `PhotoMgmtView.vue` into:

| New file | Responsibility |
| --- | --- |
| `photoMgmtOperations.ts` | Keep/expand pure availability and stage helpers. |
| `usePhotoFilters.ts` | Date/store/status filters and route sync. |
| `usePhotoActions.ts` | Notify/confirm/deliver actions and loading state. |
| `PhotoAlbumList.vue` | Album cards/list/table. |
| `PhotoAlbumDetailDrawer.vue` | Detail, access logs, action buttons. |
| `PhotoUploadPanel.vue` | Upload and asset display. |

## Execution Phases

### Phase 0: Stabilize Current Order Chain

**Goal:** Finish the current local fix before structural refactor.

- [ ] Verify local diff in `OrdersView.vue` and `OrdersView.contract.test.ts`.
- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/shared/tooling/studioWorkbenchSmokeScripts.contract.test.ts
```

Expected: pass.

- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Expected: pass.

- [ ] Deploy if production-facing:

```powershell
& D:\OtherProject\CameraApp\yingyue-cloud-repo\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId prod-order-slot-rescope-20260621-2306 -Build -Deploy -ProbeHttp
```

- [ ] Run real click smoke:

```powershell
& D:\OtherProject\CameraApp\yingyue-cloud-repo\tools\run-studio-workbench-real-click-smoke.ps1 -ConfirmWriteLocalDb
```

Stop condition: if real smoke fails, fix the specific order-chain bug before any split.

### Phase 1: Guardrails Before Splitting

**Goal:** Add mechanical visibility so files stop growing silently.

- [ ] Create `studio-workbench/scripts/check-file-size.mjs`.
- [ ] Create `studio-workbench/src/shared/tooling/fileSizeGuard.contract.test.ts`.
- [ ] Check the current top offenders as known exceptions with target owners and dates.
- [ ] Add npm script `"check:file-size": "node scripts/check-file-size.mjs"`.
- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/shared/tooling/fileSizeGuard.contract.test.ts
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run check:file-size
```

Rule: the guard may allow known over-limit files during migration, but it must fail for any new over-limit file.

### Phase 2: Split `orderOperations.ts`

**Goal:** Extract pure order helper modules first because tests already cover them and behavior risk is lower than Vue extraction.

- [ ] Move status helpers to `orderStatusOperations.ts`.
- [ ] Move filter/search helpers to `orderFilterOperations.ts`.
- [ ] Move slot/reschedule helpers to `orderSlotOperations.ts`.
- [ ] Move export helpers to `orderExportOperations.ts`.
- [ ] Move photo stage helpers to `orderPhotoDeliveryOperations.ts`.
- [ ] Move operation-log/channel evidence helpers to `orderOperationLogEvidence.ts`.
- [ ] Keep `orderOperations.ts` as a barrel export with deprecation comment.
- [ ] Split `orderOperations.test.ts` into matching test files.
- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/orders/orderStatusOperations.test.ts src/features/orders/orderFilterOperations.test.ts src/features/orders/orderSlotOperations.test.ts src/features/orders/orderExportOperations.test.ts src/features/orders/orderPhotoDeliveryOperations.test.ts src/features/orders/orderOperationLogEvidence.test.ts
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Expected: behavior unchanged; imports through `orderOperations.ts` still work.

### Phase 3: Split `OrdersView.vue`

**Goal:** Convert `OrdersView.vue` into an orchestration view below 800 lines first, then below 500 lines.

- [ ] Extract route/query logic to `composables/useOrderRouteScope.ts`.
- [ ] Extract list filters to `composables/useOrderFilters.ts`.
- [ ] Extract slot scope to `composables/useOrderSlotScope.ts`.
- [ ] Extract selected-order drawer state to `composables/useOrderDetailState.ts`.
- [ ] Extract mutation calls to `composables/useOrderMutations.ts`.
- [ ] Extract operation-log refresh to `composables/useOrderOperationLogs.ts`.
- [ ] Split `OrdersView.contract.test.ts` into:
  - `OrdersView.routeScope.contract.test.ts`
  - `OrdersView.slotScope.contract.test.ts`
  - `OrdersView.detailDrawer.contract.test.ts`
  - `OrdersView.mutations.contract.test.ts`
  - `OrdersView.photoActions.contract.test.ts`
- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/orders/OrdersView.routeScope.contract.test.ts src/features/orders/OrdersView.slotScope.contract.test.ts src/features/orders/OrdersView.detailDrawer.contract.test.ts src/features/orders/OrdersView.mutations.contract.test.ts src/features/orders/OrdersView.photoActions.contract.test.ts
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Acceptance:

- `OrdersView.vue` <= 800 lines after first pass.
- Slot deep link still supports `date`, `storeId`, `slotStart`, `slotEnd`.
- Reschedule updates route slot scope to the new half-hour.
- Status transition refreshes operation logs before the success state is considered complete.

### Phase 4: Split `backend.ts`

**Goal:** Make API ownership clear while preserving `backendApi` public shape.

- [ ] Create `shared/api/modules/ordersApi.ts` and move order-related mapping/calls.
- [ ] Create `inventoryApi.ts` and move inventory calls.
- [ ] Create `albumsApi.ts` and move album/photo calls.
- [ ] Create `merchantApi.ts` and move decoration/micro-page/micro-form/service-group calls.
- [ ] Create `productsApi.ts` and move product/card/mapping calls.
- [ ] Create `settingsApi.ts` and move employee/channel/template/log calls.
- [ ] Create `publicApi.ts` and move public customer/micro-page/form calls.
- [ ] Keep `backend.ts` as:

```ts
import { ordersApi } from './modules/ordersApi'
import { inventoryApi } from './modules/inventoryApi'
import { albumsApi } from './modules/albumsApi'
import { merchantApi } from './modules/merchantApi'
import { productsApi } from './modules/productsApi'
import { settingsApi } from './modules/settingsApi'
import { publicApi } from './modules/publicApi'

export const backendApi = {
  ...ordersApi,
  ...inventoryApi,
  ...albumsApi,
  ...merchantApi,
  ...productsApi,
  ...settingsApi,
  ...publicApi,
}
```

- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/shared/api/backend.contract.test.ts src/shared/api/yingyueAdapter.test.ts
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Acceptance: no caller changes required in this phase.

### Phase 5: Split `appStore.ts`

**Goal:** Move domain state to existing stores while preserving `appStore` compatibility.

- [ ] Move order list/stats/sync state to `ordersStore.ts`.
- [ ] Move album/photo state to `albumsStore.ts`.
- [ ] Move operation logs to `operationLogStore.ts`.
- [ ] Move product/package/card state to `productStore.ts`.
- [ ] Move settings/employees/channels to `settingsStore.ts` and `channelStore.ts`.
- [ ] Keep `appStore.ts` as a compatibility facade over `storeIndex.ts`.
- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/shared/stores/appStore.contract.test.ts src/shared/stores/appStoreTransforms.test.ts
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Acceptance:

- `appStore.ts` <= 900 lines after first pass, <= 600 lines after caller migration.
- Existing imports of `appStore` still pass.

### Phase 6: Split Dashboard And Photo Management

**Goal:** Reduce the two largest remaining views after order/API/store boundaries are stable.

- [ ] Extract dashboard route actions and slot board state.
- [ ] Split dashboard visual sections into components.
- [ ] Extract photo management filters/actions/detail drawer.
- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/albums/photoMgmtOperations.test.ts src/features/orders/OrdersView.slotScope.contract.test.ts
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

Acceptance:

- `DashboardView.vue` <= 800 lines, then <= 500.
- `PhotoMgmtView.vue` <= 800 lines, then <= 500.
- 首页时段 -> 预约订单详情 -> 取消/改期 -> 库存返回 still passes real smoke.

### Phase 7: Route And Feature Registry Cleanup

**Goal:** Keep navigation deterministic after module splits.

- [ ] Ensure `featureRegistry.ts` remains the only staff feature registry.
- [ ] Do not merge Joe666/Stella alternate route trees over current registry.
- [ ] Add missing feature-map references for extracted modules.
- [ ] Run:

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- src/app/router/featureRegistry.contract.test.ts src/app/router/router.contract.test.ts
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

### Phase 8: Local Maps And Handoff

**Goal:** Make future AI handoff deterministic.

- [ ] Update `C:\Users\Administrator\Desktop\yiyue\code_map.md`.
- [ ] Update `C:\Users\Administrator\Desktop\yiyue\function_map.md` if user-visible behavior changes.
- [ ] Update `C:\Users\Administrator\Desktop\yiyue\api_map.md` if API module ownership changes.
- [ ] Update `C:\Users\Administrator\Desktop\yiyue\optimization_map.md`.
- [ ] Update `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\CLAUDE-HANDOFF.md` or equivalent handoff file after major phase completion.

## Multi-Agent Dispatch Plan

Use parallel agents only where files do not overlap.

| Agent | Scope | Writable files | Must not touch | Output |
| --- | --- | --- | --- | --- |
| A Order pure helpers | Phase 2 | `features/orders/order*Operations*.ts`, matching tests | `OrdersView.vue`, API/store files | Passing helper tests and split summary. |
| B Orders view composables | Phase 3 | `OrdersView.vue`, `features/orders/composables/*`, order contract tests | `backend.ts`, `appStore.ts` | Route/detail/mutation composables and passing order contracts. |
| C API facade | Phase 4 | `shared/api/backend.ts`, `shared/api/modules/*`, API tests | Vue pages, stores | Same `backendApi` public shape, passing API contracts. |
| D Store facade | Phase 5 | `shared/stores/*`, store tests | Vue pages except import adjustments if unavoidable | Same `appStore` public shape, passing store contracts. |
| E Dashboard/photo | Phase 6 | `DashboardView.vue`, `PhotoMgmtView.vue`, new components/composables | API/store internals | Reduced page size and passing contracts. |
| F Maps/guardrails | Phase 1 and 8 | docs, maps, file-size guard | Business code | Current maps and guard output. |

Merge order:

1. A, C, F can start first.
2. B waits for A if it imports split helpers directly.
3. D waits for C if store calls import API modules directly.
4. E waits for B and D to avoid conflicting state assumptions.

## Verification Matrix

| Change type | Required verification |
| --- | --- |
| Pure order helper split | `order*Operations*.test.ts` + `npm run build` |
| Orders page composables | split `OrdersView.*.contract.test.ts` + real click smoke before deploy |
| API split | `backend.contract.test.ts`, `yingyueAdapter.test.ts`, build |
| Store split | `appStore.contract.test.ts`, `appStoreTransforms.test.ts`, build |
| Dashboard/photo split | dashboard/photo/order targeted contracts + build |
| Production deploy | `deploy-studio-workbench-hk2.ps1 -Build -Deploy -ProbeHttp`, then real login/click smoke |

## Stop Rules

Stop and fix before continuing when:

- any structural split changes visible order counts/status groups;
- route query loses `storeId`, `date`, `slotStart`, or `slotEnd`;
- reschedule no longer updates slot-scoped route context;
- status transition succeeds but operation log evidence does not refresh;
- historical `DOUYIN_LIFE` orders appear in 今日预约 without real slot fields;
- `backendApi` or `appStore` compatibility shape breaks unrelated pages.

## Definition Of Done

The refactor is done when:

- no Vue page view exceeds 800 lines, with active plan to move below 500;
- no TS helper/store/API module exceeds the temporary max without an exception entry;
- `OrdersView.vue`, `appStore.ts`, `backend.ts`, `DashboardView.vue`, and `PhotoMgmtView.vue` each have one clear responsibility;
- all current appointment/order/capacity flows pass targeted tests and real smoke;
- local maps under `C:\Users\Administrator\Desktop\yiyue` describe the new ownership;
- HK2 deployment evidence exists for any production-facing change.
