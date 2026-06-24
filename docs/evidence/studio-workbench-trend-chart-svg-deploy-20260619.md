# Studio Workbench Trend Chart SVG Deploy - 2026-06-19

## Release

```text
commit: 1cc5aef perf(studio): replace trend chart echarts with svg
release: prod-1cc5aef-trend-svg-20260619-115216
site: https://studio.evanshine.me
branch: yingyue-closed-loop-optimization-20260603
```

## Scope

- Frontend-only `studio-workbench` deployment.
- No backend jar replacement.
- No database migration.
- No Douyin OpenAPI/SPI call.
- No business data write during smoke.

## Change

| Area | Files | Result |
| --- | --- | --- |
| Dashboard trend chart | `studio-workbench/src/shared/components/dashboard/TrendChart.vue` | Replaced `vue-echarts` with native SVG polylines for booked/arrived trend data, keeping fixed height and empty state. |
| Build dependencies | `studio-workbench/package.json`, `studio-workbench/package-lock.json` | Removed `vue-echarts` and transitive `echarts/zrender`. |
| Vite chunks | `studio-workbench/vite.config.ts` | Removed `echarts-vendor` manual chunk; kept `framework-vendor`. |
| Contracts | `TrendChart.contract.test.ts`, `DashboardView.contract.test.ts`, `viteConfig.contract.test.ts` | Locks SVG chart rendering, async dashboard loading, and no ECharts vendor chunk. |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/shared/components/dashboard/TrendChart.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/app/viteConfig.contract.test.ts
# Test Files 3 passed
# Tests 40 passed

rg -n "echarts|vue-echarts|zrender|v-chart|echarts-vendor" studio-workbench/src --glob "!**/*.test.ts"
# no output

rg -n "echarts|vue-echarts|zrender|v-chart|echarts-vendor" studio-workbench/package.json studio-workbench/package-lock.json studio-workbench/vite.config.ts
# no output

npm --prefix studio-workbench run build
# passed; no echarts-vendor chunk-size warning
# note: Rolldown plugin timings notice only
```

## Package

```text
local zip: C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-1cc5aef-trend-svg-20260619-115216.zip
size bytes: 519039
sha256: D475FE26EB4739CC9C1F323B253C0BF0B783C310305D8F41FB76B677ECED1EDC
remote zip: /opt/yingyue/releases/studio-workbench-prod-1cc5aef-trend-svg-20260619-115216.zip
```

## HK2 Deploy

```text
server: 103.24.216.8
release dir: /opt/yingyue/releases/studio-workbench-prod-1cc5aef-trend-svg-20260619-115216
backup: /opt/yingyue/backups/20260619-115429-pre-studio-workbench-prod-1cc5aef-trend-svg-20260619-115216
site dir: /var/www/studio.evanshine.me
site files: 5
release.txt: prod-1cc5aef-trend-svg-20260619-115216
yingyue-admin.service: active
nginx -t: successful
```

## Online Smoke

```text
https://studio.evanshine.me/release.txt -> 200, marker=True
https://studio.evanshine.me/dashboard/today?cb=prod-1cc5aef-trend-svg-20260619-115216 -> 200, marker=True
https://studio.evanshine.me/order/appointment?quick=all&cb=prod-1cc5aef-trend-svg-20260619-115216 -> 200, marker=True
https://studio.evanshine.me/login?cb=prod-1cc5aef-trend-svg-20260619-115216 -> 200, marker=True
remote asset grep for echarts/zrender/vue-echarts/echarts-vendor -> no output
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260619-115429-pre-studio-workbench-prod-1cc5aef-trend-svg-20260619-115216/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
