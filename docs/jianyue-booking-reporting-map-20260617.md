# JianYue Booking Reporting Map 2026-06-17

## Conclusion

Reports should be derived from `yy_order` and slot inventory, not from page-local mock data. The first useful reporting slice is daily operations: valid orders, status mix, paid/unpaid, source/channel mix, capacity utilization, and data anomalies.

## Report Surfaces

| Surface | Audience | Data source |
| --- | --- | --- |
| 首页经营概况 | Front desk, manager | `yy_order`, `yy_booking_slot_inventory` |
| Product analysis | Manager/operator | `yy_order`, `yy_product`, `yy_channel_product_mapping` |
| Channel conversion/source | Operator | `yy_order.channel_type`, `source`, mapping/logs |
| Capacity utilization | Manager | `yy_booking_slot_inventory`, scheduled `yy_order` |
| Export | Manager/operator | `POST /yy/order/export` |

## Core Metrics

| Metric | Definition |
| --- | --- |
| 今日有效订单 | Count valid orders with arrival date today or order date today depending on selected card. |
| 今日待服务 | Valid orders in the 待服务 group. |
| 今日服务中 | Valid orders in the 服务中 group. |
| 今日已完成 | Valid orders in the 已完成 group. |
| 待支付 | Valid orders with `pay_status=UNPAID`. |
| 预约满载时段 | Slots where `paid_count >= capacity`. |
| 冲突订单 | Orders with `inventory_status=CONFLICT`. |
| 缺时段订单 | Valid recent platform orders missing slot fields. |
| 渠道订单数 | Group by `channel_type`. |
| 产品订单数 | Group by `product_id` or `external_sku_id` mapped to product. |

## Default Windows

| Page/report | Default |
| --- | --- |
| Dashboard today | Today by arrival date, plus recent anomaly hints. |
| Douyin order list | Last one month unless user expands range. |
| Trend chart | Last 20 or 30 days. |
| Export | User-selected date range, not hidden all-history by default. |

## Drill-Down Rules

| Metric click | Destination |
| --- | --- |
| 待服务 | `/order/appointment?quick=pending&date=...` |
| 服务中 | `/order/appointment?quick=serving&date=...` |
| 已完成 | `/order/appointment?quick=completed&date=...` |
| 满载时段 | `/schedule?date=...&full=1` or filtered order list |
| 缺时段订单 | `/order/appointment?anomaly=missing-slot` |
| 需要映射 | mapping/anomaly page filtered by `NEED_MAPPING` |

## SQL Shape

Status count:

```sql
select status, pay_status, count(*)
from yy_order
where del_flag = '0'
  and arrival_time >= current_date
  and arrival_time < current_date + interval '1 day'
group by status, pay_status;
```

Slot utilization:

```sql
select biz_date, start_time, end_time, sum(capacity) as capacity, sum(paid_count) as used
from yy_booking_slot_inventory
where del_flag = '0'
  and biz_date = current_date::text
group by biz_date, start_time, end_time
order by start_time;
```

Channel mix:

```sql
select channel_type, count(*) as orders, sum(coalesce(paid_amount_cent, 0)) as paid_amount_cent
from yy_order
where del_flag = '0'
  and order_time >= now() - interval '30 day'
group by channel_type
order by orders desc;
```

## Implementation Rules

- Keep dashboard queries backend-aggregated when possible.
- Frontend may map raw statuses into JianYue groups for display, but definitions must stay in one shared helper.
- Reports must not load thousands of rows into the browser just to count.
- Export should always state applied date/channel/store filters.
- Revenue metrics must use cents fields and format only at the UI boundary.

## Acceptance

- Dashboard numbers can be traced to a query or backend endpoint.
- Clicking a metric opens a matching filtered list.
- Recent Douyin historical rows do not dominate today operational metrics.
- Product/channel charts remain useful when some historical rows lack slot fields.
