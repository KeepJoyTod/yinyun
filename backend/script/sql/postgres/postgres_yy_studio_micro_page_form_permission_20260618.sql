-- 影约云门店工作台：给 studio_staff 补微页面/微表单权限。
-- 幂等执行；不改超级管理员，不包含密码、token、手机号明文。

insert into sys_role_menu (role_id, menu_id)
select r.role_id, m.menu_id
from sys_role r
join sys_menu m on m.menu_id in (
    9100, 9101, 9102, 9103, 9104, 9105, 9106,
    9110, 9111, 9112, 9113,
    9120, 9121, 9122, 9123, 9124, 9125
)
where r.role_key = 'studio_staff'
  and r.del_flag = '0'
  and m.status = '0'
  and not exists (
      select 1
      from sys_role_menu rm
      where rm.role_id = r.role_id
        and rm.menu_id = m.menu_id
  );
