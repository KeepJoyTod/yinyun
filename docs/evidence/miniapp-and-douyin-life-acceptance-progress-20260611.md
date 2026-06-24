# 小程序与抖音来客验收推进记录

时间：2026-06-11 22:30

## 结论

- 生产 API 与客户取片自动预检通过。
- 微信/抖音小程序构建通过。
- 微信开发者工具已登录，可通过 CLI 打开 `mp-weixin`，并已生成预览二维码。
- 抖音开发者工具已安装并打开，但当前停留在前置管理页，需要在 GUI 中手动导入 `mp-toutiao`。
- 本机直连抖音 OpenAPI 返回 `IP不在白名单`，不作为生产验收结论。
- 香港2加白服务器出口查询抖音来客订单成功，`client_token` 与 `goodlife/v1/trade/order/query/` 均返回成功，检测到订单列表。
- 生产库已有 `DOUYIN_LIFE` 相册占位 1 个，最近 72 小时有订单查询、库存查询、退款通知日志。

## 自动验证

### 生产 API

命令：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount -CheckDouyinMissingSignature
```

结果：

```text
auth: success
albums: success count=1
detail: success albumId=990202606080001, assetCount=4
thumbnail-url: success
preview-url: success
download-url: success
auth-json-route: success
douyin-missing-signature: rejected error_code=9999
preflight: passed
```

### 平台 readiness

命令：

```powershell
.\tools\yingyue-platform-readiness.ps1
```

结果：

```text
api-domain-scheme: PASS
douyin-miniapp-appid: PASS
wechat-miniapp-appid: PASS
douyin-miniapp-dist: PASS
wechat-miniapp-dist: PASS
douyin-webhook-challenge: PASS
douyin-missing-signature: PASS
github-repo-private: PASS
platform readiness passed
```

合法域名已由用户确认：

```text
request: https://api.evanshine.me
uploadFile: https://api.evanshine.me
downloadFile: https://api.evanshine.me
```

### mobile-uniapp

命令：

```powershell
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
npm test
```

结果：

```text
typecheck: passed
build:mp-weixin: passed
build:mp-toutiao: passed
npm test: 108 passed, 0 failed
```

说明：更新交付状态文案后，`delivery-status-contract.test.cjs` 的旧断言同步更新为“合法域名已由用户确认完成”。

## 开发者工具

### 微信小程序

导入目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
```

结果：

```text
微信开发者工具 login: true
cli open: success
cli preview: success
Using AppID: wx2a1a34748f56a6c6
```

本地预览码：

```text
C:\Users\Administrator\Desktop\影约云微信预览码\wechat-preview.png
```

### 抖音小程序

导入目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

工具路径：

```text
D:\douyinkaifa\@bytedminiprogram-ide\抖音开发者工具.exe
```

当前状态：

```text
抖音开发者工具已安装并打开，窗口标题为“抖音开发者工具前置管理页”。
未发现可用根目录 CLI；需要在 GUI 中手动导入 mp-toutiao 目录。
```

## 抖音来客

### 本机直连 OpenAPI

命令：

```powershell
.\tools\run-douyin-life-current-order.ps1
```

结果：

```text
client_token: success
order query: IP不在白名单，请开通权限
```

说明：这是本机出口 IP 限制，不代表香港2生产出口。

### 香港2加白出口 OpenAPI

命令：

```powershell
.\tools\yingyue-douyin-openapi-remote-order-query.ps1 -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt"
```

结果：

```text
remote_host: 103.24.216.8
client_token: success, err_no=0
client_token logid: 202606112228419BB59A45A22750264A94
order query: success, err_no=0
order query logid: 202606112228428AC9CDECA75C51259B09
order_count_detected: 10
```

### 生产库审计

命令：

```powershell
.\tools\yingyue-douyin-album-audit.ps1 -Mode SshDocker -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -RecentHours 72 -RecentLimit 10
```

结果：

```text
DOUYIN_LIFE albums total: 1
DOUYIN_LIFE albums in recent 72h: 0
latest DOUYIN_LIFE album: ACTIVE / WAITING / phone_record=present_encrypted_or_masked / visible_asset_count=0
recent sync log api_name: life_order_query, reservation_stock_query, refund_notify
```

## 仍需人工触发

1. 微信真机扫码 `C:\Users\Administrator\Desktop\影约云微信预览码\wechat-preview.png`，验证：
   - `13900001111 / PREVIEW-20260608` 登录
   - 相册列表
   - 相册详情
   - 图片预览
   - 保存图片
2. 抖音开发者工具手动导入 `mp-toutiao` 目录，验证同一条取片链路。
3. 抖音来客用真实商品/预约商品支付一次，触发：
   - 支付通知或订单同步
   - 本地 `yy_order`
   - 取片相册占位
   - 后台订单导出
4. 平台验收时继续收集真实 `logid`：
   - 发券 SPI
   - 创单/支付回调
   - 接单
   - 核销
