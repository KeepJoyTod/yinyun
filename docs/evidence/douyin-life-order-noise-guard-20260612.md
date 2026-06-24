# 抖音来客 1000 单异常展示诊断与防护记录

日期：2026-06-12

## 现象

- `https://studio.evanshine.me/orders` 出现大量 `DYL-*` 订单。
- 部分订单没有手机号，部分订单有手机号。
- 页面看起来像一次性出现约 1000 条“全部订单”。

## 生产库诊断结论

- `yy_order` 共 1003 条。
- `dyl_orders` 共 1003 条。
- `distinct_external` 共 1003 条，不是同一个外部订单重复插入。
- 缺手机号订单 176 条，有手机号订单 827 条。
- 所有异常订单来源均为 `DOUYIN_LIFE`，大多是 `PENDING / PAID`。
- `yy_photo_album` 中 `DOUYIN_LIFE` 相册占位为 827 个，和有手机号订单数一致。

关键自动同步日志：

```text
2026-06-12 16:04:04 life_order_auto_sync
status=SYNCED, total=1000, created=999, updated=1, failed=0
startTime=2026-06-12 15:22:11
endTime=2026-06-12 16:02:11
logid=2026061216035854DBA017A3F4D55D8B31
```

## 根因

1. 后端 `DOUYIN_LIFE` 自动同步按 40 分钟窗口查询抖音订单，但适配器最多可翻 20 页，每页最多 100 条。抖音接口返回连续满页时，一次同步最多可能灌入 2000 条。
2. 这次生产自动同步在一个窗口内返回了 1000 条，系统幂等地按外部订单号入库。
3. 员工工作台之前默认以 `pageSize=1000` 拉取订单，导致这些渠道订单被一股脑展示给店员。
4. 抖音返回缺手机号时，影约云仍保留本地订单用于对账，但不会自动创建客户取片相册。

## 已加防护

- `YyChannelOrderQuery` 新增 `maxPages`、`maxTotal`。
- `YyDouyinLifeAutoSyncService` 自动同步默认带：

```text
maxPages=2
maxTotal=80
```

- `DouyinLifeChannelAdapter.syncOrders` 达到翻页或总数安全上限时停止，并返回：

```text
syncStatus=SUSPICIOUS
```

- 自动同步日志 `remark` 记录 `maxPages/maxTotal`，便于后续排障。
- 员工工作台订单 API 默认只取今日到店工作单：

```text
pageSize=100
beginArrivalTime=当天 00:00:00
endArrivalTime=当天 23:59:59
```

- 员工订单页新增“异常缺资料”筛选，缺手机号或缺到店时间的渠道单不计入“今日待处理/今日待确认”。

## 注意

- 本次不删除生产订单，避免误删真实抖音来客对账数据。
- 管理员仍可在系统后台订单管理中查看全量订单。
- 店员工作台只展示日常处理所需工作单。
