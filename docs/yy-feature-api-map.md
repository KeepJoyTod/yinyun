# 影约云功能页面与接口映射

更新时间：2026-06-11

## 2026-06-11 架构口径

`C:\Users\Administrator\Downloads\综合架构设计(1).md` 已吸收为现有项目地图，不换技术栈，不新建第二套预约/支付账本。正式口径：

- 后端继续使用 Spring Boot / RuoYi-Vue-Plus / MyBatis-Plus / Sa-Token。
- 管理后台继续使用 `admin-ui` Vue 3 + Element Plus。
- 门店工作台为 `studio-workbench`，客户 PC 端为 `client-web`。
- H5、微信小程序、抖音小程序继续使用 `mobile-uniapp`。
- 订单统一落 `yy_order`，外部订单映射落 `yy_channel_order_mapping`，同步日志落 `yy_channel_sync_log`。
- 详细说明见 `docs/comprehensive-architecture-absorption-20260611.md`。

## 当前本机入口

| 项目 | 地址 / 配置 | 说明 |
| --- | --- | --- |
| 后端 | `http://127.0.0.1:8080` | `ruoyi-admin.jar`，本地 PostgreSQL + Redis |
| 前端 | `http://127.0.0.1:5180/` | `yingyue-cloud-repo/admin-ui`，不要用旧的 `5174/5175` |
| 前端代理 | `/dev-api -> http://localhost:8080` | 由 `admin-ui/vite.config.ts` 配置 |
| 本地前端环境 | `admin-ui/.env.development` | 本地开发关闭接口加密，使用 PC clientId |
| 菜单来源 | `sys_menu` | RuoYi 动态路由，SQL 在 `backend/script/sql/postgres/postgres_yy_cloud.sql` |

## 页面路由映射

| 功能 | 当前路由 | 页面文件 | 主要接口 |
| --- | --- | --- | --- |
| 首页工作台 | `/index` | `admin-ui/src/views/index.vue` | `/yy/meta/priority-features`, `/yy/meta/enterprise-modules` |
| B-002 预约概况 | `/yy/dashboard` | `admin-ui/src/views/yy/dashboard/index.vue` | `/yy/dashboard/overview` |
| B-029 预约订单 | `/yy/order` | `admin-ui/src/views/yy/order/index.vue` | `/yy/order/list`, `/yy/order`, `/yy/order/{id}`, `/yy/order/export` |
| B-008 门店管理 | `/yy/store` | `admin-ui/src/views/yy/store/index.vue` | `/yy/store/list`, `/yy/store`, `/yy/store/{id}`, `/yy/store/export` |
| B-022 在线选片配置 | `/yy/product` | `admin-ui/src/views/yy/product/index.vue` | `/yy/product/list`, `/yy/product`, `/yy/product/{id}`, `/yy/product/export` |
| C-020 底片/选片 | `/yy/photo` | `admin-ui/src/views/yy/photo/index.vue` | `/yy/photoAlbum/*`, `/yy/photoAsset/*` |
| 渠道插件总览 | `/yy/channel` | `admin-ui/src/views/yy/channel/index.vue` | `/yy/channelPlugin/*`, `/yy/channelAccount/*`, `/yy/channelSyncLog/*` |
| B-026 抖音产品 | `/yy/channel-douyin` 或 `/yy/channel/douyin` | `admin-ui/src/views/yy/channel/douyin/index.vue` | `/yy/channel/DOUYIN/*` |
| 抖音来客生活服务 | `/yy/channel-life` 或 `/yy/channel/life` | `admin-ui/src/views/yy/channel/life/index.vue` | `/yy/channel/DOUYIN_LIFE/*` |
| B-027 美团产品 | `/yy/channel-meituan` 或 `/yy/channel/meituan` | `admin-ui/src/views/yy/channel/meituan/index.vue` | `/yy/channel/MEITUAN/*` |
| 微信生态 | `/yy/wechat` | `admin-ui/src/views/yy/wechat/index.vue` | `/yy/wechat/workbench`, `/yy/wechat/notice/test`, `/yy/channel/WECHAT/*`, `/yy/channelAccount/*`, `/yy/channelSyncLog/*` |
| 企业结构 | `/yy/enterprise` | `admin-ui/src/views/yy/enterprise/index.vue` | `/yy/meta/enterprise-modules` |
| 预约配置 | `/yy/booking-config` | `admin-ui/src/views/yy/booking-config/index.vue` | `/yy/serviceGroup/list`, `/yy/serviceGroup`, `/yy/serviceGroup/{id}`, `/yy/serviceGroup/export`, `/yy/scheduleRule/list`, `/yy/scheduleRule`, `/yy/scheduleRule/{id}`, `/yy/scheduleRule/export` |
| 员工管理 | `/yy/employee` | `admin-ui/src/views/yy/employee/index.vue` | `/yy/employee/list`, `/yy/employee`, `/yy/employee/{id}`, `/yy/employee/export` |
| 客户管理 | `/yy/customer` | `admin-ui/src/views/yy/customer/index.vue` | `/yy/customer/list`, `/yy/customer/{id}/orders` |
| 通知中心 | `/yy/notification` | `admin-ui/src/views/yy/notification/index.vue` | `/yy/notificationTemplate/list`, `/yy/notificationTemplate`, `/yy/notificationTemplate/{id}`, `/yy/notificationTemplate/export`, `/yy/notificationLog/list`, `/yy/notificationLog/{id}`, `/yy/notificationLog/export` |
| 经营报表 | `/yy/report` | `admin-ui/src/views/yy/report/index.vue` | `/yy/reportSnapshot/list`, `/yy/reportSnapshot`, `/yy/reportSnapshot/{id}`, `/yy/reportSnapshot/export` |
| 多端预约 | `/yy/mobile` | `admin-ui/src/views/yy/mobile/index.vue` | `/yy/mobileChannelConfig/list`, `/yy/mobileChannelConfig`, `/yy/mobileChannelConfig/{id}`, `/yy/mobileChannelConfig/export` |

> 注意：RuoYi 菜单里仍使用 `/yy/channel-life` 这类短 path；前端已额外补了 `/yy/channel/life`、`/yy/channel/douyin`、`/yy/channel/meituan` 三个直观别名。

## 后端 Controller 映射

| Controller | 根路径 | 作用 |
| --- | --- | --- |
| `YyDashboardController` | `/yy/dashboard` | 预约概况、首页统计 |
| `YyOrderController` | `/yy/order` | 预约订单 CRUD、导出 |
| `YyStoreController` | `/yy/store` | 门店 CRUD、导出 |
| `YyProductController` | `/yy/product` | 服务产品、选片配置 CRUD、导出 |
| `YyPhotoAlbumController` | `/yy/photoAlbum` | 相册/选片单 CRUD、导出 |
| `YyPhotoAssetController` | `/yy/photoAsset` | 底片列表 CRUD、导出 |
| `YyCustomerController` | `/yy/customer` | 客户档案、客户近期订单 |
| `YyChannelController` | `/yy/channel` | 抖音/抖音来客/美团/微信渠道统一适配入口 |
| `YyChannelPluginController` | `/yy/channelPlugin` | 渠道插件开通态和授权态 |
| `YyChannelAccountController` | `/yy/channelAccount` | 渠道账号、密钥、webhook、token 配置 |
| `YyChannelProductMappingController` | `/yy/channelProductMapping` | 自有产品与外部商品映射 |
| `YyChannelOrderMappingController` | `/yy/channelOrderMapping` | 外部订单与本地订单映射 |
| `YyChannelSyncLogController` | `/yy/channelSyncLog` | 渠道接口调用日志 |
| `YyServiceGroupController` | `/yy/serviceGroup` | 预约服务组 CRUD、导出 |
| `YyScheduleRuleController` | `/yy/scheduleRule` | 预约排期规则 CRUD、导出 |
| `YyEmployeeController` | `/yy/employee` | 员工台账、系统用户绑定、导出 |
| `YyNotificationTemplateController` | `/yy/notificationTemplate` | 通知模板 CRUD、导出 |
| `YyNotificationLogController` | `/yy/notificationLog` | 通知发送日志查询、详情、删除、导出 |
| `YyMobileChannelConfigController` | `/yy/mobileChannelConfig` | H5/小程序/App 入口、AppID、回调、SDK 状态配置 |
| `YyReportSnapshotController` | `/yy/reportSnapshot` | 门店日报/渠道/选片经营快照 CRUD、导出 |
| `YyWechatController` | `/yy/wechat` | 微信通知/公众号/小程序/企微预留工作台 |
| `YyMetaController` | `/yy/meta` | 企业版模块和标红优先级元数据 |

## 渠道同步接口

| 场景 | 本地接口 | 目前作用 | 关键入参 |
| --- | --- | --- | --- |
| 生成渠道 token | `GET /yy/channel/{channelType}/client-token` | 使用渠道账号密钥换 token，并记录同步日志 | `storeId`, `accountId`, `useTestDataHeader` |
| 查询外部订单 | `GET /yy/channel/{channelType}/orders` | 查询外部订单状态，能识别则写入本地订单和映射 | `orderId`, `outOrderNo`, `openId`, `orderStatus`, `startTime`, `endTime` |
| 查询订单详情 | `GET /yy/channel/{channelType}/orders/{externalOrderId}` | 查看单笔外部订单详情和本地映射 | `externalOrderId` |
| 服务市场已购状态 | `GET /yy/channel/{channelType}/service-status` | 抖音服务市场场景查询用户是否已购 | `openId`, `serviceId`, `serviceModeId` |
| 服务市场购买明细 | `GET /yy/channel/{channelType}/purchase-list` | 查询服务市场购买列表 | `openId`, `serviceId`, `serviceModeId` |
| webhook 回调 | `POST /yy/channel/{channelType}/webhook` | 接收支付通知、服务市场订单事件等，落日志和映射 | 平台回调 body |
| 接单/拒单确认 | `POST /yy/channel/{channelType}/confirm` | 抖音来客预约确认、接单或拒单 | `bookId`, `confirmResult`, `fulfilmentType`, `rejectReason` |

`channelType` 当前建议值：

| 值 | 含义 | 适用页面 |
| --- | --- | --- |
| `DOUYIN` | 抖音服务市场/抖音产品插件 | `/yy/channel-douyin` |
| `DOUYIN_LIFE` | 抖音来客生活服务团购/预约订单 | `/yy/channel-life` |
| `MEITUAN` | 美团核销/团购插件 | `/yy/channel-meituan` |
| `WECHAT` | 微信生态预留 | `/yy/wechat` |

## 微信生态当前边界

| 能力 | 当前状态 | 本地落点 |
| --- | --- | --- |
| 公众号通知 | 模板与测试发送入口已预留，真实发送等待公众号 AppID、AppSecret、模板 ID | `/yy/wechat/notice/test`, `yy_notification_template`, `yy_notification_log` |
| 小程序预约 | 多端预约配置可维护微信小程序 AppID、回调地址和 SDK 状态 | `/yy/mobile`, `yy_mobile_channel_config` |
| 微信支付回调 | 已有统一 webhook 入口，可落渠道映射和同步日志；真实验签/证书待商户号资料齐全后接入 | `POST /yy/channel/WECHAT/webhook`, `yy_channel_order_mapping`, `yy_channel_sync_log` |
| 微信订单查看 | 从本地渠道映射表反查本地预约订单，不再返回固定 mock | `GET /yy/channel/WECHAT/orders`, `GET /yy/channel/WECHAT/orders/{externalOrderId}` |
| 企业微信客户联系 | 先保留客户手机号、客服手机号、备注字段和配置入口，真实外部联系人同步后置 | `yy_customer`, `yy_order.remark`, `yy_channel_account` |

## 抖音来客需要商家提供的信息

| 信息 | 用途 | 系统落点 |
| --- | --- | --- |
| `client_key` / `client_secret` | 换取 `client_token`，调用抖音生活服务开放接口 | `yy_channel_account.app_key`, `app_secret_enc` |
| `account_id` | 商家账号维度查单和请求头透传 | `yy_channel_account.remark` 或后续专列 |
| 测试店铺 / 测试商品 | 沙盒或验收环境创建测试交易 | `yy_channel_product_mapping` |
| `order_id` / `out_order_no` | 查询用户订单状态 | `yy_channel_order_mapping.external_order_id` |
| webhook 回调域名 | 接支付通知、接单回调、状态变化 | `yy_channel_account.webhook_url` |
| 能力权限 | 订单查询、预约确认、支付通知、webhook/SPI | `yy_channel_plugin.auth_status` |

官方入口：

- 抖音来客自研商家入驻：`https://developer.open-douyin.com/docs/resource/zh-CN/local-life/connect/developer/self-developed-merchant-guide`
- 订单支付通知：`https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/locallife/free-group-sol/order-payment-notice`
- 预约确认接口：`https://developer.open-douyin.com/docs/resource/zh-CN/local-life/develop/OpenAPI/comprehensive/group-buy-reservation/order-confirmation`

## 当前已验证

| 项目 | 结果 |
| --- | --- |
| 后端 jar 启动 | 成功 |
| PostgreSQL `yingyue_cloud` | 77 张 public 表 |
| Redis | `PONG` |
| 前端 `5180` | 标题、API 前缀、clientId、加密开关加载正确 |
| 登录 | `admin/admin123` 登录成功 |
| 首页 | 可进入，P0 卡片可见 |
| 预约订单 | `/yy/order` 可进入，筛选区和表格可见 |
| 客户管理 | `/yy/customer` 可进入，客户样例和订单沉淀字段可见 |
| 抖音来客 | `/yy/channel-life` 和 `/yy/channel/life` 都可进入，查单/确认/webhook 联调区可见 |

## 2026-06-13 客户订单 token 查单接口

| 场景 | 接口 | 说明 |
| --- | --- | --- |
| 客户按手机号验证订单访问 | `POST /client/orders/auth/verify` | 公开只读；必须传 `storeId` 和完整手机号，返回 2 小时短期 `clientOrderToken` 和脱敏订单列表 |
| 客户按 token 查订单列表 | `GET /client/orders` + `X-Client-Order-Token` | 只返回 token 授权的本地订单 |
| 客户按 token 查订单详情 | `GET /client/orders/{orderNo}` + `X-Client-Order-Token` | 详情页使用；URL 不再带 `storeId/phone` |
| 兼容旧查单 | `GET /client/orders/by-phone?storeId=...&phone=...&phoneLast4=...` | 保留给旧入口，后续新入口不再首选 |
| 客户电脑网页订单详情 | `/customer/orders/:orderNo` | 优先用本地 `yy_order_client_token`，无 token 时重新验证手机号 |
| 小程序/H5 查询页 | `mobile-uniapp/src/pages/order/query/index.vue` | 必填门店 ID + 手机号，调用 `auth/verify` 后返回取片链接和订单详情链接 |

返回约束：

- `orderId` 以字符串返回，避免小程序/H5 大整数精度丢失。
- 不返回客户姓名、完整手机号、secret、完整 openid、raw private payload。
- 客户查单只读本地 `yy_order`，不会实时请求抖音；抖音订单由订单类 Webhook/SPI 入站和 OpenAPI 补偿同步写入本地库。
- 订单 token 是 HMAC 签名的短期 bearer token，只签门店和订单 ID 列表，不把手机号放进 URL。

## 2026-06-13 渠道事件收件箱接口落点

| 能力 | 本地落点 | 说明 |
| --- | --- | --- |
| DOUYIN_LIFE 订单类 Webhook/SPI 入站 | `DouyinLifeChannelAdapter.handleLifeSpi(...)` | `order-create/pay-notify` 先写 `yy_channel_event_inbox`，再按事件落 `yy_order` |
| 入站幂等 | `YyChannelEventInboxServiceImpl` | 只有 `PROCESSED` 视为重复；`RECEIVED/FAILED` 可重试 |
| 表结构 | `backend/script/sql/postgres/postgres_yy_channel_event_inbox_migration_20260612.sql` 和 `postgres_yy_cloud.sql` | 老库跑迁移，新库全量脚本已包含 |
