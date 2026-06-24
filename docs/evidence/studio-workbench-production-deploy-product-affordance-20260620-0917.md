# Studio Workbench Production Deploy - Product Affordance

- date: 2026-06-20
- release: `prod-product-affordance-20260620-0917`
- target: `https://studio.evanshine.me`
- backend changed: no
- github pushed: no

## Changes

- Card product management:
  - `客户链接` no longer behaves as a dead disabled button.
  - Clicking it shows the explicit backend gap: public customer card-product link API is not connected yet, so no fake link is generated.
  - `抖音映射` now navigates to `/product/douyin` for real DOUYIN_LIFE mapping diagnostics.
- Douyin product mapping:
  - Added `复制入口` action.
  - If `landingUrl/landingPath` exists, staff can copy the real Douyin Life entry.
  - If missing, staff gets a clear reason and can copy the missing-field checklist.
- Event inbox:
  - Added read-only report evidence for stale DOUYIN_LIFE inbox failures.

## Verification

| Command | Result |
| --- | --- |
| `PowerShell Parser.ParseFile(tools/get-douyin-life-event-inbox-report.ps1)` | `PowerShell parser OK` |
| `.\tools\get-douyin-life-event-inbox-report.ps1 -OutputJsonPath docs/evidence/douyin-life-event-inbox-report-20260620-091024.json -OutputMarkdownPath docs/evidence/douyin-life-event-inbox-report-20260620-091024.md -StaleDays 3 -Limit 20` | PASS; `total=2 failed=2 retry=0 dead=0 staleXLifeSignFailures=2` |
| `npm --prefix studio-workbench run test -- src/shared/tooling/studioWorkbenchSmokeScripts.contract.test.ts` | 1 file / 2 tests passed |
| `npm --prefix studio-workbench run test -- src/features/products/ProductCardManagementView.contract.test.ts src/features/products/DouyinProductsView.contract.test.ts` | 2 files / 15 tests passed |
| `npm --prefix studio-workbench run build` | PASS; no ECharts chunk warning |
| `.\tools\deploy-studio-workbench-hk2.ps1 -ReleaseId 'prod-product-affordance-20260620-0917' -Build -Deploy -ProbeHttp` | PASS; `nginx -t` successful; route verification PASS |
| `.\tools\run-studio-workbench-real-login-smoke.ps1 -BaseUrl https://studio.evanshine.me -ReleaseId 'prod-product-affordance-20260620-0917'` | PASS; 9 routes, token present, 0 console/page errors |

## Runtime Evidence

- Real login smoke: `docs/evidence/studio-real-login-smoke-20260620-091707/real-login-smoke.json`
- Event inbox report: `docs/evidence/douyin-life-event-inbox-report-20260620-091024.md`

## Boundaries

- No backend jar deployment.
- No order, inventory, customer, or Douyin platform write.
- No GitHub push.
- `客户链接` still requires a real public card-product API before it can produce customer-facing URLs.
