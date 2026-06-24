# 影约云平台配置就绪检查 2026-06-07

## 结论

已新增并执行平台配置就绪脚本：

```powershell
.\tools\yingyue-platform-readiness.ps1
```

检查结果通过。微信小程序 AppID 已补入 `mobile-uniapp/src/manifest.json` 的 `mp-weixin.appid`，微信/抖音小程序 AppID 检查均为 PASS。

## 检查结果

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| API HTTPS 域名 | PASS | `https://api.evanshine.me` |
| 抖音小程序 AppID | PASS | `mp-toutiao.appid` 已配置 |
| 微信小程序 AppID | PASS | `mp-weixin.appid=wx2a1a34748f56a6c6` |
| 抖音小程序构建产物 | PASS | `mobile-uniapp/dist/build/mp-toutiao` 已存在 |
| 微信小程序构建产物 | PASS | `mobile-uniapp/dist/build/mp-weixin` 已存在 |
| 抖音 Webhook challenge | PASS | 返回 `application/json` 且回显 challenge |
| 缺签名 SPI 拒绝 | PASS | 返回抖音裸 JSON，`error_code=9999` |
| GitHub 仓库私有 | PASS | `dengzhekun/yingyue-cloud` 为 private |
| 小程序 request 域名 | MANUAL | 后台填 `https://api.evanshine.me` |
| 小程序 download 域名 | MANUAL | 后台填 `https://api.evanshine.me` |
| 小程序 upload 域名 | MANUAL | 后台填 `https://api.evanshine.me` |

## 平台填写值

小程序合法域名：

```text
request/download/upload domain: https://api.evanshine.me
```

抖音 Webhook / SPI 地址：

```text
https://api.evanshine.me/api/douyin/life/webhook
https://api.evanshine.me/api/douyin/life/tripartite-code/create
https://api.evanshine.me/api/douyin/life/refund/apply
https://api.evanshine.me/api/douyin/life/refund/notify
https://api.evanshine.me/api/douyin/life/reservation/order-create
https://api.evanshine.me/api/douyin/life/reservation/pay-notify
https://api.evanshine.me/api/douyin/life/reservation/order-query
https://api.evanshine.me/api/douyin/life/reservation/stock-query
https://api.evanshine.me/api/douyin/life/voucher/revoke
https://api.evanshine.me/api/douyin/life/voucher/batch-revoke
https://api.evanshine.me/api/douyin/life/order/query
https://api.evanshine.me/api/douyin/life/fulfil/check-info-sync
```

## 剩余人工动作

| 项 | 当前状态 |
| --- | --- |
| 抖音小程序合法域名 | 需要在抖音小程序后台填写 request/download/upload 域名 |
| 微信小程序合法域名 | 需要在微信公众平台填写 request/download/upload 域名 |
| 微信小程序 AppID | 已填 `wx2a1a34748f56a6c6` 并重新构建 |
| 真单回调验收 | 需要真实触发抖音预约/支付/发券/退款等平台回调获取 logid |
