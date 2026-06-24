create table if not exists yy_merchant_micro_form (
    id              bigint       not null,
    tenant_id       varchar(20)  default '000000',
    store_id        bigint       default 0 not null,
    form_name       varchar(120) not null,
    status          varchar(32)  default 'DRAFT' not null,
    schema_json     jsonb,
    notify_users    varchar(500) default null,
    published_at    timestamp,
    link_key        varchar(64)  not null,
    create_dept     bigint       default null,
    create_by       bigint       default null,
    create_time     timestamp,
    update_by       bigint       default null,
    update_time     timestamp,
    del_flag        char(1)      default '0',
    remark          varchar(500) default null,
    primary key (id),
    unique (tenant_id, link_key),
    check (status in ('DRAFT', 'PUBLISHED', 'OFFLINE'))
);

create index if not exists idx_yy_merchant_micro_form_filter
    on yy_merchant_micro_form (tenant_id, store_id, status, published_at);

create table if not exists yy_merchant_micro_form_submission (
    id                 bigint       not null,
    tenant_id          varchar(20)  default '000000',
    form_id            bigint       not null,
    form_name_snapshot varchar(120) default null,
    customer_name      varchar(64)  default null,
    customer_phone     varchar(32)  default null,
    answers_json       jsonb,
    submitted_at       timestamp,
    follow_status      varchar(32)  default 'PENDING' not null,
    follow_remark      varchar(500) default null,
    order_id           bigint       default null,
    create_dept        bigint       default null,
    create_by          bigint       default null,
    create_time        timestamp,
    update_by          bigint       default null,
    update_time        timestamp,
    del_flag           char(1)      default '0',
    remark             varchar(500) default null,
    primary key (id),
    check (follow_status in ('PENDING', 'FOLLOWED', 'CLOSED'))
);

create index if not exists idx_yy_merchant_micro_form_submission_form
    on yy_merchant_micro_form_submission (tenant_id, form_id, submitted_at);
create index if not exists idx_yy_merchant_micro_form_submission_customer
    on yy_merchant_micro_form_submission (tenant_id, customer_phone);

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
values
(9100, '微表单管理', 6200, 18, 'microForm', 'yy/micro-form/index', '', 1, 0, 'C', '0', '0', 'yy:microForm:list', 'form', 103, 1, now(), null, null, '商户微表单定义管理'),
(9101, '微表单查询', 9100, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microForm:list', '#', 103, 1, now(), null, null, '微表单查询'),
(9102, '微表单新增', 9100, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microForm:add', '#', 103, 1, now(), null, null, '微表单新增'),
(9103, '微表单修改', 9100, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microForm:edit', '#', 103, 1, now(), null, null, '微表单修改'),
(9104, '微表单删除', 9100, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microForm:remove', '#', 103, 1, now(), null, null, '微表单删除'),
(9105, '微表单导出', 9100, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microForm:export', '#', 103, 1, now(), null, null, '微表单导出'),
(9106, '微表单发布', 9100, 6, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microForm:publish', '#', 103, 1, now(), null, null, '微表单发布下线'),
(9110, '表单提交数据', 6200, 19, 'microFormSubmission', 'yy/micro-form-submission/index', '', 1, 0, 'C', '0', '0', 'yy:microFormSubmission:list', 'table', 103, 1, now(), null, null, '客户微表单提交数据'),
(9111, '提交数据查询', 9110, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microFormSubmission:list', '#', 103, 1, now(), null, null, '提交数据查询'),
(9112, '提交数据导出', 9110, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microFormSubmission:export', '#', 103, 1, now(), null, null, '提交数据导出'),
(9113, '提交数据跟进', 9110, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microFormSubmission:edit', '#', 103, 1, now(), null, null, '提交数据跟进')
on conflict (menu_id) do nothing;
