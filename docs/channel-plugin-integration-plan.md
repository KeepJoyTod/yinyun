# 抖音/美团渠道插件实施计划

更新日期：2026-06-01

## 结论

渠道插件要按企业 SaaS 能力做，不做成写死按钮。B-026 抖音现在分两条线：第一条是“服务市场平台应用”，用于商家购买影约云 SaaS 服务；第二条是“生活服务团购订单”，用于客户在抖音团购/店铺下单照相套餐。两条线不能混用 token、订单号和 webhook。

## 新增证据

| 渠道 | 证据 | 确认能力 |
| --- | --- | --- |
| 抖音服务市场 | 用户确认结论 | 平台应用类服务：`client_key/client_secret` 换 `client_access_token`，`service_id/service_mode_id/open_id` 查询购买状态和购买明细。 |
| 抖音服务市场 | 用户确认结论 | `service_market_order` webhook 处理事件：1 支付、2 接单、3 确认实施、4 用户确认、5 取消。 |
| 抖音生活服务团购 | 用户截图与官方文档 | 客户在抖音团购商品下单，商家应用通过订单支付通知和订单查询接口拿交易状态。前置通常是抖音来客商家主体、营业执照/主体认证、测试店铺和测试商品。联调见 `docs/douyin-local-life-order-runbook.md`。 |
| 抖音普通电商 | 备选分支 | 如果后续确认是普通抖音电商店铺订单，再切到电商开放平台订单接口，不与服务市场主线混用。 |
| 美团 | 当前暂无接口截图 | 先按插件抽象预留，后续拿到美团核销工具文档后补 adapter。 |

## P0 范围

| 编号 | 功能 | 企业版第一版要求 |
| --- | --- | --- |
| B-026 | 抖音产品 | 未授权时显示服务市场平台应用未开通；授权后支持购买状态查询、购买明细查询、订单事件 webhook 和本地预约订单映射。 |
| B-027 | 美团产品 | 未授权时显示未开通；先完成插件配置、商品映射、核销订单占位，等接口文档后接真实 API。 |
| B-029 | 预约订单列表 | 外部订单同步后能按来源筛选 `DOUYIN` / `MEITUAN`，能查看外部订单号和同步状态。 |

## 企业版数据模型建议

| 表 | 用途 | 关键字段 |
| --- | --- | --- |
| `yy_channel_plugin` | 渠道插件定义 | `channel_type`、`name`、`enabled`、`description` |
| `yy_channel_account` | 租户/门店授权与服务市场配置 | V0 先存 `app_key/client_key`、`app_secret_enc/client_secret`、`service_id`、`service_mode_id`、`service_market_app_id`、`service_market_path`、`test_open_id`、`webhook_url`、Token、授权状态、过期时间；后续多服务模式再拆 `yy_channel_service_config` |
| `yy_channel_product_mapping` | 外部商品映射 | `product_id`、`channel_type`、`external_product_id`、`external_sku_id`、`external_name` |
| `yy_channel_order_mapping` | 外部订单映射 | `order_id`、`channel_type`、`external_order_id`、`external_status`、`sync_status`、`raw_payload` |
| `yy_channel_sync_log` | 同步与接口日志 | `channel_type`、`api_name`、`request_id`、`success`、`error_message`、`duration_ms` |

## 抖音生活服务团购订单

生活服务团购订单对应客户在抖音搜索/团购页购买照相套餐。测试环境不是单纯切 `open-sandbox`，而是走生活服务测试店铺、测试人员、测试商品和商家应用授权。
如果没有抖音来客商家主体和主体资质，当前只能先做接口联调准备，不能把这条链路当成普通小程序沙盒来跑。

| 能力 | 接口/机制 | 本地动作 |
| --- | --- | --- |
| 用户下单 | 抖音测试店铺/测试商品 | 测试用户在抖音端完成购买，产生 `order_id/out_order_no`。 |
| 支付通知 | 订单支付通知 SPI | 影约云接收支付通知，记录原始 payload。 |
| 商家查单 | `GET /goodlife/v1/trade/order/query/` | 带 `access-token` 和 `Rpc-Transit-Life-Account` 查询订单状态。 |
| 本地转单 | `yy_channel_order_mapping` | 将抖音订单映射到本地预约/核销订单。 |

已新增本地 smoke 脚本：

```powershell
.\tools\douyin-life-order-smoke.ps1
```

详细步骤见：`docs/douyin-local-life-order-runbook.md`。

## 抖音 Adapter 当前实现

已完成真实接口入口，不再只是 mock：

| 本地接口 | 作用 |
| --- | --- |
| `GET /yy/channel/DOUYIN/client-token` | 使用 `client_key/client_secret` 调用 `POST ${DOUYIN_BASE_URL}/oauth/client_token/`，沙盒为 `https://open-sandbox.douyin.com` |
| `GET /yy/channel/DOUYIN/service-status` | 使用 `client_access_token + open_id + service_id + service_mode_id` 查询是否已购 |
| `GET /yy/channel/DOUYIN/purchase-list` | 查询服务市场购买明细 |
| `POST /yy/channel/DOUYIN/webhook` | 解析 `service_market_order` 事件 1/2/3/4/5 |

配置来源优先级：

1. 请求参数：`openId`、`serviceId`、`serviceModeId`
2. 环境变量：`DOUYIN_CLIENT_KEY`、`DOUYIN_CLIENT_SECRET`、`DOUYIN_SERVICE_ID`、`DOUYIN_SERVICE_MODE_ID`、`DOUYIN_TEST_OPEN_ID`
3. 后台授权账号表：`yy_channel_account.app_key/app_secret_enc/service_id/service_mode_id/test_open_id`
4. 网关域名：`DOUYIN_BASE_URL` 或 `yy.douyin.base-url`，沙盒用 `https://open-sandbox.douyin.com`，正式用 `https://open.douyin.com`

后台页面：`影约云 -> 抖音产品 -> 抖音沙盒接口联调`，可直接点“生成 client_token / 查询已购状态 / 查询购买明细 / 模拟 webhook”。

沙盒应用联调要点：

| 配置 | 沙盒值 |
| --- | --- |
| 网关域名 | `https://open-sandbox.douyin.com` |
| 本地环境变量 | `DOUYIN_BASE_URL=https://open-sandbox.douyin.com` |
| 正式环境切换 | 正式应用上线后改为 `https://open.douyin.com` |
| 服务端域名白名单 | 本地/服务器回调域名要加到开放平台白名单，正式联调建议用 HTTPS 域名 |
| webview 域名白名单 | H5 预约页或购买跳转页所在域名要加入白名单 |

沙盒 `Secret` 只能放本地环境变量或后台授权账号，不要提交到 GitHub、截图文档或普通日志。

## 抖音 Adapter 第一版能力

| 能力 | 抖音接口 | 本地动作 |
| --- | --- | --- |
| 平台 token | 生成 `client_token` | 使用 `client_key/client_secret` 换取 `client_access_token`，加密存储，不进前端。 |
| 测试用户 | OAuth code 换 `open_id` | 测试环境先把用户加入白名单，否则查询可能为空。 |
| 是否已购 | `GET /aweme/v2/creator/service_market/user/service/status` | 根据 `service_id/service_mode_id/open_id` 判断用户是否已购买服务。 |
| 购买明细 | `GET /market/service/user/purchase/list/` | 查询购买记录、有效期、服务模式，写入渠道订单池和同步日志。 |
| 状态流转 | `service_market_order` webhook | 事件 1/2/3/4/5 分别对应支付、接单、确认实施、用户确认、取消。 |
| 购买跳转 | `service_market_app_id/service_market_path` | 用户未购买时，H5/小程序端引导去服务市场购买页。 |

## 同步策略

- 第一阶段：只读同步购买状态和购买明细，不自动改本地业务状态。
- 第二阶段：webhook 收到支付/接单/确认实施等事件后写入状态流水，人工确认转本地预约单。
- 第三阶段：按规则自动转单，例如购买有效、手机号已留、服务模式已匹配时自动生成预约。
- 所有外部接口必须记录请求结果和错误，便于企业客服排查。
- `access_token`、`refresh_token` 只能加密存储，不在日志和前端明文展示。
- 沙盒 APP 默认可能有 scope，但公开 mock 事件不一定覆盖 `service_market_order`，测试不能只依赖沙盒事件伪造。

## 页面落点

| 页面 | 需要展示 |
| --- | --- |
| 渠道插件 | 抖音/美团开通状态、授权按钮、最后同步时间、错误摘要。 |
| 抖音订单 | 购买记录、open_id、服务模式、有效期、状态事件、本地预约映射。 |
| 预约订单 | 来源筛选、外部订单号、本地订单号、同步来源。 |
| 商品管理 | 抖音/美团产品类型、外部商品编码、映射状态。 |

## 验收标准

| 编号 | 验收点 |
| --- | --- |
| CH-001 | 未配置授权时，渠道插件页明确显示未开通，不能误导成已接入。 |
| CH-002 | 配置抖音服务市场参数后，可以查询是否已购并写入同步日志。 |
| CH-003 | 查询购买明细时，通过 `/market/service/user/purchase/list/` 展示购买记录和服务模式。 |
| CH-004 | webhook 事件可写入渠道订单状态，并能人工映射到本地预约订单。 |
| CH-005 | 外部接口失败时有错误提示、错误日志和重试入口。 |
| CH-006 | token 不出现在前端页面、导出文件、普通日志中。 |

## 下一步 Goal

```text
基于当前已实现的抖音服务市场接口入口，拿沙盒 client_key/client_secret、service_id/service_mode_id、测试 open_id 后做一次真实联调：生成 client_token、查询已购状态、查询购买明细；确认返回字段后再把购买明细写入 yy_channel_order_mapping 和 yy_channel_sync_log。
```
