# Studio Workbench All Orders Deploy 2026-06-16

## Result

`studio-workbench` has been rebuilt in real API mode and deployed to `https://studio.evanshine.me`.

This deploy keeps the staff order page default as the today arrival queue, and makes `查看全部订单` load all locally synchronized orders from `yy_order`.

## Scope

- Backend release already deployed: `/opt/yingyue/releases/28eccbe-20260616-1429`
- Frontend release deployed for this fix: `/opt/yingyue/releases/prod-frontend-28eccbe-allorders-20260616-1455`
- Frontend site dir: `/var/www/studio.evanshine.me`
- Backend jar: `/opt/yingyue/backend/ruoyi-admin.jar`
- Main API root: `https://api.evanshine.me`

## Backups

- Backend, DB, and first frontend backup: `/opt/yingyue/backups/20260616-142855-pre-28eccbe`
- Frontend backup before all-orders deploy: `/opt/yingyue/backups/20260616-145555-pre-prod-frontend-28eccbe-allorders`

## Build Environment

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-28eccbe-allorders
```

No token, password, client secret, or local `.env.local` value is recorded in this evidence file.

## Verification

Remote services:

```text
yingyue-admin.service -> active
nginx.service -> active
yingyue-douyin-callback.service -> active
Spring Boot startup -> success
```

Database:

```text
postgres_yy_employee_store_migration_20260616.sql -> applied
postgres_yy_store_seed_20260616.sql -> applied
yy_store real seeded stores -> present
yy_employee_store table -> present
current production auto-filled employee-store bindings -> 0
```

API smoke:

```text
POST /auth/login -> success, token redacted
GET /yy/studio/bootstrap -> success
GET /yy/store/list -> 5 rows
GET /yy/order/list -> total 1003
GET /yy/channel/DOUYIN_LIFE/sync-health -> success
```

Browser smoke:

```text
https://studio.evanshine.me/login -> API mode login page, no captcha
https://studio.evanshine.me/order/appointment -> reachable after login
查看全部订单 -> Showing 1 to 1003 of 1003 entries
```

## Notes

- `yy_order` remains the single local order and appointment ledger.
- `DOUYIN_LIFE` order sync still writes through the existing backend channel flow and sync logs.
- The today dashboard can show `0` for today arrival if no order has today's arrival date. That is a date-scope result, not missing synchronized order data.
- Employee multi-store binding infrastructure is deployed, but production currently has no auto-filled employee-store bindings. The next operational step is to bind real staff to real stores in the employee permission flow.
