-- 影约云门店工作台：客片访问日志权限补齐
-- 背景：studio-workbench 客片管理页可进入 yy:photoAlbum:list，但访问日志接口
-- /yy/photoAccessLog/list 单独要求 yy:photoAccessLog:list，导致子面板权限错误。

insert into sys_menu (
    menu_id,
    menu_name,
    parent_id,
    order_num,
    path,
    component,
    query_param,
    is_frame,
    is_cache,
    menu_type,
    visible,
    status,
    perms,
    icon,
    create_dept,
    create_by,
    create_time,
    update_by,
    update_time,
    remark
)
values
    (90623501, '访问日志查询', 6205, 11, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAccessLog:list', '#', 103, 1, now(), null, null, '客户取片访问日志查询'),
    (90623502, '访问日志导出', 6205, 12, '#', '', '', 1, 0, 'F', '0', '0', 'yy:photoAccessLog:export', '#', 103, 1, now(), null, null, '客户取片访问日志导出')
on conflict (menu_id) do update set
    menu_name = excluded.menu_name,
    parent_id = excluded.parent_id,
    order_num = excluded.order_num,
    perms = excluded.perms,
    remark = excluded.remark,
    update_time = now();

insert into sys_role_menu (role_id, menu_id)
select distinct rm.role_id, 90623501
from sys_role_menu rm
join sys_menu m on m.menu_id = rm.menu_id
where m.perms = 'yy:photoAlbum:list'
  and not exists (
      select 1
      from sys_role_menu existing
      where existing.role_id = rm.role_id
        and existing.menu_id = 90623501
  );

insert into sys_role_menu (role_id, menu_id)
select distinct rm.role_id, 90623502
from sys_role_menu rm
join sys_menu m on m.menu_id = rm.menu_id
where m.perms = 'yy:photoAlbum:export'
  and not exists (
      select 1
      from sys_role_menu existing
      where existing.role_id = rm.role_id
        and existing.menu_id = 90623502
  );
