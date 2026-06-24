-- 影约云门店工作台生产热修复：store-admin 门店范围 + DOUYIN_LIFE 映射字段
-- 幂等执行；不包含密码、token、手机号明文。

alter table yy_channel_product_mapping
    add column if not exists external_poi_id varchar(128) default '';

alter table yy_channel_product_mapping
    add column if not exists landing_url varchar(500) default '';

alter table yy_channel_product_mapping
    add column if not exists landing_path varchar(500) default '';

alter table yy_employee_store
    add column if not exists create_dept bigint default null;

alter table yy_employee_store
    add column if not exists create_by bigint default null;

alter table yy_employee_store
    add column if not exists update_by bigint default null;

create index if not exists idx_yy_channel_product_mapping_life_poi_sku
    on yy_channel_product_mapping (tenant_id, channel_type, external_poi_id, external_sku_id)
    where del_flag = '0';

-- 默认门店只是 POI/SKU 未映射时的过渡兜底，展示顺序放到真实门店后面。
update yy_store
set sort = 99,
    update_time = now(),
    remark = coalesce(nullif(remark, ''), '抖音来客未映射订单过渡门店')
where tenant_id = '000000'
  and store_code = 'DY-LIFE-DEFAULT'
  and del_flag = '0'
  and sort < 99;

with admin_user as (
    select user_id, tenant_id, nick_name
    from sys_user
    where user_name = 'store-admin'
      and del_flag = '0'
    limit 1
),
primary_store as (
    select id as store_id
    from yy_store
    where tenant_id = '000000'
      and store_code = 'BZ-WANDA'
      and del_flag = '0'
    limit 1
),
existing_employee as (
    select e.id
    from yy_employee e
    join admin_user u on u.user_id = e.user_id
    where e.del_flag = '0'
    order by e.id
    limit 1
),
inserted_employee as (
    insert into yy_employee (
        id, tenant_id, store_id, user_id, employee_no, employee_name, mobile,
        role_type, skill_tags, status, sort, create_dept, create_by,
        create_time, del_flag, remark
    )
    select
        900000000000990010,
        u.tenant_id,
        s.store_id,
        u.user_id,
        'STUDIO-STORE-ADMIN',
        coalesce(nullif(u.nick_name, ''), '门店管理员'),
        '',
        'STORE_MANAGER',
        '全店运营,订单同步,抖音来客',
        '0',
        0,
        null,
        u.user_id,
        now(),
        '0',
        'store-admin 工作台生产账号员工身份'
    from admin_user u
    cross join primary_store s
    where not exists (select 1 from existing_employee)
    on conflict (tenant_id, employee_no) do update
        set user_id = excluded.user_id,
            store_id = excluded.store_id,
            role_type = excluded.role_type,
            status = '0',
            update_time = now(),
            del_flag = '0',
            remark = excluded.remark
    returning id
),
target_employee as (
    select id from existing_employee
    union all
    select id from inserted_employee
    limit 1
),
target_primary_store as (
    select e.id as employee_id, s.store_id
    from target_employee e
    cross join primary_store s
)
update yy_employee e
set store_id = t.store_id,
    role_type = 'STORE_MANAGER',
    status = '0',
    update_time = now(),
    remark = coalesce(nullif(e.remark, ''), 'store-admin 工作台生产账号员工身份')
from target_primary_store t
where e.id = t.employee_id;

with target_employee as (
    select e.id as employee_id, e.tenant_id
    from yy_employee e
    join sys_user u on u.user_id = e.user_id
    where u.user_name = 'store-admin'
      and u.del_flag = '0'
      and e.del_flag = '0'
    order by e.id
    limit 1
),
real_store_scope as (
    select *
    from (values
        ('BZ-WANDA', 900000000000991001::bigint, '1'::char(1), 1),
        ('BZ-WUYUE', 900000000000991002::bigint, '0'::char(1), 2),
        ('WH-ZHIGU', 900000000000991003::bigint, '0'::char(1), 3),
        ('ZB-WANXIANGHUI', 900000000000991004::bigint, '0'::char(1), 4),
        ('DY-LIFE-DEFAULT', 900000000000991099::bigint, '0'::char(1), 99)
    ) as scope(store_code, link_id, is_primary, sort)
),
scope_rows as (
    select
        s.link_id,
        e.tenant_id,
        e.employee_id,
        st.id as store_id,
        s.is_primary,
        s.sort
    from target_employee e
    join real_store_scope s on true
    join yy_store st on st.tenant_id = e.tenant_id
        and st.store_code = s.store_code
        and st.del_flag = '0'
)
update yy_employee_store es
set is_primary = '0',
    update_time = now()
from target_employee e
where es.employee_id = e.employee_id
  and es.tenant_id = e.tenant_id
  and es.del_flag = '0';

with target_employee as (
    select e.id as employee_id, e.tenant_id
    from yy_employee e
    join sys_user u on u.user_id = e.user_id
    where u.user_name = 'store-admin'
      and u.del_flag = '0'
      and e.del_flag = '0'
    order by e.id
    limit 1
),
real_store_scope as (
    select *
    from (values
        ('BZ-WANDA', 900000000000991001::bigint, '1'::char(1), 1),
        ('BZ-WUYUE', 900000000000991002::bigint, '0'::char(1), 2),
        ('WH-ZHIGU', 900000000000991003::bigint, '0'::char(1), 3),
        ('ZB-WANXIANGHUI', 900000000000991004::bigint, '0'::char(1), 4),
        ('DY-LIFE-DEFAULT', 900000000000991099::bigint, '0'::char(1), 99)
    ) as scope(store_code, link_id, is_primary, sort)
),
scope_rows as (
    select
        s.link_id,
        e.tenant_id,
        e.employee_id,
        st.id as store_id,
        s.is_primary,
        s.sort
    from target_employee e
    join real_store_scope s on true
    join yy_store st on st.tenant_id = e.tenant_id
        and st.store_code = s.store_code
        and st.del_flag = '0'
)
insert into yy_employee_store (
    id, tenant_id, employee_id, store_id, is_primary,
    role_type, status, sort, create_time, del_flag
)
select
    link_id,
    tenant_id,
    employee_id,
    store_id,
    is_primary,
    'STORE_MANAGER',
    '0',
    sort,
    now(),
    '0'
from scope_rows
on conflict (tenant_id, employee_id, store_id) where del_flag = '0' do update
    set is_primary = excluded.is_primary,
        role_type = excluded.role_type,
        status = '0',
        sort = excluded.sort,
        update_time = now();
