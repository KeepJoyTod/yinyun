# Studio Workbench Slot Guard Deploy Evidence

GeneratedAt: 2026-06-18 02:12:55 +08:00

## Result

```text
DEPLOYED_READY_FOR_MANUAL_CHECK
```

## Deployment

| Item | Value |
| --- | --- |
| Release | `prod-staff-booking-slot-guard-20260618-0212` |
| Commit | `56fa026 fix(studio): block full booking slots from manual entry` |
| Site | `https://studio.evanshine.me` |
| Remote release | `/opt/yingyue/releases/prod-staff-booking-slot-guard-20260618-0212` |
| Backup | `/opt/yingyue/backups/20260618-021255-pre-studio-workbench-prod-staff-booking-slot-guard-20260618-0212` |
| Package sha256 | `C199CD744FE2E9E40EDAD6CDBC99FCCF96FE25BBD33465AFDCD734A821D52DF1` |

## Scope

- `/order/staff-booking` 推荐库存时段如果已满或存在冲突，不再直接打开录入预约弹窗。
- 已满/冲突时段会跳到 `/merchant/inventory`，并带上日期、门店和服务组筛选参数。
- 不修改后端服务、数据库、抖音 OpenAPI 配置、OSS、小程序或 admin-ui。

## Verification

```text
npm --prefix studio-workbench run test -- src/features/orders/StaffBookingEntryView.contract.test.ts src/app/router/featureRegistry.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
-> 5 files, 101 tests passed

npm --prefix studio-workbench run build
-> passed; existing Vite large chunk warning only

git diff --check
-> no whitespace errors
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260618-021255-pre-studio-workbench-prod-staff-booking-slot-guard-20260618-0212/. /var/www/studio.evanshine.me/
nginx -t && systemctl reload nginx
```
