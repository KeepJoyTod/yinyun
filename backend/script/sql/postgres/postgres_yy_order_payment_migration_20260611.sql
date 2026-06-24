-- 影约云订单支付结构迁移
-- 目标：
-- 1. yy_order 继续作为统一订单/预约主账本，补齐渠道、金额和支付状态字段。
-- 2. yy_payment_record 预留给 DOUYIN_MINI_APP tt.pay、微信支付等自建支付流水。
-- 3. DOUYIN_LIFE 抖音来客 P0 仍以抖音侧支付结果 + yy_channel_order_mapping 幂等落库为准。

alter table yy_order
    add column if not exists channel_type varchar(32) default '';

alter table yy_order
    add column if not exists total_amount_cent bigint default 0;

alter table yy_order
    add column if not exists paid_amount_cent bigint default 0;

alter table yy_order
    add column if not exists pay_status varchar(32) default 'UNPAID';

alter table yy_order
    add column if not exists paid_time timestamp;

alter table yy_order
    add column if not exists refund_status varchar(32) default '';

alter table yy_order
    add column if not exists refund_amount_cent bigint default 0;

alter table yy_order
    add column if not exists external_product_id varchar(128) default '';

alter table yy_order
    add column if not exists external_sku_id varchar(128) default '';

alter table yy_order
    add column if not exists external_poi_id varchar(128) default '';

alter table yy_order
    add column if not exists service_group_id bigint default null;

alter table yy_order
    add column if not exists inventory_slot_id bigint default null;

alter table yy_order
    add column if not exists slot_date varchar(16) default '';

alter table yy_order
    add column if not exists slot_start_time varchar(16) default '';

alter table yy_order
    add column if not exists slot_end_time varchar(16) default '';

alter table yy_order
    add column if not exists inventory_status varchar(32) default '';

alter table yy_order
    add column if not exists conflict_reason varchar(255) default '';

create index if not exists idx_yy_order_channel_payment
    on yy_order (tenant_id, channel_type, pay_status, paid_time);

create index if not exists idx_yy_order_external_product
    on yy_order (tenant_id, channel_type, external_product_id, external_sku_id);

create index if not exists idx_yy_order_slot_inventory
    on yy_order (tenant_id, store_id, service_group_id, slot_date, slot_start_time, inventory_status);

create table if not exists yy_payment_record (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    order_id bigint not null,
    channel_type varchar(32) not null,
    provider varchar(32) not null,
    out_trade_no varchar(128) not null,
    platform_order_id varchar(128) default '',
    transaction_id varchar(128) default '',
    amount_cent bigint not null default 0,
    paid_amount_cent bigint default 0,
    currency varchar(16) default 'CNY',
    pay_status varchar(32) default 'PENDING',
    paid_time timestamp,
    notify_time timestamp,
    close_time timestamp,
    refund_status varchar(32) default '',
    refund_amount_cent bigint default 0,
    raw_payload text,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create unique index if not exists uk_yy_payment_record_out_trade_no
    on yy_payment_record (tenant_id, channel_type, out_trade_no)
    where del_flag = '0';

create index if not exists idx_yy_payment_record_order
    on yy_payment_record (tenant_id, order_id, pay_status);

create index if not exists idx_yy_payment_record_platform
    on yy_payment_record (tenant_id, channel_type, platform_order_id);

create table if not exists yy_booking_slot_inventory (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint not null,
    service_group_id bigint default null,
    external_sku_id varchar(128) default '',
    biz_date varchar(16) not null,
    start_time varchar(16) not null,
    end_time varchar(16) not null,
    capacity int default 1,
    paid_count int default 0,
    conflict_count int default 0,
    status varchar(32) default 'ACTIVE',
    version int default 0,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create unique index if not exists uk_yy_booking_slot_inventory_key
    on yy_booking_slot_inventory (tenant_id, store_id, coalesce(service_group_id, 0), coalesce(external_sku_id, ''), biz_date, start_time, end_time)
    where del_flag = '0';

create index if not exists idx_yy_booking_slot_inventory_query
    on yy_booking_slot_inventory (tenant_id, store_id, biz_date, start_time, status);

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
values
(6290, '库存账本', 6200, 17, 'booking-inventory', 'yy/booking-inventory/index', '', 1, 0, 'C', '0', '0', 'yy:bookingInventory:list', 'calendar', 103, 1, now(), null, null, '支付后扣减的全渠道预约时段库存')
on conflict (menu_id) do nothing;

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
values
(6291, '库存账本查询', 6290, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingInventory:list', '#', 103, 1, now(), null, null, '库存账本查询'),
(6292, '库存账本详情', 6290, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingInventory:query', '#', 103, 1, now(), null, null, '库存账本详情'),
(6293, '库存账本修改', 6290, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingInventory:edit', '#', 103, 1, now(), null, null, '库存账本修改'),
(6294, '库存账本导出', 6290, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingInventory:export', '#', 103, 1, now(), null, null, '库存账本导出')
on conflict (menu_id) do nothing;
