-- 员工-门店多对多绑定表
create table if not exists yy_employee_store (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    employee_id bigint not null,
    store_id bigint not null,
    is_primary char(1) default '0',
    role_type varchar(32) default 'STAFF',
    status char(1) default '0',
    sort int default 0,
    create_dept bigint default null,
    create_by bigint default null,
    create_time timestamp,
    update_by bigint default null,
    update_time timestamp,
    del_flag char(1) default '0',
    primary key (id)
);

alter table yy_employee_store
    add column if not exists create_dept bigint default null;

alter table yy_employee_store
    add column if not exists create_by bigint default null;

alter table yy_employee_store
    add column if not exists update_by bigint default null;

-- 每员工仅一个主门店的部分唯一索引
create unique index if not exists uk_yy_employee_store_primary
    on yy_employee_store (tenant_id, employee_id)
    where is_primary = '1' and del_flag = '0';

-- 员工-门店组合唯一
create unique index if not exists uk_yy_employee_store_emp_store
    on yy_employee_store (tenant_id, employee_id, store_id)
    where del_flag = '0';

-- 从 yy_employee.store_id 迁移主门店关系到 yy_employee_store
-- 仅当 yy_employee.store_id 非空时才插入 is_primary=true
insert into yy_employee_store (id, tenant_id, employee_id, store_id, is_primary, role_type, status, sort, create_time, del_flag)
select
    e.id + 1000000000000000 as id,
    e.tenant_id,
    e.id as employee_id,
    e.store_id,
    '1' as is_primary,
    e.role_type,
    e.status,
    e.sort,
    e.create_time,
    '0' as del_flag
from yy_employee e
where e.store_id is not null
  and e.del_flag = '0'
  and not exists (
    select 1 from yy_employee_store es
    where es.tenant_id = e.tenant_id
      and es.employee_id = e.id
      and es.store_id = e.store_id
      and es.del_flag = '0'
)
on conflict do nothing;
