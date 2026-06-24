-- 影约云四门店种子数据 (幂等, 基于 tenant_id + store_code 唯一判断)
-- 使用大整数 ID 避免与雪花生成器冲突

insert into yy_store (
    id, tenant_id, store_code, store_name, status, phone, address,
    business_hours, sort, create_time, create_by, del_flag, remark
) values
(
    900000000000000100, '000000', 'BZ-WANDA', '滨州万达店', '0',
    '', '', '', 1,
    now(), 1, '0', '影约云标准门店'
),
(
    900000000000000200, '000000', 'BZ-WUYUE', '滨州吾悦店', '0',
    '', '', '', 2,
    now(), 1, '0', '影约云标准门店'
),
(
    900000000000000300, '000000', 'WH-ZHIGU', '威海智慧谷店', '0',
    '', '', '', 3,
    now(), 1, '0', '影约云标准门店'
),
(
    900000000000000400, '000000', 'ZB-WANXIANGHUI', '淄博万象汇店', '0',
    '', '', '', 4,
    now(), 1, '0', '影约云标准门店'
)
on conflict (tenant_id, store_code) do nothing;
