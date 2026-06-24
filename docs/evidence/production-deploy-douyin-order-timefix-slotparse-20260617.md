# 生产部署证据：抖音订单时间过滤与时段解析 2026-06-17

## 部署范围

```text
server: 103.24.216.8
service: yingyue-admin.service
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
release: /opt/yingyue/releases/douyin-order-timefix-slotparse-20260617-20260617-131240/ruoyi-admin.jar
backup: /opt/yingyue/backups/douyin-order-timefix-slotparse-20260617-20260617-131240-pre/ruoyi-admin.jar
sha256: 79d3078976b54e75a735cb64035fa2933fa12e85f6fc1b68ac5a0b9bb3a073ff
```

## 本次变更

- `DOUYIN_LIFE` OpenAPI 查单参数改用 `create_order_start_time/create_order_end_time` 秒级时间戳。
- smoke 工具同步改为官方时间字段，并输出人类时间和实际发送字段。
- `DouyinLifeChannelAdapter.extractOrderSlotSpec(...)` 扩展预约时间戳字段：`reserve_*_timestamp`、`booking_*_timestamp`、`reservation_*_timestamp`。
- 增加回归测试，确认时间戳型预约字段会写入 `yy_order.slot_*` 并触发统一库存确认。
- 写入历史排期诊断：1003 条历史 `DOUYIN_LIFE` 订单没有真实预约时段，不伪造进 `yy_booking_slot_inventory`。

## 验证

本地：

```text
mvn -pl ruoyi-modules/ruoyi-yy -am -Dtest=DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest,YyDouyinLifeAutoSyncServiceTest,YyChannelSyncLogServiceImplTest test
result: 60 tests, 0 failures, 0 errors

PowerShell parser:
tools/douyin-life-order-smoke.ps1 OK
tools/yingyue-douyin-openapi-remote-order-query.ps1 OK
tools/get-yingyue-booking-chain-snapshot.ps1 OK

mvn -pl ruoyi-admin -am -DskipTests package
result: BUILD SUCCESS
```

线上：

```text
https://api.evanshine.me/auth/code
result: 200, captchaEnabled=false

https://studio.evanshine.me/
result: 200

future-window smoke:
range: 2030-01-01 00:00:00 -> 2030-01-01 00:10:00
create_order_start_time: 1893427200
create_order_end_time: 1893427800
order_count_detected: 0
logid: 20260617131550559351603196F851D62B
```

自动同步：

```text
latest life_order_auto_sync:
202606171311129D54173FE1037C47F3DE success=1
20260617130612516A7AED9DA2879499F4 success=1
2026061713011028569219DBDE52370600 success=1
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

## 回滚

```bash
cp /opt/yingyue/backups/douyin-order-timefix-slotparse-20260617-20260617-131240-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
chown yingyue:yingyue /opt/yingyue/backend/ruoyi-admin.jar
chmod 0644 /opt/yingyue/backend/ruoyi-admin.jar
systemctl restart yingyue-admin.service
```
