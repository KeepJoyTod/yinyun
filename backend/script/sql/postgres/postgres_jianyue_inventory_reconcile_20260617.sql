-- Reconcile imported Jianyue orders with yy_booking_slot_inventory.
-- Generated at 2026-06-17 after deploying real Jianyue slot/order data.
-- This script contains no customer PII. It only aggregates paid imported orders by store/date/slot.

begin;

-- Reconcile imported Jianyue orders with yy_booking_slot_inventory.
-- This keeps daily slot capacity labels consistent after idempotent order imports.
drop table if exists pg_temp.yy_jianyue_slot_order_counts;
create temporary table yy_jianyue_slot_order_counts on commit drop as
  select tenant_id,
         store_id,
         service_group_id,
         coalesce(external_sku_id, '') as external_sku_id,
         slot_date,
         slot_start_time,
         slot_end_time,
         count(*)::integer as order_count,
         concat_ws('|', tenant_id, store_id, coalesce(service_group_id, 0), coalesce(external_sku_id, ''), slot_date, slot_start_time, slot_end_time) as slot_key
    from yy_order
   where del_flag = '0'
     and channel_type = 'JIANYUE'
     and pay_status = 'PAID'
     and slot_date is not null and slot_start_time is not null and slot_end_time is not null
     and coalesce(status, '') not in ('CANCELLED', 'REFUNDED', 'PARTIAL_REFUNDED', 'STOCK_CONFLICT')
   group by tenant_id, store_id, service_group_id, coalesce(external_sku_id, ''), slot_date, slot_start_time, slot_end_time;

drop table if exists pg_temp.yy_jianyue_inserted_slots;
create temporary table yy_jianyue_inserted_slots (id bigint) on commit drop;
with inserted_slots as (
  insert into yy_booking_slot_inventory
  (id, tenant_id, store_id, service_group_id, external_sku_id, biz_date, start_time, end_time, capacity, paid_count, conflict_count, status, version, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
  select (920000000000000000 + abs(hashtextextended(slot_key, 20260617)) % 999999999999999)::bigint,
         tenant_id, store_id, service_group_id, external_sku_id,
         slot_date, slot_start_time, slot_end_time,
         greatest(order_count, 1), 0, 0, 'ACTIVE', 0, 103, 1, now(), 1, now(), '0',
         'Backfilled from imported Jianyue orders without schedule slot'
    from yy_jianyue_slot_order_counts counts
   where not exists (
     select 1
       from yy_booking_slot_inventory target
      where target.del_flag = '0'
        and target.tenant_id = counts.tenant_id
        and target.store_id = counts.store_id
        and coalesce(target.service_group_id, 0) = coalesce(counts.service_group_id, 0)
        and coalesce(target.external_sku_id, '') = counts.external_sku_id
        and target.biz_date = counts.slot_date
        and target.start_time = counts.slot_start_time
        and target.end_time = counts.slot_end_time
   )
  on conflict do nothing
  returning id
)
insert into yy_jianyue_inserted_slots select id from inserted_slots;

drop table if exists pg_temp.yy_jianyue_slot_counts;
create temporary table yy_jianyue_slot_counts on commit drop as
  select target.id as inventory_slot_id,
         counts.tenant_id, counts.store_id, counts.service_group_id, counts.external_sku_id,
         counts.slot_date, counts.slot_start_time, counts.slot_end_time,
         counts.order_count,
         greatest(counts.order_count - coalesce(target.capacity, 0), 0)::integer as conflict_count
    from yy_jianyue_slot_order_counts counts
    join yy_booking_slot_inventory target
      on target.del_flag = '0'
     and target.tenant_id = counts.tenant_id
     and target.store_id = counts.store_id
     and coalesce(target.service_group_id, 0) = coalesce(counts.service_group_id, 0)
     and coalesce(target.external_sku_id, '') = counts.external_sku_id
     and target.biz_date = counts.slot_date
     and target.start_time = counts.slot_start_time
     and target.end_time = counts.slot_end_time;

drop table if exists pg_temp.yy_jianyue_updated_slots;
create temporary table yy_jianyue_updated_slots (id bigint) on commit drop;
with updated_slots as (
  update yy_booking_slot_inventory target
     set paid_count = least(coalesce(slot_counts.order_count, 0), greatest(coalesce(target.capacity, 0), 0)),
         conflict_count = slot_counts.conflict_count,
         update_by = 1,
         update_time = now()
    from yy_jianyue_slot_counts slot_counts
   where target.id = slot_counts.inventory_slot_id
  returning target.id
)
insert into yy_jianyue_updated_slots select id from updated_slots;

drop table if exists pg_temp.yy_jianyue_ranked_orders;
create temporary table yy_jianyue_ranked_orders on commit drop as
  select orders.id,
         slot_counts.inventory_slot_id,
         row_number() over (
           partition by orders.tenant_id, orders.store_id, coalesce(orders.service_group_id, 0), coalesce(orders.external_sku_id, ''), orders.slot_date, orders.slot_start_time, orders.slot_end_time
           order by orders.id
         ) as slot_rank,
         coalesce(slot_inventory.capacity, 0) as capacity
    from yy_order orders
    join yy_jianyue_slot_counts slot_counts
      on slot_counts.tenant_id = orders.tenant_id
     and slot_counts.store_id = orders.store_id
     and coalesce(slot_counts.service_group_id, 0) = coalesce(orders.service_group_id, 0)
     and slot_counts.external_sku_id = coalesce(orders.external_sku_id, '')
     and slot_counts.slot_date = orders.slot_date
     and slot_counts.slot_start_time = orders.slot_start_time
     and slot_counts.slot_end_time = orders.slot_end_time
    join yy_booking_slot_inventory slot_inventory on slot_inventory.id = slot_counts.inventory_slot_id
   where orders.del_flag = '0'
     and orders.channel_type = 'JIANYUE'
     and orders.pay_status = 'PAID'
     and orders.slot_date is not null and orders.slot_start_time is not null and orders.slot_end_time is not null
     and coalesce(orders.status, '') not in ('CANCELLED', 'REFUNDED', 'PARTIAL_REFUNDED', 'STOCK_CONFLICT');

drop table if exists pg_temp.yy_jianyue_updated_orders;
create temporary table yy_jianyue_updated_orders (id bigint) on commit drop;
with updated_orders as (
  update yy_order target
     set inventory_slot_id = ranked_orders.inventory_slot_id,
         inventory_status = case when ranked_orders.slot_rank <= greatest(ranked_orders.capacity, 0) then 'CONFIRMED' else 'CONFLICT' end,
         conflict_reason = case when ranked_orders.slot_rank <= greatest(ranked_orders.capacity, 0) then '' else '库存已满，需人工改期' end,
         update_by = 1,
         update_time = now()
    from yy_jianyue_ranked_orders ranked_orders
   where target.id = ranked_orders.id
  returning target.id
)
insert into yy_jianyue_updated_orders select id from updated_orders;

select
  (select count(*) from yy_jianyue_inserted_slots) as inserted_inventory_slots,
  (select count(*) from yy_jianyue_updated_slots) as updated_inventory_slots,
  (select count(*) from yy_jianyue_updated_orders) as updated_orders;

commit;
