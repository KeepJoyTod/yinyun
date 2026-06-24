# Studio Orders Today Work Deploy 2026-06-12

## Result

`8ffab98 fix: default studio orders to today work` has been deployed to `https://studio.evanshine.me`.

This deploy narrows the staff order page from historical-first to daily operations-first:

- `/orders` defaults to `今日待处理`.
- `待确认优先` only counts orders arriving today.
- `/orders?focus=pending` opens `今日待确认`, not all historical pending orders.
- `全部订单` remains available as an explicit manual filter.

## Deployment

- Server: `103.24.216.8`
- Site dir: `/var/www/studio.evanshine.me`
- Local package: `dist/studio-workbench-8ffab98.zip`
- Remote package: `/opt/yingyue/releases/studio-workbench-8ffab98.zip`
- Release: `/opt/yingyue/releases/studio-workbench-8ffab98`
- Backup: `/opt/yingyue/backups/20260612-215322-pre-studio-workbench-8ffab98`

## Verification

- TDD red check: `npm test -- OrdersView.contract.test.ts` failed before implementation on the new today-work assertions.
- `studio-workbench npm test`: 17 files, 47 tests passed.
- `studio-workbench npm run build` with API mode env: passed.
- `mobile-uniapp npm run build:mp-weixin`: passed.
- `mobile-uniapp npm run build:mp-toutiao`: passed.
- `tools/yingyue-platform-readiness.ps1 -BaseUrl https://api.evanshine.me`: passed.
- Remote `nginx -t`: successful.
- Public HTTP checks:
  - `https://studio.evanshine.me/orders`: HTTP 200.
  - `https://studio.evanshine.me/orders?focus=pending`: HTTP 200.
- Browser smoke:
  - `/orders` shows `今日待处理 · 0`.
  - `/orders` shows `今日待确认`.
  - `/orders` empty state says `今日待处理订单已清空`.
  - `/orders?focus=pending` shows `已进入今日待确认订单，当前 0 条需要处理`.

## Douyin Life Follow-Up

The code and public platform checks are ready for external acceptance.

A first read-only remote order query retry on 2026-06-12 reached the SSH layer but timed out during SSH session setup:

```text
New-SSHSession: Socket read operation has timed out after 10000 milliseconds.
```

A second retry connected successfully and fetched `client_token`, but Douyin order query returned platform rate limiting:

```text
token: status=200, success=true, err_no=0
order_query: status=200, err_no=2119003, message=请求太过频繁，请稍后再试
order_query logid: 202606122157174E2C013D45A20495FD5E
```

The next retry can use the same read-only command after the rate limit cools down:

```powershell
.\tools\yingyue-douyin-openapi-remote-order-query.ps1 -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -RecentHours 168 -PageSize 10
```

If it returns a paid order, sync the selected order through the existing `DOUYIN_LIFE` admin/order sync flow and record the returned OpenAPI `logid`.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260612-215322-pre-studio-workbench-8ffab98/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
