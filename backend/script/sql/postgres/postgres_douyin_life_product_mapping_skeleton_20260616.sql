-- DOUYIN_LIFE real SKU/POI mapping skeleton from production yy_channel_order_mapping.raw_payload.
-- Safe intent:
--   1. Seed local yy_product rows from real Douyin Life SKU names.
--   2. Seed yy_channel_product_mapping rows for real POI+SKU combinations.
--   3. Keep mapping_status='NEED_MAPPING' and store_id=null so resolver will NOT auto-assign yy_order.store_id.
--   4. After POI -> real yy_store evidence is confirmed, update store_id + mapping_status='ACTIVE', then rerun orders/backfill.

begin;

insert into yy_product
(id, tenant_id, store_id, product_type, product_name, price, duration_minutes, selection_price, album_product_name, status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(900000000000020100, '000000', null, 'DOUYIN_LIFE', '【暑期特惠】精致证件照-经典通用', 68.80, 30, null, '', '0', 900, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1765136728900670；DOUYIN_LIFE_PRODUCT=1765136728900670；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020110, '000000', null, 'DOUYIN_LIFE', '结婚登记照/情侣红底纪念照', 79.00, 30, null, '', '0', 910, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1765149825801219；DOUYIN_LIFE_PRODUCT=1765149825801219；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020120, '000000', null, 'DOUYIN_LIFE', '单人艺术写真—【生日｜肖像｜轻纱｜桌前｜简约｜韩系｜赫本】（下单后后预约拍摄）', 109.00, 30, null, '', '0', 920, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1769659221370883；DOUYIN_LIFE_PRODUCT=1769659221370883；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020130, '000000', null, 'DOUYIN_LIFE', '【暑假特惠】情侣双人写真（下单后提前预约）', 89.00, 30, null, '', '0', 930, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1768849478367259；DOUYIN_LIFE_PRODUCT=1768849478367259；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020140, '000000', null, 'DOUYIN_LIFE', '【暑期特惠】儿童证件照-入园入学考级', 49.00, 30, null, '', '0', 940, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1772297209231363；DOUYIN_LIFE_PRODUCT=1772297209231363；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020150, '000000', null, 'DOUYIN_LIFE', '精致全家福（4人）', 129.00, 30, null, '', '0', 950, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1765140171245581；DOUYIN_LIFE_PRODUCT=1765140171245581；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020160, '000000', null, 'DOUYIN_LIFE', '精致证件照三底色-经典通用', 119.00, 30, null, '', '0', 960, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1770473343276035；DOUYIN_LIFE_PRODUCT=1770473343276035；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020170, '000000', null, 'DOUYIN_LIFE', '儿童证件照-入园、入学、身份证、考级、...', 49.00, 30, null, '', '0', 970, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1765138590111751；DOUYIN_LIFE_PRODUCT=1765138590111751；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020180, '000000', null, 'DOUYIN_LIFE', '958代1100元全家福代金券', 958.00, 30, null, '', '0', 980, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1770943384350776；DOUYIN_LIFE_PRODUCT=1770943384350776；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020190, '000000', null, 'DOUYIN_LIFE', '职业形象照', 89.00, 30, null, '', '0', 990, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1765154542674967；DOUYIN_LIFE_PRODUCT=1765154542674967；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020200, '000000', null, 'DOUYIN_LIFE', '【特惠套餐】情侣红底合照＋双人证件照', 199.00, 30, null, '', '0', 1000, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1769659946240043；DOUYIN_LIFE_PRODUCT=1769659946240043；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020210, '000000', null, 'DOUYIN_LIFE', '单人好孕照（送全部底片）', 199.00, 30, null, '', '0', 1010, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1768121210918952；DOUYIN_LIFE_PRODUCT=1768121210918952；POI 待确认真实门店后再启用 ACTIVE 映射'),
(900000000000020220, '000000', null, 'DOUYIN_LIFE', '【大学开学必备】精致证件照｜三色三版打印｜适用校园卡四六级教资公考、入职晋升｜提供服装化妆|立等可取', 103.00, 30, null, '', '0', 1020, 103, 1, now(), 1, now(), '0', '抖音来客真实订单提炼骨架；DOUYIN_LIFE_SKU=1834803890491392；DOUYIN_LIFE_PRODUCT=1834803890491392；POI 待确认真实门店后再启用 ACTIVE 映射')
on conflict (id) do nothing;

insert into yy_channel_product_mapping
(id, tenant_id, store_id, product_id, channel_type, external_product_id, external_sku_id, external_poi_id, landing_url, landing_path, external_name, mapping_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(900000000000030100, '000000', null, 900000000000020100, 'DOUYIN_LIFE', '1765136728900670', '1765136728900670', '7228779175929186363', '', '', '【暑期特惠】精致证件照-经典通用', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=604；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030110, '000000', null, 900000000000020110, 'DOUYIN_LIFE', '1765149825801219', '1765149825801219', '7228779175929186363', '', '', '结婚登记照/情侣红底纪念照', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=169；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030120, '000000', null, 900000000000020120, 'DOUYIN_LIFE', '1769659221370883', '1769659221370883', '7228779175929186363', '', '', '单人艺术写真—【生日｜肖像｜轻纱｜桌前｜简约｜韩系｜赫本】（下单后后预约拍摄）', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=50；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030130, '000000', null, 900000000000020130, 'DOUYIN_LIFE', '1768849478367259', '1768849478367259', '7228779175929186363', '', '', '【暑假特惠】情侣双人写真（下单后提前预约）', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=45；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030140, '000000', null, 900000000000020140, 'DOUYIN_LIFE', '1772297209231363', '1772297209231363', '7228779175929186363', '', '', '【暑期特惠】儿童证件照-入园入学考级', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=33；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030150, '000000', null, 900000000000020150, 'DOUYIN_LIFE', '1765140171245581', '1765140171245581', '7228779175929186363', '', '', '精致全家福（4人）', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=28；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030160, '000000', null, 900000000000020160, 'DOUYIN_LIFE', '1770473343276035', '1770473343276035', '7228779175929186363', '', '', '精致证件照三底色-经典通用', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=22；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030170, '000000', null, 900000000000020170, 'DOUYIN_LIFE', '1765138590111751', '1765138590111751', '7228779175929186363', '', '', '儿童证件照-入园、入学、身份证、考级、...', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=15；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030180, '000000', null, 900000000000020180, 'DOUYIN_LIFE', '1770943384350776', '1770943384350776', '7228779175929186363', '', '', '958代1100元全家福代金券', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=15；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030190, '000000', null, 900000000000020190, 'DOUYIN_LIFE', '1765154542674967', '1765154542674967', '7228779175929186363', '', '', '职业形象照', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=8；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030200, '000000', null, 900000000000020200, 'DOUYIN_LIFE', '1769659946240043', '1769659946240043', '7228779175929186363', '', '', '【特惠套餐】情侣红底合照＋双人证件照', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=7；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030210, '000000', null, 900000000000020210, 'DOUYIN_LIFE', '1768121210918952', '1768121210918952', '7228779175929186363', '', '', '单人好孕照（送全部底片）', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=6；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030220, '000000', null, 900000000000020100, 'DOUYIN_LIFE', '1765136728900670', '1765136728900670', '7555006097638393865', '', '', '【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=2；POI 归属未确认，禁止改 ACTIVE 或归真实店'),
(900000000000030230, '000000', null, 900000000000020220, 'DOUYIN_LIFE', '1834803890491392', '1834803890491392', '7228779175929186363', '', '', '【大学开学必备】精致证件照｜三色三版打印｜适用校园卡四六级教资公考、入职晋升｜提供服装化妆|立等可取', 'NEED_MAPPING', 103, 1, now(), 1, now(), '0', '从 DOUYIN_LIFE 历史订单 rawPayload 提炼；orders=1；POI 归属未确认，禁止改 ACTIVE 或归真实店')
on conflict (id) do nothing;

commit;
