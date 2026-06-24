# Studio Workbench Order Scope Deploy 2026-06-16

## Result

`9e58f35 fix(studio): scope Douyin Life order workbench` 已部署到 `https://studio.evanshine.me`。

本次只更新香港2 `103.24.216.8` 上的门店工作台静态前端目录 `/var/www/studio.evanshine.me`，不改后端服务、不改数据库、不改 nginx 站点配置。

## Scope

- 预约订单页的历史入口固定为“近30天来客”，后端查询使用 `source=DOUYIN_LIFE` 和近 30 天下单时间窗口。
- `DOUYIN_LIFE` 团购/券类订单如果没有预约时段，按 `orderDate` 进入工作台日处理口径，不再全部计入“缺预约时间”异常。
- 非来客订单仍要求预约时段，缺预约时间继续进入异常流。
- 首页、活动订单、派生订单模块、预约订单页共用同一套订单异常规则。

## Git

```text
branch=yingyue-closed-loop-optimization-20260603
commit=9e58f35 fix(studio): scope Douyin Life order workbench
push=4095c81..9e58f35 -> origin/yingyue-closed-loop-optimization-20260603
```

## Verification

Local tests:

```text
npm test
-> 80 files passed, 443 tests passed
```

Production build:

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_LOGIN_CAPTCHA=false
VITE_STUDIO_LEGACY_AUTO_LOGIN=false
VITE_STUDIO_RELEASE_ID=prod-9e58f35-order-scope-20260616
npm run build
-> passed
```

Local browser smoke against real API:

```text
url=http://localhost:5190/order/appointment?quick=all&cb=codex-verify-20260616
近30天来客=1003
缺预约时间=0
异常缺资料=176
全部门店 button count=1
old "缺到店时间" text present=false
```

## Deployment

```text
local_package=C:\Users\ADMINI~1\AppData\Local\Temp\studio-workbench-order-scope-9e58f35-20260616-223117.zip
sha256=3D3FB8773A904601BDE9E300E4B603C13E31FFFA49830FBA91F3B22F9339A01C
remote_package=/opt/yingyue/releases/studio-workbench-order-scope-9e58f35-20260616-223117.zip
release=/opt/yingyue/releases/studio-workbench-order-scope-9e58f35-20260616-223117
backup=/opt/yingyue/backups/studio-workbench-order-scope-9e58f35-20260616-223117-pre
site=/var/www/studio.evanshine.me
asset_dir=prod-9e58f35-order-scope-20260616
asset_count=75
index_size=1014
nginx -t=successful
systemctl reload nginx=successful
```

## Public Probes

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/login -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/dashboard/today -> 200 text/html
https://studio.evanshine.me/merchant/store -> 200 text/html
https://studio.evanshine.me/schedule -> 200 text/html
release asset present=true
```

Browser smoke:

```text
url=https://studio.evanshine.me/login?cb=codex-prod-9e58f35
title=影约云门店工作台
release asset present=true
visible login fields=account,password
visible captcha input=false
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/studio-workbench-order-scope-9e58f35-20260616-223117-pre/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
