-- 渠道事件收件箱：用于 Webhook/SPI 幂等、失败留痕和定时补偿排查。

create table if not exists yy_channel_event_inbox (
    id bigint primary key,
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
    create_dept bigint,
    create_by bigint,
    create_time timestamp,
    update_by bigint,
    update_time timestamp,
    del_flag char(1) default '0'
);

comment on table yy_channel_event_inbox is '影约云渠道事件收件箱';
comment on column yy_channel_event_inbox.channel_type is '渠道类型';
comment on column yy_channel_event_inbox.event_type is '事件类型';
comment on column yy_channel_event_inbox.event_id is '事件幂等ID';
comment on column yy_channel_event_inbox.external_order_id is '外部订单号';
comment on column yy_channel_event_inbox.request_id is '平台请求ID/logid';
comment on column yy_channel_event_inbox.signature_valid is '签名是否有效';
comment on column yy_channel_event_inbox.process_status is '处理状态 RECEIVED/PROCESSED/FAILED/DUPLICATE';
comment on column yy_channel_event_inbox.raw_payload is '脱敏后的原始报文';

create unique index if not exists uk_yy_channel_event_inbox_event
    on yy_channel_event_inbox (tenant_id, channel_type, event_type, event_id)
    where del_flag = '0';

create index if not exists idx_yy_channel_event_inbox_order
    on yy_channel_event_inbox (tenant_id, channel_type, external_order_id)
    where del_flag = '0';

create index if not exists idx_yy_channel_event_inbox_status
    on yy_channel_event_inbox (tenant_id, channel_type, process_status, create_time)
    where del_flag = '0';
