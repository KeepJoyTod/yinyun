# JianYue Booking Acceptance Test Map 2026-06-17

## Conclusion

Acceptance must prove three things:

1. UI shape matches the JianYue operational model.
2. Data comes from `yy_order` and `yy_booking_slot_inventory`.
3. Douyin historical limitations are handled honestly without fake schedule slots.

## Verification Layers

| Layer | Tool/command | Purpose |
| --- | --- | --- |
| Frontend unit/contract | `npm --prefix studio-workbench run test` | UI labels, filters, payloads, schedule grouping |
| Frontend build | `npm --prefix studio-workbench run build` | TypeScript and production bundle |
| Backend compile/test | `mvn -pl backend/ruoyi-modules/ruoyi-yy -DskipTests compile` and focused tests | Java contracts and service compile |
| Browser smoke | In-app browser or Playwright | Real page layout and interaction |
| Production data snapshot | `tools/get-yingyue-booking-chain-snapshot.ps1` | Verify server data after deploy/import |
| Secret scan | `Select-String`/`rg` | Ensure docs/evidence contain no secrets |

## Page Acceptance Checklist

### 首页经营概况

| Check | Expected |
| --- | --- |
| Default loads quickly | No all-history UI freeze. |
| Business overview visible | Shows compact metrics for today's/recent operational view. |
| Today appointment summary visible | Shows today's slots/order workload without fake historical Douyin time slots. |
| Metric click | Opens filtered `/order/appointment` query. |
| Missing-slot anomaly | Historical Douyin rows without slot fields show as anomaly/context, not schedule cards. |

### 今日预约

| Check | Expected |
| --- | --- |
| Period sections | `上午`, `下午`, `晚上` sections are visible. |
| Slot card content | Each slot shows time, `订单：x`, `工位：x/y`. |
| Full state | Full slot shows `满`. |
| Desktop scroll | Mouse wheel scrolls page vertically; slot board is not a horizontal-only strip. |
| Empty slot click | Opens filtered order scope or inspect view, not direct create. |
| New order entry | Explicit `新增订单` / `新增服务订单` opens staff order form. |

### 预约订单

| Check | Expected |
| --- | --- |
| Filters | Store, keyword, source, method, order time, arrival time are visible or reachable. |
| Status groups | `全部有效订单`, `待服务`, `服务中`, `已完成`, `待支付`, `已取消`, `已退单`. |
| Default date window | Does not show every old Douyin order by default. |
| Slot deep link | Date/store/time query restricts the list. |
| Sync order action | Calls Douyin sync endpoint and refreshes data/log feedback. |

### 新增服务订单

| Check | Expected |
| --- | --- |
| Customer fields | phone, name, gender, email, customer association. |
| Order fields | store, service group, product. |
| Schedule fields | scheduled/undecided mode, date, time, duration or end time. |
| Notification/remark | Both are present. |
| Buttons | `返回`, `保存`, `保存并接待`. |
| Scheduled save | Creates `yy_order` and reserves/increments slot. |
| Undecided save | Creates `yy_order` without slot reservation. |

## Data Acceptance Queries

Run from the database environment after deploy/import:

```sql
select channel_type, count(*)
from yy_order
where del_flag = '0'
group by channel_type
order by channel_type;
```

Expected: `DOUYIN_LIFE`, `JIANYUE`/local channels remain distinguishable.

```sql
select count(*) as scheduled_orders
from yy_order
where del_flag = '0'
  and slot_date = current_date::text
  and slot_start_time is not null
  and slot_end_time is not null;
```

Expected: matches the day's real scheduled workload imported or created locally.

```sql
select count(*) as missing_slot_douyin_orders
from yy_order
where del_flag = '0'
  and channel_type = 'DOUYIN_LIFE'
  and order_time >= now() - interval '30 day'
  and (slot_date is null or slot_start_time is null);
```

Expected: may be greater than zero for historical rows. These rows must not render in timed slot board.

```sql
select count(*) as slot_count
from yy_booking_slot_inventory
where del_flag = '0'
  and biz_date = current_date::text;
```

Expected: greater than zero after JianYue slot import or local schedule seed.

## Contract Tests To Keep

| Area | Test file target |
| --- | --- |
| Slot grouping and click policy | `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.contract.test.ts`, `ScheduleView.contract.test.ts` |
| Staff create payload | `StaffBookingModal.contract.test.ts`, `appStore.contract.test.ts`, `backend.contract.test.ts` |
| Order filters/status groups | `OrdersView.contract.test.ts`, `orderOperations.test.ts` |
| Douyin resolver | `DouyinLifeStoreResolverTest.java` |
| Backend staff create | `YyOrderServiceImplTest.java` |

## Evidence File Standard

Each acceptance run should write an evidence note under `docs/evidence/`:

| Field | Required content |
| --- | --- |
| Date/time | Exact run time and environment. |
| Commit | Git commit hash. |
| Commands | Commands run and pass/fail result. |
| Browser smoke | Pages checked and visible result. |
| Data snapshot | Counts for today slots/orders and 30-day Douyin missing-slot rows. |
| Known limits | Only real remaining limitations, especially platform payload gaps. |
| Secrets | No tokens, passwords, complete phone numbers, or AppSecret values. |
