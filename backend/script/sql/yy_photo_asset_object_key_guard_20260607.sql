-- 影约云底片 OSS object_key 安全约束
-- 用于已初始化过的 MySQL 8 环境。
-- 执行前请确认不存在同一相册内 active object_key 重复记录。

update yy_photo_asset
set visible = '0'
where del_flag = '0'
  and visible = '1'
  and (object_key is null or trim(object_key) = '');

update yy_photo_asset asset
join (
    select id
    from (
        select id,
               row_number() over (partition by tenant_id, album_id, object_key order by id) as rn
        from yy_photo_asset
        where del_flag = '0'
          and object_key is not null
          and trim(object_key) <> ''
    ) duplicate_assets
    where rn > 1
) duplicate on asset.id = duplicate.id
set asset.del_flag = '1',
    asset.visible = '0';

alter table yy_photo_asset
    add column object_key_active varchar(500)
        generated always as (
            case
                when del_flag = '0' and object_key is not null and trim(object_key) <> ''
                then object_key
                else null
            end
        ) stored comment '有效OSS对象Key';

create unique index uk_yy_photo_asset_album_object_key_active
    on yy_photo_asset (tenant_id, album_id, object_key_active);

alter table yy_photo_asset
    add constraint ck_yy_photo_asset_visible_object_key
    check (del_flag = '1' or visible <> '1' or trim(coalesce(object_key, '')) <> '');
