# Studio Workbench Real Login Deep Flow - 2026-06-19

## Summary

- Site: `https://studio.evanshine.me`
- Backend: `https://api.evanshine.me`
- Account checked: `store-admin`
- Scope: real production login, read-only route checks, appointment slot to order detail, photo action gate, and micro-form submission entry.

No password, token, raw payload, or full customer phone number is recorded here. Browser JSON evidence was redacted before keeping it.

## Login Smoke

`POST https://api.evanshine.me/auth/login` returned:

```text
code=200
token=present
clientId=e5cd7e4891bf95d1d19206ce24a7b32e
```

Browser login reached:

```text
https://studio.evanshine.me/dashboard/today
```

No redirect back to `/login` was observed.

## Route Checks

Evidence directory:

```text
docs/evidence/studio-real-acceptance-20260619-login-routes/
```

Checked routes:

| Route | Result |
| --- | --- |
| `/dashboard/today` | OK; `今日预约` and `经营概况` visible |
| `/order/appointment` | OK; appointment order console visible |
| `/service/photos` | OK; photo delivery console visible |
| `/merchant/decoration` | OK; store decoration page visible |
| `/merchant/micro-pages` | OK; published micro page list visible |
| `/merchant/micro-forms` | OK; micro form list visible |
| `/product/card-management` | OK; card management empty state visible |
| `/product/card-catalog` | OK; card catalog empty state visible |
| `/order/forms` | OK; form submission list visible |

None redirected to login or showed a visible 403 state.

## Appointment Slot Flow

Verified production data through read-only API:

| Date | Store | Slot | Count | Status |
| --- | --- | --- | --- | --- |
| `2026-06-19` | `900000000000000100` | `13:30-14:00` | `1` | `PENDING` |
| `2026-06-19` | `900000000000000100` | `15:00-15:30` | `1` | `PENDING` |
| `2026-06-18` | `900000000000000100` | `18:00-18:30` | `1` | `PENDING` |

Dashboard route:

```text
/dashboard/today?date=2026-06-19&storeId=900000000000000100&slotStart=13:30&slotEnd=14:00
```

Observed after backend data finished loading:

```text
13:30-14:00
orders=1
capacity=1/1
full=true
store=滨州万达店
```

Note: immediately after page load, the slot can briefly show inventory before order aggregation finishes. After waiting for backend data, the count reconciled to `orders=1`.

## Slot-Scoped Order Detail

Order route:

```text
/order/appointment?date=2026-06-19&start=2026-06-19&end=2026-06-19&storeId=900000000000000100&slotStart=13:30&slotEnd=14:00
```

Observed:

- `API 已连接`
- `共 1 条`
- `时段 13:30-14:00`
- masked order marker: `JY-12118454`
- drawer opened when the order number was clicked

Detail drawer observed:

- `回到该时段`
- customer information block, redacted in saved JSON
- appointment time `06-19 13:30`
- payment state `已支付`
- lifecycle chain `待确认 -> 已确认 -> 已到店 -> 服务中 -> 已完成`
- cancel section with refund boundary guidance
- source context `JIANYUE`
- timeline section

Non-destructive boundary:

- Did not click `确认订单`
- Did not click `取消预约`
- Did not submit `保存改期`

## Photo Actions

Order detail:

- `通知客户` disabled with reason `请先选择相册`
- `客片确认` disabled with reason `请先选择相册`
- `资料发送` disabled with reason `请先选择相册`
- `去客片管理` visible

Photo management route:

```text
/service/photos
```

Observed:

- photo delivery console visible
- album placeholders visible
- current account has many placeholder albums from Douyin order sync
- selected empty album action gate works:
  - `通知客户` disabled with reason `请先上传底片`
  - `客片确认` disabled with reason `请先上传底片`
  - `资料发送` disabled with reason `请先上传底片`

## Micro Form Submission Entry

Route:

```text
/order/forms
```

Observed:

- one real test submission visible
- `去订单跟进` visible
- `转预约` visible
- follow states `待跟进 / 已跟进 / 已关闭` visible

Non-destructive boundary:

- Did not convert the submission into an appointment.
- Did not update follow status.

## Evidence Files

Kept JSON evidence:

```text
docs/evidence/studio-real-acceptance-20260619-login-routes/route-check.json
docs/evidence/studio-real-acceptance-20260619-deep-flow/dashboard-slot-1330-after-wait.json
docs/evidence/studio-real-acceptance-20260619-deep-flow/slot-scoped-orders-1330.json
docs/evidence/studio-real-acceptance-20260619-deep-flow/order-detail-after-click.json
docs/evidence/studio-real-acceptance-20260619-deep-flow/photos-actions.json
docs/evidence/studio-real-acceptance-20260619-deep-flow/form-submission-transfer.json
```

Sensitive screenshots that included customer detail text were removed from the kept evidence set.

## Remaining Gaps

1. Dashboard loading state can briefly show inventory count before order aggregation completes; acceptable but worth tightening with a clearer loading indicator on slot counts.
2. Order page store filtering was tightened after this pass: `/order/appointment` now scopes to a concrete store by default, removes the visible `全部门店` option, and writes `storeId/astore/dm` from the resolved concrete store scope.
3. Card product pages are route-ready but empty. Need a minimal card product create/edit/publish/downline loop with test data.
4. Photo delivery action gates are correct, but real upload -> notify -> confirm -> deliver needs a dedicated test album or explicit approval.
5. Micro-form submission -> staff booking entry was route-visible but not submitted in production during this pass.

## Store Scope Follow-up

Changed files:

```text
studio-workbench/src/features/orders/OrdersView.vue
studio-workbench/src/features/orders/OrdersView.contract.test.ts
```

Verification:

```powershell
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts
# 1 file / 45 tests passed

npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/dashboard/DashboardView.contract.test.ts src/shared/components/schedule/JianyueSlotGrid.contract.test.ts
# 4 files / 120 tests passed

npm --prefix studio-workbench run build
# passed; existing echarts-vendor chunk-size warning only
```
