# Studio Workbench Order Photo Actions Deploy - 2026-06-18

## Result

`studio-workbench` release `prod-049cea8-order-photo-actions-20260618-20260618-000143` has been deployed to Hong Kong 2 at `https://studio.evanshine.me`.

This release adds photo delivery status and real album action entries directly inside the appointment order detail drawer.

## Scope

- Frontend only: `studio-workbench/dist` deployed to `/var/www/studio.evanshine.me`.
- Backend/database/nginx config/miniapp builds: unchanged.
- Existing backend APIs reused:
  - `POST /yy/photoAlbum/{id}/notify`
  - `POST /yy/photoAlbum/{id}/selection/confirm`
  - `POST /yy/photoAlbum/{id}/deliver`

## Code

```text
Commit: 049cea8 feat(studio): show photo delivery actions in order drawer
Branch: yingyue-closed-loop-optimization-20260603
```

Changed files:

```text
studio-workbench/src/features/orders/OrdersView.vue
studio-workbench/src/features/orders/OrdersView.contract.test.ts
studio-workbench/src/features/orders/orderOperations.ts
studio-workbench/src/features/orders/orderOperations.test.ts
```

## Behavior

In `/order/appointment` order detail drawer:

- Shows `客片交付状态`.
- Derives stage from existing album data:
  - no album -> `未建相册`
  - zero photos -> `待上传客片`
  - photos but no selected assets -> `待通知选片`
  - selected assets -> `待确认选片`
  - delivered album -> `已交付`
- Shows real action buttons when an album exists:
  - `通知客户` -> `appStore.notifyAlbum`
  - `客片确认` -> `appStore.confirmAlbumSelection`
  - `资料发送` -> `appStore.deliverAlbum`
- Backend state machine still validates whether confirmation or delivery is allowed.

## Verification

Local:

```text
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts
-> 24 passed

npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts
-> 35 passed

npm --prefix studio-workbench run build
-> passed, existing Vite chunk-size warning only

git diff --check
-> passed, CRLF warnings only
```

Production build artifact:

```text
Local package: C:\Users\Administrator\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-049cea8-order-photo-actions-20260618-20260618-000143.zip
SHA256: 2A4C085BF1B91A61703BB290EADA238C34ECD2A7F3ECE7467184AF91A203C658
Size: 603694
Remote package: /opt/yingyue/releases/studio-workbench-prod-049cea8-order-photo-actions-20260618-20260618-000143.zip
```

Deployment:

```text
release=prod-049cea8-order-photo-actions-20260618-20260618-000143
release_dir=/opt/yingyue/releases/prod-049cea8-order-photo-actions-20260618-20260618-000143
backup=/opt/yingyue/backups/20260618-000230-pre-studio-workbench-prod-049cea8-order-photo-actions-20260618-20260618-000143
marker_count=9
asset_count=79
nginx -t -> successful
systemctl reload nginx -> successful
```

Production HTTP:

```text
GET https://studio.evanshine.me/order/appointment?cb=prod-049cea8-order-photo-actions-20260618-20260618-000143
-> 200, marker=True

GET https://studio.evanshine.me/service/photos?cb=prod-049cea8-order-photo-actions-20260618-20260618-000143
-> 200, marker=True

GET https://studio.evanshine.me/dashboard/today?cb=prod-049cea8-order-photo-actions-20260618-20260618-000143
-> 200, marker=True

GET https://api.evanshine.me/auth/code
-> 200, application/json, bytes=80
```

## Local Maps Updated

```text
docs\yiyue\function_map.md
docs\yiyue\optimization_map.md
docs\yiyue\jianyue_benchmark_map.md
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260618-000230-pre-studio-workbench-prod-049cea8-order-photo-actions-20260618-20260618-000143/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Notes

- `通知客户` still records fallback/manual notification when no real SMS/subscription channel is configured.
- `客片确认` and `资料发送` are guarded by the backend album state machine; the order drawer does not fabricate success.
- No token, password, customer photo data, phone number, or raw private payload is recorded in this file.
