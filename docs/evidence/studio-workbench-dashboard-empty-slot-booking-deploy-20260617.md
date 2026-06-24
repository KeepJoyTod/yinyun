# Studio Workbench Dashboard Empty Slot Booking Deploy Evidence

Date: 2026-06-17

## Scope

- Release: `prod-66bd741-dashboard-empty-slot-booking-20260617`
- Commit: `66bd741 fix(studio): open empty dashboard slots as staff booking`
- Frontend only: `studio-workbench/dist` deployed to `https://studio.evanshine.me`
- Backend, database, nginx site config, miniapp builds: unchanged

## Change

- Dashboard `JianyueSlotGrid` empty appointment slots now open `StaffBookingModal` prefilled with store, service group, date, start time, and end time.
- Non-empty dashboard slots still deep-link to `/order/appointment`.
- Created staff bookings refresh the same dashboard schedule, booking inventory, and stats loaders.

## Artifact

| Artifact | Size | SHA256 |
| --- | ---: | --- |
| `studio-workbench-prod-66bd741-dashboard-empty-slot-booking-20260617.zip` | `584165` | `8a42a6ce875239abed1c711737fbc2dfa92d671c98adceb0d4f46e4ef0be1170` |

## Deployment

| Item | Result |
| --- | --- |
| Server | Hong Kong 2 / `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Backup path | `/opt/yingyue/backups/prod-66bd741-dashboard-empty-slot-booking-20260617-20260617-190806` |
| `nginx -t` | successful |

## Verification

| Check | Result |
| --- | --- |
| `npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts` | 23 passed |
| `npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts` | 37 passed |
| `npm --prefix studio-workbench run build` | passed; existing Vite large chunk warning only |
| GitHub Actions / push | success |
| GitHub Actions / pull_request | success |
| `GET https://studio.evanshine.me/dashboard/today?cb=prod-66bd741-dashboard-empty-slot-booking-20260617` | 200, release marker present |
| `GET https://api.evanshine.me/auth/code` | 200, `application/json`, body length 80 |

## Notes

- No secrets, tokens, account passwords, raw private payloads, or customer phone numbers were recorded.
- Historical `DOUYIN_LIFE` orders without real appointment slot payload remain excluded from `yy_booking_slot_inventory`.
