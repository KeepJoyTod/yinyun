# Studio Workbench Day-Scoped Dashboard Deploy 2026-06-12

## Result

The studio workbench dashboard count inflation has been fixed and deployed to `https://studio.evanshine.me`.

Deployed commits:

- `cd1aec0 fix: scope studio dashboard by day`
- `0e7c1d1 fix: show today pending orders in studio header`

## What Changed

- Dashboard now has explicit date controls: `前一天 / 今天 / 后一天`.
- `今日待拍`、`待上传`、`待选片`、`待交付` are scoped to the selected date.
- Service order status stats use the selected date in backend query params.
- Header order CTA now shows today's pending order count instead of all historical pending orders.
- Header label changed to `今日待确认`.

## Deployment

- Server: `103.24.216.8`
- Site dir: `/var/www/studio.evanshine.me`
- Local package: `dist/studio-workbench-0e7c1d1.zip`
- Remote package: `/opt/yingyue/releases/studio-workbench-0e7c1d1.zip`
- Release: `/opt/yingyue/releases/studio-workbench-0e7c1d1`
- Backup: `/opt/yingyue/backups/20260612-212345-pre-studio-workbench-0e7c1d1`

## Verification

- `studio-workbench npm test`: 17 files, 45 tests passed.
- `studio-workbench npm run build` with API mode env: passed.
- Vite chunk size warning remains; it is a bundle-size optimization warning and did not block deployment.
- Remote `nginx -t`: successful.
- Remote static checks:
  - asset count: `23`
  - deployed bundle contains `今日待确认`
  - deployed bundle contains `门店运营看板`
- Browser smoke on `https://studio.evanshine.me/`:
  - Dashboard shows date controls.
  - Dashboard date is `6 月 12 日`.
  - `今日待拍`: `0`
  - `待上传`: `0`
  - `待选片`: `0`
  - `待交付`: `0`
  - Header no longer shows `待确认 1000`.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260612-212345-pre-studio-workbench-0e7c1d1/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
