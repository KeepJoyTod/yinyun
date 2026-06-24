-- 服务生产模块结构迁移
-- 目标：
-- 1. 三方修图中心从 yy_photo_album / yy_photo_asset 自动派生修图任务，但使用独立任务表承接派单、阻塞和验收状态。
-- 2. 三方修图服务商、中央修图策略、开通许可证不占用历史备注字段，统一落到专表。

create table if not exists yy_retouch_provider (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    provider_code varchar(64) not null,
    provider_name varchar(128) not null,
    contact_name varchar(64) default '',
    contact_phone varchar(32) default '',
    supported_store_ids varchar(500) default '',
    service_scope varchar(255) default '',
    quote_mode varchar(32) default 'PER_PHOTO',
    settlement_mode varchar(32) default 'MONTHLY',
    application_status varchar(32) default 'PENDING',
    status varchar(32) default 'ACTIVE',
    rating_score int default 5,
    sla_hours int default 24,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, provider_code)
);

create index if not exists idx_yy_retouch_provider_status
    on yy_retouch_provider (tenant_id, status, application_status);

create table if not exists yy_retouch_task (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    store_id bigint not null,
    order_id bigint default null,
    album_id bigint default null,
    provider_id bigint default null,
    provider_name varchar(128) default '',
    task_no varchar(64) not null,
    status varchar(32) default 'WAIT_ASSIGN',
    acceptance_status varchar(32) default 'PENDING',
    quote_amount_cent bigint default 0,
    due_time timestamp,
    submitted_time timestamp,
    completed_time timestamp,
    source_stage varchar(32) default 'CONFIRMED',
    customer_name varchar(64) default '',
    service_name varchar(128) default '',
    block_reason varchar(255) default '',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, task_no)
);

create index if not exists idx_yy_retouch_task_store
    on yy_retouch_task (tenant_id, store_id, status, due_time);

create index if not exists idx_yy_retouch_task_album
    on yy_retouch_task (tenant_id, album_id);

create table if not exists yy_collaboration_policy (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    policy_code varchar(64) not null,
    review_flow_enabled char(1) default '1',
    product_info_mask_mode varchar(32) default 'MASK_PHOTO_ONLY',
    enabled_store_ids varchar(500) default '',
    fallback_action varchar(32) default 'RETURN_TO_STORE',
    transfer_enabled char(1) default '1',
    auto_dispatch_mode varchar(32) default 'STORE_ONLY',
    gender_makeup_enabled char(1) default '0',
    female_makeup_ratio numeric(10,2) default 1.50,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, policy_code)
);

create table if not exists yy_service_license_binding (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    license_key varchar(128) not null,
    plan_name varchar(128) default '',
    status varchar(32) default 'ACTIVE',
    expire_time timestamp,
    bound_store_ids varchar(500) default '',
    seat_count int default 1,
    activated_time timestamp,
    renew_action varchar(32) default 'RENEW',
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    remark varchar(500) default null,
    primary key (id),
    unique (tenant_id, license_key)
);

create index if not exists idx_yy_service_license_status
    on yy_service_license_binding (tenant_id, status, expire_time);
