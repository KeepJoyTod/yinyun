# Studio Workbench API Login Deploy 2026-06-12

## Result

`2b47d00 fix: wait for studio route before mount` has been deployed to `https://studio.evanshine.me`.

The production staff workbench now runs in API mode:

- Login uses RuoYi `/auth/login`.
- Captcha loads from `/auth/code`.
- Staff routes require both staff session and API token.
- API mode no longer falls back to demo data after backend/API failure.
- Order rows show backend sync copy before staff advances an order status.

## Deployment

- Server: `103.24.216.8`
- Site dir: `/var/www/studio.evanshine.me`
- Release: `/opt/yingyue/releases/studio-workbench-2b47d00`
- Backup: `/opt/yingyue/backups/20260612-204039-pre-studio-workbench-2b47d00`
- Public index asset: `/assets/index-C9RxuFXG.js`

## Verification

- `studio-workbench npm test`: 15 files, 41 tests passed.
- `studio-workbench npm run build`: passed.
- Vite chunk size warning remains; it is a bundle-size optimization warning and did not block deployment.
- Remote `nginx -t`: successful.
- Remote static checks:
  - `route_ready_hits=1`
  - `api_error_hits=1`
  - `auth_code_hits=1`
  - `asset_count=23`
- Public HTTP checks:
  - `https://studio.evanshine.me/login`: HTTP 200.
  - `https://studio.evanshine.me/orders?focus=pending`: HTTP 200 SPA fallback.
- Browser smoke:
  - `/login` shows `门店工作台登录`.
  - `/login` shows captcha and the captcha image loads.
  - `/login` does not show `DEMO 可视演示`.
  - Direct `/orders?focus=pending` without token redirects to `/login?redirect=...`.
  - Direct `/orders?focus=pending` does not expose the orders table before login.

## Remaining Manual Acceptance

Use a real staff/backend account with these permissions:

- `yy:order:list`
- `yy:order:edit`
- `system:oss:upload`
- `system:oss:query`
- `yy:photoAsset:add`
- `yy:photoAsset:list`

Then verify:

- Login succeeds with captcha.
- `/orders` shows `API 已连接`.
- Advancing an order status writes to `/yy/order` and persists after refresh.
- `/photo-mgmt` upload still creates `yy_photo_asset`.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260612-204039-pre-studio-workbench-2b47d00/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
