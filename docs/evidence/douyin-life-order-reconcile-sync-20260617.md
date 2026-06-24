# DOUYIN_LIFE 24h 对账补偿同步实现记录

日期：2026-06-17

## 目标

保留现有 5 分钟实时补偿同步的小窗口和安全闸，同时新增低频 24 小时对账任务，避免真实 POI/SKU 映射补齐、短暂失败或自动同步窗口错过后，订单长期不落 `yy_order`。

## 实现边界

- 仍走 `YyChannelAdapterService.syncOrders("DOUYIN_LIFE", query)`，不手写插入订单。
- 仍由 `DouyinLifeChannelAdapter` 写 `yy_channel_order_mapping` / `yy_order`。
- 没有真实预约时段的订单不写 `yy_booking_slot_inventory`。
- 和实时同步共享同一个 `AtomicBoolean running`，避免两个定时任务并发打抖音 OpenAPI。
- 独立日志名：`yy_channel_sync_log.api_name=life_order_reconcile_sync`。

## 默认配置

```text
yy.douyin.life.reconcile.enabled=true
yy.douyin.life.reconcile.initial-delay-ms=120000
yy.douyin.life.reconcile.fixed-delay-ms=86400000
yy.douyin.life.reconcile.window-hours=24
yy.douyin.life.reconcile.page-size=100
yy.douyin.life.reconcile.max-pages=3
yy.douyin.life.reconcile.max-total=300
```

说明：`window-hours` 代码层最大限制为 168 小时，`maxTotal` 最大限制为 500，防止误配置导致无限历史灌库。

## 代码改动

| 文件 | 改动 |
| --- | --- |
| `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyDouyinLifeAutoSyncService.java` | 新增 `scheduledReconcileRun()`、`runReconcileOnce()`、24h 查询构造、独立日志名 |
| `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyDouyinLifeAutoSyncServiceTest.java` | 新增对账窗口和禁用跳过测试 |

## 验证

RED：

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test

结果：BUILD FAILURE，YyDouyinLifeAutoSyncService 缺少 runReconcileOnce()
```

GREEN：

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyDouyinLifeAutoSyncServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test

结果：BUILD SUCCESS，YyDouyinLifeAutoSyncServiceTest 5 tests, failures=0, errors=0
```

## 生产含义

部署后，服务启动约 2 分钟后会跑一次 24 小时对账，以后每天跑一次。它只补最近一天，不会把历史 1003 条再次作为工作台今日排期；订单是否进入今日预约排期仍取决于 `yy_order.slot_date/slot_start_time/slot_end_time` 或真实库存时段。
