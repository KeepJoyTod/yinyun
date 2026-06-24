-- 影约云后台运营 CRUD 迁移
-- 用于已初始化过的 PostgreSQL 环境；全量建库脚本后续单独整理。

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

create index if not exists idx_yy_schedule_rule
    on yy_schedule_rule (tenant_id, store_id, service_group_id, weekday);

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

create index if not exists idx_yy_notice_log
    on yy_notification_log (tenant_id, channel_type, send_status, create_time);

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

create index if not exists idx_yy_report_snapshot
    on yy_report_snapshot (tenant_id, store_id, report_date, report_type);

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
select 6320, '预约配置', 6200, 11, 'booking-config', 'yy/booking-config/index', '', 1, 0, 'C', '0', '0', 'yy:bookingConfig:list', 'date', 103, 1, now(), null, null, '服务组与预约时段规则'
where not exists (select 1 from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6321, '员工管理', 6200, 12, 'employee', 'yy/employee/index', '', 1, 0, 'C', '0', '0', 'yy:employee:list', 'peoples', 103, 1, now(), null, null, '员工台账与门店岗位'
where not exists (select 1 from sys_menu where path = 'employee' or perms = 'yy:employee:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6322, '客户管理', 6200, 13, 'customer', 'yy/customer/index', '', 1, 0, 'C', '0', '0', 'yy:customer:list', 'user', 103, 1, now(), null, null, '客户档案与消费记录'
where not exists (select 1 from sys_menu where path = 'customer' or perms = 'yy:customer:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6323, '通知中心', 6200, 14, 'notification', 'yy/notification/index', '', 1, 0, 'C', '0', '0', 'yy:notification:list', 'message', 103, 1, now(), null, null, '通知模板与发送日志'
where not exists (select 1 from sys_menu where path = 'notification' or perms = 'yy:notification:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6324, '经营报表', 6200, 15, 'report', 'yy/report/index', '', 1, 0, 'C', '0', '0', 'yy:report:list', 'chart', 103, 1, now(), null, null, '门店、渠道、选片经营报表'
where not exists (select 1 from sys_menu where path = 'report' or perms = 'yy:report:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6325, '多端预约', 6200, 16, 'mobile', 'yy/mobile/index', '', 1, 0, 'C', '0', '0', 'yy:mobile:list', 'phone', 103, 1, now(), null, null, 'H5、小程序、App 预约入口配置'
where not exists (select 1 from sys_menu where path = 'mobile' or perms = 'yy:mobile:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6330, '预约配置详情', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:query', '#', 103, 1, now(), null, null, '预约配置详情'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6331, '预约配置新增', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:add', '#', 103, 1, now(), null, null, '预约配置新增'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6332, '预约配置修改', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:edit', '#', 103, 1, now(), null, null, '预约配置修改'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6333, '预约配置删除', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:remove', '#', 103, 1, now(), null, null, '预约配置删除'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6334, '预约配置导出', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:export', '#', 103, 1, now(), null, null, '预约配置导出'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6335, '员工详情', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:query', '#', 103, 1, now(), null, null, '员工详情'
where not exists (select 1 from sys_menu where perms = 'yy:employee:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6336, '员工新增', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:add', '#', 103, 1, now(), null, null, '员工新增'
where not exists (select 1 from sys_menu where perms = 'yy:employee:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6337, '员工修改', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:edit', '#', 103, 1, now(), null, null, '员工修改'
where not exists (select 1 from sys_menu where perms = 'yy:employee:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6338, '员工删除', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:remove', '#', 103, 1, now(), null, null, '员工删除'
where not exists (select 1 from sys_menu where perms = 'yy:employee:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6339, '员工导出', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:export', '#', 103, 1, now(), null, null, '员工导出'
where not exists (select 1 from sys_menu where perms = 'yy:employee:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6340, '客户详情', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:query', '#', 103, 1, now(), null, null, '客户详情'
where not exists (select 1 from sys_menu where perms = 'yy:customer:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6341, '客户新增', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:add', '#', 103, 1, now(), null, null, '客户新增'
where not exists (select 1 from sys_menu where perms = 'yy:customer:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6342, '客户修改', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:edit', '#', 103, 1, now(), null, null, '客户修改'
where not exists (select 1 from sys_menu where perms = 'yy:customer:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6343, '客户删除', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:remove', '#', 103, 1, now(), null, null, '客户删除'
where not exists (select 1 from sys_menu where perms = 'yy:customer:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6344, '客户导出', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:export', '#', 103, 1, now(), null, null, '客户导出'
where not exists (select 1 from sys_menu where perms = 'yy:customer:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6345, '通知详情', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:query', '#', 103, 1, now(), null, null, '通知详情'
where not exists (select 1 from sys_menu where perms = 'yy:notification:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6346, '通知新增', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:add', '#', 103, 1, now(), null, null, '通知新增'
where not exists (select 1 from sys_menu where perms = 'yy:notification:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6347, '通知修改', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:edit', '#', 103, 1, now(), null, null, '通知修改'
where not exists (select 1 from sys_menu where perms = 'yy:notification:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6348, '通知删除', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:remove', '#', 103, 1, now(), null, null, '通知删除'
where not exists (select 1 from sys_menu where perms = 'yy:notification:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6349, '通知导出', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:export', '#', 103, 1, now(), null, null, '通知导出'
where not exists (select 1 from sys_menu where perms = 'yy:notification:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6350, '报表详情', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:query', '#', 103, 1, now(), null, null, '报表详情'
where not exists (select 1 from sys_menu where perms = 'yy:report:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6351, '报表新增', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:add', '#', 103, 1, now(), null, null, '报表新增'
where not exists (select 1 from sys_menu where perms = 'yy:report:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6352, '报表修改', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:edit', '#', 103, 1, now(), null, null, '报表修改'
where not exists (select 1 from sys_menu where perms = 'yy:report:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6353, '报表删除', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:remove', '#', 103, 1, now(), null, null, '报表删除'
where not exists (select 1 from sys_menu where perms = 'yy:report:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6354, '报表导出', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:export', '#', 103, 1, now(), null, null, '报表导出'
where not exists (select 1 from sys_menu where perms = 'yy:report:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6355, '多端配置详情', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:query', '#', 103, 1, now(), null, null, '多端配置详情'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6356, '多端配置新增', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:add', '#', 103, 1, now(), null, null, '多端配置新增'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6357, '多端配置修改', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:edit', '#', 103, 1, now(), null, null, '多端配置修改'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6358, '多端配置删除', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:remove', '#', 103, 1, now(), null, null, '多端配置删除'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6359, '多端配置导出', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:export', '#', 103, 1, now(), null, null, '多端配置导出'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:export');
