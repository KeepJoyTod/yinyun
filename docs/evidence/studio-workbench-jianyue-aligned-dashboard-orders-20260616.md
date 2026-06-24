# 门店工作台简约网口径对齐证据

GeneratedAt: 2026-06-16 20:35 +08:00

## 结果

已把本轮 P0 交互补到“能看、能点、能回到真实订单账本”的状态：

- 首页经营概况的服务订单卡片改为简约网业务分组：`全部有效订单`、`待服务`、`服务中`、`已完成`、`已取消`、`已退单`。
- 首页状态卡点击进入 `/order/appointment` 时传稳定状态 key，避免把展示文案当筛选条件导致空列表。
- 首页和今日预约的时段工位支持点击预约块，跳到预约订单页并用 `orderNo` / 本地订单号自动定位订单抽屉。
- 预约订单页支持 `q` / `keyword` 深链，可按订单号、本地订单 ID、客户名、手机号片段匹配并打开详情。
- 门店管理页的 `DOUYIN_LIFE` 绑定识别已抽为 `storeDouyinBindings.ts`，不再只依赖中文门店名。

## 四门店激活边界

标准四门店/POI：

```text
7228779175929186363 -> BZ-WUYUE / 900000000000000200 / 滨州吾悦店
7555006097638393865 -> WH-ZHIGU / 900000000000000300 / 威海智慧谷店
7342410951733282851 -> BZ-WANDA / 900000000000000100 / 滨州万达店
7628187182788544538 -> ZB-WANXIANGHUI / 900000000000000400 / 淄博万象汇店
```

禁止自动激活：

```text
7407304729216157722 -> 一悦照相馆(滨州店)
```

原因：它不是当前四个标准 `yy_store` 之一，不能猜到万达或吾悦。

## 代码落点

```text
首页经营概况:
studio-workbench/src/features/dashboard/DashboardView.vue

预约订单:
studio-workbench/src/features/orders/OrdersView.vue
studio-workbench/src/features/orders/orderOperations.ts

今日预约:
studio-workbench/src/features/schedule/ScheduleView.vue
studio-workbench/src/features/schedule/scheduleOperations.ts

门店 DOUYIN_LIFE 绑定:
studio-workbench/src/features/stores/StoreView.vue
studio-workbench/src/features/stores/storeDouyinBindings.ts
```

## 测试覆盖

新增/更新覆盖点：

```text
src/features/orders/orderOperations.test.ts
src/features/orders/OrdersView.contract.test.ts
src/features/dashboard/DashboardView.contract.test.ts
src/features/schedule/scheduleOperations.test.ts
src/features/schedule/ScheduleView.contract.test.ts
src/features/stores/storeDouyinBindings.test.ts
src/features/stores/StoreView.contract.test.ts
src/shared/components/schedule/ReservationSlots.contract.test.ts
```

## 给接力模型的约束

- 继续使用 `DOUYIN_LIFE`，不要混用 `DOUYIN` 或 `DOUYIN_MINI_APP`。
- `yy_order` 是唯一订单/预约账本，不新增第二套预约订单表。
- 前端只读本地后端 API，不直接调用抖音 OpenAPI。
- 抖音订单归店只认 `yy_channel_product_mapping` 的 POI/SKU 映射或标准 POI anchor。
- 首页、今日预约、预约订单页的所有点击必须落到真实路由，不保留死按钮。
