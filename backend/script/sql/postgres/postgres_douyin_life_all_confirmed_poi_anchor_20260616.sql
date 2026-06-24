-- Add DOUYIN_LIFE POI anchor mappings for confirmed real stores without
-- historical POI+SKU rows yet.
--
-- Evidence source: Douyin OpenAPI GET /goodlife/v1/shop/poi/query/ from HK2.
-- Already active before this script:
--   7228779175929186363 -> BZ-WUYUE
--   7555006097638393865 -> WH-ZHIGU
--
-- Added here:
--   7342410951733282851 -> 一悦照相馆(滨州万达店) -> BZ-WANDA
--   7628187182788544538 -> 一悦照相馆(淄博万象汇店) -> ZB-WANXIANGHUI
--
-- Not activated:
--   7407304729216157722 -> 一悦照相馆(滨州店), because it is not one of the
--   current four seeded yy_store rows.
--
-- These rows intentionally use blank external_sku_id as POI anchors. Existing
-- POI+SKU exact mappings still win first. The resolver then falls back to a
-- POI-only unique store match when an incoming order has only a POI or a new SKU.

begin;

do $$
declare
    v_wanda_store_count integer;
    v_zibo_store_count integer;
begin
    select count(*)
      into v_wanda_store_count
      from yy_store
     where id = 900000000000000100
       and tenant_id = '000000'
       and store_code = 'BZ-WANDA'
       and del_flag = '0';

    if v_wanda_store_count <> 1 then
        raise exception 'Expected exactly one active BZ-WANDA store row, got %', v_wanda_store_count;
    end if;

    select count(*)
      into v_zibo_store_count
      from yy_store
     where id = 900000000000000400
       and tenant_id = '000000'
       and store_code = 'ZB-WANXIANGHUI'
       and del_flag = '0';

    if v_zibo_store_count <> 1 then
        raise exception 'Expected exactly one active ZB-WANXIANGHUI store row, got %', v_zibo_store_count;
    end if;
end $$;

insert into yy_product
(id, tenant_id, store_id, product_type, product_name, price, duration_minutes, selection_price, album_product_name, status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(900000000000020300, '000000', 900000000000000100, 'DOUYIN_LIFE', '抖音来客 POI 锚点-滨州万达店', 0, 30, null, '', '0', 1200, 103, 1, now(), 1, now(), '0', 'POI-only anchor product for DOUYIN_LIFE store resolver; POI=7342410951733282851; not a sellable SKU'),
(900000000000020310, '000000', 900000000000000400, 'DOUYIN_LIFE', '抖音来客 POI 锚点-淄博万象汇店', 0, 30, null, '', '0', 1210, 103, 1, now(), 1, now(), '0', 'POI-only anchor product for DOUYIN_LIFE store resolver; POI=7628187182788544538; not a sellable SKU')
on conflict (id) do nothing;

insert into yy_channel_product_mapping
(id, tenant_id, store_id, product_id, channel_type, external_product_id, external_sku_id, external_poi_id, landing_url, landing_path, external_name, mapping_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(900000000000030300, '000000', 900000000000000100, 900000000000020300, 'DOUYIN_LIFE', '', '', '7342410951733282851', '', '', '一悦照相馆(滨州万达店) POI 锚点', 'ACTIVE', 103, 1, now(), 1, now(), '0', '抖音 POI 查询确认：一悦照相馆(滨州万达店)，映射到 BZ-WANDA；用于 POI-only 归店，不代表具体 SKU'),
(900000000000030310, '000000', 900000000000000400, 900000000000020310, 'DOUYIN_LIFE', '', '', '7628187182788544538', '', '', '一悦照相馆(淄博万象汇店) POI 锚点', 'ACTIVE', 103, 1, now(), 1, now(), '0', '抖音 POI 查询确认：一悦照相馆(淄博万象汇店)，映射到 ZB-WANXIANGHUI；用于 POI-only 归店，不代表具体 SKU')
on conflict (id) do update
   set store_id = excluded.store_id,
       product_id = excluded.product_id,
       mapping_status = 'ACTIVE',
       update_by = 1,
       update_time = now(),
       remark = excluded.remark
 where yy_channel_product_mapping.tenant_id = '000000'
   and yy_channel_product_mapping.channel_type = 'DOUYIN_LIFE';

do $$
declare
    v_wanda_anchor_count integer;
    v_zibo_anchor_count integer;
begin
    select count(*)
      into v_wanda_anchor_count
      from yy_channel_product_mapping
     where tenant_id = '000000'
       and channel_type = 'DOUYIN_LIFE'
       and external_poi_id = '7342410951733282851'
       and store_id = 900000000000000100
       and mapping_status = 'ACTIVE'
       and del_flag = '0';

    if v_wanda_anchor_count <> 1 then
        raise exception 'Expected 1 active BZ-WANDA POI anchor, got %', v_wanda_anchor_count;
    end if;

    select count(*)
      into v_zibo_anchor_count
      from yy_channel_product_mapping
     where tenant_id = '000000'
       and channel_type = 'DOUYIN_LIFE'
       and external_poi_id = '7628187182788544538'
       and store_id = 900000000000000400
       and mapping_status = 'ACTIVE'
       and del_flag = '0';

    if v_zibo_anchor_count <> 1 then
        raise exception 'Expected 1 active ZB-WANXIANGHUI POI anchor, got %', v_zibo_anchor_count;
    end if;
end $$;

commit;
