# 抖音生活服务当前联调状态

更新日期：2026-06-11

## 结论

已经找到并验证生活服务商家应用凭证组合：本地 `backend/.env.local` 已保存 `DOUYIN_LIFE_*` 环境变量，并确认被 Git 忽略。

当前代码侧已经补齐第一版闭环：订单查询/同步、发券 SPI、预约接拒单、整单核销、SPI 回调和 `logid` 记录都已有正式 Spring Boot 入口。当前真实联调卡点不是凭证问题，而是开放平台侧尚未给测试账号开通 `商户直连/库存直连`，商品也必须勾选 `抖音APP预约` 后，用户在 App 发起预约才会走创单 SPI。

当前统一架构：

| 模块 | 结论 |
| --- | --- |
| 正式后端 API 域名 | `https://api.evanshine.me` |
| 历史兼容入口 | `https://yingyueyun.evanshine.me`，仅保留旧配置和排障用途 |
| 抖音生活服务 | `DOUYIN_LIFE`，负责 SPI、订单、预约、发码、退款、库存、核销 |
| 客户取片端 | `mobile-uniapp`，H5 / 微信小程序 / 抖音小程序共用，只调 `/client/photo/*` |
| 微信云 / 抖音云 | 可选 BFF，只做平台登录、手机号授权、openid/unionid 或平台用户 ID 绑定、轻量代理 |

主订单、主相册、客户主数据、OSS 权限仍在 Spring Boot，不迁入微信云或抖音云。

## 2026-06-11 综合架构吸收结论

`C:\Users\Administrator\Downloads\综合架构设计(1).md` 已作为架构复盘材料吸收，不作为换栈或重建数据库依据。

| 综合设计概念 | 当前正式落点 | 结论 |
| --- | --- | --- |
| `appointments` | `yy_order` | `yy_order` 继续作为唯一预约/订单账本 |
| `platform_appointment_id` | `yy_channel_order_mapping.external_order_id` | 外部订单按 `tenant_id + channel_type + external_order_id` 幂等映射 |
| `payment_orders` | `yy_order` 支付摘要 + `yy_payment_record` 自建支付流水 | `DOUYIN_LIFE` P0 不自己收款；小程序 `tt.pay` / 微信支付 P1 使用独立支付流水 |
| `sync_tasks` / `sync_task_errors` | `yy_channel_sync_log` | 记录 logid、请求摘要、同步状态和失败原因 |
| 平台适配器 | `YyChannelAdapterService` + 各渠道 adapter | 保持当前 Spring Boot adapter 模型 |
| 小程序统一端 | `mobile-uniapp` | 微信/抖音/H5 共用，不迁移 Taro |

详细文档：

```text
docs/comprehensive-architecture-absorption-20260611.md
```

## 2026-06-11 订单支付数据库结构

当前结论：

| 场景 | 能不能真实订单/支付 | 数据库落点 |
| --- | --- | --- |
| `DOUYIN_LIFE` 抖音来客真实商品 | 能。用户在抖音来客商品页真实下单并支付，抖音负责收款。 | `yy_order` 保存本地订单和支付摘要；`yy_channel_order_mapping` 保存抖音订单幂等映射；`yy_channel_sync_log` 保存回调/OpenAPI logid。 |
| `DOUYIN_LIFE` 支付通知/查单 | 能。支付成功后可由 SPI/Webhook 推送，也可用订单查询 OpenAPI 补偿。 | 本地按抖音外部订单号 upsert，不重复创建订单。 |
| `DOUYIN_MINI_APP` 小程序内支付 | 能，但需开通小程序担保支付后再接 `tt.pay`。 | `yy_payment_record` 保存预下单号、平台支付单、交易流水、支付回调和状态。 |

已新增：

```text
backend/script/sql/postgres/postgres_yy_order_payment_migration_20260611.sql
```

结构边界：

- `yy_order` 是唯一主账本，不新增 `appointments` 双账本。
- `yy_payment_record` 不是 `DOUYIN_LIFE` 必需表；它服务后续小程序/微信自建支付。
- 真实导出仍走 `POST /yy/order/export`，导出前先同步抖音订单。

## 已确认信息

| 项 | 状态 |
| --- | --- |
| 生活服务商家应用 AppID/client_key | 已找到并保存到本地 `.env.local` |
| client_secret | 已从本地密钥文件读取并保存到本地 `.env.local` |
| account_id | 已保存 |
| 门店 ID | 已保存 |
| 当前测试订单号 | 已保存 |
| client_token | 生成成功 |
| 订单查询 | 代码已实现；通过香港2加白出口已成功查询并同步指定订单 |
| 发券 SPI | 代码已实现；等待三方码发布白名单/平台回调真实验收 |
| 预约接拒单 | 代码已实现；需要真实 `book_id` 和能力 |
| 整单核销 | 代码已实现；需要核销能力、`poi_id`、券码或 `verify_token` |

## SaaS Oncall 最新判断

| 项 | 结论 |
| --- | --- |
| 当前测试账号 | 之前未开通 `商户直连` |
| 平台处理 | SaaS 值班人会帮忙开通，预计次日账号才能开通库存直连 |
| 创单 SPI 前置 | 需要通过接口创建门店接待设置、门店接单时间和库存 |
| 商品创建 | 需要勾选 `抖音APP预约` |
| 预约入口 | 用户在抖音 App 发起预约后，才会走创单 SPI |
| 正式商家 | 正式商家也需要开通商户直连 |
| 商户直连后 | 只能通过接口维护时段库存 |

当前不要再重复付款。明天商户直连/库存直连开通后，先创建接待设置和库存，再新建或编辑测试商品，确认 App 端出现在线预约入口后再下单。

## 已实现入口

| 能力 | 本地/公网入口 | 说明 |
| --- | --- | --- |
| 订单查询 | `GET /yy/channel/DOUYIN_LIFE/orders` | 调 `GET /goodlife/v1/trade/order/query/`，成功后同步本地订单；手机号和门店齐全时自动创建取片相册占位 |
| 批量同步 | `POST /yy/channel/DOUYIN_LIFE/orders/sync` | 默认同步最近 24 小时，不要求手工输入订单号；可自动创建取片相册占位 |
| 发券 SPI | `POST /api/douyin/life/tripartite-code/create` | 返回抖音裸 JSON，记录请求头 `X-Bytedance-Logid` |
| 预约接拒单 | `POST /yy/channel/DOUYIN_LIFE/confirm` | 调 `POST /goodlife/v1/comprehensive/trade/order/confirm/` |
| 整单核销 | `POST /yy/channel/DOUYIN_LIFE/verify` | 调 `POST /goodlife/v1/fulfilment/certificate/verify/` |
| 验收 logid 聚合 | `GET /yy/channel/DOUYIN_LIFE/acceptance-cases` | 按开放平台验收用例展示最近 `yy_channel_sync_log.request_id` |
| 事件订阅 | `POST /api/douyin/life/webhook` | 支持 `CHALLENGE` JSON 校验，返回 `{"challenge": 原值}` |
| 业务 SPI | `/api/douyin/life/reservation/*`、`/api/douyin/life/voucher/*` | 记录回调 `logid`，订单创建/支付通知会尝试同步本地订单并创建取片相册占位 |
| SPI 验签 | `x-life-sign` | 已按官方规则校验；生产可强制缺签失败 |

2026-06-07 更新：开放平台 Webhooks 当前填 `https://api.evanshine.me/api/douyin/life/webhook`。`api.evanshine.me` 是后端 API 域名，不是小程序域名；后续 H5、微信小程序、抖音小程序也统一调用该 API 域名。`yingyueyun.evanshine.me` 保留为历史兼容入口，不作为新配置首选。

2026-06-10 更新：抖音小程序 Webhook AppSecret 已启用，URL 已配置为 `https://api.evanshine.me/api/douyin/life/webhook`；不在仓库或桌面地图记录 AppSecret 明文。公网 challenge 探针返回 `200 application/json`，body 为 `{"challenge": 原值}`。当前取片小程序不依赖订阅事件，订阅开关可全部保持关闭；若开放平台流程要求留授权日志，最多先开启 `contract_authorize` 和 `contract_unauthorize`，其他 IM、订阅消息、push 失败、书架同步事件暂不需要。

当前推荐 SPI / Webhook 公网地址：

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

小程序配置：

| 项 | 值 |
| --- | --- |
| 抖音小程序 AppID | `tta3c8d5753dac3aae01` |
| 微信小程序 AppID | `wx2a1a34748f56a6c6` |
| 抖音小程序导入目录 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |
| 微信小程序导入目录 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| 小程序合法域名 | request / uploadFile / downloadFile 均配置 `https://api.evanshine.me` |

2026-06-07 更新：已新增 `tools/yingyue-platform-readiness.ps1`，用于发布前统一检查 API HTTPS、Webhook challenge JSON、缺签名 SPI 拒绝、小程序构建产物、微信/抖音小程序 AppID 和 GitHub 私有状态。微信小程序 AppID 已写入 `mobile-uniapp/src/manifest.json`。
| 图片访问 | OSS 私有，客户端走短期签名 URL 或 `/client/photo/assets/{assetId}/stream` |

2026-06-10 更新：客户取片端已完成第一轮 UI 抛光。正式源码仍是 `mobile-uniapp`，借鉴朋友 Taro 小程序的底片状态节奏，但没有迁移 Taro/React 代码；登录、相册、详情、预览页已改为更明确的影楼交付语境。微信/抖音小程序图片展示已改为 `downloadFile + X-Client-Token + /client/photo/assets/{assetId}/stream`，不再直接把 OSS 签名 URL 塞给 `<image>`，因此小程序合法域名只需要覆盖 `https://api.evanshine.me`。`build:h5`、`build:mp-weixin`、`build:mp-toutiao` 已验证通过，保存图片仍需微信/抖音真机确认。

2026-06-10 更新：真实下单和订单导出规划已沉淀。P0 先让用户通过抖音搜索/进入小程序后跳转抖音来客真实商品或预约商品页完成支付，订单归属 `DOUYIN_LIFE`，继续走生活服务支付通知、订单查询、订单同步和取片相册占位。P1 再做抖音小程序内自建套餐支付，渠道归属 `DOUYIN_MINI_APP`，规划接口为 `POST /client/douyin-miniapp/pay/preorder`、`POST /api/douyin/miniapp/pay/notify` 和本地订单状态查询。全渠道导出统一复用 `POST /yy/order/export`，导出本地 `yy_order` 中已同步的 `DOUYIN_LIFE`、`DOUYIN_MINI_APP`、微信/H5/门店本地订单；导出前需要先同步抖音来客订单。

2026-06-10 更新：统一订单导出 P0 已补齐状态口径。后台订单列表新增“外部状态”“同步状态”筛选；后端 `YyOrderBo`、`YyOrderServiceImpl.queryList(...)` 已支持按最新 `yy_channel_order_mapping.external_status/sync_status` 过滤；`YyOrderVo` Excel 导出已包含“渠道外部状态”“渠道同步状态”两列。`DOUYIN_MINI_APP` 已加入订单来源选项，但小程序内 `tt.pay` 预下单/支付回调仍属 P1。

2026-06-10 更新：抖音来客真实下单入口配置 P0 已落地。`yy_channel_product_mapping` 新增 `external_poi_id`、`landing_url`、`landing_path`，用于保存来客商品 ID、SKU、POI、商品页 URL 或抖音路径；后台“抖音来客”页已新增“真实下单入口配置”卡片，支持新增/编辑/复制入口。该入口只服务 `DOUYIN_LIFE` 来客商品页/预约商品页跳转支付，不承接 `tt.pay`；小程序内支付仍归属 `DOUYIN_MINI_APP` P1。

2026-06-10 更新：客户端读取真实下单入口 P0 已接上。后端新增公开只读接口 `GET /client/douyin-life/order-entries?storeId=...`，只返回 `DOUYIN_LIFE`、已启用、且有 `landingUrl/landingPath` 的入口，并把 19 位 ID 字符串化。`mobile-uniapp` 新增 `pages/douyin/order/index`，登录页“预约下单”可进入；H5 可直接打开 `landingUrl`，微信/抖音小程序当前先复制入口链接或路径，后续再按平台能力接原生跳转。

2026-06-11 更新：后台“抖音来客”页已补运营引导，把“P0 来客商品页支付”“先同步后导出”“P1 小程序 tt.pay”分成三段。页面可直接复制首个真实下单入口、同步近 24 小时订单，并跳转 `/yy/order?source=DOUYIN_LIFE&intent=export`；订单页会自动筛选抖音来客订单并提示先确认同步状态再导出。该改动只优化后台操作路径，不新增后端接口，不改变 `DOUYIN_LIFE` / `DOUYIN_MINI_APP` 边界。

当前继续推进顺序：

1. 抖音/微信小程序后台补齐合法域名：request、uploadFile、downloadFile 都填 `https://api.evanshine.me`。
2. 在后台“抖音来客 -> 真实下单入口配置”维护真实 `externalProductId`、`externalSkuId`、`externalPoiId`、`landingUrl/landingPath`。
3. 抖音开发者工具导入 `mobile-uniapp\dist\build\mp-toutiao`，微信开发者工具导入 `mobile-uniapp\dist\build\mp-weixin`。
4. 先验证“预约下单”页能读取入口，再用 `13900001111 / PREVIEW-20260608` 验收手机号 + 取片码、相册、预览、保存图片。
5. 用 `DOUYIN_LIFE` 来客商品页真实支付复测订单同步、相册占位和统一导出。
6. DNS/TLS 准备好后再切 `studio.evanshine.me` 门店工作台和 `admin.evanshine.me` 系统后台。
7. 平台真机取片稳定后，再接抖音/微信手机号授权和抖音小程序内支付 POC。

2026-06-03 21:58 更新：已修复 `reservation_order_create` / `reservation_pay_notify` 下划线命名未触发订单落库的问题；真实创单或支付回调进入 Spring Boot 后，会同步 `yy_order` 和 `yy_channel_order_mapping`，并保留 `X-Bytedance-Logid`。

2026-06-07 19:23 更新：订单到取片链路已接上。`DOUYIN_LIFE` 订单查询、批量同步、订单绑定、预约创单 SPI、预约支付通知 SPI 落本地订单后，如果手机号和门店齐全，会幂等创建 `yy_photo_album` 占位：`channel_type=DOUYIN_LIFE`、`status=ACTIVE`、`selection_status=WAITING`、`access_code=PICK-********`、默认 30 天过期。后台上传照片后，客户可通过手机号 + 取片码进入相册。

2026-06-07 20:40 更新：已新增 `tools/yingyue-douyin-album-audit.ps1` 并远程只读审计生产库。近 48 小时已有 `reservation_stock_query`、`life_order_query`、`life_event_webhook` 日志；首次审计时 `DOUYIN_LIFE` 自动相册占位总数为 `0`。

2026-06-07 21:50 更新：通过香港2加白出口远程 OpenAPI 查单成功，logid `20260607211535C87A5FBA80DF285ABD5A`。随后用指定订单同步生产，结果 `SyncStatus=SYNCED`、`Total=1`、`Created=1`、`Failed=0`，同步 logid `202606072150269EF6B8106858BB7611D2`。生产审计确认已有 1 个 `DOUYIN_LIFE` 取片相册占位，手机号记录存在但未打印明文。

2026-06-07 22:27 更新：已新增 `tools/yingyue-douyin-photo-pickup-remote-smoke.ps1`，并用真实抖音订单跑通客户取片入口：OpenAPI 查单 logid `20260607222728124502DF358CD51BDB71`，客户手机号脱敏为 `182****5429`，`/client/photo/auth/verify` 返回 `200`，相册列表返回 `1`，相册详情返回 `200`。当前该真实相册 `asset_count=0`，所以预览/下载按预期跳过；下一步是后台上传客片后复测图片签名 URL 和 `/stream`。

## 本地复测命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\run-douyin-life-current-order.ps1
```

如果开放平台要求测试数据头：

```powershell
.\tools\run-douyin-life-current-order.ps1 -UseTestDataHeader
```

库存接口复测：

```powershell
.\tools\run-douyin-life-inventory-smoke.ps1 -UseTestDataHeader -PoiId 7571364336015247401 -SkuId 1866866896807962
```

公网 SPI 默认安全探针：

```powershell
.\tools\run-douyin-life-spi-public-smoke.ps1
```

默认只测试 Webhook challenge；需要用 smoke payload 探业务 SPI 时显式加 `-IncludeBusinessSpi`。

当前 `.env.local` 只有 `DOUYIN_LIFE_STORE_ID` 时，库存脚本会用它兜底 POI；但 `DOUYIN_LIFE_SKU_ID` 或 `DOUYIN_LIFE_SKU_OUT_ID` 必须显式配置或通过参数传入。

## 下一步要在开放平台处理

打开抖音开放平台生活服务商家应用页面：

```text
https://developer.open-douyin.com/lifeapp/当前应用AppID/official/solutions
```

重点申请或确认这些能力：

| 能力 | 用途 |
| --- | --- |
| 商户直连 / 库存直连 | 通过接口维护门店接待设置、接单时间和库存；触发在线预约链路的前置条件 |
| 生活服务订单查询 | 用 `order_id` 查询订单状态 |
| 三方码发布 / 发券 SPI | 支付后让抖音请求影约云发券，获取第 1 步验收 `logid` |
| 到综预约品确认接拒单 | 第三方接单/拒单，获取验收需要的 `logid` |
| 团购/券码核销相关能力 | 后续整单核销 OpenAPI 验收 |
| 订单支付通知/SPI | 支付成功后把订单推送到影约云 webhook |

## 明天开通后的验收顺序

1. 确认测试账号已开通 `商户直连/库存直连`。
2. 通过接口创建门店接待设置、门店接单时间和库存。
3. 创建或编辑测试商品，勾选 `抖音APP预约`，保留 `无需留资 + 券码`。
4. 用测试用户在抖音 App 下单并发起预约。
5. 观察服务器是否收到 `/api/douyin/life/reservation/order-create` 或对应创单 SPI。
6. 拿到真实 `book_id` 后调用接单 OpenAPI。
7. 使用真实券码或 `verify_token` 调整单核销 OpenAPI。
8. 将每一步响应或回调里的 `logid` 填回开放平台验收页。

## 注意

- 已支付订单不等于接口能力已开通；开放平台仍可能拦截订单查询、接单或核销接口。
- 不要再重复真实付款。先确认三方码发布、订单查询、接拒单和核销能力，再用已有低价订单或新的测试订单跑。
- `.env.local`、`secret.txt` 都被 `.gitignore` 忽略，不应提交到 Git。

## 2026-06-11 支付与库存边界

- `DOUYIN_LIFE` 真实支付发生在抖音来客，影约云通过 SPI/Webhook/OpenAPI 同步到本地 `yy_order`。
- 微信/H5/抖音小程序自建支付发生在影约云本地支付线，后续接 `yy_payment_record`。
- 新增 `yy_booking_slot_inventory` 作为本地全渠道时段库存账本，原子扣减防止本地确认量超卖。
- `yy_channel_inventory_slot` 保留为抖音平台库存镜像和联调记录，不再作为本地全渠道库存锁。
- `/api/douyin/life/reservation/stock-query` 已优先读取 `yy_booking_slot_inventory` 返回剩余容量，查不到本地账本时再兼容 `yy_channel_inventory_slot`。
- 支付成功后扣库存；扣减失败时标记 `STOCK_CONFLICT / CONFLICT`，默认人工改期，不自动退款。
- 后台已新增 `影约云 / 库存账本` 页面和 `/yy/bookingSlotInventory/*` API，可按门店/日期查看容量、已确认、冲突数、占用率，并调整容量或跳转冲突订单。
- 后台订单编辑已接入人工改期闭环：运营修改服务组/外部 SKU/预约日期/开始结束时间后，系统会保留原支付摘要，释放旧确认时段并扣新时段；冲突订单因未占旧库存，只重新尝试新时段扣减。

## 2026-06-12 自动同步与员工工作台

已补自动同步闭环：

| 项 | 状态 |
| --- | --- |
| 自动同步任务 | 已实现，默认开启，5 分钟一次 |
| 同步窗口 | 最近 30 分钟 + 10 分钟重叠 |
| 幂等 | 复用 `yy_channel_order_mapping`，重复订单更新不重复插入 |
| 同步摘要 | 写 `yy_channel_sync_log.api_name=life_order_auto_sync` |
| 首页状态 | 员工首页 `渠道联调状态` 已读取 `/yy/channel/DOUYIN_LIFE/auto-sync/status` |
| 201 状态 | 已映射为已支付待处理订单，避免真实订单跳过 |

员工现在可以在后台首页看到最近一次 DOUYIN_LIFE 自动同步是否正常、同步统计和最近 `logid`。订单页和抖音来客联调页的手动同步按钮继续保留，用于补偿同步和排障。

## 2026-06-12 订单噪声防护补充

生产库确认出现 1003 条 `DOUYIN_LIFE` 本地订单，其中 999 条来自 `2026-06-12 16:04:04` 的一次自动同步，日志为：

```text
status=SYNCED, total=1000, created=999, updated=1, failed=0
startTime=2026-06-12 15:22:11
endTime=2026-06-12 16:02:11
logid=2026061216035854DBA017A3F4D55D8B31
```

这些订单不是同一个订单重复插入；`distinct_external=1003`。其中 176 条缺手机号，只保留为渠道对账订单，不自动创建取片相册。

已补防护：

| 项 | 当前策略 |
| --- | --- |
| 自动同步安全上限 | `maxPages=2`、`maxTotal=80` |
| 达到上限后的状态 | `SUSPICIOUS`，停止继续翻页 |
| 员工工作台默认取数 | 今日到店 + `pageSize=100` |
| 缺资料订单 | 进入“异常缺资料”，不计入今日待处理/今日待确认 |
| 证据文档 | `docs/evidence/douyin-life-order-noise-guard-20260612.md` |

不删除已入库订单。管理员后台保留全量对账，店员工作台只展示日常履约工作单。

2026-06-17 追加根因修复：订单查询 OpenAPI 的时间过滤字段应使用 `create_order_start_time/create_order_end_time`，值为秒级时间戳；旧 `start_time/end_time` 会被当前生活服务查单接口忽略，导致短窗口和未来窗口仍返回历史满页订单，反复触发 `maxTotal=80`。已修复 `DouyinLifeChannelAdapter.syncOrders(...)`、`tools/douyin-life-order-smoke.ps1` 和 `tools/yingyue-douyin-openapi-remote-order-query.ps1`。香港2只读 smoke 用 `2030-01-01 00:00:00 -> 00:10:00` 验证返回 `order_count_detected=0`，说明新字段生效。

2026-06-17 追加排期诊断：生产 1003 条历史 `DOUYIN_LIFE` 订单的 raw payload 全部可解析，且 POI/SKU 都存在，但完整预约时段候选为 0，`buyer_reserve_info` 均为空数组。因此历史抖音订单只能作为订单/对账数据，不能伪造写入 `yy_booking_slot_inventory`。新订单已补 `reserve_start_timestamp/reserve_end_timestamp`、`booking_*_timestamp`、`reservation_*_timestamp` 等预约时间戳字段解析；只要后续 SPI/Webhook/OpenAPI payload 带真实时段，就会写入 `yy_order.slot_*` 并尝试确认统一库存。证据见 `docs/evidence/douyin-life-order-timefix-and-slot-diagnosis-20260617.md`。

## 2026-06-13 Webhook 优先、事件收件箱与客户查单边界

当前订单同步口径收敛为：

| 项 | 当前策略 |
| --- | --- |
| 实时订单来源 | 优先接收 `DOUYIN_LIFE` Webhook/SPI；订单创建、支付通知、退款通知、券核销状态先进入 inbox 再更新本地订单，发券/库存继续记录同步日志 |
| 补偿订单来源 | OpenAPI 主动同步保留为补偿，不作为客户页面实时查抖音的入口 |
| 入站幂等 | 新增 `yy_channel_event_inbox`，记录 `RECEIVED/PROCESSING/PROCESSED/DONE/FAILED/RETRY/DEAD/DUPLICATE` |
| 重试语义 | `PROCESSED/DONE` 视为完成幂等；`RECEIVED/FAILED/RETRY` 可再次处理，避免进程崩溃后永久丢单 |
| 收件箱 worker | `YyChannelEventInboxWorkerService` 已接入定时处理，默认 30 秒一轮、批量 10 条、最多重试 5 次 |
| 稳定事件键 | `eventId` 优先使用外部订单号，其次 request/logid，再兜底 payload hash |
| 敏感信息 | inbox 和同步日志只保存脱敏 payload，不保存 secret、token、完整 openid 或完整手机号 |
| 管理后台运维 | 抖音来客页已新增“订单同步健康”和“事件收件箱”，可看最近 Webhook、最近补偿同步、失败/可重试/死信数和最近 logid |
| 手动重试 | 管理后台通过 `POST /yy/channel/DOUYIN_LIFE/event-inbox/{id}/retry` 将失败事件重新放回可处理状态 |
| 客户查单 | 新入口 `POST /client/orders/auth/verify` 换 2 小时短期 `clientOrderToken`，再用 `GET /client/orders` 或 `GET /client/orders/{orderNo}` 携带 `X-Client-Order-Token`；旧 `/by-phone` 仅兼容 |

客户小程序/H5 查订单只读本地 `yy_order`，不会在客户请求时实时调用抖音 OpenAPI。抖音订单进入本地库的路径是：Webhook/SPI 入站优先，收件箱 worker 处理可重试事件，自动同步/手动同步补偿，最终由 `yy_order + yy_channel_order_mapping + yy_channel_event_inbox + yy_channel_sync_log` 共同提供可排查证据。

2026-06-13 补充：`refund_notify/refund_notice` 已纳入订单类 inbox；普通开放平台 webhook 的 `content` 即使是字符串 JSON，也会解析内部 `order_id/action/refund_amount`。`REFUND_SUCCESS/REFUNDED/PARTIAL_REFUND` 会映射到本地 `REFUNDED/PARTIAL_REFUNDED`，并写入 `yy_order.refund_status/refund_amount_cent`；`VERIFY_SUCCESS/VERIFIED/USED/FULFIL_SUCCESS` 会映射为本地 `COMPLETED`。`refund_apply` 仍是退款审核 SPI，不等同于退款结果落库事件。

## 2026-06-13 抖音来客真实验收状态脚本

已新增只读验收聚合脚本：

```powershell
.\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile "<香港2密码文件>"
```

脚本读取生产 `yy_channel_sync_log` 与 `yy_channel_event_inbox`，只输出状态、时间、logid 和脱敏外部订单号，不打印 secret、token、完整手机号或原始 payload。

最新生产查询结果：

| 项 | 当前状态 | 说明 |
| --- | --- | --- |
| 总状态 | `PENDING_EXTERNAL_ACCEPTANCE` | 代码和公网入口已就绪，等待真实平台验收触发 |
| 三方码发券 SPI | `PENDING` | 需要真实下单触发 `/api/douyin/life/tripartite-code/create`，取 `X-Bytedance-Logid` |
| 预约创单/支付回调 | `PENDING` | 需要真实预约或支付触发 `/reservation/order-create` 或 `/reservation/pay-notify` |
| 接单 OpenAPI | `PENDING` | 需要真实 `book_id` 调 `/yy/channel/DOUYIN_LIFE/confirm`，取响应 `extra.logid` |
| 整单核销 OpenAPI | `PENDING` | 需要真实券码或 `verify_token` 调 `/yy/channel/DOUYIN_LIFE/verify`，取响应 `extra.logid` |
| 订单自动/补偿同步 | 最近一次 `FAILED` | 不是必填验收项；排障看 `life_order_auto_sync` 最新 requestId |
| 事件收件箱 | `WARNING`，无 `DEAD` | 有可重试失败事件，无死信；管理员后台可在“事件收件箱”重试 |

最新证据文件：

```text
docs/evidence/douyin-life-acceptance-status-20260613-172715.json
```

总状态脚本 `tools/get-yingyue-delivery-status.ps1` 已识别该证据；只有当上述 4 个必填真实验收项均为 `PASS` 时，抖音来客外部阻塞才会自动消失。
