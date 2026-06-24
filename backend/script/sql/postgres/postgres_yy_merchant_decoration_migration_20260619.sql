create table if not exists yy_merchant_decoration (
    id                    bigint       not null,
    tenant_id             varchar(20)  default '000000',
    store_id              bigint       default 0 not null,
    channel_type          varchar(32)  default 'WECHAT' not null,
    status                varchar(32)  default 'DRAFT' not null,
    config_json           jsonb        not null,
    published_config_json jsonb        default null,
    share_icon_oss_id     bigint       default null,
    watermark_oss_id      bigint       default null,
    published_at          timestamp,
    preview_token         varchar(64)  default null,
    create_dept           bigint       default null,
    create_by             bigint       default null,
    create_time           timestamp,
    update_by             bigint       default null,
    update_time           timestamp,
    del_flag              char(1)      default '0',
    remark                varchar(500) default null,
    primary key (id)
);

create unique index if not exists uk_yy_merchant_decoration_scope
    on yy_merchant_decoration (tenant_id, store_id, channel_type)
    where del_flag = '0';

create index if not exists idx_yy_merchant_decoration_status
    on yy_merchant_decoration (tenant_id, status, published_at);
