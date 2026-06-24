# Studio Workbench Jianyue UI Deploy - 2026-06-16

## Scope

- Target: `https://studio.evanshine.me`
- Server: Hong Kong 2, `103.24.216.8`
- Site directory: `/var/www/studio.evanshine.me`
- Release id: `prod-eb044ca-studio-jianyue-ui-20260616`
- Git commit deployed: `eb044ca feat(studio): refine appointment dashboard UI`
- Scope limited to static `studio-workbench` frontend files. No backend, database, or nginx config changes.

## Package

- Local package: `studio-workbench/releases/studio-workbench-jianyue-ui-eb044ca-20260616-230639.zip`
- SHA256: `410E453CEEDF1618117F38031DFAF72263D8A7E0B9990D82D27BD9E7B46E814B`
- Size: `0.54 MB`
- Remote package: `/opt/yingyue/releases/studio-workbench-jianyue-ui-eb044ca-20260616-230639.zip`
- Remote release dir: `/opt/yingyue/releases/studio-workbench-jianyue-ui-eb044ca-20260616-230639`
- Pre-deploy backup: `/opt/yingyue/backups/studio-workbench-jianyue-ui-eb044ca-20260616-230639-pre`

## Build

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_LOGIN_CAPTCHA='false'
$env:VITE_STUDIO_LEGACY_AUTO_LOGIN='false'
$env:VITE_STUDIO_RELEASE_ID='prod-eb044ca-studio-jianyue-ui-20260616'
npm run build
```

Result:

- `vue-tsc -b`: PASS
- `vite build`: PASS
- Assets emitted under `dist/assets/prod-eb044ca-studio-jianyue-ui-20260616/`
- Vite reported the existing ECharts chunk-size warning only. This does not block deploy.

## Tests

```powershell
npm test -- --run
```

Result:

- Test files: `80 passed`
- Tests: `451 passed`

## Deploy

Steps performed by SSH/SFTP script:

1. Uploaded package to `/opt/yingyue/releases/`.
2. Unzipped into a release-specific directory.
3. Backed up the existing site directory.
4. Replaced `/var/www/studio.evanshine.me` with the new static files.
5. Verified `/var/www/studio.evanshine.me/assets/prod-eb044ca-studio-jianyue-ui-20260616`.
6. Ran `nginx -t`.
7. Reloaded nginx.

Remote verification:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## HTTP Probes

All probes returned `200` and included `prod-eb044ca-studio-jianyue-ui-20260616` in the HTML asset paths:

- `https://studio.evanshine.me/`
- `https://studio.evanshine.me/login`
- `https://studio.evanshine.me/order/appointment`
- `https://studio.evanshine.me/dashboard/today`
- `https://studio.evanshine.me/merchant/store`
- `https://studio.evanshine.me/schedule`

## Browser Smoke

URL:

```text
https://studio.evanshine.me/login?cb=prod-eb044ca-studio-jianyue-ui-20260616
```

Observed:

- Page title: `影约云门店工作台`
- Release assets present: `true`
- Login page rendered staff workbench copy: `true`
- Captcha visible: `false`
- Browser console errors from the page: none observed.

## Authenticated API Smoke

Production staff login was checked with the local workbench account file. No password or token value is recorded here.

Bootstrap:

- Login user: `store-admin`
- Token length: `423`
- Identity username: `store-admin`
- Identity role type: `STORE_MANAGER`
- Identity store id: `900000000000000100`
- Store scope count: `5`
- Menu permission count: `25`
- Global store scope: `false`
- Pending orders from bootstrap: `1003`
- Active selections from bootstrap: `828`

Recent Douyin Life orders:

- Endpoint: `GET /yy/order/list`
- Query window: `2026-05-16 00:00:00` to `2026-06-16 23:59:59`
- Channel: `DOUYIN_LIFE`
- HTTP/API code: `200`
- Returned/total rows: `1003 / 1003`
- Status sample: `PENDING = 1003`
- Store sample: `900000000000000200 = 1001`, `900000000000000300 = 2`

Today booking inventory:

- Endpoint: `GET /yy/bookingSlotInventory/list`
- Date: `2026-06-16`
- HTTP/API code: `200`
- Returned slots: `0`
- Full slots: `0`

Conclusion:

- Real account, permission bootstrap, recent Douyin Life order ledger, and one-month order query are available in production.
- Today slot capacity data is not yet populated in `yy_booking_slot_inventory`; the new Jianyue-style UI will display morning/afternoon/evening slot cards once inventory or dated arrival slots are synced into that ledger.
- This remaining gap is data synchronization/backfill, not missing frontend UI.

## User-Facing Changes In This Release

- Appointment slots use Jianyue-style sections: `上午`, `下午`, `晚上`.
- Slot cards show clear time, order count, capacity, and a top-right `满` badge when capacity is full.
- Home dashboard loads booking inventory together with dashboard stats and schedule data.
- Store page uses compact real-store cards, with actions for service groups, product config, walk-in order, and order attributes.
- Douyin Life mapping diagnostics are folded under a details section instead of occupying the main view.
