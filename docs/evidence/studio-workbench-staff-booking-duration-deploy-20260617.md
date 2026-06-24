# Studio Workbench Staff Booking Duration Deploy Evidence

Date: 2026-06-17

## Scope

- Release: `prod-f49ea40-staff-booking-duration-20260617`
- Commit: `f49ea40 fix(studio): derive staff booking duration from slot`
- Frontend only: `studio-workbench/dist` deployed to `https://studio.evanshine.me`
- Backend, database, nginx site config, miniapp builds: unchanged

## Change

- `StaffBookingModal` now treats prefilled slot `endTime` as an initial duration seed.
- Submitted `slotEndTime` is recalculated from the current start time and selected duration, so staff edits to duration are reflected in the final booking payload.
- Non-standard slot durations are included in the duration select so existing real slot windows remain visible.

## Artifact

| Artifact | Size | SHA256 |
| --- | ---: | --- |
| `studio-workbench-prod-f49ea40-staff-booking-duration-20260617.zip` | `583362` | `6039ec10a12cf0507646a8a7744782fa8c14ce94d389211dc02c57daf7f1f49b` |

## Deployment

| Item | Result |
| --- | --- |
| Server | Hong Kong 2 / `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Backup path | `/opt/yingyue/backups/prod-f49ea40-staff-booking-duration-20260617-20260617-191656` |
| `nginx -t` | successful |

## Verification

| Check | Result |
| --- | --- |
| `npm --prefix studio-workbench run test -- src/features/orders/StaffBookingModal.contract.test.ts` | 2 passed |
| `npm --prefix studio-workbench run test -- src/features/orders/StaffBookingModal.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts` | 68 passed |
| `npm --prefix studio-workbench run build` | passed; existing Vite large chunk warning only |
| `GET https://studio.evanshine.me/dashboard/today?cb=prod-f49ea40-staff-booking-duration-20260617` | 200, release marker present |
| `GET https://api.evanshine.me/auth/code` | 200, `application/json`, body length 80 |

## Notes

- No secrets, tokens, account passwords, raw private payloads, or customer phone numbers were recorded.
- GitHub push was attempted after commit but local TCP connection to `github.com:443` failed during this run; retry when network connectivity recovers.
