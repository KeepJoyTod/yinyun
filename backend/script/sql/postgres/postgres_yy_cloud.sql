-- 影约云业务表与菜单 PostgreSQL 脚本

create table if not exists yy_store (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_code varchar(64) not null,
    store_name varchar(128) not null,
    status char(1) default '0',
    phone varchar(32) default '',
    address varchar(255) default '',
    business_hours varchar(128) default '',
    sort int default 0,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, store_code)
);

create table if not exists yy_product (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    product_type varchar(32) not null,
    product_name varchar(128) not null,
    price numeric(10,2) default 0.00,
    duration_minutes int default 0,
    selection_price numeric(10,2) default 0.00,
    album_product_name varchar(128) default '',
    status char(1) default '0',
    sort int default 0,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_order (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint not null,
    order_no varchar(64) not null,
    customer_name varchar(64) default '',
    customer_phone varchar(32) default '',
    source varchar(32) default 'LOCAL',
    booking_method varchar(32) default 'MANUAL',
    order_time timestamp,
    arrival_time timestamp,
    status varchar(32) default 'PENDING',
    workstation_no varchar(32) default '',
    external_order_id varchar(128) default '',
    channel_type varchar(32) default '',
    total_amount_cent bigint default 0,
    paid_amount_cent bigint default 0,
    pay_status varchar(32) default 'UNPAID',
    paid_time timestamp,
    refund_status varchar(32) default '',
    refund_amount_cent bigint default 0,
    external_product_id varchar(128) default '',
    external_sku_id varchar(128) default '',
    external_poi_id varchar(128) default '',
    service_group_id bigint default null,
    inventory_slot_id bigint default null,
    slot_date varchar(16) default '',
    slot_start_time varchar(16) default '',
    slot_end_time varchar(16) default '',
    inventory_status varchar(32) default '',
    conflict_reason varchar(255) default '',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, order_no)
);

create table if not exists yy_photo_album (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint not null,
    order_id bigint default null,
    album_name varchar(128) not null,
    customer_name varchar(64) default '',
    customer_phone varchar(32) default '',
    public_token varchar(128) default '',
    access_code varchar(128) default '',
    channel_type varchar(32) default 'H5',
    status varchar(32) default 'ACTIVE',
    selection_status varchar(32) default 'DRAFT',
    douyin_order_id varchar(128) default '',
    certificate_code varchar(128) default '',
    book_id varchar(128) default '',
    expire_time timestamp,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_photo_asset (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint not null,
    album_id bigint not null,
    file_name varchar(255) not null,
    file_url varchar(500) not null,
    object_key varchar(500) default '',
    thumbnail_object_key varchar(500) default '',
    sort int default 0,
    is_selected char(1) default '0',
    visible char(1) default '1',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    constraint ck_yy_photo_asset_visible_object_key check (del_flag = '1' or visible <> '1' or btrim(coalesce(object_key, '')) <> '')
);

create unique index if not exists uk_yy_photo_asset_album_object_key_active
    on yy_photo_asset (tenant_id, album_id, object_key)
    where del_flag = '0' and object_key is not null and btrim(object_key) <> '';

create table if not exists yy_photo_access_log (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    album_id bigint default null,
    asset_id bigint default null,
    customer_phone varchar(32) default '',
    platform varchar(32) default 'H5',
    action varchar(64) default '',
    ip varchar(64) default '',
    success char(1) default '1',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_photo_verify_code (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    phone varchar(32) default '',
    verify_code varchar(16) default '',
    scene varchar(32) default 'PHOTO_PICKUP',
    platform varchar(32) default 'H5',
    expire_time timestamp,
    used_time timestamp,
    status varchar(32) default 'CREATED',
    ip varchar(64) default '',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_channel_plugin (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    channel_type varchar(32) not null,
    plugin_name varchar(128) not null,
    enabled char(1) default '0',
    auth_status varchar(32) default 'UNOPENED',
    open_tip varchar(255) default '',
    last_sync_time timestamp,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, channel_type)
);

create table if not exists yy_channel_account (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    channel_type varchar(32) not null,
    account_name varchar(128) default '',
    app_key varchar(128) default '',
    app_secret_enc varchar(500) default '',
    service_id varchar(128) default '',
    service_mode_id varchar(128) default '',
    service_market_app_id varchar(128) default '',
    service_market_path varchar(500) default '',
    test_open_id varchar(128) default '',
    webhook_url varchar(500) default '',
    access_token_enc varchar(500) default '',
    refresh_token_enc varchar(500) default '',
    expires_at timestamp,
    status varchar(32) default 'UNAUTHORIZED',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_channel_product_mapping (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    product_id bigint not null,
    channel_type varchar(32) not null,
    external_product_id varchar(128) default '',
    external_sku_id varchar(128) default '',
    external_poi_id varchar(128) default '',
    landing_url varchar(500) default '',
    landing_path varchar(500) default '',
    external_name varchar(255) default '',
    mapping_status varchar(32) default 'UNMAPPED',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_channel_order_mapping (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    order_id bigint default null,
    channel_type varchar(32) not null,
    external_order_id varchar(128) not null,
    external_status varchar(64) default '',
    sync_status varchar(32) default 'PENDING',
    raw_payload text,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, channel_type, external_order_id)
);

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

create table if not exists yy_channel_sync_log (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    channel_type varchar(32) not null,
    api_name varchar(128) not null,
    request_id varchar(128) default '',
    success char(1) default '0',
    error_message text default '',
    duration_ms bigint default 0,
    retryable char(1) default '0',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_channel_event_inbox (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    channel_type varchar(32) not null,
    event_type varchar(96) not null,
    event_id varchar(128) not null,
    external_order_id varchar(128) default '',
    request_id varchar(128) default '',
    signature_valid char(1) default '0',
    process_status varchar(32) default 'RECEIVED',
    retry_count int default 0,
    next_retry_time timestamp,
    raw_payload text,
    error_message varchar(1000) default '',
    processed_time timestamp,
    remark varchar(1000) default '',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    primary key (id)
);

create unique index if not exists uk_yy_channel_event_inbox_event
    on yy_channel_event_inbox (tenant_id, channel_type, event_type, event_id)
    where del_flag = '0';

create index if not exists idx_yy_channel_event_inbox_order
    on yy_channel_event_inbox (tenant_id, channel_type, external_order_id)
    where del_flag = '0';

create index if not exists idx_yy_channel_event_inbox_status
    on yy_channel_event_inbox (tenant_id, channel_type, process_status, create_time)
    where del_flag = '0';

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

create table if not exists yy_service_group (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint not null,
    group_code varchar(64) not null,
    group_name varchar(128) not null,
    capacity int default 1,
    duration_minutes int default 30,
    status char(1) default '0',
    sort int default 0,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, store_id, group_code)
);

create table if not exists yy_schedule_rule (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint not null,
    service_group_id bigint not null,
    weekday int not null,
    start_time varchar(16) not null,
    end_time varchar(16) not null,
    capacity int default 1,
    enabled char(1) default '1',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_employee (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint not null,
    user_id bigint default null,
    employee_no varchar(64) not null,
    employee_name varchar(64) not null,
    mobile varchar(32) default '',
    role_type varchar(32) default 'STAFF',
    skill_tags varchar(255) default '',
    status char(1) default '0',
    sort int default 0,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, employee_no)
);

create table if not exists yy_customer (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    customer_name varchar(64) not null,
    mobile varchar(32) not null,
    gender char(1) default '0',
    birthday date,
    source varchar(32) default 'LOCAL',
    member_level varchar(32) default 'NORMAL',
    total_order_count int default 0,
    total_spend numeric(12,2) default 0.00,
    last_order_time timestamp,
    tags varchar(255) default '',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, mobile)
);

create table if not exists yy_notification_template (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    template_code varchar(64) not null,
    scene varchar(64) not null,
    channel_type varchar(32) not null,
    title varchar(128) default '',
    content varchar(1000) not null,
    provider_template_id varchar(128) default '',
    enabled char(1) default '1',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, template_code)
);

create table if not exists yy_notification_log (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    order_id bigint default null,
    customer_id bigint default null,
    template_id bigint default null,
    channel_type varchar(32) not null,
    receiver varchar(128) not null,
    send_status varchar(32) default 'PENDING',
    request_id varchar(128) default '',
    error_message text default '',
    sent_time timestamp,
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

create table if not exists yy_report_snapshot (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint default null,
    report_date date not null,
    report_type varchar(32) default 'DAILY',
    order_total int default 0,
    arrived_total int default 0,
    completed_total int default 0,
    revenue_total numeric(12,2) default 0.00,
    selection_total numeric(12,2) default 0.00,
    source_summary jsonb,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id)
);

create table if not exists yy_mobile_channel_config (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    channel_type varchar(32) not null,
    channel_name varchar(128) not null,
    app_id varchar(128) default '',
    app_secret_enc varchar(500) default '',
    callback_url varchar(500) default '',
    enabled char(1) default '0',
    sdk_status varchar(32) default 'PENDING',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, channel_type)
);

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
values
(6200, '影约云', 0, 6, 'yy', null, '', 1, 0, 'M', '0', '0', null, 'dashboard', 103, 1, now(), null, null, '影约云业务目录'),
(6201, '预约概况', 6200, 1, 'dashboard', 'yy/dashboard/index', '', 1, 0, 'C', '0', '0', 'yy:dashboard:list', 'chart', 103, 1, now(), null, null, '预约概况'),
(6202, '预约订单', 6200, 2, 'order', 'yy/order/index', '', 1, 0, 'C', '0', '0', 'yy:order:list', 'list', 103, 1, now(), null, null, '预约订单列表'),
(6203, '门店管理', 6200, 3, 'store', 'yy/store/index', '', 1, 0, 'C', '0', '0', 'yy:store:list', 'build', 103, 1, now(), null, null, '门店管理'),
(6204, '产品管理', 6200, 4, 'product', 'yy/product/index', '', 1, 0, 'C', '0', '0', 'yy:product:list', 'shopping', 103, 1, now(), null, null, '产品与选片配置'),
(6205, '客片选片', 6200, 5, 'photo', 'yy/photo/index', '', 1, 0, 'C', '0', '0', 'yy:photo:list', 'image', 103, 1, now(), null, null, '客片与底片列表'),
(6206, '渠道插件', 6200, 6, 'channel', 'yy/channel/index', '', 1, 0, 'C', '0', '0', 'yy:channel:list', 'link', 103, 1, now(), null, null, '渠道插件总览'),
(6207, '抖音产品', 6200, 7, 'channel-douyin', 'yy/channel/douyin/index', '', 1, 0, 'C', '0', '0', 'yy:channel:douyin', 'guide', 103, 1, now(), null, null, '抖音产品插件'),
(6208, '美团产品', 6200, 8, 'channel-meituan', 'yy/channel/meituan/index', '', 1, 0, 'C', '0', '0', 'yy:channel:meituan', 'guide', 103, 1, now(), null, null, '美团产品插件'),
(6209, '微信生态', 6200, 9, 'wechat', 'yy/wechat/index', '', 1, 0, 'C', '0', '0', 'yy:wechat:list', 'message', 103, 1, now(), null, null, '微信公众号、小程序、支付、企微客户联系'),
(6260, '抖音来客', 6200, 10, 'channel-life', 'yy/channel/life/index', '', 1, 0, 'C', '0', '0', 'yy:channel:life', 'briefcase', 103, 1, now(), null, null, '抖音来客生活服务团购订单'),
(6250, '企业结构', 6200, 10, 'enterprise', 'yy/enterprise/index', '', 1, 0, 'C', '0', '0', 'yy:enterprise:list', 'tree', 103, 1, now(), null, null, '企业版模块结构总览'),
(6251, '预约配置', 6200, 11, 'booking-config', 'yy/booking-config/index', '', 1, 0, 'C', '0', '0', 'yy:bookingConfig:list', 'date', 103, 1, now(), null, null, '服务组与预约时段规则'),
(6252, '员工管理', 6200, 12, 'employee', 'yy/employee/index', '', 1, 0, 'C', '0', '0', 'yy:employee:list', 'peoples', 103, 1, now(), null, null, '员工台账与门店岗位'),
(6253, '客户管理', 6200, 13, 'customer', 'yy/customer/index', '', 1, 0, 'C', '0', '0', 'yy:customer:list', 'user', 103, 1, now(), null, null, '客户档案与消费记录'),
(6254, '通知中心', 6200, 14, 'notification', 'yy/notification/index', '', 1, 0, 'C', '0', '0', 'yy:notification:list', 'message', 103, 1, now(), null, null, '通知模板与发送日志'),
(6255, '经营报表', 6200, 15, 'report', 'yy/report/index', '', 1, 0, 'C', '0', '0', 'yy:report:list', 'chart', 103, 1, now(), null, null, '门店、渠道、选片经营报表'),
(6256, '多端预约', 6200, 16, 'mobile', 'yy/mobile/index', '', 1, 0, 'C', '0', '0', 'yy:mobile:list', 'phone', 103, 1, now(), null, null, 'H5、小程序、App 预约入口配置'),
(6290, '库存账本', 6200, 17, 'booking-inventory', 'yy/booking-inventory/index', '', 1, 0, 'C', '0', '0', 'yy:bookingInventory:list', 'calendar', 103, 1, now(), null, null, '支付后扣减的全渠道预约时段库存')
on conflict (menu_id) do nothing;

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
values
(6210, '订单查询', 6202, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:order:list', '#', 103, 1, now(), null, null, '订单查询'),
(6211, '订单新增', 6202, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:order:add', '#', 103, 1, now(), null, null, '订单新增'),
(6212, '订单修改', 6202, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:order:edit', '#', 103, 1, now(), null, null, '订单修改'),
(6213, '订单删除', 6202, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:order:remove', '#', 103, 1, now(), null, null, '订单删除'),
(6214, '订单导出', 6202, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:order:export', '#', 103, 1, now(), null, null, '订单导出'),
(6215, '门店查询', 6203, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:store:list', '#', 103, 1, now(), null, null, '门店查询'),
(6216, '门店新增', 6203, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:store:add', '#', 103, 1, now(), null, null, '门店新增'),
(6217, '门店修改', 6203, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:store:edit', '#', 103, 1, now(), null, null, '门店修改'),
(6218, '门店删除', 6203, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:store:remove', '#', 103, 1, now(), null, null, '门店删除'),
(6219, '门店导出', 6203, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:store:export', '#', 103, 1, now(), null, null, '门店导出'),
(6220, '产品查询', 6204, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:product:list', '#', 103, 1, now(), null, null, '产品查询'),
(6221, '产品新增', 6204, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:product:add', '#', 103, 1, now(), null, null, '产品新增'),
(6222, '产品修改', 6204, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:product:edit', '#', 103, 1, now(), null, null, '产品修改'),
(6223, '产品删除', 6204, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:product:remove', '#', 103, 1, now(), null, null, '产品删除'),
(6224, '产品导出', 6204, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:product:export', '#', 103, 1, now(), null, null, '产品导出'),
(6225, '相册查询', 6205, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAlbum:list', '#', 103, 1, now(), null, null, '相册查询'),
(6226, '相册新增', 6205, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAlbum:add', '#', 103, 1, now(), null, null, '相册新增'),
(6227, '相册修改', 6205, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAlbum:edit', '#', 103, 1, now(), null, null, '相册修改'),
(6228, '相册删除', 6205, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAlbum:remove', '#', 103, 1, now(), null, null, '相册删除'),
(6229, '相册导出', 6205, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAlbum:export', '#', 103, 1, now(), null, null, '相册导出'),
(6230, '底片查询', 6205, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAsset:list', '#', 103, 1, now(), null, null, '底片查询'),
(6231, '底片新增', 6205, 7, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAsset:add', '#', 103, 1, now(), null, null, '底片新增'),
(6232, '底片修改', 6205, 8, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAsset:edit', '#', 103, 1, now(), null, null, '底片修改'),
(6233, '底片删除', 6205, 9, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAsset:remove', '#', 103, 1, now(), null, null, '底片删除'),
(6234, '底片导出', 6205, 10, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAsset:export', '#', 103, 1, now(), null, null, '底片导出'),
(6235, '插件查询', 6206, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelPlugin:list', '#', 103, 1, now(), null, null, '插件查询'),
(6236, '插件新增', 6206, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelPlugin:add', '#', 103, 1, now(), null, null, '插件新增'),
(6237, '插件修改', 6206, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelPlugin:edit', '#', 103, 1, now(), null, null, '插件修改'),
(6238, '插件删除', 6206, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelPlugin:remove', '#', 103, 1, now(), null, null, '插件删除'),
(6239, '插件导出', 6206, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelPlugin:export', '#', 103, 1, now(), null, null, '插件导出'),
(6240, '账号查询', 6206, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelAccount:list', '#', 103, 1, now(), null, null, '账号查询'),
(6241, '账号新增', 6206, 7, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelAccount:add', '#', 103, 1, now(), null, null, '账号新增'),
(6242, '账号修改', 6206, 8, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelAccount:edit', '#', 103, 1, now(), null, null, '账号修改'),
(6243, '账号删除', 6206, 9, '#', '', '', 1, 0, 'F', '0', '0', 'yy:channelAccount:remove', '#', 103, 1, now(), null, null, '账号删除'),
(6244, '微信生态查询', 6209, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:wechat:list', '#', 103, 1, now(), null, null, '微信生态查询'),
(6245, '微信通知发送', 6209, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:wechat:send', '#', 103, 1, now(), null, null, '微信通知测试发送'),
(6257, '企业结构查询', 6250, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:enterprise:list', '#', 103, 1, now(), null, null, '企业结构查询'),
(6258, '预约配置查询', 6251, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:list', '#', 103, 1, now(), null, null, '预约配置查询'),
(6259, '员工查询', 6252, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:list', '#', 103, 1, now(), null, null, '员工查询'),
(6270, '预约配置详情', 6251, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:query', '#', 103, 1, now(), null, null, '预约配置详情'),
(6271, '预约配置新增', 6251, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:add', '#', 103, 1, now(), null, null, '预约配置新增'),
(6272, '预约配置修改', 6251, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:edit', '#', 103, 1, now(), null, null, '预约配置修改'),
(6273, '预约配置删除', 6251, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:remove', '#', 103, 1, now(), null, null, '预约配置删除'),
(6274, '预约配置导出', 6251, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:export', '#', 103, 1, now(), null, null, '预约配置导出'),
(6291, '库存账本查询', 6290, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingInventory:list', '#', 103, 1, now(), null, null, '库存账本查询'),
(6292, '库存账本详情', 6290, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingInventory:query', '#', 103, 1, now(), null, null, '库存账本详情'),
(6293, '库存账本修改', 6290, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingInventory:edit', '#', 103, 1, now(), null, null, '库存账本修改'),
(6294, '库存账本导出', 6290, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingInventory:export', '#', 103, 1, now(), null, null, '库存账本导出'),
(6275, '员工详情', 6252, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:query', '#', 103, 1, now(), null, null, '员工详情'),
(6276, '员工新增', 6252, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:add', '#', 103, 1, now(), null, null, '员工新增'),
(6277, '员工修改', 6252, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:edit', '#', 103, 1, now(), null, null, '员工修改'),
(6278, '员工删除', 6252, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:remove', '#', 103, 1, now(), null, null, '员工删除'),
(6279, '员工导出', 6252, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:export', '#', 103, 1, now(), null, null, '员工导出'),
(6264, '客户查询', 6253, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:list', '#', 103, 1, now(), null, null, '客户查询'),
(6265, '客户详情', 6253, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:query', '#', 103, 1, now(), null, null, '客户详情'),
(6266, '客户新增', 6253, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:add', '#', 103, 1, now(), null, null, '客户新增'),
(6267, '客户修改', 6253, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:edit', '#', 103, 1, now(), null, null, '客户修改'),
(6268, '客户删除', 6253, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:remove', '#', 103, 1, now(), null, null, '客户删除'),
(6269, '客户导出', 6253, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:export', '#', 103, 1, now(), null, null, '客户导出'),
(6261, '通知查询', 6254, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:list', '#', 103, 1, now(), null, null, '通知查询'),
(6280, '通知详情', 6254, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:query', '#', 103, 1, now(), null, null, '通知详情'),
(6281, '通知新增', 6254, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:add', '#', 103, 1, now(), null, null, '通知新增'),
(6282, '通知修改', 6254, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:edit', '#', 103, 1, now(), null, null, '通知修改'),
(6283, '通知删除', 6254, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:remove', '#', 103, 1, now(), null, null, '通知删除'),
(6284, '通知导出', 6254, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:export', '#', 103, 1, now(), null, null, '通知导出'),
(6262, '报表查询', 6255, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:list', '#', 103, 1, now(), null, null, '报表查询'),
(6285, '报表详情', 6255, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:query', '#', 103, 1, now(), null, null, '报表详情'),
(6286, '报表新增', 6255, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:add', '#', 103, 1, now(), null, null, '报表新增'),
(6287, '报表修改', 6255, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:edit', '#', 103, 1, now(), null, null, '报表修改'),
(6288, '报表删除', 6255, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:remove', '#', 103, 1, now(), null, null, '报表删除'),
(6289, '报表导出', 6255, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:export', '#', 103, 1, now(), null, null, '报表导出'),
(6263, '多端配置查询', 6256, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:list', '#', 103, 1, now(), null, null, '多端配置查询'),
(6290, '多端配置详情', 6256, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:query', '#', 103, 1, now(), null, null, '多端配置详情'),
(6291, '多端配置新增', 6256, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:add', '#', 103, 1, now(), null, null, '多端配置新增'),
(6292, '多端配置修改', 6256, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:edit', '#', 103, 1, now(), null, null, '多端配置修改'),
(6293, '多端配置删除', 6256, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:remove', '#', 103, 1, now(), null, null, '多端配置删除'),
(6294, '多端配置导出', 6256, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:export', '#', 103, 1, now(), null, null, '多端配置导出')
on conflict (menu_id) do nothing;
