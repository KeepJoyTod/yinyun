-- 影约云渠道联动迁移：抖音来客库存槽与渠道长报文字段
-- 用于已初始化过的 PostgreSQL 环境；全量建库脚本后续单独整理。

alter table yy_channel_order_mapping
    alter column raw_payload type text using raw_payload::text;

alter table yy_channel_sync_log
    alter column error_message type text;

alter table yy_channel_product_mapping
    add column if not exists external_poi_id varchar(128) default '';

alter table yy_channel_product_mapping
    add column if not exists landing_url varchar(500) default '';

alter table yy_channel_product_mapping
    add column if not exists landing_path varchar(500) default '';

create table if not exists yy_channel_inventory_slot (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    channel_type varchar(32) not null,
    account_id varchar(128) default '',
    poi_id varchar(128) default '',
    sku_id varchar(128) default '',
    sku_out_id varchar(128) default '',
    biz_date varchar(16) default '',
    start_time varchar(16) default '',
    end_time varchar(16) default '',
    available_stock int default 0,
    sync_status varchar(32) default 'PENDING',
    last_log_id varchar(128) default '',
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

create index if not exists idx_yy_channel_inventory_slot
    on yy_channel_inventory_slot (tenant_id, channel_type, poi_id, sku_id, sku_out_id, biz_date, start_time);

insert into sys_menu
(menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select
6310, '抖音来客', 6200, 10, 'channel-life', 'yy/channel/life/index', '', 1, 0, 'C', '0', '0', 'yy:channel:life', 'briefcase', 103, 1, now(), null, null, '抖音来客生活服务团购订单'
where not exists (
    select 1 from sys_menu where path = 'channel-life' or perms = 'yy:channel:life'
);
