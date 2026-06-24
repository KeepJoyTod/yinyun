# studio-workbench public micro page renderer deploy - 2026-06-18

## Scope

- Branch: `yingyue-closed-loop-optimization-20260603`
- Release: `prod-public-micro-page-renderer-20260618-2348`
- Target: `https://studio.evanshine.me`
- Deployment target: Hong Kong 2, `/var/www/studio.evanshine.me`

This frontend-only deploy replaces the public micro page schema/debug preview with a customer-facing renderer. It also makes the merchant phone preview use the same renderer so the editor preview and public link stay aligned.

## Changed Files

```text
studio-workbench/src/features/public/components/MicroPageRenderer.vue
studio-workbench/src/features/public/PublicMicroPageView.vue
studio-workbench/src/features/public/PublicMicroPageView.contract.test.ts
studio-workbench/src/features/merchant/MerchantMicroPagesView.vue
studio-workbench/src/features/merchant/MerchantMicroPagesView.contract.test.ts
```

## Data Flow

```text
/public/micro-page/:id
-> backendApi.getPublicMicroPage(id)
-> GET /yy/client/micro-page/{id}
-> PublicMicroPageView
-> MicroPageRenderer
```

Supported renderer components remain aligned with the current backend whitelist:

```text
title, image, textnav, masonry, store, spacer, divider
```

No backend component whitelist was expanded in this change.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/features/public/PublicMicroPageView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/app/router/featureRegistry.contract.test.ts
# Test Files 3 passed
# Tests 31 passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_RELEASE_ID='prod-public-micro-page-renderer-20260618-2348'
npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# built in 3.83s
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. This is an existing bundle-size warning, not a deployment blocker.

## Deploy

Local package:

```text
C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-public-micro-page-renderer-20260618-2348.tgz
SIZE_BYTES=600179
SHA256=12fa233f3ee40513ef31ca803b7cba1ea82d2717c6f337a6f607e76f4e3c5baa
```

Remote:

```text
RELEASE=/opt/yingyue/releases/prod-public-micro-page-renderer-20260618-2348
BACKUP=/opt/yingyue/backups/20260618-235353-pre-prod-public-micro-page-renderer-20260618-2348-anchorfix
SITE_FILES=111
MARKER=prod-public-micro-page-renderer-20260618-2348
```

Nginx:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Online Acceptance

URL:

```text
https://studio.evanshine.me/public/micro-page/mpfe135e736349451b82?sourceCode=codex-verify-20260618-2316&cb=prod-public-micro-page-renderer-20260618-2348
```

Runtime DOM evidence:

```text
hasDebugMicroPage=false
hasComponentTypeLabels=false
hasFallback=false
hasJsonLike=false
hasReleaseAsset=true
hasStoreAnchor=true
hasSamplesAnchor=false (the accepted test page has no masonry component)
buttons=立即预约, 查看样片, 联系门店
firstText=影约云 · 预约拍摄 / Codex验收微页面 20260618 2316 / 活动介绍与预约入口 / 门店信息
```

## Boundaries

- Frontend-only deploy.
- No backend service restart.
- No database migration.
- No Douyin OpenAPI writes.
- No secrets or credential files staged.
- The editor component tree still displays component types for staff editing; only the public page and phone preview stop exposing debug/schema output.
