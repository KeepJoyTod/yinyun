# 抖音生活服务团购订单联调 Runbook

更新日期：2026-06-02

## 结论

你截图里的“团购商品/商家下单”属于抖音生活服务商家应用订单链路，不是上一批已接的“服务市场平台应用”。这条链路的目标是：用户在抖音团购页购买测试商品，抖音把支付通知推给影约云，影约云用商家应用 OpenAPI 查询这笔订单状态，再映射为本地预约/核销订单。

更准确地说：这不是只靠个人开发者沙盒就能完整跑通的能力。完整测试需要抖音来客商家主体、生活服务商家应用、测试店铺/商品和对应业务权限；很多入口会要求企业/个体工商户资质、营业执照或已开通抖音来客。当前仓库已经准备好接口、脚本、回调和字段映射；真实创建团购订单、发券、接单、核销，需要平台能力和测试商家侧数据配合。

## 链路区别

| 场景 | 当前项目状态 | 说明 |
| --- | --- | --- |
| 服务市场平台应用 | 已接入 client_token、已购状态、购买明细、webhook 占位 | 面向“商家购买我们的 SaaS 服务”。 |
| 生活服务团购订单 | 本文新增联调步骤和 smoke 脚本 | 面向“客户在抖音团购/店铺下单照相套餐”。 |

生活服务团购不是由影约云后端直接创建真实订单。测试时先在抖音测试店铺/测试商品里由测试用户下单，平台产生订单后，我们再收通知和查状态。

## 商家需要提供

| 数据 | 用途 | 备注 |
| --- | --- | --- |
| 抖音来客商家账号 | 店铺、商品、订单归属 | 生活服务订单最终属于来客商家，不属于普通小程序沙盒。 |
| 营业执照/主体资质 | 开通生活服务商家能力 | 企业或个体工商户通常需要先完成资质认证。 |
| 生活服务商家应用 `client_key` | 换 `client_access_token` | 和小程序沙盒 AppID 可能不是同一个。 |
| 生活服务商家应用 `client_secret` | 换 `client_access_token` | 只能放环境变量/密钥管理，不提交 Git。 |
| `account_id` | 请求头 `Rpc-Transit-Life-Account` | 表示授权/绑定的商家账号。 |
| 测试店铺 | 生成测试商品和测试订单 | 需要在抖音开放平台/生活服务测试配置里添加。 |
| 测试用户 | 在抖音端购买测试商品 | 用于产生真实测试订单。 |
| 测试商品/团购套餐 | 用户下单入口 | 最好先准备一个低价或沙盒商品。 |
| `order_id` 或 `out_order_no` | 商家端查询订单状态 | 支付通知回调里会拿到，或从测试订单后台复制。 |
| 支付通知回调 URL | 接收订单支付通知 | 正式联调需要 HTTPS 公网域名。 |
| 业务权限 scope | 调用生活服务订单接口 | 至少要具备生活服务订单/核销相关权限。 |

## 测试环境操作

1. 先确认主体：是否有抖音来客商家账号、营业执照/主体认证、可用门店。
2. 在抖音开放平台创建或绑定“生活服务商家应用”。
3. 让生活服务商家应用绑定测试店铺/测试商家，确认权限包含订单查询、订单通知、团购核销或预约品相关能力。
4. 配置订单支付通知回调地址，例如：`https://你的域名/api/douyin/life/reservation/pay-notify`。
5. 在抖音来客或测试店铺侧创建一个测试团购商品/套餐。这里是单独的测试店铺/测试商品数据域：通过来客后台创建测试商品时，浏览器需要用 ModHeader 加测试数据请求头；通过接口创建测试商品时，请求头必须加 `Rpc-Persist-Life-Test-Data-Access: all`。正式店铺/正式商品不要开启这个测试头。
6. 测试用户从抖音端进入商品页并完成下单/支付。
7. 从支付通知、来客商家后台、测试后台或开放平台工具拿到 `order_id` / `out_order_no`。
8. 运行本仓库 smoke 脚本查询订单状态。
9. 确认订单状态后，再映射到 `yy_channel_order_mapping` 和本地预约订单。

如果现在没有营业执照或抖音来客商家主体，只能先完成：应用资料梳理、接口代码、回调地址、字段映射、脚本准备；不能凭普通小程序沙盒生成真实生活服务团购订单。

## 本地命令行联调

PowerShell 当前窗口设置：

```powershell
$env:DOUYIN_LIFE_BASE_URL="https://open.douyin.com"
$env:DOUYIN_LIFE_CLIENT_KEY="<生活服务商家应用 client_key>"
$env:DOUYIN_LIFE_CLIENT_SECRET="<生活服务商家应用 client_secret>"
$env:DOUYIN_LIFE_ACCOUNT_ID="<商家 account_id>"
$env:DOUYIN_LIFE_ORDER_ID="<测试订单 order_id>"
```

执行：

```powershell
.\tools\douyin-life-order-smoke.ps1
```

也可以按外部订单号查：

```powershell
$env:DOUYIN_LIFE_OUT_ORDER_NO="<测试订单 out_order_no>"
.\tools\douyin-life-order-smoke.ps1
```

需要看脱敏后的原始响应：

```powershell
.\tools\douyin-life-order-smoke.ps1 -ShowRaw
```

如果联调测试数据要求带测试数据头：

```powershell
.\tools\douyin-life-order-smoke.ps1 -UseTestDataHeader
```

脚本和后台“测试数据头”开关只用于测试店铺/测试商品数据域，会给 OpenAPI 请求加：

```text
Rpc-Persist-Life-Test-Data-Access: all
```

来客后台页面本身不是由脚本调用，进入单独的测试店铺/创建测试商品时要按本地视频材料使用浏览器插件 ModHeader。视频材料位置：

```text
C:\Users\Administrator\Desktop\yiyue\测试店铺管理
```

后台页面保存 `client_secret` 和 token 时按敏感凭证处理，规则见 `docs/channel-secret-storage.md`。

## 接口落点

| 动作 | 平台接口/机制 | 本地动作 |
| --- | --- | --- |
| 获取 token | `POST /oauth/client_token/` | 用生活服务商家应用 `client_key/client_secret` 换 token。 |
| 用户下单 | 抖音测试店铺/测试商品 | 用户侧完成，不由影约云直接造真实订单。 |
| 支付通知 | 订单支付通知 SPI | `POST /yy/channel/DOUYIN_LIFE/webhook` 接回调，记录订单号、金额、状态和脱敏 payload；已识别状态会自动创建/更新 `yy_order`。 |
| 商家查单 | `GET /goodlife/v1/trade/order/query/` | `GET /yy/channel/DOUYIN_LIFE/orders` 带 `access-token` 和 `Rpc-Transit-Life-Account` 查询订单状态；查到有效订单后会同步 `yy_order` 并回显 `localOrderId`。 |
| 发券 | 发券 SPI / 三方码发券 | `POST /api/douyin/life/tripartite-code/create` 返回抖音要求的裸 JSON，并记录 `X-Bytedance-Logid`。 |
| 接单/拒单 | `POST /goodlife/v1/comprehensive/trade/order/confirm/` | `POST /yy/channel/DOUYIN_LIFE/confirm` 提交 `book_id`、接单结果、拒单原因。 |
| 整单核销 | `POST /goodlife/v1/fulfilment/certificate/verify/` | `POST /yy/channel/DOUYIN_LIFE/verify` 提交 `poi_id`、`codes` 或 `verify_token`，记录响应 `logid`。 |
| 本地映射 | `yy_channel_order_mapping` | 外部订单映射到本地预约/核销单。 |

## 下一步开发项

1. `DOUYIN_LIFE` 渠道适配器已完成，避免和 `DOUYIN` 服务市场逻辑混用。
2. 后台“抖音生活服务订单联调”页面已完成，包含 token、查单、同步、接拒单、核销和最近 `logid`。
3. webhook/SPI 已完成：订单创建、支付通知、库存查询、订单查询、撤销核销、发券 SPI 都有 Spring Boot 入口。
4. 查询/同步订单成功后会落库 `yy_channel_order_mapping` 和 `yy_order`。
5. 状态映射已完成第一版：支付/接单/服务中/完成/取消会同步为 `PENDING/CONFIRMED/SERVING/COMPLETED/CANCELLED`。
6. 当前剩余不是本地代码主功能，而是平台能力验收：三方码发布、订单查询、接拒单、核销能力需要开放平台放行并提供真实 `book_id`、券码或 `verify_token`。

## 验收标准

| 编号 | 验收点 |
| --- | --- |
| DY-LIFE-001 | 能用生活服务 `client_key/client_secret` 获取 token。 |
| DY-LIFE-002 | 测试用户能在测试店铺创建一笔团购订单。 |
| DY-LIFE-003 | 支付通知能被影约云接收并记录原始 payload。 |
| DY-LIFE-004 | 能通过 `order_id/out_order_no` 查询订单状态。 |
| DY-LIFE-005 | 查询到“已结束/已完成/已核销”等状态后，本地订单能同步为对应状态。 |
| DY-LIFE-006 | token、手机号、open_id、商家密钥不进入日志、导出文件或 Git。 |
| DY-LIFE-007 | 发券 SPI 返回抖音裸 JSON，不包 RuoYi `R.ok(...)`。 |
| DY-LIFE-008 | 接单/核销 OpenAPI 的响应 `logid` 能在后台复制，用于开放平台验收。 |
| DY-LIFE-009 | 订单类 Webhook/SPI 入站事件先写 `yy_channel_event_inbox`，重复推送按事件状态幂等处理；退款通知同步本地退款状态和退款金额，券核销通知同步为本地完成。 |
| DY-LIFE-010 | OpenAPI 定时同步只做补偿；客户查单接口只读本地 `yy_order`，不实时请求抖音。 |

## Webhook/SPI 入站优先与 OpenAPI 补偿排障

生产订单同步默认按下面顺序排查：

1. 先看抖音是否推送到 `https://api.evanshine.me/api/douyin/life/*`。
2. 后台进入抖音来客联调页，先看“订单同步健康”是否有最近 Webhook、最近补偿同步、失败事件数和最近 logid。
3. 再看“事件收件箱”或 `yy_channel_event_inbox` 是否有对应事件。
4. `process_status=PROCESSED/DONE` 表示已处理完成；`RECEIVED/FAILED/RETRY` 允许重试，不按重复事件跳过。
5. `yy_channel_order_mapping` 确认外部订单号是否已映射到本地订单。
6. `yy_order` 确认本地订单状态、支付状态、门店、手机号、预约时段是否齐全。

说明：当前 inbox 覆盖订单类事件（`reservation/order-create`、`reservation/pay-notify`、`refund_notify/refund_notice`、普通 webhook 中 `content.action=refund_success/verify_success`、订单 webhook）；`YyChannelEventInboxWorkerService` 默认每 30 秒处理可重试事件，失败低于 5 次转 `RETRY`，达到阈值转 `DEAD`。发券、退款申请 `refund_apply`、库存等非订单 SPI 继续写 `yy_channel_sync_log`。
7. 如没有推送或推送丢失，再用 `POST /yy/channel/DOUYIN_LIFE/orders/sync` 按时间范围补偿同步；补偿同步达到 `maxPages/maxTotal` 时返回 `SUSPICIOUS`，先缩小时间窗口，不继续扩大范围灌库。

管理员可用接口：

```text
GET /yy/channel/DOUYIN_LIFE/sync-health
GET /yy/channel/DOUYIN_LIFE/event-inbox/status
GET /yy/channel/DOUYIN_LIFE/event-inbox/list
POST /yy/channel/DOUYIN_LIFE/event-inbox/{id}/retry
```

客户订单查询入口为：

```text
POST /client/orders/auth/verify
Header: Content-Type: application/json
Body: {"storeId":"门店ID","phone":"完整手机号","phoneLast4":"后四位"}

GET /client/orders
Header: X-Client-Order-Token: 上一步返回的 clientOrderToken

GET /client/orders/{orderNo}
Header: X-Client-Order-Token: 上一步返回的 clientOrderToken
```

该接口是公开只读入口，必须带 `storeId`，只返回脱敏字段、取片入口和订单详情入口，不返回客户姓名、完整手机号、secret、token 或原始私有 payload。

## 参考

- 抖音订单支付通知：`https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/locallife/free-group-sol/order-payment-notice`
- 抖音生活服务订单查询：`https://developer.open-douyin.com/docs/resource/zh-CN/local-life/develop/OpenAPI/general-capabilities/order.query/query`
- 抖音生活服务自研商家接入：`https://developer.open-douyin.com/docs/resource/zh-CN/local-life/connect/developer/self-developed-merchant-guide`
- 抖音生活服务测试账号说明：`https://developer.open-douyin.com/docs/resource/zh-CN/local-life/connect/test-accountu-sage-instructions`
