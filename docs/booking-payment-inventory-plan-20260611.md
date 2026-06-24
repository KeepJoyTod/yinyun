# 预约支付与统一时段库存账本

## 当前结论

- 微信小程序、H5、门店官网自建下单：支付和订单以影约云本地库为准，落 `yy_order` 和 `yy_payment_record`。
- 抖音来客团购/预约：用户在抖音来客侧真实支付，影约云通过 SPI/Webhook/OpenAPI 同步到本地 `yy_order`。
- `yy_channel_inventory_slot` 是抖音平台库存镜像，不是全渠道库存锁。
- `yy_booking_slot_inventory` 是新增的全渠道本地真实时段库存账本。

## 库存扣减规则

- 默认采用“支付后才扣库存”。
- 支付成功回调幂等更新支付流水后，调用 `IYyBookingSlotInventoryService.confirmPaidOrderSlot(...)`。
- 原子扣减 SQL 只在 `paid_count < capacity` 时成功。
- 成功：订单 `inventory_status=CONFIRMED`。
- 失败：订单 `inventory_status=CONFLICT`、`status=STOCK_CONFLICT`，进入人工改期。
- 旧订单或抖音同步订单没有完整时段时，不强行扣库存。

## 已落地代码

- 新增实体/Mapper/服务：
  - `YyBookingSlotInventory`
  - `YyBookingSlotInventoryMapper`
  - `IYyBookingSlotInventoryService`
  - `YyBookingSlotInventoryServiceImpl`
- `yy_order` 增加：
  - `service_group_id`
  - `inventory_slot_id`
  - `slot_date`
  - `slot_start_time`
  - `slot_end_time`
  - `inventory_status`
  - `conflict_reason`
- 抖音来客 webhook 若 payload 带日期、时段、SKU，会写入订单时段字段并尝试扣本地库存。
- 后台订单页增加库存状态筛选、库存列、预约时段展示和人工改期字段。
- 订单编辑已接入库存迁移：已支付订单表单不再覆盖支付摘要；改期时先释放旧 `CONFIRMED` 时段，再按新时段重新扣库存。
- 新增后台库存账本页 `admin-ui/src/views/yy/booking-inventory/index.vue`：
  - 按门店、服务组、日期、状态、冲突筛选时段。
  - 展示容量、已确认、剩余、冲突数和占用率。
  - 支持调整容量；容量不能小于已确认订单数。
  - 可跳转订单页筛同一 `inventorySlotId` 的冲突订单。
- 新增后台库存账本 API：
  - `GET /yy/bookingSlotInventory/list`
  - `GET /yy/bookingSlotInventory/{id}`
  - `PUT /yy/bookingSlotInventory`
  - `POST /yy/bookingSlotInventory/export`
- SQL 已补菜单：`影约云 / 库存账本`，权限为 `yy:bookingInventory:list/query/edit/export`。

## 后续接入点

- 微信支付回调：验签、幂等写 `yy_payment_record` 后调用统一库存服务。
- 抖音小程序 `tt.pay`：独立 `DOUYIN_MINI_APP` 支付 service，不复用 `DOUYIN_LIFE` SPI。
- 抖音库存 SPI：已优先从 `yy_booking_slot_inventory` 计算可约库存，再兼容 `yy_channel_inventory_slot`。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyOrderServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyBookingSlotInventoryServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
```
