-- DOUYIN_LIFE real-account mapping gap fill, 2026-06-20.
-- Evidence source:
--   docs/evidence/douyin-life-real-account-discovery-20260620-021944.json
--   docs/evidence/douyin-life-sync-diagnosis-20260620-0220.json
--
-- Scope:
--   - local DB only
--   - no yy_order writes
--   - no yy_booking_slot_inventory writes
--   - no Douyin platform writes

begin;

insert into yy_product
(id, tenant_id, store_id, product_type, product_name, price, duration_minutes, selection_price, album_product_name,
 status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
select *
from (values
    (900000000000020240::bigint, '000000', null::bigint, 'DOUYIN_LIFE',
     '红底全家福｜红底周年纪念｜红底照｜红底亲子照｜服装化妆｜一张精修',
     0.00::numeric, 0, 0.00::numeric, '', '0', 240, null::bigint, 1::bigint, now(), 1::bigint, now(), '0',
     '抖音来客真实账户只读发现 2026-06-20；DOUYIN_LIFE_SKU=1786524382942250；DOUYIN_LIFE_PRODUCT=1786524382942250；证据 douyin-life-real-account-discovery-20260620-021944'),
    (900000000000020250::bigint, '000000', null::bigint, 'DOUYIN_LIFE',
     '生日照｜单人写真｜公主风、御风、小清新等风格任选｜一套妆造｜四张精修｜送摆台',
     0.00::numeric, 0, 0.00::numeric, '', '0', 250, null::bigint, 1::bigint, now(), 1::bigint, now(), '0',
     '抖音来客真实账户只读发现 2026-06-20；DOUYIN_LIFE_SKU=1835694064184368；DOUYIN_LIFE_PRODUCT=1835694064184368；证据 douyin-life-real-account-discovery-20260620-021944')
) as v(id, tenant_id, store_id, product_type, product_name, price, duration_minutes, selection_price, album_product_name,
       status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
where not exists (
    select 1
    from yy_product p
    where p.tenant_id = v.tenant_id
      and p.product_type = 'DOUYIN_LIFE'
      and p.del_flag = '0'
      and p.remark like '%' || split_part(v.remark, 'DOUYIN_LIFE_SKU=', 2) || '%'
);

insert into yy_channel_product_mapping
(id, tenant_id, store_id, product_id, channel_type, external_product_id, external_sku_id, external_poi_id,
 landing_url, landing_path, external_name, mapping_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
select *
from (values
    (900000000000030360::bigint, '000000', 900000000000000200::bigint, 900000000000020240::bigint, 'DOUYIN_LIFE',
     '1786524382942250', '1786524382942250', '7228779175929186363', '', '',
     '红底全家福｜红底周年纪念｜红底照｜红底亲子照｜服装化妆｜一张精修',
     'ACTIVE', null::bigint, 1::bigint, now(), 1::bigint, now(), '0',
     '抖音来客真实账户只读发现 2026-06-20；POI=滨州吾悦店；证据 douyin-life-sync-diagnosis-20260620-0220'),
    (900000000000030370::bigint, '000000', 900000000000000100::bigint, 900000000000020110::bigint, 'DOUYIN_LIFE',
     '1765149825801219', '1765149825801219', '7342410951733282851', '', '',
     '红底登记照｜红底照｜领证照｜学院风、新中式、白衬衣、韩式等｜含服装化妆｜一张精修',
     'ACTIVE', null::bigint, 1::bigint, now(), 1::bigint, now(), '0',
     '抖音来客真实账户只读发现 2026-06-20；POI=滨州万达店；证据 douyin-life-sync-diagnosis-20260620-0220'),
    (900000000000030380::bigint, '000000', 900000000000000100::bigint, 900000000000020130::bigint, 'DOUYIN_LIFE',
     '1768849478367259', '1768849478367259', '7342410951733282851', '', '',
     '情侣写真｜夏季情侣照｜情侣文艺照｜全场风格任选｜一套妆造｜四张精修｜送摆台',
     'ACTIVE', null::bigint, 1::bigint, now(), 1::bigint, now(), '0',
     '抖音来客真实账户只读发现 2026-06-20；POI=滨州万达店；证据 douyin-life-sync-diagnosis-20260620-0220'),
    (900000000000030390::bigint, '000000', 900000000000000100::bigint, 900000000000020250::bigint, 'DOUYIN_LIFE',
     '1835694064184368', '1835694064184368', '7342410951733282851', '', '',
     '生日照｜单人写真｜公主风、御风、小清新等风格任选｜一套妆造｜四张精修｜送摆台',
     'ACTIVE', null::bigint, 1::bigint, now(), 1::bigint, now(), '0',
     '抖音来客真实账户只读发现 2026-06-20；POI=滨州万达店；证据 douyin-life-sync-diagnosis-20260620-0220')
) as v(id, tenant_id, store_id, product_id, channel_type, external_product_id, external_sku_id, external_poi_id,
       landing_url, landing_path, external_name, mapping_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
where exists (
    select 1
    from yy_store s
    where s.tenant_id = v.tenant_id
      and s.id = v.store_id
      and s.del_flag = '0'
)
and exists (
    select 1
    from yy_product p
    where p.tenant_id = v.tenant_id
      and p.id = v.product_id
      and p.del_flag = '0'
)
and not exists (
    select 1
    from yy_channel_product_mapping m
    where m.tenant_id = v.tenant_id
      and m.channel_type = v.channel_type
      and m.external_poi_id = v.external_poi_id
      and m.external_sku_id = v.external_sku_id
      and m.del_flag = '0'
);

commit;

select jsonb_build_object(
    'mode', 'WRITE_LOCAL_DB_DOUYIN_LIFE_MAPPING_GAP_20260620',
    'products', (
        select jsonb_agg(jsonb_build_object(
            'id', id::text,
            'productName', product_name,
            'status', status,
            'storeId', coalesce(store_id::text, '')
        ) order by id)
        from yy_product
        where id in (900000000000020240, 900000000000020250)
    ),
    'mappings', (
        select jsonb_agg(jsonb_build_object(
            'id', id::text,
            'storeId', store_id::text,
            'productId', product_id::text,
            'externalPoiId', external_poi_id,
            'externalSkuId', external_sku_id,
            'mappingStatus', mapping_status
        ) order by id)
        from yy_channel_product_mapping
        where id in (900000000000030360, 900000000000030370, 900000000000030380, 900000000000030390)
    ),
    'inventoryWrites', false,
    'orderWrites', false,
    'platformWrites', false
)::text as evidence;
