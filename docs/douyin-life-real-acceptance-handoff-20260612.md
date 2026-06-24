# 抖音来客真实验收交接

日期：2026-06-12

## 结论

抖音来客 `DOUYIN_LIFE` 代码、公网 SPI 地址、订单查询/同步、发券、接单、核销入口都已准备好。当前剩余的是外部真实验收：需要平台能力和真实用户/测试用户触发，拿到对应接口的 `logid` 后填回开放平台。

## 核心规则

| 项 | 结论 |
| --- | --- |
| 渠道 | `DOUYIN_LIFE` |
| 正式 API 域名 | `https://api.evanshine.me` |
| 后台入口 | `https://admin.evanshine.me` -> 抖音来客 |
| logid 不是 | 订单号、商品 ID、account_id、book_id |
| SPI 回调 logid | 请求头 `X-Bytedance-Logid` |
| OpenAPI logid | 响应体 `extra.logid` 或 `logid` |
| 本地账本 | 订单统一写 `yy_order`，外部订单映射写 `yy_channel_order_mapping` |
| 同步日志 | `yy_channel_sync_log.request_id` 保存 logid |

## 验收项

| 验收项 | 触发方式 | logid 来源 | 后台查看 |
| --- | --- | --- | --- |
| 发券 | 用户真实支付后，抖音请求发券 SPI | `/tripartite-code/create` 请求头 `X-Bytedance-Logid` | 抖音来客 -> 开放平台验收 logid |
| 创单/支付回调 | 用户在抖音 App 发起预约或支付成功 | `/reservation/order-create` 或 `/reservation/pay-notify` 请求头 `X-Bytedance-Logid` | 抖音来客 -> 同步日志 |
| 接单 | 后台调用 `POST /yy/channel/DOUYIN_LIFE/confirm` | OpenAPI 响应 `extra.logid` 或 `logid` | 抖音来客 -> 接单结果 |
| 核销 | 后台调用 `POST /yy/channel/DOUYIN_LIFE/verify` | OpenAPI 响应 `extra.logid` 或 `logid` | 抖音来客 -> 核销结果 |
| 订单同步 | 自动同步或手动同步订单 | 订单查询 OpenAPI 响应 `extra.logid` 或 `logid` | 首页渠道状态、订单页、抖音来客同步日志 |

## 当前推荐 SPI 地址

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

## 操作顺序

1. 确认抖音开放平台能力已经开通：三方码发布、生活服务订单查询、到综预约品确认接拒单、团购/券码核销、订单支付通知/SPI。
2. 确认真实商品或测试商品配置正确，并且用户端能发起预约或支付。
3. 用户下单/支付后，先看发券 SPI 和创单/支付回调是否进入后台同步日志。
4. 后台抖音来客页面复制发券、创单/支付回调 `logid`。
5. 拿到真实 `book_id` 后，如果平台要求主动接单，再调用接单并复制响应 `logid`。
6. 拿到真实券码或 `verify_token` 后，调用整单核销并复制响应 `logid`。
7. 把对应 `logid` 填到开放平台验收页。

## 常用命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\print-douyin-life-acceptance-handoff.ps1
.\tools\get-yingyue-delivery-status.ps1
.\tools\yingyue-platform-readiness.ps1
.\tools\run-douyin-life-current-order.ps1
.\tools\run-douyin-life-spi-public-smoke.ps1
.\tools\yingyue-douyin-album-audit.ps1
```

## 注意

- 不要重复真实付款；优先使用已有真实订单或低价测试订单。
- 待支付订单号不能用于最终验收。
- 不要把 AppSecret、token、完整手机号、openid、OSS AccessKey 写进文档或截图。
- 如果开放平台提示 `logid` 校验失败，优先确认是不是误填了订单号或商品 ID。
