# DOUYIN_LIFE 订单时间过滤与排期诊断 2026-06-17

## 结论

- 根因已确认：抖音生活服务订单查询不能用旧 `start_time/end_time` 过滤创建时间，应使用 `create_order_start_time/create_order_end_time` 秒级时间戳。
- 香港2上线后，自动同步已从连续 `SUSPICIOUS total=80` 变为 `SYNCED total=0`，说明安全上限反复触发的问题已解除。
- 历史 1003 条 `DOUYIN_LIFE` 订单只有真实 POI/SKU，没有真实预约日期和时段，不能伪造写入 `yy_booking_slot_inventory`。
- 新订单链路已补预约时间戳字段解析：如果 SPI/Webhook/OpenAPI payload 带 `reserve_start_timestamp/reserve_end_timestamp` 或同类字段，会写入 `yy_order.slot_*` 并触发统一库存确认。

## 生产证据

只读 smoke：

```text
command: tools/yingyue-douyin-openapi-remote-order-query.ps1
server: 103.24.216.8
range: 2030-01-01 00:00:00 -> 2030-01-01 00:10:00
sent fields: create_order_start_time=1893427200, create_order_end_time=1893427800
result: order_count_detected=0
logid: 202606171302116F283153B53225BC1CB5
```

自动同步日志：

```text
before deploy: life_order_auto_sync status=SUSPICIOUS, total=80
after deploy:  life_order_auto_sync status=SYNCED, total=0
after logid:   2026061713011028569219DBDE52370600
```

预约链快照：

```text
date: 2026-06-17
todaySlots: 63
todayCapacity: 77
todayPaid: 2
todayConflicts: 1
todayOrders: 3
todayOrdersWithSlot: 3
windowOrders: 1357
windowMissingSlot: 1003
paidOrdersWithSlotNoInventory: 0
```

## 历史 DOUYIN_LIFE 时段诊断

生产 `yy_channel_order_mapping.raw_payload + yy_order` 只读统计：

```text
totalMappedDouyinLifeOrders: 1003
localCompleteSlotOrders: 0
rawParsed: 1003
rawCompleteSlotCandidates: 0
rawPartialSlotCandidates: 0
rawReserveFieldCandidates: 0
buyerReserveInfoEmptyArray: 1003
rawPoiPresent: 1003
rawSkuPresent: 1003
dateFieldCounts: []
startFieldCounts: []
endFieldCounts: []
```

解释：

- 这 1003 条历史订单可归真实门店，因为 POI/SKU 齐全。
- 这 1003 条历史订单不能进入今日预约板，因为 payload 没有可证明的预约日期、开始时间、结束时间。
- 首页和今日预约应继续以 `yy_booking_slot_inventory + 有 slot_* 的 yy_order` 展示真实每日排期。

## 代码落点

```text
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapter.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapterTest.java
tools/douyin-life-order-smoke.ps1
tools/yingyue-douyin-openapi-remote-order-query.ps1
docs/douyin-life-current-status.md
```

行为边界：

- 不删除历史订单。
- 不把无时段历史订单伪造进库存。
- `DOUYIN_LIFE` 新订单优先靠 SPI/Webhook 入站；OpenAPI 自动同步只做补偿。
- 自动同步窗口继续保留 `maxPages/maxTotal` 安全闸。
