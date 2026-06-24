# Studio Workbench Acceptance Evidence

GeneratedAt: 2026-06-18 02:04:29 +08:00

## Result

```text
READY_FOR_MANUAL_CHECK
```

## Deployment

| Item | Value |
| --- | --- |
| Release | `prod-staff-booking-entry-20260618-0205` |
| Site | `https://studio.evanshine.me` |
| Remote release | `/opt/yingyue/releases/prod-staff-booking-entry-20260618-0205` |
| Backup | `/opt/yingyue/backups/20260618-020429-pre-studio-workbench-prod-staff-booking-entry-20260618-0205` |

## Verified Commands

- `npm --prefix studio-workbench run test -- src/shared/components/schedule/ReservationSlots.contract.test.ts src/app/router/featureRegistry.contract.test.ts`
- `npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts`
- `npm --prefix studio-workbench run build`
- `git diff --check`

## Notes

- Sidebar redundant `staff-booking-entry` group icon mapping removed.
- Local maps updated for `order-staff-booking` and horizontal wheel scrolling.
