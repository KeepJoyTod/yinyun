-- DOUYIN_LIFE real account mapping delta from read-only discovery 2026-06-17.
--
-- Evidence:
--   docs/evidence/douyin-life-real-account-discovery-20260617-140628.md
--   docs/evidence/douyin-life-real-mapping-gap-20260617-before.json
--
-- Scope:
--   1. Add 1 missing yy_product skeleton for real SKU 1867489036547136.
--   2. Add 4 missing ACTIVE POI+SKU mappings confirmed by real account discovery.
--
-- Safety:
--   - Does not update yy_order.
--   - Does not write yy_booking_slot_inventory.
--   - Does not activate 7407304729216157722 because it is not one of the four yy_store rows.
--   - Existing POI-only anchors stay in place; exact POI+SKU mappings win first.

begin;

do $$
declare
    v_wanda_store_count integer;
    v_wuyue_store_count integer;
    v_existing_gap_count integer;
begin
    select count(*)
      into v_wanda_store_count
      from yy_store
     where tenant_id = '000000'
       and id = 900000000000000100
       and store_code = 'BZ-WANDA'
       and del_flag = '0';

    if v_wanda_store_count <> 1 then
        raise exception 'Expected one active BZ-WANDA store, got %', v_wanda_store_count;
    end if;

    select count(*)
      into v_wuyue_store_count
      from yy_store
     where tenant_id = '000000'
       and id = 900000000000000200
       and store_code = 'BZ-WUYUE'
       and del_flag = '0';

    if v_wuyue_store_count <> 1 then
        raise exception 'Expected one active BZ-WUYUE store, got %', v_wuyue_store_count;
    end if;

    select count(*)
      into v_existing_gap_count
      from yy_channel_product_mapping
     where tenant_id = '000000'
       and channel_type = 'DOUYIN_LIFE'
       and del_flag = '0'
       and (
            (external_poi_id = '7228779175929186363' and external_sku_id = '1867489036547136')
         or (external_poi_id = '7342410951733282851' and external_sku_id = '1765136728900670')
         or (external_poi_id = '7342410951733282851' and external_sku_id = '1772297209231363')
         or (external_poi_id = '7342410951733282851' and external_sku_id = '1834803890491392')
       );

    if v_existing_gap_count <> 0 then
        raise exception 'Expected 0 existing target POI+SKU mappings before delta, got %', v_existing_gap_count;
    end if;
end $$;

insert into yy_product
(id, tenant_id, store_id, product_type, product_name, price, duration_minutes, selection_price, album_product_name, status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(900000000000020230, '000000', null, 'DOUYIN_LIFE', '【孕妈准爸合影】孕妇照双人｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台', 329.00, 30, null, '', '0', 1030, 103, 1, now(), 1, now(), '0', '抖音来客真实账户只读发现 2026-06-17；DOUYIN_LIFE_SKU=1867489036547136；DOUYIN_LIFE_PRODUCT=1867489036547136；证据 douyin-life-real-account-discovery-20260617-140628')
on conflict (id) do nothing;

do $$
declare
    v_product_count integer;
begin
    select count(*)
      into v_product_count
      from yy_product
     where tenant_id = '000000'
       and product_type = 'DOUYIN_LIFE'
       and del_flag = '0'
       and id in (
           900000000000020100,
           900000000000020140,
           900000000000020220,
           900000000000020230
       );

    if v_product_count <> 4 then
        raise exception 'Expected 4 required DOUYIN_LIFE product rows, got %', v_product_count;
    end if;
end $$;

insert into yy_channel_product_mapping
(id, tenant_id, store_id, product_id, channel_type, external_product_id, external_sku_id, external_poi_id, landing_url, landing_path, external_name, mapping_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
select *
  from (
    values
    (900000000000030320::bigint, '000000', 900000000000000200::bigint, 900000000000020230::bigint, 'DOUYIN_LIFE', '1867489036547136', '1867489036547136', '7228779175929186363', '', '', '【孕妈准爸合影】孕妇照双人｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台', 'ACTIVE', 103::bigint, 1::bigint, now(), 1::bigint, now(), '0', '抖音真实账户只读发现确认：一悦照相馆(滨州吾悦店)，POI=7228779175929186363，SKU=1867489036547136，映射到 BZ-WUYUE；不写预约库存'),
    (900000000000030330::bigint, '000000', 900000000000000100::bigint, 900000000000020100::bigint, 'DOUYIN_LIFE', '1765136728900670', '1765136728900670', '7342410951733282851', '', '', '【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取', 'ACTIVE', 103::bigint, 1::bigint, now(), 1::bigint, now(), '0', '抖音真实账户只读发现确认：一悦照相馆(滨州万达店)，POI=7342410951733282851，SKU=1765136728900670，映射到 BZ-WANDA；不写预约库存'),
    (900000000000030340::bigint, '000000', 900000000000000100::bigint, 900000000000020140::bigint, 'DOUYIN_LIFE', '1772297209231363', '1772297209231363', '7342410951733282851', '', '', '儿童证件照｜适用入园、入学、钢琴美术书法舞蹈竞赛考级等｜提供服装化妆｜精修+打印', 'ACTIVE', 103::bigint, 1::bigint, now(), 1::bigint, now(), '0', '抖音真实账户只读发现确认：一悦照相馆(滨州万达店)，POI=7342410951733282851，SKU=1772297209231363，映射到 BZ-WANDA；不写预约库存'),
    (900000000000030350::bigint, '000000', 900000000000000100::bigint, 900000000000020220::bigint, 'DOUYIN_LIFE', '1834803890491392', '1834803890491392', '7342410951733282851', '', '', '【大学开学必备】精致证件照｜三色三版打印｜适用校园卡四六级教资公考、入职晋升｜提供服装化妆|立等可取', 'ACTIVE', 103::bigint, 1::bigint, now(), 1::bigint, now(), '0', '抖音真实账户只读发现确认：一悦照相馆(滨州万达店)，POI=7342410951733282851，SKU=1834803890491392，映射到 BZ-WANDA；不写预约库存')
  ) as source(id, tenant_id, store_id, product_id, channel_type, external_product_id, external_sku_id, external_poi_id, landing_url, landing_path, external_name, mapping_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
 where not exists (
     select 1
       from yy_channel_product_mapping target
      where target.tenant_id = source.tenant_id
        and target.channel_type = source.channel_type
        and target.external_poi_id = source.external_poi_id
        and target.external_sku_id = source.external_sku_id
        and target.del_flag = '0'
 );

do $$
declare
    v_active_count integer;
begin
    select count(*)
      into v_active_count
      from yy_channel_product_mapping
     where tenant_id = '000000'
       and channel_type = 'DOUYIN_LIFE'
       and mapping_status = 'ACTIVE'
       and del_flag = '0'
       and (
            (external_poi_id = '7228779175929186363' and external_sku_id = '1867489036547136' and store_id = 900000000000000200 and product_id = 900000000000020230)
         or (external_poi_id = '7342410951733282851' and external_sku_id = '1765136728900670' and store_id = 900000000000000100 and product_id = 900000000000020100)
         or (external_poi_id = '7342410951733282851' and external_sku_id = '1772297209231363' and store_id = 900000000000000100 and product_id = 900000000000020140)
         or (external_poi_id = '7342410951733282851' and external_sku_id = '1834803890491392' and store_id = 900000000000000100 and product_id = 900000000000020220)
       );

    if v_active_count <> 4 then
        raise exception 'Expected 4 active target POI+SKU mappings after delta, got %', v_active_count;
    end if;
end $$;

commit;
