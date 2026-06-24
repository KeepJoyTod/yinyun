# Studio Workbench Production Deploy Evidence

GeneratedAt: 2026-06-20 00:58 +08:00

## Result

| Item | Result |
| --- | --- |
| Release | `prod-52ea06e-studio-store-scope-20260620-005445` |
| Host | HK2 `103.24.216.8` |
| Site | `https://studio.evanshine.me` |
| Backend service | `yingyue-admin.service active` |
| Nginx | `nginx -t` successful, reloaded |
| Frontend marker | `/var/www/studio.evanshine.me/release.txt` matched release |
| Asset marker | `/var/www/studio.evanshine.me/index.html` references `assets/prod-52ea06e-studio-store-scope-20260620-005445` |
| Backup | `/opt/yingyue/backups/20260620-005708-pre-studio-workbench-prod-52ea06e-studio-store-scope-20260620-005445` |

## Build And Test

| Command | Result |
| --- | --- |
| `npm --prefix studio-workbench run test -- src/shared/stores/appStore.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/albums/PhotoMgmtView.contract.test.ts src/features/merchant/MerchantDecorationView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/products/ProductCardManagementView.contract.test.ts src/features/products/ProductCardCatalogView.contract.test.ts` | 10 files / 179 tests passed |
| `VITE_STUDIO_RELEASE_ID=prod-52ea06e-studio-store-scope-20260620-005445 npm --prefix studio-workbench run build` | Passed; no ECharts chunk warning |

## HTTP Smoke

All routes returned HTTP 200 and the HTML referenced the same release marker.

| Route | Result |
| --- | --- |
| `/` | PASS |
| `/login` | PASS |
| `/dashboard/today` | PASS |
| `/order/appointment?quick=all` | PASS |
| `/service/photos` | PASS |
| `/merchant/decoration` | PASS |
| `/merchant/micro-pages` | PASS |
| `/merchant/micro-forms` | PASS |
| `/product/card-management` | PASS |
| `/product/card-catalog` | PASS |

Generated public-route evidence:

- `docs/evidence/studio-workbench-acceptance-20260620-005806.md`
- `docs/evidence/studio-workbench-acceptance-20260620-005806.json`

Earlier real-login smoke evidence for the same workflow family:

- `docs/evidence/studio-real-acceptance-20260620-20260619164549-final/real-login-smoke.json`

## Scope

This deployment only replaced static files for `studio.evanshine.me`. It did not modify backend code, database data, Redis state, Douyin platform state, inventory, or orders.
