# Studio Workbench Real Login Regression - 2026-06-19

## Summary

- Site: `https://studio.evanshine.me`
- Backend: `https://api.evanshine.me`
- Release marker: `prod-949e639-photo-actions-20260619-0155`
- Account checked: `store-admin`
- Scope: restore real staff login and verify the core workbench routes with a real production login state.

No password, token, raw private payload, or full customer phone number is recorded in this evidence file.

## Login Diagnosis

Initial API login attempts returned:

```text
code=500
message=Password input error
token=absent
```

Root cause:

- The production `store-admin` account existed and was enabled.
- Database status check returned `user_id=990010`, `status=0`, `del_flag=0`, `tenant_id=000000`.
- The shared local handoff document and the production password hash were out of sync.

Fix applied on HK2:

- Updated only `sys_user.user_name='store-admin'` under `tenant_id='000000'`.
- Reset the password hash to match the local handoff password.
- Cleared Redis key `pwd_err_cnt:store-admin`.
- SQL result: `UPDATE 1`.

Post-fix API verification:

```text
POST https://api.evanshine.me/auth/login
code=200
token=present
```

## Real Browser Verification

The in-app browser used the normal staff login page:

```text
https://studio.evanshine.me/login
```

After login, the browser reached:

```text
https://studio.evanshine.me/dashboard/today
```

Observed:

- Sidebar shows the staff workbench navigation.
- User scope shows `滨州万达店`.
- Store summary shows `5 家门店 · 滨州万达店`.
- Page is not redirected to `/login`.
- No 403/Forbidden state was visible.

## Appointment Slot Flow

Verified route:

```text
/dashboard/today
```

Observed:

- Today schedule uses `上午 / 下午 / 晚上`.
- Slots are grouped as half-hour cards.
- No `全部门店` / `全门店` selector is shown on the dashboard.
- Current store scope is a concrete `yy_store.id` backed store.

Verified slot:

```text
2026-06-19 13:30-14:00
store=滨州万达店
```

Observed detail panel:

```text
slot=13:30-14:00
status=已满
orders=1
capacity=1/1
remaining=0
conflict=0
```

The slot detail listed one order and exposed:

- `查看该时段订单`
- `调整容量`
- inventory-full warning before manual booking

## Appointment Order Detail

Verified deep link from the selected dashboard slot:

```text
/order/appointment?...&storeId=900000000000000100&slotStart=13:30&slotEnd=14:00
```

Observed:

- Appointment orders page loaded with `API 已连接`.
- Slot-scoped result count was `1`.
- The target order detail drawer opened.
- `回到该时段` was visible.
- The order showed store, scheduled time, status, amount, payment state, channel/source, and action area.

Cancel guidance:

- The cancel section displayed channel/payment-aware guidance.
- It states that workbench cancellation updates the local `yy_order` state, while paid external refunds must be handled on the corresponding payment/platform side.

Photo action gate:

- The selected order had no linked album.
- `通知客户`, `客片确认`, and `资料发送` were disabled.
- Button titles/reasons showed `请先选择相册`.
- `去客片管理` was available.

## Route Regression

The following real-login routes were checked. None redirected to login, none showed a visible 403/Forbidden state, and no visible runtime error text was found.

| Route | Result |
| --- | --- |
| `/merchant/decoration` | OK |
| `/merchant/micro-pages` | OK; published micro page list visible |
| `/merchant/micro-forms` | OK; published micro form list visible |
| `/product/card-management` | OK; empty card-management state visible |
| `/product/card-catalog` | OK; empty card-catalog state visible |
| `/service/photos` | OK; photo delivery console visible |

## Remaining Gaps

- This pass did not click destructive actions such as real cancellation, status transition, publishing changes, or uploading files.
- Card product pages are route-ready but currently have no card product data.
- Photo management has correct empty/action states for the current account, but end-to-end upload and delivery still need a separate non-destructive test album or explicit approval.
- Micro page/form edit-save-publish was not repeated in this pass; previous evidence covers that flow.

## 2026-06-19 Dashboard Slot Orders Deep-Link Fix

Regression reproduced before the fix:

```text
/dashboard/today -> select slot 13:30-14:00 -> 查看该时段订单
```

Observed broken route:

```text
/order/appointment?quick=all&time=arrival&start=2026-06-19&end=2026-06-19&storeId=900000000000000100&dm=滨州万达店&astore=滨州万达店&q=JY-12118454&slotStart=13:30&slotEnd=14:00
```

Observed broken result:

```text
搜索无结果
共 0 条
```

Root cause:

- Dashboard slot overview passed the selected row `orderNo` through `q`.
- Orders page then applied both slot filter and full-text search, which over-filtered the slot-scoped list.

Fix:

- `DashboardView.vue` slot overview deep link no longer sends `q`.
- The dashboard now sends only date/store/slot scope, plus optional `orderId` when drilling from a concrete order row.

Files:

- `studio-workbench/src/features/dashboard/DashboardView.vue`
- `studio-workbench/src/features/dashboard/DashboardView.contract.test.ts`

Fresh verification after the change:

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts
# 1 file / 35 tests passed

npm --prefix studio-workbench run build
# passed
```

Expected post-deploy behavior:

- `查看该时段订单` opens the full slot-scoped order list without `q=...` in the URL.
- Clicking a concrete order row still preserves `orderId` deep link precision.
