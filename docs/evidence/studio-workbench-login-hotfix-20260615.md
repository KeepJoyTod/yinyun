# Studio Workbench Login Hotfix 2026-06-15

## Result

Production `https://studio.evanshine.me` now accepts `store-admin` login and enters the workbench home page.

## Deployment

- Release: `studio-workbench-hotfix-login-20260615-231815`
- Server: `103.24.216.8`
- Site dir: `/var/www/studio.evanshine.me`
- Backup: `/opt/yingyue/backups/20260615-232000-pre-studio-workbench-hotfix-login-20260615-231815`

## Build

- Real API mode build completed successfully.
- Build-time store count override used for the hotfix: `VITE_STUDIO_EXPECTED_STORE_COUNT=1`

## Verification

HTTP:

- `https://studio.evanshine.me/login` -> `200`
- `https://studio.evanshine.me/` -> `200`
- `https://studio.evanshine.me/dashboard/today` -> `200`

API:

- `/auth/login` -> `200`
- `/yy/studio/bootstrap` -> `200`
- `/yy/store/list` -> `1` row

Browser:

- Login page rendered correctly.
- Submitting the real staff account redirected to `/`.
- Workbench home page loaded without `真实门店数据不足`.
- No return to `/login` after bootstrap.

## Notes

- Production store bootstrap currently reports zero bound stores for `store-admin`; login still works and the home page loads.
- Next follow-up is to normalize store binding and make the real store count policy consistent with production data.
