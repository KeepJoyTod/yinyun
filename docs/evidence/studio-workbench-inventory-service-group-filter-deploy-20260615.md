# Studio Workbench Inventory Service Group Filter Deploy 2026-06-15

## Result

`6e08eac feat(studio): filter inventory by service group` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-6e08eac.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-6e08eac.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-6e08eac` |
| Backup | `/opt/yingyue/backups/20260615-112030-pre-studio-workbench-6e08eac` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- `/merchant/inventory` now has a service group filter.
- Demo inventory filtering applies date, store, service group, and conflict filters together.
- API-mode inventory query forwards `serviceGroupId` to `/yy/bookingSlotInventory/list`.
- Inventory summary cards are derived from the currently loaded slots through `inventoryOperations.ts`.
- Photographer filtering remains intentionally unimplemented until the schedule/inventory source exposes a real photographer field.

## Verification

Local:

```text
npm test -- inventoryOperations.test.ts InventoryView.contract.test.ts backend.contract.test.ts -> 3 files, 16 tests passed
npm test -> 68 files, 360 tests passed
npm run build -> passed; 2829 modules transformed; built in 2.49s
git diff --check -> passed; only Windows LF/CRLF notices before commit
Browser local smoke -> service group filter works, store switch resets invalid service group, consoleErrors=0
```

Remote deploy output:

```text
commit=6e08eac
release=/opt/yingyue/releases/studio-workbench-6e08eac
backup=/opt/yingyue/backups/20260615-112030-pre-studio-workbench-6e08eac
site=/var/www/studio.evanshine.me
uploaded_files=91
asset_files=88
nginx=ok
site_index=ok
```

Public HTTP checks:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/merchant/inventory -> 200 text/html
https://studio.evanshine.me/dashboard/today -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
```

Production browser smoke:

```text
https://studio.evanshine.me/merchant/inventory
asset=https://studio.evanshine.me/assets/index-DRohVs2z.js
initial serviceGroupOptions=全部服务组, 证件照快拍组, 形象照主棚, 交付与取片组
after serviceGroup=形象照主棚 -> rows=1, 时段总数=1, 库存冲突=1, 总容量=3
after store=影约云香港交付点 -> serviceGroup=全部服务组, options=全部服务组/交付与取片组, rows=1
consoleErrors=0
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-112030-pre-studio-workbench-6e08eac/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Remaining T02 Work

- Production API-mode inventory query smoke still needs an authenticated API session.
- Photographer filtering should stay blocked until the source data has a real photographer field.
