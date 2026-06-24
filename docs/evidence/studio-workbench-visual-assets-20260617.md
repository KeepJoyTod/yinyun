# Studio Workbench Visual Assets Evidence - 2026-06-17

## Scope

This batch fills missing visual assets in the studio workbench while keeping JianYue captured private screenshots and QR codes out of production.

Implemented:

- Global empty-state illustration from the captured JianYue file-empty asset.
- Local product fallback covers for ID photo and portrait services.
- Local store-card cover for merchant store cards.
- Local demo album sample images for photo delivery and resource/sample pages.
- Central `workbenchAssets.ts` asset registry to prevent scattering placeholder paths.

Not shipped:

- JianYue QR codes, account screenshots, customer/business screenshots, and unrelated hardware JPGs.

## Source Files

| File | Purpose |
| --- | --- |
| `studio-workbench/src/assets/jianyue/empty-files.png` | Captured JianYue empty-state illustration |
| `studio-workbench/src/assets/jianyue/product-idcard.svg` | Local ID-photo product cover |
| `studio-workbench/src/assets/jianyue/product-portrait.svg` | Local portrait product cover |
| `studio-workbench/src/assets/jianyue/store-front.svg` | Local store card cover |
| `studio-workbench/src/assets/jianyue/sample-*.svg` | Local demo album sample images |
| `studio-workbench/src/shared/stores/workbenchAssets.ts` | Shared asset registry and fallback helpers |
| `studio-workbench/src/shared/components/feedback/StateView.vue` | Global empty-state image |
| `studio-workbench/src/shared/stores/appStore.ts` | Demo products and albums use separated local assets |
| `studio-workbench/src/shared/stores/appStoreTransforms.ts` | Real product fallback and save guard |
| `studio-workbench/src/features/stores/StoreView.vue` | Store card image |
| `studio-workbench/src/features/albums/PhotoMgmtView.vue` | Empty photo dropzone image |

## Local Evidence

JianYue evidence is stored outside the repo:

```text
C:\Users\Administrator\Desktop\yiyue\jianyue-assets\20260617-dashboard
```

Implementation evidence is stored outside the repo:

```text
C:\Users\Administrator\Desktop\yiyue\jianyue-assets\20260617-implemented
```

## Verification

```text
npm --prefix studio-workbench run test -- src/shared/components/feedback/StateView.contract.test.ts src/features/stores/StoreView.contract.test.ts src/features/albums/PhotoMgmtView.contract.test.ts src/shared/stores/appStore.contract.test.ts
4 passed, 39 passed
```

```text
npm --prefix studio-workbench run build
passed; existing Vite large chunk warning only
```

Local browser checks:

```text
http://127.0.0.1:5191/ -> 63 images, broken=[]
http://127.0.0.1:5191/merchant/store -> 78 images, broken=[]
http://127.0.0.1:5191/service/photos -> 97 images, broken=[]
```

## Production Deployment

Release:

```text
prod-e3c244c-visual-assets-20260617
```

Git commit:

```text
e3c244c feat(studio): add local visual assets
```

HK2 deployment:

```text
target=/var/www/studio.evanshine.me
backup=/var/www/studio.evanshine.me.bak-prod-e3c244c-visual-assets-20260617-20260617-222853
nginx -t: successful
systemctl reload nginx: successful
```

Smoke checks:

```text
https://studio.evanshine.me/ -> 200, index contains prod-e3c244c-visual-assets-20260617
https://studio.evanshine.me/assets/prod-e3c244c-visual-assets-20260617/empty-files-aeT2Mupe.png -> 200, 35382 bytes, image/png
Browser /merchant/store unauthenticated redirect -> /login?...reason=access, release script loaded, broken=[]
```

Rollback:

```bash
rm -rf /var/www/studio.evanshine.me.rollback-target
mv /var/www/studio.evanshine.me /var/www/studio.evanshine.me.rollback-target
mv /var/www/studio.evanshine.me.bak-prod-e3c244c-visual-assets-20260617-20260617-222853 /var/www/studio.evanshine.me
nginx -t && systemctl reload nginx
```

## Remaining

- Replace local generated covers with real `yy_product.cover_url` after product photos are uploaded.
- Replace demo album images with OSS-backed `yy_photo_asset.url` in real mode.
- Generate and use YingYue-owned QR codes instead of any JianYue QR code.
