-- 影约云底片 OSS object_key 安全约束
-- 用于已初始化过的 PostgreSQL 环境。
-- 规则：客户可见底片必须有 object_key；同一相册内未删除底片不能重复绑定同一个 object_key。

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
