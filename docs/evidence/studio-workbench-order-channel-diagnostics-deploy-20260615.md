# Studio Workbench Order Channel Diagnostics Deploy 2026-06-15

## Result

`4d3b60f feat(studio): add order channel diagnostics` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-4d3b60f.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-4d3b60f.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-4d3b60f` |
| Backup | `/opt/yingyue/backups/20260615-082522-pre-studio-workbench-4d3b60f` |
| Uploaded files | `91` |
| Asset files | `88` |

## What Changed

- Order detail drawer now shows channel sync logs related to the selected order.
- Staff can copy a diagnostic payload containing order ID, local `yy_order` ID, channel type, `requestId/logid`, error message, and remark.
- Shared copy helper now has a textarea fallback and no longer reports success when every clipboard path fails.
- The studio workbench no longer has a direct `@vueuse/core` dependency; `radix-vue` keeps its own transitive dependency.

## Verification

Local:

```text
studio-workbench npm test -> 66 files, 349 tests passed
studio-workbench npm run build -> passed; 2828 modules transformed; built in 3.62s
git diff --check -> passed; only Windows LF/CRLF notices before commit
```

Remote deploy output:

```text
commit=4d3b60f
release=/opt/yingyue/releases/studio-workbench-4d3b60f
backup=/opt/yingyue/backups/20260615-082522-pre-studio-workbench-4d3b60f
site=/var/www/studio.evanshine.me
uploaded=91
assets=88
nginx -t -> successful
```

Public HTTP checks:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/service/photos -> 200 text/html
https://studio.evanshine.me/service/selection -> 200 text/html
https://studio.evanshine.me/settings/logs -> 200 text/html
```

Browser smoke:

```text
https://studio.evanshine.me/login?redirect=/order/appointment
hasLoginTitle=true
hasSidePanel=true
hasSideCopy=true
hasHorizontalOverflow=false
viewportWidth=1270
formLeft=823

https://studio.evanshine.me/order/appointment?q=YY202606100001&quick=all
orderRowCount=1
copyButtonCount=1
drawer has 渠道同步 / 复制排障 / requestId/logid / 错误信息 / 备注
clipboard contains [订单渠道排障], YY202606100001, local ID 9001, DOUYIN_LIFE logid, and remark
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260615-082522-pre-studio-workbench-4d3b60f/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
