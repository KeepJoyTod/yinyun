# studio-workbench micro page editor props deploy - 2026-06-19

## Summary

- Release: `prod-micro-page-editor-props-20260619-000755`
- Scope: frontend-only `studio-workbench`
- Site: `https://studio.evanshine.me`
- Backend/database/Douyin OpenAPI: unchanged

This deploy makes merchant micro pages configurable enough for real staff use. The editor now exposes component-specific fields for the backend-supported micro page components, and the public renderer consumes those props instead of showing schema/debug placeholders.

## Code Changes

| Area | File | Change |
| --- | --- | --- |
| Merchant editor | `studio-workbench/src/features/merchant/MerchantMicroPagesView.vue` | Adds component-specific fields for title alignment, image URL/height, text navigation items, masonry sample items, store address/phone/hours, and spacer height |
| Default templates | `MerchantMicroPagesView.vue` | Replaces internal placeholders with customer-facing copy and local fallback images |
| Public renderer | `studio-workbench/src/features/public/components/MicroPageRenderer.vue` | Applies configured image height and supports anchor/internal/external/tel/mail navigation |
| Contract tests | `MerchantMicroPagesView.contract.test.ts`, `PublicMicroPageView.contract.test.ts` | Locks editor fields, useful defaults, public CTA behavior, and no schema/debug leakage |

Backend component whitelist remains unchanged:

```text
image, masonry, title, textnav, store, spacer, divider
```

Unsupported components such as `product`, `card`, `ad`, `groupbuy`, and `contact` are still intentionally not emitted by the frontend editor.

## Local Verification

```powershell
npm --prefix studio-workbench run test -- src/features/public/PublicMicroPageView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/app/router/featureRegistry.contract.test.ts
# Test Files 3 passed
# Tests 34 passed

$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_RELEASE_ID='prod-micro-page-editor-props-20260619-000755'
npm --prefix studio-workbench run build
# vue-tsc -b && vite build
# built in 3.50s
```

Build warning retained:

- `echarts-vendor` chunk is larger than 500 kB after minification. This is an existing bundle-size warning, not a deployment blocker.

## Deploy

Local package:

```text
C:\Users\ADMINI~1\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-micro-page-editor-props-20260619-000755.tgz
SIZE_BYTES=602001
SHA256=7e56b77d6b5aee6c4f2127b731edba951ded3fd8744d24a2de1504fa3df2b5fb
```

Remote:

```text
RELEASE=/opt/yingyue/releases/prod-micro-page-editor-props-20260619-000755
BACKUP=/opt/yingyue/backups/20260619-001030-pre-prod-micro-page-editor-props-20260619-000755
SITE_FILES=111
MARKER=prod-micro-page-editor-props-20260619-000755
```

Nginx:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Online Smoke

HTTP route checks:

```text
https://studio.evanshine.me/merchant/micro-pages?cb=prod-micro-page-editor-props-20260619-000755 -> 200, marker=true, oldMarker=false
https://studio.evanshine.me/public/micro-page/mpfe135e736349451b82?sourceCode=codex-verify-20260618-2316&cb=prod-micro-page-editor-props-20260619-000755 -> 200, marker=true, oldMarker=false
https://studio.evanshine.me/merchant/decoration?cb=prod-micro-page-editor-props-20260619-000755 -> 200, marker=true, oldMarker=false
```

Remote service check:

```text
cat /var/www/studio.evanshine.me/release.txt -> prod-micro-page-editor-props-20260619-000755
systemctl is-active yingyue-admin.service -> active
asset files in release dir -> 107
```

Browser DOM evidence for the public micro page:

```text
hasReleaseAsset=true
hasDebugMicroPage=false
hasComponentTypeLabels=false
buttons=立即预约, 查看样片, 联系门店
firstText=影约云 · 预约拍摄 / Codex验收微页面 20260618 2316 / 活动介绍与预约入口 / 门店信息
```

## Boundaries

- Frontend-only deploy.
- No backend service restart.
- No database migration.
- No Douyin OpenAPI reads or writes.
- No secrets or credential files staged.
- This does not implement new backend micro page component types. Product/groupbuy/ad/contact-like modules must wait for backend whitelist + normalize props + renderer support.
