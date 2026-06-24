# Studio Workbench Dashboard Operational Date Deploy Evidence

Date: 2026-06-17

## Scope

- Release: `prod-dead7d1-dashboard-operational-date-20260617`
- Commit: `dead7d1 fix(studio): scope dashboard operations by operational date`
- Frontend only: `studio-workbench/dist` deployed to `https://studio.evanshine.me`
- Backend, database, nginx site config, miniapp builds: unchanged

## Change

- Dashboard operation card `今日待拍` now counts from `selectedDateOrders`, the same operational date bucket used by dashboard order/status sections.
- Dashboard pending task notice now counts pending orders from the selected operational day, not all cached orders.
- This keeps Douyin/current ledger orders with normalized operational dates consistent across dashboard cards, status groups, and appointment sections.

## Artifact

| Artifact | Size | SHA256 |
| --- | ---: | --- |
| `studio-workbench-prod-dead7d1-dashboard-operational-date-20260617.zip` | `583965` | `97aa61f07bc90674a4e476e58f3add00afd0dd0ca431d01ef28785916d41efc7` |

## Deployment

| Item | Result |
| --- | --- |
| Server | Hong Kong 2 / `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Backup path | `/opt/yingyue/backups/prod-dead7d1-dashboard-operational-date-20260617-20260617-193046` |
| `nginx -t` | successful |

## Verification

| Check | Result |
| --- | --- |
| `npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts` | 25 passed |
| `npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts` | 70 passed |
| `npm --prefix studio-workbench run build` | passed; existing Vite large chunk warning only |
| `GET https://studio.evanshine.me/dashboard/today?cb=prod-dead7d1-dashboard-operational-date-20260617` | 200, release marker present |
| `GET https://api.evanshine.me/auth/code` | 200, `application/json`, body length 80 |

## Notes

- No secrets, tokens, account passwords, raw private payloads, or customer phone numbers were recorded.
