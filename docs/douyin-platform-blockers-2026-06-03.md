# 抖音生活服务平台卡点复盘

更新日期：2026-06-03

## 结论

当前抖音来客联调推不动，主要不是影约云代码没写好，而是开放平台侧资源和能力没有完全对齐。现在不要继续重复付款或重复创建商品，先解决测试店铺、发券 SPI、订单查询能力、接入验收状态这四个点。

## 当前现象

| 现象 | 判断 | 影响 |
| --- | --- | --- |
| 测试店铺显示暂无数据 | 当前应用或当前解决方案没有可用测试店铺资源 | 无法稳定创建测试商品/测试订单 |
| 来客后台创建测试商品看不到测试数据 | 浏览器页面没有进入单独的测试店铺/测试商品数据域 | 需要用 ModHeader 加 `Rpc-Persist-Life-Test-Data-Access: all` |
| 接口创建商品查不到测试资源 | OpenAPI 请求没有进入单独的测试店铺/测试商品数据域 | 请求 header 需要加 `Rpc-Persist-Life-Test-Data-Access: all` |
| SPI 回调列表没有发券 SPI | `三方码发布` 白名单未开，或当前账号/方案不展示该能力 | 无法产生第 1 步发券 `logid` |
| 商品券码类型只有抖音券 | 当前来客商品不是三方码发码商品 | 支付后不会调用我方发券 SPI |
| `综合预约订单查询` 显示已开通但接入中/已限流 | 能力申请不等于验收完成或实际可用 | 后台无法自动拉抖音订单 |
| 接口限流约 400 次/天 | 这是默认配额，不是根因 | 低频测试够用，但验收完成前能力仍可能不可用 |
| 库存 OpenAPI 返回 IP 不在白名单 | 当前调用出口 IP 未被开放平台放行 | 需要把当前公网出口加入白名单，或改在已加白服务器出口调用 |
| 已支付订单查不到或不能继续验收 | 订单属于另一个应用/商户/测试资源，或能力未放开 | 不能证明代码有问题 |

## 当前代码侧已准备

| 能力 | 本地入口 | 状态 |
| --- | --- | --- |
| client_token | `GET /yy/channel/DOUYIN_LIFE/client-token` | 已实现 |
| 订单查询 | `GET /yy/channel/DOUYIN_LIFE/orders` | 已实现，等平台能力 |
| 订单批量同步 | `POST /yy/channel/DOUYIN_LIFE/orders/sync` | 已实现 |
| 发券 SPI | `POST /api/douyin/life/tripartite-code/create` | 已实现，等平台开白后配置 |
| 预约订单创建 | `POST /api/douyin/life/reservation/order-create` | 已实现回调入口 |
| 支付通知 | `POST /api/douyin/life/reservation/pay-notify` | 已实现回调入口 |
| 三方订单查询 SPI | `POST /api/douyin/life/reservation/order-query` | 已实现回调入口 |
| 库存查询 SPI | `POST /api/douyin/life/reservation/stock-query` | 已实现回调入口 |
| 接单/拒单 | `POST /yy/channel/DOUYIN_LIFE/confirm` | 已实现，等真实 `book_id` |
| 整单核销 | `POST /yy/channel/DOUYIN_LIFE/verify` | 已实现，等真实券码/核销能力 |
| 撤销核销通知 | `POST /api/douyin/life/voucher/revoke`、`/batch-revoke` | 已实现回调入口 |

2026-06-03 21:58 代码侧补强：`reservation_order_create` / `reservation_pay_notify` 下划线命名已兼容，回调会进入本地订单同步；新增回归测试覆盖创单 SPI 落库和 `logid` 记录。

## 到底哪里出问题

### 0.1 SaaS Oncall 最新确认

2026-06-03，抖音生活服务 SaaS 值班人确认：

| 项 | 结论 |
| --- | --- |
| 当前测试账号 | 之前未开通 `商户直连` |
| 平台处理 | SaaS 值班人会帮忙开通，预计次日账号才能开通库存直连 |
| 创单 SPI 触发前置 | 需要先开通商户直连，再通过接口创建门店接待设置、门店接单时间和库存 |
| 商品创建 | 需要勾选 `抖音APP预约`，用户才能在抖音 App 发起预约 |
| 预约链路 | 用户发起预约后，才会走创单 SPI |
| 开通粒度 | 不需要把所有能力一个一个开通 |
| 正式商家 | 后续正式商家也需要开通商户直连 |
| 商户直连后限制 | 开通商户直连后，只能通过接口维护时段库存 |
| 联系方式 | 只能通过开放平台联系 SaaS/值班同学 |

当前判断：在商户直连/库存直连开通前，继续付款不会触发完整预约创单链路。先准备接口、后台状态展示、美团基础接入和次日验收清单。

### 0.2 库存 OpenAPI smoke 最新结果

2026-06-03 18:58，使用测试数据头 `Rpc-Persist-Life-Test-Data-Access: all`、测试 POI `7571364336015247401`、当前测试商品/sku 标识 `1866866896807962` 从本机直连抖音 OpenAPI：

| 接口 | 结果 | logid |
| --- | --- | --- |
| `client_token` | 成功，`err_no=0` | `2026060318581396DD100E639213382C75` |
| 创建/更新库存 SKU | 失败：`2119013 IP不在白名单，请开通权限` | `2026060318581428AE53777646CA721454` |
| 保存实时库存 | 失败：`2119013 IP不在白名单，请开通权限` | `2026060318581454E505F97492DE71C1AB` |
| 库存更新通知 | 失败：`2119013 IP不在白名单，请开通权限` | `20260603185814C7E9CA0B36739379D2D5` |
| 查询时段库存 | 失败：`3000007 IP不在白名单，请开通权限` | `20260603185815B15181F0E3BEB9636FBD` |

判断：请求已经能到抖音，且 token 正常；当前阻塞点是 OpenAPI 调用出口 IP 白名单。直接在本机跑 smoke 会被拦截，除非把本机公网出口加入开放平台白名单。更稳的做法是在已加白服务器上运行 smoke 或通过线上 Spring Boot 后端调用。

2026-06-03 22:27 复测：订单 smoke wrapper 已修复，`client_token` 成功，订单查询仍返回“应用未获得该能力”；库存 smoke 显式传测试 POI `7571364336015247401` 和测试商品 ID `1866866896807962` 后，库存相关接口仍返回“IP不在白名单，请开通权限”。当前平台阻塞判断不变。

2026-06-03 23:07 服务器出口 `103.24.216.8` 复测：IP 白名单已生效，库存接口不再返回“IP不在白名单”。新的返回为：库存 SKU `3000001 无效的库存时间间隔`，实时库存/库存通知 `2138000360 没有推送该POI套餐权限`，时段库存查询 `3000007 无该poi创建套餐权限`。当前阻塞从“IP 白名单”转为“当前测试 POI/套餐权限未对齐 + 库存 SKU 时间间隔参数需按官方文档修正”。

### 0. 2026-06-03 新测试订单

| 项 | 结果 |
| --- | --- |
| 订单 1 | `1095594781140185988`，券号 `1095 8164 3159 234` |
| 订单 2 | `1095600660751065988`，券号 `oDkumtU5e049Y1H` |
| 商品状态 | 两笔均已支付，抖音端显示“待使用” |
| 适用门店 | `测试POI-账号构造0`，属于测试数据域 |
| 商品页面提示 | 两笔均显示 `免预约` |
| 服务器回调日志 | 两笔均未看到触发 `/api/douyin/life/tripartite-code/create`、`/reservation/order-create`、`/pay-notify` |
| 主动订单查询 | `client_token` 成功；用测试商户 `7571363430548899876` 和测试数据头查询订单，仍返回“应用未获得该能力” |
| 判断 | 这两笔订单证明测试购买链路可用，但不能证明发券 SPI、预约创单、接单、核销已跑通 |

关键判断：截图里显示 `免预约`，所以它不会进入“提交预约 -> 第三方接单”链路；券号也不是我方临时 SPI 生成的 `YY...` 格式，且服务器没有收到真实回调，所以这些订单更像平台侧/抖音券链路，不是三方码发券 SPI 链路。

### 1. 测试店铺资源不一致

之前本地记录过测试店铺：

| 项 | 值 |
| --- | --- |
| 店铺 | 酿名苑579 |
| 测试商户 ID | `7571363430548899876` |
| 测试 POI | `7571364336015247401` |

但当前页面如果显示“测试店铺暂无数据”，说明当前应用/当前解决方案/当前账号状态下没有拿到这套测试资源，或者资源属于之前另一个应用/流程。先不要用真实来客订单硬测，要先让平台恢复或重新分配测试店铺。

### 2. 发券 SPI 没出现在配置列表

开放平台测试用例“到综预约品-创单发码流程-非留资”第 1 步需要发券 `logid`。这个 `logid` 只能来自抖音调用我方发券 SPI 时的请求头：

```text
X-Bytedance-Logid
```

但如果 SPI 列表没有：

```text
发券 SPI / 三方码发券 / fulfilment.order.tripartite_code
```

就说明当前不能从平台触发我方发券接口，也就拿不到第 1 步验收 `logid`。

### 3. 抖音券不等于三方码发券

抖音券商品可以正常支付，但通常由抖音平台自己发券，不会请求我方：

```text
https://yingyueyun.evanshine.me/api/douyin/life/tripartite-code/create
```

所以“支付成功”不等于“发券 SPI 已被调用”。如果开放平台验收强制要求发券 SPI，就必须让商品变成三方码/商家发码模式，或让平台确认抖音券商品可跳过该验收步骤。

### 4. 已开通不等于可用

能力列表里的“已开通”只表示申请状态，不代表接口已经解除验收限制。只要仍然是：

```text
接入中 / 已限流 / 应用未获得该能力
```

就可能无法真实调用订单查询、接单、核销等 OpenAPI。

## 现在应该找平台确认的问题

直接问抖音 BD/客服：

```text
我是自研商家，应用类型是“生活服务商家应用”，正在接入“到综团购预约解决方案”。

当前问题：
1. 当前应用在解决方案测试页里“测试店铺暂无数据”，请帮我确认是否已分配测试店铺资源。
2. 开发配置 -> SPI 回调里没有“发券 SPI / 三方码发券 / fulfilment.order.tripartite_code”，请确认是否需要开通“三方码发布”白名单。
3. 测试用例“到综预约品-创单发码流程-非留资”第 1 步要求发券 logid，但当前商品只有“抖音券”，支付后不会调用我方发券 SPI。请确认抖音券是否可以跳过发券 SPI 验收；如果不能，请开通三方码发券商品能力。
4. “综合预约订单查询”显示已开通但仍接入中/已限流，实际调用可能返回“应用未获得该能力”。请确认这个能力如何解除限制。

我方公网回调已经准备：
事件订阅：https://yingyueyun.evanshine.me/api/douyin/life/webhook
发券 SPI：https://yingyueyun.evanshine.me/api/douyin/life/tripartite-code/create
预约创单：https://yingyueyun.evanshine.me/api/douyin/life/reservation/order-create
支付通知：https://yingyueyun.evanshine.me/api/douyin/life/reservation/pay-notify
三方订单查询：https://yingyueyun.evanshine.me/api/douyin/life/reservation/order-query
库存查询：https://yingyueyun.evanshine.me/api/douyin/life/reservation/stock-query
券撤销核销：https://yingyueyun.evanshine.me/api/douyin/life/voucher/revoke
批量撤销核销：https://yingyueyun.evanshine.me/api/douyin/life/voucher/batch-revoke
```

## 暂停事项

- 暂停重复真实付款。
- 暂停重复创建相同商品。
- 暂停把订单号、商品 ID、account_id 当作 `logid` 填验收。
- 暂停在没有测试店铺资源时继续跑完整验收。

## 可以继续做的事

- 本地后台继续展示渠道订单、同步状态、最近错误和 `logid`。
- 美团 V1 继续做授权/订单同步框架。
- 等平台确认后，按 `client_token -> 发券 logid -> 接单 logid -> 核销 logid` 顺序跑验收。

## 测试数据 Header 规则

| 场景 | 操作 |
| --- | --- |
| 通过抖音来客后台创建测试商品 | 浏览器安装/启用 ModHeader，给来客相关请求加 `Rpc-Persist-Life-Test-Data-Access: all` |
| 通过接口创建测试商品 | 请求 header 加 `Rpc-Persist-Life-Test-Data-Access: all` |
| 影约云后台查测试店铺/测试商品订单 | 打开“测试数据头”开关，后端会自动加 `Rpc-Persist-Life-Test-Data-Access: all` |
| PowerShell smoke 脚本 | 使用 `-UseTestDataHeader` 参数 |

注意：这个 header 是测试数据域开关，不是正式商品/正式店铺通用 header。正式联调和上线环境不要开启。

本地视频材料：

```text
C:\Users\Administrator\Desktop\yiyue\测试店铺管理
```

## 关键文档地址

- 自研商家入驻指南：[https://developer.open-douyin.com/docs/resource/zh-CN/local-life/connect/developer/self-developed-merchant-guide](https://developer.open-douyin.com/docs/resource/zh-CN/local-life/connect/developer/self-developed-merchant-guide)
- 生活服务 OpenAPI SDK 总览：[https://developer.open-douyin.com/docs/resource/zh-CN/local-life/develop/sdk-overview](https://developer.open-douyin.com/docs/resource/zh-CN/local-life/develop/sdk-overview)
- 发券 SPI：[https://developer.open-douyin.com/docs/resource/zh-CN/local-life/develop/OpenAPI/general-capabilities/tripartite.code/create](https://developer.open-douyin.com/docs/resource/zh-CN/local-life/develop/OpenAPI/general-capabilities/tripartite.code/create)
- 综合预约确认接拒单：[https://developer.open-douyin.com/docs/resource/zh-CN/local-life/develop/OpenAPI/comprehensive/group-buy-reservation/order-confirmation/appointment-confirmation](https://developer.open-douyin.com/docs/resource/zh-CN/local-life/develop/OpenAPI/comprehensive/group-buy-reservation/order-confirmation/appointment-confirmation)
