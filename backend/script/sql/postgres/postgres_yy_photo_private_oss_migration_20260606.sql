-- 影约云客户取片私有 OSS 字段迁移
-- 用于已初始化过的 PostgreSQL 环境；新库已在 postgres_yy_cloud.sql 中包含这些字段。

alter table yy_photo_album add column if not exists customer_name varchar(64) default '';
alter table yy_photo_album add column if not exists customer_phone varchar(32) default '';
alter table yy_photo_album add column if not exists access_code varchar(128) default '';
alter table yy_photo_album add column if not exists channel_type varchar(32) default 'H5';
alter table yy_photo_album add column if not exists status varchar(32) default 'ACTIVE';
alter table yy_photo_album add column if not exists douyin_order_id varchar(128) default '';
alter table yy_photo_album add column if not exists certificate_code varchar(128) default '';
alter table yy_photo_album add column if not exists book_id varchar(128) default '';

alter table yy_photo_asset add column if not exists object_key varchar(500) default '';
alter table yy_photo_asset add column if not exists thumbnail_object_key varchar(500) default '';

update yy_photo_asset
set visible = '0'
where del_flag = '0'
  and visible = '1'
  and (object_key is null or btrim(object_key) = '');

with duplicate_assets as (
    select id,
           row_number() over (partition by tenant_id, album_id, object_key order by id) as rn
    from yy_photo_asset
    where del_flag = '0'
      and object_key is not null
      and btrim(object_key) <> ''
)
update yy_photo_asset asset
set del_flag = '1',
    visible = '0'
from duplicate_assets duplicate
where asset.id = duplicate.id
  and duplicate.rn > 1;

create unique index if not exists uk_yy_photo_asset_album_object_key_active
    on yy_photo_asset (tenant_id, album_id, object_key)
    where del_flag = '0' and object_key is not null and btrim(object_key) <> '';

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'ck_yy_photo_asset_visible_object_key'
    ) then
        alter table yy_photo_asset
            add constraint ck_yy_photo_asset_visible_object_key
            check (del_flag = '1' or visible <> '1' or btrim(coalesce(object_key, '')) <> '');
    end if;
end $$;

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
