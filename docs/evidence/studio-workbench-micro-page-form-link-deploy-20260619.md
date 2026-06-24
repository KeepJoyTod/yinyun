# studio-workbench micro page form link deploy - 2026-06-19

## Summary

- Release: `prod-micro-page-form-link-20260619-002810`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deploy connects the merchant micro page `textnav` CTA to real published micro forms. Staff can keep manually editing a link, or bind a navigation item to an already published micro form from the editor property panel. The default "立即预约" link uses the first published micro form when one exists, and falls back to `#store` when none exists.

## Code Changes

| Area | File | Change |
| --- | --- | --- |
| Merchant editor | `studio-workbench/src/features/merchant/MerchantMicroPagesView.vue` | Loads `backendApi.listMicroForms({ status: 'PUBLISHED' })` for CTA binding |
| Text navigation props | `MerchantMicroPagesView.vue` | Adds a "绑定微表单..." selector under each text navigation item |
| Link builder | `MerchantMicroPagesView.vue` | Reuses the same public micro form URL rules as `MerchantMicroFormsView.vue`, including hash-route base URLs |
| Default template | `MerchantMicroPagesView.vue` | Uses `defaultBookingLink.value` for "立即预约" instead of hardcoded `#store` when published forms are available |
| Contract tests | `MerchantMicroPagesView.contract.test.ts` | Locks published-form binding and prevents direct order/appointment creation from micro page CTA |

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/public/PublicMicroPageView.contract.test.ts src/app/router/featureRegistry.contract.test.ts
# Test Files 3 passed
# Tests 35 passed

npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# built in 3.64s

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_RELEASE_ID='prod-micro-page-form-link-20260619-002810'
npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# built in 3.46s
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. This is an existing bundle-size warning, not a deployment blocker.

## Deploy

Local package:

```text
C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-micro-page-form-link-20260619-002810.tgz
SIZE_BYTES=601834
SHA256=5ad1153bb098781e55f05822e79d7ba1a3181495157e177ce0906db054372ccc
```

Remote:

```text
RELEASE_DIR=/opt/yingyue/releases/prod-micro-page-form-link-20260619-002810
BACKUP=/opt/yingyue/backups/20260619-002920-pre-prod-micro-page-form-link-20260619-002810
SITE_FILES=111
MARKER=prod-micro-page-form-link-20260619-002810
```

Nginx:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Remote service check:

```text
cat /var/www/studio.evanshine.me/release.txt -> prod-micro-page-form-link-20260619-002810
systemctl is-active yingyue-admin.service -> active
asset files in release dir -> 107
```

## Online Smoke

HTTP route checks:

```text
https://studio.evanshine.me/merchant/micro-pages?cb=prod-micro-page-form-link-20260619-002810 -> 200, marker=true, oldMarker=false
https://studio.evanshine.me/public/micro-page/mpfe135e736349451b82?sourceCode=codex-verify-20260618-2316&cb=prod-micro-page-form-link-20260619-002810 -> 200, marker=true, oldMarker=false
https://studio.evanshine.me/merchant/micro-forms?cb=prod-micro-page-form-link-20260619-002810 -> 200, marker=true, oldMarker=false
```

Browser DOM evidence:

```text
public micro page:
hasReleaseAsset=true
hasDebugMicroPage=false
buttons=立即预约, 查看样片, 联系门店
bodyStart=影约云 · 预约拍摄 / Codex验收微页面 20260618 2316 / 活动介绍与预约入口 / 门店信息

merchant micro pages route:
hasReleaseAsset=true
console errors/warnings=[]
body includes 微页面管理 and template controls after app mount
```

Production chunk check:

```text
MerchantMicroPagesView-493IwHgS.js -> 200
HasBindMicroForm=true
HasListMicroForms=true
HasNoPublishedHint=true
```

## Boundaries

- Frontend-only deploy.
- No backend service restart.
- No database migration.
- No Douyin OpenAPI reads or writes.
- No order, appointment, inventory, or schedule writes.
- Micro page CTA navigation does not create orders. Real appointment/order creation still must go through micro form submission, staff booking, or DOUYIN_LIFE sync chains.
- Unsupported micro page component types remain disabled: `product`, `card`, `ad`, `groupbuy`, `contact`.
