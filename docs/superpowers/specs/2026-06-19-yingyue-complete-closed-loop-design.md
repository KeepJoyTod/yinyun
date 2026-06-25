# YingYue Complete Closed Loop Design

## Goal

把影约云从“多个页面和预实现模块并存”收口成可验收的完整闭环版本：客户可看门店/商品/时段并提交预约，店员可在工作台处理排期、订单、客片、微页面和卡产品，抖音来客继续走真实 DOUYIN_LIFE 数据链。客户端在线支付本阶段不实现，只保留显式接口占位和后续扩展点。

## Confirmed Decision

本阶段选择完整闭环版，但支付按下面规则处理：

- 不接微信支付、抖音小程序担保支付、收银通道和真实扣款。
- `/api/customer/orders/{orderId}/pay` 必须返回 `paymentReady=false`，并带清晰提示。
- 客户公开端创建的本地预约写 `yy_order.pay_status=UNPAID`。
- 不因为点击“支付”把订单改成 `PAID`。
- DOUYIN_LIFE 的真实支付事实只来自抖音来客订单查询、SPI/Webhook 或抖音侧支付通知。
- 后续在线支付落点预留到 `yy_payment_record` 和 `DOUYIN_MINI_APP` / `WECHAT` 渠道，不混入 `DOUYIN_LIFE`。

## Current Project State

Repo:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

Branch:

```text
yingyue-closed-loop-optimization-20260603
```

当前工作区是多来源合并后的脏工作区，包含 Joe、Stella、Codex 的大量未提交文件。后续执行必须按文件分批提交，禁止 `git add .`。

已具备的基础：

- 工作台首页、今日预约、预约订单、店员录单、排期库存已经接到 `yy_order` 和 `yy_booking_slot_inventory`。
- 订单详情、取消、改期、到店、服务中、完成、操作日志、客片入口已经有基础链路。
- 商户装修、微页面、微表单、卡产品、抖音产品映射已有前端和部分后端。
- 客户公开 API 已新增到 `YyClientPublicApiController` / `YyClientPublicApiServiceImpl`。
- `mobile-uniapp` 已开始接 `/api/public/*` 和 `/api/customer/*`。
- DOUYIN_LIFE 真实订单同步、POI/SKU 映射、Webhook/SPI、logid、同步日志已有基础。

关键缺口：

- 客户公开端预约在支付预留模式下要明确“未支付但已提交预约”的排期占用规则。
- 客户 API 和移动端还需要补全真实 smoke、错误态、无权限态、生产域名验收。
- 工作台动作闭环需要继续收口：取消/改期原因、操作人、日志刷新、排期库存回流。
- 客片通知/确认/资料发送需要真实动作闭环和兜底提示。
- 商户装修、微页面、卡产品要从“页面可点”推进到“保存/发布/公开渲染/回跳可验收”。
- UI 复刻简约网只能在数据契约稳定后集中做，避免视觉覆盖逻辑问题。

## Architecture

### Backend

- Spring Boot / RuoYi-Vue-Plus。
- PostgreSQL 为主库。
- `yy_order` 是唯一订单和预约账本。
- `yy_booking_slot_inventory` 是唯一排期容量账本。
- `yy_channel_order_mapping` 保存外部订单幂等映射。
- `yy_channel_sync_log` 保存 DOUYIN_LIFE OpenAPI / SPI / Webhook 的 logid 和结果。
- `yy_payment_record` 只作为后续小程序/微信在线支付预留，本阶段不写真实支付流水。

### Staff Workbench

- Vue 3 + TypeScript + Pinia + Vite。
- 入口域名：`https://studio.evanshine.me`。
- 数据只通过 `studio-workbench/src/shared/api/backend.ts` 调后端。
- 店员视角必须按真实 `yy_store.id` 分门店，不默认混看全部门店。

### Customer Mobile

- `mobile-uniapp` 作为 H5、微信小程序、抖音小程序共用客户端。
- 客户公开预约调用 `/api/public/*` 和 `/api/customer/*`。
- 在线支付按钮保留，但在支付未接入时展示“订单已创建，请到店或联系门店确认”，不得伪造支付成功。

### Douyin Life

- `DOUYIN_LIFE` 是抖音来客生活服务商家应用。
- 订单查询、SPI/Webhook、POI/SKU、预约库存继续走香港2验证。
- 历史抖音订单没有真实 `slot_date + slot_start_time + slot_end_time` 时不能进入今日排期。
- 抖音新订单如果 payload 或 SPI 带真实时段，才进入 `yy_booking_slot_inventory + yy_order` 排期链。

## Closed Loop Definition

### Customer Booking Loop

1. 客户打开移动端首页。
2. 选择门店。
3. 选择商品/规格。
4. 读取真实门店时段库存。
5. 提交姓名、手机号、日期、半小时时段。
6. 后端写 `yy_order`，渠道为 `CLIENT_WEB`，支付状态为 `UNPAID`。
7. 支付接口返回 `paymentReady=false`。
8. 客户订单页能看到待确认/未支付状态，可取消或改期。
9. 店员工作台能看到该订单，并按店内规则确认、到店、服务中、完成。

### Staff Workbench Loop

1. 登录后进入单门店首页。
2. 首页按上午/下午/晚上展示半小时排期。
3. 点空时段进入店员录单，带入门店、日期、时间段。
4. 点非空时段进入该时段订单列表。
5. 订单详情支持确认、到店、服务中、完成、取消、改期。
6. 动作完成后刷新订单列表、排期、库存、经营概况和操作日志。
7. 满员或冲突进入库存管理，调整容量后能返回原上下文。

### Photo Delivery Loop

1. 订单完成后可进入客片管理。
2. 工作台可上传/查看相册、通知客户、确认选片、发送资料。
3. 客户端可通过客户身份或取片码查看相册。
4. 所有通知动作必须显示真实发送结果或明确兜底人工跟进。

### Merchant Surface Loop

1. 商户装修可保存草稿和发布。
2. 微页面可编辑、发布、公开渲染。
3. 微表单可公开提交，后台可跟进或转人工预约。
4. 卡产品可创建、编辑、上下架，并能在客户/公开端被展示或作为后续支付预留商品。

### Douyin Life Loop

1. 香港2调用抖音来客 OpenAPI 获取真实账户能力状态。
2. POI/SKU 映射到真实 `yy_store` 和 `yy_product`。
3. 订单同步写 `yy_order` 和 `yy_channel_order_mapping`。
4. 有真实时段的预约订单写入排期库存。
5. 无真实时段的历史订单只进入订单账本，不进入今日排期。
6. Webhook/SPI 记录 `logid` 和脱敏摘要。

## Payment Placeholder Contract

### API Contract

`POST /api/customer/orders/{orderId}/pay`

Response data:

```json
{
  "orderId": "900000000000000001",
  "amount": 0,
  "paymentReady": false,
  "message": "在线支付暂未接入，订单已创建，请到店或联系门店确认。",
  "timeStamp": "",
  "nonceStr": "",
  "package": "",
  "signType": "",
  "paySign": ""
}
```

Frontend behavior:

- If `paymentReady=false`, do not call `uni.requestPayment`.
- Show non-success neutral toast or bottom sheet.
- Navigate customer to order list/detail.
- Keep order `payStatus=UNPAID`.

Backend behavior:

- Authorize order owner before returning placeholder.
- Do not update `yy_order.pay_status`.
- Do not insert `yy_payment_record`.
- Do not deduct payment-related inventory based on pay action.

## Inventory Contract For No Online Payment

Because online payment is reserved, customer self-booking must use one of these explicit modes:

| Mode | Rule | Recommended for current phase |
| --- | --- | --- |
| Soft submit | Customer order appears as `PENDING + UNPAID`, does not consume capacity until staff confirms | Not enough for daily operations |
| Manual reserve | Customer order appears as `PENDING + UNPAID`, consumes local capacity immediately, staff can release by cancel/reschedule | Recommended |
| Staff confirm reserve | Customer order appears as `PENDING + UNPAID`, consumes capacity when staff clicks confirm | Acceptable if UI clearly marks pending capacity |

Current code shows customer create writes `yy_order` but does not clearly call inventory confirmation. For a complete closed loop with no online payment, implement **Manual reserve** or explicitly implement **Staff confirm reserve**. The recommended P0 is Manual reserve, because customers selecting a real half-hour slot should reduce visible remaining capacity immediately.

## Verification Standard

Minimum local verification:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile

cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/shared/api/backend.contract.test.ts
npm run build

cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
```

Minimum HK2 verification:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\invoke-hk2.ps1 -Command "systemctl is-active yingyue-admin.service; nginx -t"
.\tools\run-douyin-life-current-order.ps1
```

Production smoke path:

```text
https://studio.evanshine.me/dashboard/today
https://studio.evanshine.me/order/appointment
https://studio.evanshine.me/service/photos
https://studio.evanshine.me/merchant/decoration
https://studio.evanshine.me/merchant/micro-pages
https://studio.evanshine.me/product/card-management
```

Customer smoke path:

```text
mobile-uniapp home -> store -> product -> slot -> create order -> pay placeholder -> customer order list -> cancel/reschedule
```

## Risks

- 当前工作区改动很多，必须先分批验收和提交，否则容易把未完成模块一起带上生产。
- 客户预约无支付时，容量规则如果不明确，会出现客户看到可约但店员排期没锁定的问题。
- DOUYIN_LIFE 历史订单缺少真实时段，不能靠前端补时间。
- 简约网 UI 复刻如果先做视觉，会掩盖订单动作和排期数据未闭环的问题。
- 客户端 fallback 在生产必须收口，避免接口失败时误展示本地假数据。

## Final Delivery Target

完整闭环版完成后，应能做到：

- 朋友用正式账号登录 `studio.evanshine.me` 后能按门店处理当天预约。
- 客户端能用真实 API 完成预约提交、订单查看、取消、改期。
- 支付按钮存在但明确提示未接入，不产生伪支付状态。
- 抖音来客真实订单进入统一订单账本，带真实时段的新订单进入排期。
- 商户装修、微页面、卡产品、客片交付都有真实保存/发布/动作结果。
- 本地 `docs\yiyue` 地图能让下一个 AI 直接接手。
