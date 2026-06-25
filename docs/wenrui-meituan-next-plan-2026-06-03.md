# WENRUI 抖音对齐与美团 V1 下一步计划

更新日期：2026-06-03

## 结论

WENRUI 文档和当前影约云主线判断一致：抖音代码侧已经覆盖 `client_token`、订单查询、批量同步、发券 SPI、预约接拒单、整单核销、SPI 回调和 `logid` 记录。当前主要阻塞不是代码，而是开放平台能力、测试店铺资源、三方码白名单和接入验收状态。

美团现在按第二渠道推进。V1 不做复杂预约闭环，先完成到店综合/摄影类目的授权状态、订单同步、核销记录查询和后台展示框架；真实联调等美团开放平台账号、商家主体、AppKey/AppSecret、门店授权和官方接口文档齐全后继续。

## WENRUI 对齐计划

| 项 | 处理方式 | 当前判断 |
| --- | --- | --- |
| 业务主线 | 继续使用 `DOUYIN_LIFE`，不切回服务市场 `DOUYIN` | 已确定 |
| WENRUI 文档定位 | 作为验收参考和字段/流程补充，不作为新架构替换 | 已确定 |
| 发券 SPI | 保留 `/api/douyin/life/tripartite-code/create`，等待平台出现 SPI 选项后联调 | 代码已准备，平台缺口 |
| 三方码发布 | 只在开放平台测试强制需要“发券 logid”时申请白名单 | 平台卡点 |
| 抖音券商品 | 继续作为影约云业务默认商品类型 | 可保留 |
| 订单同步 | 继续通过 `GET /goodlife/v1/trade/order/query/` 同步到本地订单 | 等能力解除 |
| 接单/核销 | 继续保留后台入口，拿到真实 `book_id`、券码、能力后验收 | 等平台资源 |

### 不立即新增的模型

当前先复用：

- `yy_order`
- `yy_channel_order_mapping`
- `yy_channel_sync_log`

等真实发券/核销跑通后，再补：

- `yy_channel_certificate`：保存 `certificate_id`、脱敏券码、券状态、核销/退款时间。
- `yy_order_status_log`：保存创单、支付、发券、接单、核销、退款、撤销核销等状态流转。

这样做的原因：现在平台侧还没有真实回调数据，过早建复杂表容易按错误字段设计。

## 抖音下一步执行顺序

1. 先暂停重复真实支付和重复创建商品，避免继续消耗时间和真钱。
2. 在开放平台确认当前应用的测试店铺是否有数据；如果为空，先找平台/BD 分配测试店铺资源。
3. 在 SPI 回调配置里确认是否能添加 `发券 SPI / fulfilment.order.tripartite_code`；如果没有该选项，找 BD 开通 `三方码发布` 白名单。
4. 继续检查 `综合预约订单查询`，它是商家后台/微信端自动同步抖音订单的核心能力。
5. 能力可用后，先跑 `client_token -> 订单查询 -> 订单同步落库`。
6. 拿到真实 `book_id` 后跑预约接单。
7. 拿到真实券码或 `verify_token` 后跑整单核销。
8. 把每一步的 `logid` 填回开放平台验收页。

## 美团 V1 计划

| 阶段 | 目标 | 需要的外部资料 |
| --- | --- | --- |
| M1 授权状态 | 后台展示未授权/已授权/token 过期/同步失败 | 美团开放平台账号、应用信息 |
| M2 门店绑定 | 通过商家账号授权门店，保存 `shop_id` | 美团开店宝/商户账号 |
| M3 token | 接入 OAuth 或平台 token 机制，支持刷新 token | AppKey、AppSecret、授权码 |
| M4 订单同步 | 查询美团订单并 upsert 到 `yy_order`、`yy_channel_order_mapping` | 订单查询接口 path、签名规则、分页字段 |
| M5 核销记录 | 查询核销记录并写同步日志 | 核销记录接口权限 |
| M6 消息推送 | 如美团提供 Webhook，再补实时订单状态变更 | 消息推送文档 |

当前保护策略：未配置 `yy.meituan.base-url` 前，后端直接返回“美团真实 OpenAPI 地址未配置”，不会请求占位 URL，避免把资料未齐误判为真实订单为空。

## 2026-06-03 21:58 执行更新

- 抖音：已修复 `reservation_order_create` / `reservation_pay_notify` 下划线 SPI 名称不触发本地订单同步的问题。
- 抖音：后台 logid 卡片将预约创建标记为“创单 SPI”，和开放平台验收用语对齐。
- 美团：基础 adapter/client 保持 V1 框架状态；未授权和未配置 `yy.meituan.base-url` 仍明确失败并写日志，等待官方资料后替换真实 path/签名。

### 美团商家要准备

- 美团开放平台账号：[https://developer.meituan.com/](https://developer.meituan.com/)
- 行业/应用方向：到店综合，细分优先休闲娱乐/摄影。
- 营业执照主体，最好与美团门店主体一致。
- 美团商户/开店宝账号，用于门店授权。
- AppKey、AppSecret。
- 门店授权后的 `shop_id` 或平台返回的门店账号标识。
- 已申请权限：门店、商品/团购、订单、核销记录；主动核销权限另行确认。

## 本地可继续完成的事

- 后台页面继续保留抖音和美团两个渠道插件。
- 未授权、能力缺失、接口限流都必须显示清楚，不能伪装成同步成功。
- 同步失败继续写 `yy_channel_sync_log`，展示最近错误摘要和平台 `logid`。
- 微信/H5 端只读本地订单，不直接调抖音或美团。
- 文档持续维护到 `docs\yiyue`，避免每次重新查文档和接口。

## 验证命令

后端：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=MeituanOpenApiClientTest,MeituanChannelAdapterTest,DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest,YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

前端：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npx eslint src/views/yy/channel/meituan/index.vue src/views/yy/components/YyChannelWorkbench.vue src/views/yy/utils/douyinLife.ts src/api/yy/channel/index.ts src/api/yy/channel/types.ts
npx vitest run src/views/yy/utils/douyinLife.test.ts
npm run build:dev
```

抖音当前订单烟测：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\run-douyin-life-current-order.ps1
```

当前预期：`client_token` 成功；如果平台能力未解除，订单查询/接单/核销仍可能返回“应用未获得该能力”。
