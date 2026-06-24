-- Activate confirmed DOUYIN_LIFE POI -> yy_store mappings.
-- Evidence source: Douyin OpenAPI GET /goodlife/v1/shop/poi/query/ from HK2 server.
--
-- Confirmed mappings:
--   7228779175929186363 -> 一悦照相馆(滨州吾悦店) -> BZ-WUYUE -> 900000000000000200
--   7555006097638393865 -> 一悦照相馆(威海智慧谷店) -> WH-ZHIGU -> 900000000000000300
--
-- This script only activates existing yy_channel_product_mapping skeleton rows.
-- It does not directly update yy_order. Order remapping is done by
-- POST /yy/channel/DOUYIN_LIFE/orders/backfill after this script succeeds.

begin;

do $$
declare
    v_wuyue_store_count integer;
    v_zhigu_store_count integer;
    v_wuyue_mapping_count integer;
    v_zhigu_mapping_count integer;
begin
    select count(*)
      into v_wuyue_store_count
      from yy_store
     where id = 900000000000000200
       and tenant_id = '000000'
       and store_code = 'BZ-WUYUE'
       and del_flag = '0';

    if v_wuyue_store_count <> 1 then
        raise exception 'Expected exactly one active BZ-WUYUE store row, got %', v_wuyue_store_count;
    end if;

    select count(*)
      into v_zhigu_store_count
      from yy_store
     where id = 900000000000000300
       and tenant_id = '000000'
       and store_code = 'WH-ZHIGU'
       and del_flag = '0';

    if v_zhigu_store_count <> 1 then
        raise exception 'Expected exactly one active WH-ZHIGU store row, got %', v_zhigu_store_count;
    end if;

    select count(*)
      into v_wuyue_mapping_count
      from yy_channel_product_mapping
     where tenant_id = '000000'
       and channel_type = 'DOUYIN_LIFE'
       and external_poi_id = '7228779175929186363'
       and del_flag = '0';

    if v_wuyue_mapping_count <> 13 then
        raise exception 'Expected 13 DOUYIN_LIFE mappings for POI 7228779175929186363, got %', v_wuyue_mapping_count;
    end if;

    select count(*)
      into v_zhigu_mapping_count
      from yy_channel_product_mapping
     where tenant_id = '000000'
       and channel_type = 'DOUYIN_LIFE'
       and external_poi_id = '7555006097638393865'
       and del_flag = '0';

    if v_zhigu_mapping_count <> 1 then
        raise exception 'Expected 1 DOUYIN_LIFE mapping for POI 7555006097638393865, got %', v_zhigu_mapping_count;
    end if;
end $$;

update yy_channel_product_mapping
   set store_id = 900000000000000200,
       mapping_status = 'ACTIVE',
       update_by = 1,
       update_time = now(),
       remark = '抖音 POI 查询确认：一悦照相馆(滨州吾悦店)，POI=7228779175929186363，映射到 BZ-WUYUE；启用后由 orders/backfill 安全归店'
 where tenant_id = '000000'
   and channel_type = 'DOUYIN_LIFE'
   and external_poi_id = '7228779175929186363'
   and del_flag = '0';

update yy_channel_product_mapping
   set store_id = 900000000000000300,
       mapping_status = 'ACTIVE',
       update_by = 1,
       update_time = now(),
       remark = '抖音 POI 查询确认：一悦照相馆(威海智慧谷店)，POI=7555006097638393865，映射到 WH-ZHIGU；启用后由 orders/backfill 安全归店'
 where tenant_id = '000000'
   and channel_type = 'DOUYIN_LIFE'
   and external_poi_id = '7555006097638393865'
   and del_flag = '0';

do $$
declare
    v_wuyue_active_count integer;
    v_zhigu_active_count integer;
begin
    select count(*)
      into v_wuyue_active_count
      from yy_channel_product_mapping
     where tenant_id = '000000'
       and channel_type = 'DOUYIN_LIFE'
       and external_poi_id = '7228779175929186363'
       and store_id = 900000000000000200
       and mapping_status = 'ACTIVE'
       and del_flag = '0';

    if v_wuyue_active_count <> 13 then
        raise exception 'Expected 13 active BZ-WUYUE mappings after update, got %', v_wuyue_active_count;
    end if;

    select count(*)
      into v_zhigu_active_count
      from yy_channel_product_mapping
     where tenant_id = '000000'
       and channel_type = 'DOUYIN_LIFE'
       and external_poi_id = '7555006097638393865'
       and store_id = 900000000000000300
       and mapping_status = 'ACTIVE'
       and del_flag = '0';

    if v_zhigu_active_count <> 1 then
        raise exception 'Expected 1 active WH-ZHIGU mapping after update, got %', v_zhigu_active_count;
    end if;
end $$;

commit;
