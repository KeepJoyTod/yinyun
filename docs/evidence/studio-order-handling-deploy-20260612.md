# Studio Workbench Order Handling Deploy 2026-06-12

## Result

`7f7235b feat: polish studio order handling` has been deployed to `https://studio.evanshine.me`.

## Deployment

- Server: `103.24.216.8`
- Site dir: `/var/www/studio.evanshine.me`
- Release: `/opt/yingyue/releases/studio-workbench-7f7235b`
- Backup: `/opt/yingyue/backups/20260612-193812-pre-studio-workbench-7f7235b`
- Public index asset: `/assets/index-TO5XB6n0.js`

## Verification

- `npm test`: 10 files, 29 tests passed.
- `npm run build`: passed. Vite large chunk warning remains.
- `https://studio.evanshine.me/orders`: HTTP 200.
- Browser smoke:
  - Login with demo staff account.
  - Open `/orders?focus=pending`.
  - Page shows `DEMO 可视演示`.
  - Page shows pending focus and `确认订单` action.
  - Table includes `下一步` column.

## Current Runtime Boundary

The deployed workbench still runs in demo visual mode unless rebuilt with `VITE_STUDIO_DEMO=false` and configured with backend staff token or login integration. In demo mode, staff can see the action flow and local feedback, but status changes are not persisted to the production order database.
