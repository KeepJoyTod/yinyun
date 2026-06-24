-- 影约云渠道联动迁移：抖音来客库存槽与渠道长报文字段
-- 用于已初始化过的 MySQL 环境；全量建库脚本后续单独整理。

alter table yy_channel_order_mapping
    modify raw_payload longtext null comment '原始报文';

alter table yy_channel_sync_log
    modify error_message longtext null comment '错误信息';

set @yy_add_external_poi_id = (
    select if(
        count(*) = 0,
        'alter table yy_channel_product_mapping add column external_poi_id varchar(128) default '''' comment ''外部门店POI''',
        'select 1'
    )
    from information_schema.columns
    where table_schema = database()
      and table_name = 'yy_channel_product_mapping'
      and column_name = 'external_poi_id'
);
prepare stmt from @yy_add_external_poi_id;
execute stmt;
deallocate prepare stmt;

set @yy_add_landing_url = (
    select if(
        count(*) = 0,
        'alter table yy_channel_product_mapping add column landing_url varchar(500) default '''' comment ''真实下单入口链接''',
        'select 1'
    )
    from information_schema.columns
    where table_schema = database()
      and table_name = 'yy_channel_product_mapping'
      and column_name = 'landing_url'
);
prepare stmt from @yy_add_landing_url;
execute stmt;
deallocate prepare stmt;

set @yy_add_landing_path = (
    select if(
        count(*) = 0,
        'alter table yy_channel_product_mapping add column landing_path varchar(500) default '''' comment ''小程序/抖音路径''',
        'select 1'
    )
    from information_schema.columns
    where table_schema = database()
      and table_name = 'yy_channel_product_mapping'
      and column_name = 'landing_path'
);
prepare stmt from @yy_add_landing_path;
execute stmt;
deallocate prepare stmt;

create table if not exists yy_channel_inventory_slot (
    id              bigint(20)   not null                   comment '主键',
    tenant_id       varchar(20)  default '000000'           comment '租户编号',
    store_id        bigint(20)   default null               comment '门店ID',
    channel_type    varchar(32)  not null                   comment '渠道类型',
    account_id      varchar(128) default ''                 comment '外部商家账号ID',
    poi_id          varchar(128) default ''                 comment '外部门店POI',
    sku_id          varchar(128) default ''                 comment '外部SKU',
    sku_out_id      varchar(128) default ''                 comment '外部三方SKU',
    biz_date        varchar(16)  default ''                 comment '库存日期',
    start_time      varchar(16)  default ''                 comment '开始时间',
    end_time        varchar(16)  default ''                 comment '结束时间',
    available_stock int          default 0                  comment '可用库存',
    sync_status     varchar(32)  default 'PENDING'          comment '同步状态',
    last_log_id     varchar(128) default ''                 comment '最近logid',
    raw_payload     longtext                                comment '原始报文',
    create_dept     bigint(20)   default null               comment '创建部门',
    create_by       bigint(20)   default null               comment '创建者',
    create_time     datetime                               comment '创建时间',
    update_by       bigint(20)   default null               comment '更新者',
    update_time     datetime                               comment '更新时间',
    del_flag        char(1)      default '0'                comment '删除标志',
    remark          varchar(500) default null               comment '备注',
    primary key (id),
    key idx_yy_channel_inventory_slot (tenant_id, channel_type, poi_id, sku_id, sku_out_id, biz_date, start_time)
) engine=innodb comment='影约云渠道预约库存槽';

insert into sys_menu
(menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select
6310, '抖音来客', 6200, 10, 'channel-life', 'yy/channel/life/index', '', 1, 0, 'C', '0', '0', 'yy:channel:life', 'briefcase', 103, 1, sysdate(), null, null, '抖音来客生活服务团购订单'
where not exists (
    select 1 from sys_menu where path = 'channel-life' or perms = 'yy:channel:life'
);
