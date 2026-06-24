# 影约云当前交付状态与继续推进清单

日期：2026-06-12

## 结果

当前项目已经进入 `READY_FOR_EXTERNAL_ACCEPTANCE`：代码、构建产物、线上前端、客户取片、私有 OSS 取片证据、平台基础配置检查均已通过。剩余主要不是代码阻塞，而是微信/抖音小程序开发者工具或真机验收，以及抖音来客真实业务回调 logid 验收。

## 线上入口

| 入口 | 地址 | 定位 |
| --- | --- | --- |
| 客户网页 | `https://yingyueyun.evanshine.me` | 品牌展示、客户取片、小程序预约引导 |
| 系统后台 | `https://admin.evanshine.me` | 管理员维护订单、客户、相册、渠道、库存、报表 |
| 门店工作台 | `https://studio.evanshine.me` | 店员处理订单、排期、客片、取片异常 |
| 核心 API | `https://api.evanshine.me` | Spring Boot 统一后端 API、SPI、客户取片接口 |

## 当前边界

| 模块 | 当前结论 |
| --- | --- |
| 订单主账本 | `yy_order` 是唯一订单/预约主账本 |
| 外部订单幂等 | `yy_channel_order_mapping` 绑定平台订单号，防止重复同步 |
| 支付流水 | 后续微信支付/抖音小程序 `tt.pay` 用 `yy_payment_record` |
| 抖音来客 | `DOUYIN_LIFE`，真实支付发生在抖音来客，影约云同步订单和回调 |
| 抖音小程序 | `DOUYIN_MINI_APP`，当前先做取片和来客商品入口，后续再接小程序内支付 |
| 微信小程序 | 当前先做手机号 + 取片码取片，后续接微信支付/手机号授权 |
| 客户预约 | 只走微信/抖音小程序；客户 PC 网页不再维护预约表单 |
| 员工操作 | 门店工作台只保留店员需要处理的订单、排期、客片能力 |
| OSS | 私有 OSS；客户端只走后端鉴权后的签名 URL 或 `/stream` |

## 小程序交接

| 平台 | AppID | 导入目录 |
| --- | --- | --- |
| 微信小程序 | `wx2a1a34748f56a6c6` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| 抖音小程序 | `tta3c8d5753dac3aae01` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |

合法域名统一填写：

```text
request: https://api.evanshine.me
uploadFile: https://api.evanshine.me
downloadFile: https://api.evanshine.me
```

测试取片账号：

```text
手机号：13900001111
取片码：PREVIEW-20260608
相册：990202606080001
照片：1781018145736000012
```

## 已完成

| 项 | 状态 |
| --- | --- |
| H5 客户取片 | 已通过 |
| 私有 OSS 取片 | 已通过 |
| 后台相册上传闭环 | 已完成 |
| 微信小程序构建产物 | 已生成 |
| 抖音小程序构建产物 | 已生成 |
| 客户 PC 网页去预约表单 | 已完成并上线 |
| 门店工作台去“新建预约” | 已完成并上线 |
| 门店工作台订单页按日处理 | 已完成并上线；`/orders` 默认今日待处理，`/orders?focus=pending` 默认今日待确认 |
| 抖音来客订单查询/同步 | 已实现，并可同步到本地数据库 |
| 抖音来客自动同步 | 已实现，员工首页可看到同步状态和最近订单 |
| 抖音来客同步防护 | 已补安全闸；自动同步默认 `maxPages=2`、`maxTotal=80`，达到上限标记 `SUSPICIOUS` |
| 抖音来客同步健康面板 | 已补；管理员后台抖音来客页可看最近 Webhook、补偿同步、失败/可重试/死信事件和最近 logid |
| 抖音来客事件收件箱 | 已补后台查看和手动重试入口；订单类事件失败后可重新放回可处理状态 |
| 本地库存账本 | 已实现，支持原子扣减和冲突标记 |
| 订单导出 | 已支持渠道、外部状态、同步状态筛选与导出 |
| 员工工作台订单噪声隔离 | 已补；默认今日到店 `pageSize=100`，缺手机号/缺到店时间进入“异常缺资料” |

## 现在继续做什么

1. 用微信开发者工具导入 `mobile-uniapp\dist\build\mp-weixin`，填 AppID 后验收登录、相册、预览、保存图片。
2. 用抖音开发者工具导入 `mobile-uniapp\dist\build\mp-toutiao`，填 AppID 后验收同一条取片链路。
3. 两个平台确认通过后，运行最终证据命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "https://api.evanshine.me" -Phone "13900001111" -AccessCode "PREVIEW-20260608" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit
```

4. 抖音来客继续做真实业务验收：发券 SPI、创单/支付回调、接单、核销四类 logid。
5. 微信支付和抖音小程序 `tt.pay` 属于下一阶段；接入后仍写同一个 `yy_order`，不要新增第二套订单账本。

## 当前外部阻塞

| 阻塞 | 处理方式 |
| --- | --- |
| 本机未检测到微信/抖音开发者工具 | 在有工具的电脑导入构建目录，或安装工具后复测 |
| 抖音来客真实验收 logid | 需要平台能力、真实商品/订单、真实回调触发；本次远程查单已连通服务器和 token 接口，但订单查询被抖音限频 `2119003 请求太过频繁`，需稍后重试或从后台触发同步 |
| 微信支付/抖音小程序支付 | 需要商户号、支付能力、回调配置后进入 P1 |

## 2026-06-12 订单噪声诊断

员工工作台出现大量 `DYL-*` 订单的原因已确认：生产库真实存在 1003 条 `DOUYIN_LIFE` 本地订单，其中 999 条来自一次自动同步，外部订单号去重后仍为 1003 条，不是重复插入。176 条缺手机号只保留为渠道对账订单，不会自动创建取片相册。

已补：

- 后端自动同步安全上限：`maxPages=2`、`maxTotal=80`。
- 达到上限返回 `SUSPICIOUS`，并在 `life_order_auto_sync` 日志 remark 中记录窗口和上限。
- 员工工作台默认只取今日到店工作单，`pageSize=100`。
- 订单页新增“异常缺资料”筛选，缺手机号或缺到店时间不进入店员日常处理流。
- 证据：`docs/evidence/douyin-life-order-noise-guard-20260612.md`。

## 2026-06-13 订单同步可靠性补充

已补 `yy_channel_event_inbox` 入站事件收件箱：

- Webhook/SPI 推送优先；OpenAPI 自动/手动同步只作为补偿。
- `RECEIVED/FAILED/RETRY` 不再被当成完成幂等，只有 `PROCESSED/DONE` 才跳过重复处理。
- `YyChannelEventInboxWorkerService` 已接入定时处理：claim 可重试事件，成功标记 `DONE`，短暂失败标记 `RETRY`，达到阈值标记 `DEAD`。
- `eventId` 优先使用外部订单号，降低同一订单因 `logid` 或 payload 格式变化重复入库的风险。
- `postgres_yy_cloud.sql` 和迁移脚本都包含 `yy_channel_event_inbox`。
- 管理后台抖音来客页已接入 `GET /yy/channel/DOUYIN_LIFE/sync-health`、`/event-inbox/list` 和 `/event-inbox/{id}/retry`。

客户查单边界已收紧并已 token 化：

- 新入口 `POST /client/orders/auth/verify` 必须带 `storeId + 完整手机号`，返回 2 小时短期 `clientOrderToken`。
- 后续列表/详情使用 `GET /client/orders` 或 `GET /client/orders/{orderNo}`，请求头带 `X-Client-Order-Token`。
- 旧 `GET /client/orders/by-phone` 保留兼容；新 PC/H5/小程序入口不要再首选。
- 订单详情链接形如 `/customer/orders/{orderNo}`，不再把 `storeId/phone` 放进 URL。
- H5 详情页只展示精确匹配 `orderNo` 的订单，不 fallback 展示同手机号第一条订单。
- uni-app 查单页也要求门店 ID，避免跨门店手机号枚举。

## 常用检查命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git status --short --branch
.\tools\get-yingyue-delivery-status.ps1
.\tools\yingyue-platform-readiness.ps1
.\tools\print-miniapp-acceptance-handoff.ps1
.\tools\print-douyin-life-acceptance-handoff.ps1
```

## 生成小程序验收包

如果要交给别人或换电脑验收小程序，直接生成桌面 zip 包：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-miniapp-acceptance-package.ps1
```

生成内容包括微信/抖音小程序构建产物、验收 README、`handoff.json` 和生成时的交付状态，不包含密钥、token、服务器密码或 OSS AccessKey。
