# Studio Workbench API Login Copy Deploy 2026-06-12

## Result

`7963496 fix: clarify studio api login form` has been deployed to `https://studio.evanshine.me`.

This is a focused production static update for the staff login page only:

- API mode no longer pre-fills the demo password.
- API mode shows `API 模式已连接真实后台：使用门店账号、密码和验证码登录。`.
- Password placeholder is `请输入真实后台密码`.
- Demo copy remains only in demo runtime builds.

## Deployment

- Server: `103.24.216.8`
- Site dir: `/var/www/studio.evanshine.me`
- Local package: `dist/studio-workbench-7963496.zip`
- Remote package: `/opt/yingyue/releases/studio-workbench-7963496.zip`
- Release: `/opt/yingyue/releases/studio-workbench-7963496`
- Backup: `/opt/yingyue/backups/20260612-205708-pre-studio-workbench-7963496`

## Verification

- `studio-workbench npm test`: 15 files, 42 tests passed.
- `studio-workbench npm run build` with API mode env: passed.
- Vite chunk size warning remains; it is a bundle-size optimization warning and did not block deployment.
- Remote `nginx -t`: successful.
- Remote static checks:
  - `index=ok`
  - `asset_count=23`
  - production bundle contains `API 模式已连接真实后台`
- Public HTTP checks:
  - `https://studio.evanshine.me/login`: HTTP 200.
  - `https://studio.evanshine.me/orders?focus=pending`: HTTP 200 SPA fallback.
- Browser smoke:
  - `/login` shows `门店工作台登录`.
  - `/login` shows the API-mode real-backend hint.
  - `/login` does not visibly show the old demo credential hint.
  - Password field is empty and uses `请输入真实后台密码`.
  - Direct `/orders?focus=pending` without session/token redirects to `/login?redirect=...`.

## Remaining Manual Acceptance

Use the browser captcha on `https://studio.evanshine.me/login` and log in as the production staff account:

- Username: `store-admin`
- Password: see `C:\Users\Administrator\Desktop\影约云通用演示账号.md`

Then verify:

- `/orders` shows `API 已连接`.
- Order actions show `Backend Sync` and persist after refresh.
- `/photo-mgmt` upload still creates `yy_photo_asset`.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260612-205708-pre-studio-workbench-7963496/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
