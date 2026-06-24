-- 影约云后台运营 CRUD 迁移
-- 用于已初始化过的 MySQL 环境；全量建库脚本后续单独整理。

create table if not exists yy_service_group (
    id               bigint(20)   not null                   comment '主键',
    tenant_id        varchar(20)  default '000000'           comment '租户编号',
    store_id         bigint(20)   not null                   comment '门店ID',
    group_code       varchar(64)  not null                   comment '服务组编码',
    group_name       varchar(128) not null                   comment '服务组名称',
    capacity         int          default 1                  comment '默认容量',
    duration_minutes int          default 30                 comment '默认时长',
    status           char(1)      default '0'                comment '状态',
    sort             int          default 0                  comment '排序',
    create_dept      bigint(20)   default null               comment '创建部门',
    create_by        bigint(20)   default null               comment '创建者',
    create_time      datetime                               comment '创建时间',
    update_by        bigint(20)   default null               comment '更新者',
    update_time      datetime                               comment '更新时间',
    del_flag         char(1)      default '0'                comment '删除标志',
    remark           varchar(500) default null               comment '备注',
    primary key (id),
    unique key uk_yy_service_group (tenant_id, store_id, group_code)
) engine=innodb comment='影约云服务组';

create table if not exists yy_schedule_rule (
    id               bigint(20)   not null                   comment '主键',
    tenant_id        varchar(20)  default '000000'           comment '租户编号',
    store_id         bigint(20)   not null                   comment '门店ID',
    service_group_id bigint(20)   not null                   comment '服务组ID',
    weekday          int          not null                   comment '星期几',
    start_time       varchar(16)  not null                   comment '开始时间',
    end_time         varchar(16)  not null                   comment '结束时间',
    capacity         int          default 1                  comment '容量',
    enabled          char(1)      default '1'                comment '是否启用',
    create_dept      bigint(20)   default null               comment '创建部门',
    create_by        bigint(20)   default null               comment '创建者',
    create_time      datetime                               comment '创建时间',
    update_by        bigint(20)   default null               comment '更新者',
    update_time      datetime                               comment '更新时间',
    del_flag         char(1)      default '0'                comment '删除标志',
    remark           varchar(500) default null               comment '备注',
    primary key (id),
    key idx_yy_schedule_rule (tenant_id, store_id, service_group_id, weekday)
) engine=innodb comment='影约云预约排期规则';

create table if not exists yy_employee (
    id            bigint(20)   not null                      comment '主键',
    tenant_id     varchar(20)  default '000000'              comment '租户编号',
    store_id      bigint(20)   not null                      comment '门店ID',
    user_id       bigint(20)   default null                  comment '系统用户ID',
    employee_no   varchar(64)  not null                      comment '员工编号',
    employee_name varchar(64)  not null                      comment '员工姓名',
    mobile        varchar(32)  default ''                    comment '手机号',
    role_type     varchar(32)  default 'STAFF'               comment '岗位类型',
    skill_tags    varchar(255) default ''                    comment '技能标签',
    status        char(1)      default '0'                   comment '状态',
    sort          int          default 0                     comment '排序',
    create_dept   bigint(20)   default null                  comment '创建部门',
    create_by     bigint(20)   default null                  comment '创建者',
    create_time   datetime                                  comment '创建时间',
    update_by     bigint(20)   default null                  comment '更新者',
    update_time   datetime                                  comment '更新时间',
    del_flag      char(1)      default '0'                   comment '删除标志',
    remark        varchar(500) default null                  comment '备注',
    primary key (id),
    unique key uk_yy_employee_no (tenant_id, employee_no)
) engine=innodb comment='影约云员工';

create table if not exists yy_customer (
    id                bigint(20)    not null                 comment '主键',
    tenant_id         varchar(20)   default '000000'         comment '租户编号',
    customer_name     varchar(64)   not null                 comment '客户姓名',
    mobile            varchar(32)   not null                 comment '手机号',
    gender            char(1)       default '0'              comment '性别',
    birthday          date                                  comment '生日',
    source            varchar(32)   default 'LOCAL'          comment '来源',
    member_level      varchar(32)   default 'NORMAL'         comment '会员等级',
    total_order_count int           default 0                comment '订单数',
    total_spend       decimal(12,2) default 0.00             comment '累计消费',
    last_order_time   datetime                              comment '最近订单时间',
    tags              varchar(255)  default ''               comment '客户标签',
    create_dept       bigint(20)    default null             comment '创建部门',
    create_by         bigint(20)    default null             comment '创建者',
    create_time       datetime                              comment '创建时间',
    update_by         bigint(20)    default null             comment '更新者',
    update_time       datetime                              comment '更新时间',
    del_flag          char(1)       default '0'              comment '删除标志',
    remark            varchar(500)  default null             comment '备注',
    primary key (id),
    unique key uk_yy_customer_mobile (tenant_id, mobile)
) engine=innodb comment='影约云客户';

create table if not exists yy_notification_template (
    id                   bigint(20)    not null              comment '主键',
    tenant_id            varchar(20)   default '000000'      comment '租户编号',
    template_code        varchar(64)   not null              comment '模板编码',
    scene                varchar(64)   not null              comment '业务场景',
    channel_type         varchar(32)   not null              comment '通知渠道',
    title                varchar(128)  default ''            comment '标题',
    content              varchar(1000) not null              comment '模板内容',
    provider_template_id varchar(128)  default ''            comment '服务商模板ID',
    enabled              char(1)       default '1'           comment '是否启用',
    create_dept          bigint(20)    default null          comment '创建部门',
    create_by            bigint(20)    default null          comment '创建者',
    create_time          datetime                           comment '创建时间',
    update_by            bigint(20)    default null          comment '更新者',
    update_time          datetime                           comment '更新时间',
    del_flag             char(1)       default '0'           comment '删除标志',
    remark               varchar(500)  default null          comment '备注',
    primary key (id),
    unique key uk_yy_notice_template (tenant_id, template_code)
) engine=innodb comment='影约云通知模板';

create table if not exists yy_notification_log (
    id            bigint(20)   not null                      comment '主键',
    tenant_id     varchar(20)  default '000000'              comment '租户编号',
    store_id      bigint(20)   default null                  comment '门店ID',
    order_id      bigint(20)   default null                  comment '订单ID',
    customer_id   bigint(20)   default null                  comment '客户ID',
    template_id   bigint(20)   default null                  comment '模板ID',
    channel_type  varchar(32)  not null                      comment '通知渠道',
    receiver      varchar(128) not null                      comment '接收人',
    send_status   varchar(32)  default 'PENDING'             comment '发送状态',
    request_id    varchar(128) default ''                    comment '请求ID',
    error_message longtext                                   comment '错误信息',
    sent_time     datetime                                  comment '发送时间',
    raw_payload   longtext                                  comment '原始报文',
    create_dept   bigint(20)   default null                  comment '创建部门',
    create_by     bigint(20)   default null                  comment '创建者',
    create_time   datetime                                  comment '创建时间',
    update_by     bigint(20)   default null                  comment '更新者',
    update_time   datetime                                  comment '更新时间',
    del_flag      char(1)      default '0'                   comment '删除标志',
    remark        varchar(500) default null                  comment '备注',
    primary key (id),
    key idx_yy_notice_log (tenant_id, channel_type, send_status, create_time)
) engine=innodb comment='影约云通知日志';

create table if not exists yy_report_snapshot (
    id              bigint(20)    not null                   comment '主键',
    tenant_id       varchar(20)   default '000000'           comment '租户编号',
    store_id        bigint(20)    default null               comment '门店ID',
    report_date     date          not null                   comment '报表日期',
    report_type     varchar(32)   default 'DAILY'            comment '报表类型',
    order_total     int           default 0                  comment '订单数',
    arrived_total   int           default 0                  comment '到店数',
    completed_total int           default 0                  comment '完成数',
    revenue_total   decimal(12,2) default 0.00               comment '收入',
    selection_total decimal(12,2) default 0.00               comment '选片收入',
    source_summary  json                                     comment '来源汇总',
    create_dept     bigint(20)    default null               comment '创建部门',
    create_by       bigint(20)    default null               comment '创建者',
    create_time     datetime                                comment '创建时间',
    update_by       bigint(20)    default null               comment '更新者',
    update_time     datetime                                comment '更新时间',
    del_flag        char(1)       default '0'                comment '删除标志',
    remark          varchar(500)  default null               comment '备注',
    primary key (id),
    key idx_yy_report_snapshot (tenant_id, store_id, report_date, report_type)
) engine=innodb comment='影约云报表快照';

create table if not exists yy_mobile_channel_config (
    id             bigint(20)   not null                     comment '主键',
    tenant_id      varchar(20)  default '000000'             comment '租户编号',
    channel_type   varchar(32)  not null                     comment '端类型',
    channel_name   varchar(128) not null                     comment '端名称',
    app_id         varchar(128) default ''                   comment '应用ID',
    app_secret_enc varchar(500) default ''                   comment '加密应用密钥',
    callback_url   varchar(500) default ''                   comment '回调地址',
    enabled        char(1)      default '0'                  comment '是否启用',
    sdk_status     varchar(32)  default 'PENDING'            comment 'SDK状态',
    create_dept    bigint(20)   default null                 comment '创建部门',
    create_by      bigint(20)   default null                 comment '创建者',
    create_time    datetime                                 comment '创建时间',
    update_by      bigint(20)   default null                 comment '更新者',
    update_time    datetime                                 comment '更新时间',
    del_flag       char(1)      default '0'                  comment '删除标志',
    remark         varchar(500) default null                 comment '备注',
    primary key (id),
    unique key uk_yy_mobile_channel (tenant_id, channel_type)
) engine=innodb comment='影约云多端入口配置';

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6320, '预约配置', 6200, 11, 'booking-config', 'yy/booking-config/index', '', 1, 0, 'C', '0', '0', 'yy:bookingConfig:list', 'date', 103, 1, sysdate(), null, null, '服务组与预约时段规则'
where not exists (select 1 from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6321, '员工管理', 6200, 12, 'employee', 'yy/employee/index', '', 1, 0, 'C', '0', '0', 'yy:employee:list', 'peoples', 103, 1, sysdate(), null, null, '员工台账与门店岗位'
where not exists (select 1 from sys_menu where path = 'employee' or perms = 'yy:employee:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6322, '客户管理', 6200, 13, 'customer', 'yy/customer/index', '', 1, 0, 'C', '0', '0', 'yy:customer:list', 'user', 103, 1, sysdate(), null, null, '客户档案与消费记录'
where not exists (select 1 from sys_menu where path = 'customer' or perms = 'yy:customer:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6323, '通知中心', 6200, 14, 'notification', 'yy/notification/index', '', 1, 0, 'C', '0', '0', 'yy:notification:list', 'message', 103, 1, sysdate(), null, null, '通知模板与发送日志'
where not exists (select 1 from sys_menu where path = 'notification' or perms = 'yy:notification:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6324, '经营报表', 6200, 15, 'report', 'yy/report/index', '', 1, 0, 'C', '0', '0', 'yy:report:list', 'chart', 103, 1, sysdate(), null, null, '门店、渠道、选片经营报表'
where not exists (select 1 from sys_menu where path = 'report' or perms = 'yy:report:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6325, '多端预约', 6200, 16, 'mobile', 'yy/mobile/index', '', 1, 0, 'C', '0', '0', 'yy:mobile:list', 'phone', 103, 1, sysdate(), null, null, 'H5、小程序、App 预约入口配置'
where not exists (select 1 from sys_menu where path = 'mobile' or perms = 'yy:mobile:list');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6330, '预约配置详情', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:query', '#', 103, 1, sysdate(), null, null, '预约配置详情'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6331, '预约配置新增', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:add', '#', 103, 1, sysdate(), null, null, '预约配置新增'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6332, '预约配置修改', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:edit', '#', 103, 1, sysdate(), null, null, '预约配置修改'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6333, '预约配置删除', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:remove', '#', 103, 1, sysdate(), null, null, '预约配置删除'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6334, '预约配置导出', coalesce((select menu_id from sys_menu where path = 'booking-config' or perms = 'yy:bookingConfig:list' limit 1), 6320), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:bookingConfig:export', '#', 103, 1, sysdate(), null, null, '预约配置导出'
where not exists (select 1 from sys_menu where perms = 'yy:bookingConfig:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6335, '员工详情', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:query', '#', 103, 1, sysdate(), null, null, '员工详情'
where not exists (select 1 from sys_menu where perms = 'yy:employee:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6336, '员工新增', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:add', '#', 103, 1, sysdate(), null, null, '员工新增'
where not exists (select 1 from sys_menu where perms = 'yy:employee:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6337, '员工修改', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:edit', '#', 103, 1, sysdate(), null, null, '员工修改'
where not exists (select 1 from sys_menu where perms = 'yy:employee:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6338, '员工删除', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:remove', '#', 103, 1, sysdate(), null, null, '员工删除'
where not exists (select 1 from sys_menu where perms = 'yy:employee:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6339, '员工导出', coalesce((select menu_id from sys_menu where path = 'employee' or perms = 'yy:employee:list' limit 1), 6321), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:employee:export', '#', 103, 1, sysdate(), null, null, '员工导出'
where not exists (select 1 from sys_menu where perms = 'yy:employee:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6340, '客户详情', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:query', '#', 103, 1, sysdate(), null, null, '客户详情'
where not exists (select 1 from sys_menu where perms = 'yy:customer:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6341, '客户新增', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:add', '#', 103, 1, sysdate(), null, null, '客户新增'
where not exists (select 1 from sys_menu where perms = 'yy:customer:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6342, '客户修改', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:edit', '#', 103, 1, sysdate(), null, null, '客户修改'
where not exists (select 1 from sys_menu where perms = 'yy:customer:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6343, '客户删除', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:remove', '#', 103, 1, sysdate(), null, null, '客户删除'
where not exists (select 1 from sys_menu where perms = 'yy:customer:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6344, '客户导出', coalesce((select menu_id from sys_menu where path = 'customer' or perms = 'yy:customer:list' limit 1), 6322), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:customer:export', '#', 103, 1, sysdate(), null, null, '客户导出'
where not exists (select 1 from sys_menu where perms = 'yy:customer:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6345, '通知详情', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:query', '#', 103, 1, sysdate(), null, null, '通知详情'
where not exists (select 1 from sys_menu where perms = 'yy:notification:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6346, '通知新增', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:add', '#', 103, 1, sysdate(), null, null, '通知新增'
where not exists (select 1 from sys_menu where perms = 'yy:notification:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6347, '通知修改', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:edit', '#', 103, 1, sysdate(), null, null, '通知修改'
where not exists (select 1 from sys_menu where perms = 'yy:notification:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6348, '通知删除', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:remove', '#', 103, 1, sysdate(), null, null, '通知删除'
where not exists (select 1 from sys_menu where perms = 'yy:notification:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6349, '通知导出', coalesce((select menu_id from sys_menu where path = 'notification' or perms = 'yy:notification:list' limit 1), 6323), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:notification:export', '#', 103, 1, sysdate(), null, null, '通知导出'
where not exists (select 1 from sys_menu where perms = 'yy:notification:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6350, '报表详情', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:query', '#', 103, 1, sysdate(), null, null, '报表详情'
where not exists (select 1 from sys_menu where perms = 'yy:report:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6351, '报表新增', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:add', '#', 103, 1, sysdate(), null, null, '报表新增'
where not exists (select 1 from sys_menu where perms = 'yy:report:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6352, '报表修改', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:edit', '#', 103, 1, sysdate(), null, null, '报表修改'
where not exists (select 1 from sys_menu where perms = 'yy:report:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6353, '报表删除', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:remove', '#', 103, 1, sysdate(), null, null, '报表删除'
where not exists (select 1 from sys_menu where perms = 'yy:report:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6354, '报表导出', coalesce((select menu_id from sys_menu where path = 'report' or perms = 'yy:report:list' limit 1), 6324), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:report:export', '#', 103, 1, sysdate(), null, null, '报表导出'
where not exists (select 1 from sys_menu where perms = 'yy:report:export');

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6355, '多端配置详情', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:query', '#', 103, 1, sysdate(), null, null, '多端配置详情'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:query');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6356, '多端配置新增', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:add', '#', 103, 1, sysdate(), null, null, '多端配置新增'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:add');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6357, '多端配置修改', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:edit', '#', 103, 1, sysdate(), null, null, '多端配置修改'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:edit');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6358, '多端配置删除', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:remove', '#', 103, 1, sysdate(), null, null, '多端配置删除'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:remove');
insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
select 6359, '多端配置导出', coalesce((select menu_id from sys_menu where path = 'mobile' or perms = 'yy:mobile:list' limit 1), 6325), 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:mobile:export', '#', 103, 1, sysdate(), null, null, '多端配置导出'
where not exists (select 1 from sys_menu where perms = 'yy:mobile:export');
