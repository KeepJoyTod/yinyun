-- ----------------------------
-- 影约云演示数据 PostgreSQL 脚本
-- 用途：本地联调 7 个标红核心功能页面，生产环境可不执行。
-- 依赖：已先执行 postgres_yy_cloud.sql。
-- ----------------------------

insert into yy_store
(id, tenant_id, store_code, store_name, status, phone, address, business_hours, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(900001, '000000', 'YY-BJ-001', '朝阳旗舰店', '0', '010-88886666', '北京市朝阳区影约云摄影中心', '09:00-21:00', 1, 103, 1, now(), 1, now(), '0', '演示门店：核心预约与选片闭环'),
(900002, '000000', 'YY-SH-001', '徐汇亲子店', '0', '021-66668888', '上海市徐汇区亲子摄影空间', '10:00-20:00', 2, 103, 1, now(), 1, now(), '0', '演示门店：多门店筛选')
on conflict do nothing;

insert into yy_product
(id, tenant_id, store_id, product_type, product_name, price, duration_minutes, selection_price, album_product_name, status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(901001, '000000', 900001, 'SERVICE', '证件照精修套餐', 199.00, 45, 20.00, '精修入册10张', '0', 1, 103, 1, now(), 1, now(), '0', 'B-022 在线选片配置样例'),
(901002, '000000', 900001, 'GROUP_BUY', '亲子摄影团单', 399.00, 90, 25.00, '亲子相册20张', '0', 2, 103, 1, now(), 1, now(), '0', '团单产品样例'),
(901003, '000000', 900002, 'DOUYIN', '抖音写真预约套餐', 299.00, 60, 30.00, '写真精选12张', '0', 3, 103, 1, now(), 1, now(), '0', 'B-026 抖音产品插件样例'),
(901004, '000000', 900002, 'MEITUAN', '美团亲子核销套餐', 499.00, 120, 35.00, '家庭相册30张', '0', 4, 103, 1, now(), 1, now(), '0', 'B-027 美团产品插件样例')
on conflict do nothing;

insert into yy_order
(id, tenant_id, store_id, order_no, customer_name, customer_phone, source, booking_method, order_time, arrival_time, status, workstation_no, external_order_id, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(902001, '000000', 900001, 'YY202606010001', '李女士', '13800001111', 'LOCAL', 'MANUAL', now(), now() + interval '1 day', 'PENDING', 'A01', '', 103, 1, now(), 1, now(), '0', 'B-029 待确认预约订单'),
(902002, '000000', 900001, 'YY202606010002', '张先生', '13800002222', 'DOUYIN', 'CHANNEL', now() - interval '2 hour', now(), 'ARRIVED', 'A02', 'DY-20260601-0002', 103, 1, now(), 1, now(), '0', '抖音渠道到店订单'),
(902003, '000000', 900002, 'YY202605310003', '王女士', '13800003333', 'MEITUAN', 'CHANNEL', now() - interval '1 day', now() - interval '3 hour', 'COMPLETED', 'B01', 'MT-20260531-0003', 103, 1, now(), 1, now(), '0', '已完成并进入选片'),
(902004, '000000', 900002, 'YY202606010004', '赵女士', '13800004444', 'LOCAL', 'H5', now() - interval '1 hour', now() + interval '2 day', 'CONFIRMED', 'B02', '', 103, 1, now(), 1, now(), '0', 'H5 已确认预约'),
(902005, '000000', 900001, 'YY202606010005', '周女士', '13800005555', 'WECHAT', 'MINI_APP', now(), now() + interval '3 day', 'CONFIRMED', 'A03', 'WX-20260601-0005', 103, 1, now(), 1, now(), '0', '微信小程序预约样例')
on conflict do nothing;

insert into yy_photo_album
(id, tenant_id, store_id, order_id, album_name, customer_name, customer_phone, public_token, access_code, channel_type, status, selection_status, douyin_order_id, certificate_code, book_id, expire_time, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(903001, '000000', 900002, 902003, '王女士亲子套系选片', '王女士', '13800003333', 'demo-album-wang-202606', 'PICK-202606-001', 'H5', 'ACTIVE', 'SELECTING', '', '', '', now() + interval '14 day', 103, 1, now(), 1, now(), '0', 'C-020 底片/在线选片样例'),
(903002, '000000', 900001, 902002, '张先生写真底片', '张先生', '13800002222', 'demo-album-zhang-202606', 'PICK-202606-002', 'DOUYIN_LIFE', 'ACTIVE', 'WAITING', 'DY-LIFE-20260601-0002', 'CERT-202606-002', 'BOOK-202606-002', now() + interval '7 day', 103, 1, now(), 1, now(), '0', '待客户选片样例')
on conflict do nothing;

insert into yy_photo_asset
(id, tenant_id, store_id, album_id, file_name, file_url, object_key, thumbnail_object_key, sort, is_selected, visible, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(904001, '000000', 900002, 903001, 'IMG_0001.jpg', '/favicon.ico', 'photos/wang/IMG_0001.jpg', 'thumbs/wang/IMG_0001.jpg', 1, '1', '0', 103, 1, now(), 1, now(), '0', '占位底片，仅后台样例，客户侧不展示'),
(904002, '000000', 900002, 903001, 'IMG_0002.jpg', '/favicon.ico', 'photos/wang/IMG_0002.jpg', 'thumbs/wang/IMG_0002.jpg', 2, '0', '0', 103, 1, now(), 1, now(), '0', '占位底片，仅后台样例，客户侧不展示'),
(904003, '000000', 900001, 903002, 'PORTRAIT_0001.jpg', '/favicon.ico', 'photos/zhang/PORTRAIT_0001.jpg', 'thumbs/zhang/PORTRAIT_0001.jpg', 1, '0', '0', 103, 1, now(), 1, now(), '0', '占位底片，仅后台样例，客户侧不展示')
on conflict do nothing;

insert into yy_photo_access_log
(id, tenant_id, store_id, album_id, asset_id, customer_phone, platform, action, ip, success, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(904101, '000000', 900002, 903001, 904001, '13800003333', 'H5', 'VERIFY', '127.0.0.1', '1', 103, 1, now(), 1, now(), '0', '取片访问日志样例')
on conflict do nothing;

insert into yy_photo_verify_code
(id, tenant_id, phone, verify_code, scene, platform, expire_time, used_time, status, ip, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(904201, '000000', '13800003333', '123456', 'PHOTO_PICKUP', 'H5', now() + interval '5 minute', null, 'CREATED', '127.0.0.1', 103, 1, now(), 1, now(), '0', '取片验证码样例')
on conflict do nothing;

insert into yy_channel_plugin
(id, tenant_id, channel_type, plugin_name, enabled, auth_status, open_tip, last_sync_time, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(905001, '000000', 'DOUYIN', '抖音服务市场平台应用插件', '0', 'UNOPENED', '抖音服务市场平台应用未开通，请先准备 client_key、service_id、测试白名单和 webhook 回调', null, 103, 1, now(), 1, now(), '0', 'B-026 抖音服务市场平台应用占位'),
(905002, '000000', 'MEITUAN', '美团核销工具插件', '0', 'UNOPENED', '当前提示美团核销工具未开通，应作为渠道插件', null, 103, 1, now(), 1, now(), '0', 'B-027 美团产品插件占位'),
(905003, '000000', 'WECHAT', '微信生态接入插件', '0', 'UNOPENED', '公众号通知、小程序预约、微信支付、企微客户联系先作为接口壳', null, 103, 1, now(), 1, now(), '0', '微信生态接口占位'),
(905004, '000000', 'DOUYIN_LIFE', '抖音来客生活服务插件', '0', 'UNOPENED', '抖音来客团购订单、支付通知、接单拒单和订单映射先作为接口壳', null, 103, 1, now(), 1, now(), '0', '抖音来客生活服务插件占位')
on conflict do nothing;

insert into yy_channel_account
(id, tenant_id, store_id, channel_type, account_name, app_key, app_secret_enc, service_id, service_mode_id, service_market_app_id, service_market_path, test_open_id, webhook_url, access_token_enc, refresh_token_enc, expires_at, status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(906001, '000000', 900002, 'DOUYIN', '抖音门店账号待授权', '', '', '', '', '', '', '', '/yy/channel/DOUYIN/webhook', '', '', null, 'UNAUTHORIZED', 103, 1, now(), 1, now(), '0', '抖音服务市场：client_key/client_secret/service_id/service_mode_id/open_id/webhook 待配置'),
(906002, '000000', 900002, 'MEITUAN', '美团门店账号待授权', '', '', '', '', '', '', '', '', '', '', null, 'UNAUTHORIZED', 103, 1, now(), 1, now(), '0', '美团账号授权占位'),
(906003, '000000', 900001, 'WECHAT', '微信生态门店待授权', '', '', '', '', '', '', '', '/yy/channel/WECHAT/webhook', '', '', null, 'UNAUTHORIZED', 103, 1, now(), 1, now(), '0', '微信账号授权占位'),
(906004, '000000', 900002, 'DOUYIN_LIFE', '抖音来客门店待授权', '', '', '', '', '', '', '', '/yy/channel/DOUYIN_LIFE/webhook', '', '', null, 'UNAUTHORIZED', 103, 1, now(), 1, now(), '0', '抖音来客：client_key/client_secret/account_id/webhook 待配置')
on conflict do nothing;

insert into yy_channel_product_mapping
(id, tenant_id, store_id, product_id, channel_type, external_product_id, external_sku_id, external_poi_id, landing_url, landing_path, external_name, mapping_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(907001, '000000', 900002, 901003, 'DOUYIN', 'DY-PROD-DEMO-001', 'DY-SKU-DEMO-001', '', '', '', '抖音写真预约套餐', 'UNMAPPED', 103, 1, now(), 1, now(), '0', '抖音产品映射占位'),
(907002, '000000', 900002, 901004, 'MEITUAN', 'MT-PROD-DEMO-001', 'MT-SKU-DEMO-001', '', '', '', '美团亲子核销套餐', 'UNMAPPED', 103, 1, now(), 1, now(), '0', '美团产品映射占位'),
(907003, '000000', 900001, 901001, 'WECHAT', 'WX-PROD-DEMO-001', 'WX-SKU-DEMO-001', '', '', '', '公众号预约套餐', 'UNMAPPED', 103, 1, now(), 1, now(), '0', '微信产品映射占位'),
(907004, '000000', 900002, 901003, 'DOUYIN_LIFE', 'DY-LIFE-PROD-DEMO-001', 'DY-LIFE-SKU-DEMO-001', 'DY-LIFE-POI-DEMO-001', 'https://www.douyin.com/life/demo-order-entry', 'pages/life/goods/detail?product_id=DY-LIFE-PROD-DEMO-001&sku_id=DY-LIFE-SKU-DEMO-001', '抖音来客预约套餐', 'MAPPED', 103, 1, now(), 1, now(), '0', '抖音来客真实下单入口占位')
on conflict do nothing;

insert into yy_channel_order_mapping
(id, tenant_id, store_id, order_id, channel_type, external_order_id, external_status, sync_status, raw_payload, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(908001, '000000', 900001, 902002, 'DOUYIN', 'DY-20260601-0002', 'UNOPENED', 'PENDING', jsonb_build_object('source', 'demo', 'channel', 'douyin'), 103, 1, now(), 1, now(), '0', '抖音订单同步占位'),
(908002, '000000', 900002, 902003, 'MEITUAN', 'MT-20260531-0003', 'VERIFIED', 'SYNCED', jsonb_build_object('source', 'demo', 'channel', 'meituan'), 103, 1, now(), 1, now(), '0', '美团订单核销占位'),
(908003, '000000', 900001, 902005, 'WECHAT', 'WX-20260601-0005', 'PENDING', 'PENDING', jsonb_build_object('source', 'demo', 'channel', 'wechat'), 103, 1, now(), 1, now(), '0', '微信预约同步占位'),
(908004, '000000', 900002, 902004, 'DOUYIN_LIFE', 'DY-LIFE-20260601-0004', 'PAY_SUCCESS', 'PENDING', jsonb_build_object('source', 'demo', 'channel', 'douyin_life'), 103, 1, now(), 1, now(), '0', '抖音来客订单同步占位')
on conflict do nothing;

insert into yy_channel_sync_log
(id, tenant_id, store_id, channel_type, api_name, request_id, success, error_message, duration_ms, retryable, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(909001, '000000', 900001, 'DOUYIN', 'market.service.user.purchase.list', 'REQ-DY-DEMO-001', '0', '服务市场平台应用未开通，等待授权与白名单配置', 120, '1', 103, 1, now(), 1, now(), '0', '抖音服务市场同步日志样例'),
(909002, '000000', 900002, 'MEITUAN', 'order.verify', 'REQ-MT-DEMO-001', '1', '', 95, '0', 103, 1, now(), 1, now(), '0', '美团核销日志样例'),
(909003, '000000', 900001, 'WECHAT', 'notice.test', 'REQ-WX-DEMO-001', '0', '微信通知接口已预留', 110, '1', 103, 1, now(), 1, now(), '0', '微信通知测试日志样例'),
(909004, '000000', 900002, 'DOUYIN_LIFE', 'order.payment.notice', 'REQ-DY-LIFE-001', '1', '', 132, '0', 103, 1, now(), 1, now(), '0', '抖音来客支付通知样例')
on conflict do nothing;

insert into yy_service_group
(id, tenant_id, store_id, group_code, group_name, capacity, duration_minutes, status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(910001, '000000', 900001, 'ID-PHOTO', '证件照服务组', 3, 45, '0', 1, 103, 1, now(), 1, now(), '0', 'P1 预约配置样例'),
(910002, '000000', 900002, 'FAMILY', '亲子摄影服务组', 2, 90, '0', 2, 103, 1, now(), 1, now(), '0', 'P1 预约配置样例')
on conflict do nothing;

insert into yy_schedule_rule
(id, tenant_id, store_id, service_group_id, weekday, start_time, end_time, capacity, enabled, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(911001, '000000', 900001, 910001, 1, '09:00', '18:00', 3, '1', 103, 1, now(), 1, now(), '0', '周一证件照预约规则'),
(911002, '000000', 900002, 910002, 6, '10:00', '20:00', 2, '1', 103, 1, now(), 1, now(), '0', '周六亲子摄影预约规则')
on conflict do nothing;

insert into yy_employee
(id, tenant_id, store_id, user_id, employee_no, employee_name, mobile, role_type, skill_tags, status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(912001, '000000', 900001, null, 'EMP-BJ-001', '陈店长', '13600001111', 'MANAGER', '门店管理,订单确认,客户沟通', '0', 1, 103, 1, now(), 1, now(), '0', 'P1 员工管理样例'),
(912002, '000000', 900002, null, 'EMP-SH-001', '摄影师王老师', '13600002222', 'PHOTOGRAPHER', '亲子摄影,选片指导', '0', 2, 103, 1, now(), 1, now(), '0', 'P1 员工管理样例')
on conflict do nothing;

insert into yy_customer
(id, tenant_id, customer_name, mobile, gender, birthday, source, member_level, total_order_count, total_spend, last_order_time, tags, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(913001, '000000', '李女士', '13800001111', '2', null, 'LOCAL', 'NORMAL', 1, 199.00, now(), '证件照', 103, 1, now(), 1, now(), '0', '从预约订单沉淀的客户'),
(913002, '000000', '王女士', '13800003333', '2', null, 'MEITUAN', 'VIP', 2, 899.00, now() - interval '3 hour', '亲子,选片', 103, 1, now(), 1, now(), '0', '渠道客户样例')
on conflict do nothing;

insert into yy_notification_template
(id, tenant_id, template_code, scene, channel_type, title, content, provider_template_id, enabled, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(914001, '000000', 'BOOKING_CONFIRMED', '预约确认', 'WECHAT', '预约已确认', '您好，您的预约 {{orderNo}} 已确认，到店时间 {{arrivalTime}}。', '', '1', 103, 1, now(), 1, now(), '0', '微信/短信通知模板样例'),
(914002, '000000', 'PHOTO_SELECTION_READY', '选片提醒', 'WECHAT', '底片可选', '您好，您的底片已上传，请进入选片链接完成选择。', '', '1', 103, 1, now(), 1, now(), '0', '选片通知模板样例')
on conflict do nothing;

insert into yy_notification_log
(id, tenant_id, store_id, order_id, customer_id, template_id, channel_type, receiver, send_status, request_id, error_message, sent_time, raw_payload, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(915001, '000000', 900001, 902001, 913001, 914001, 'WECHAT', '13800001111', 'PENDING', 'REQ-NOTICE-DEMO-001', '微信服务商未配置', null, jsonb_build_object('scene', 'booking_confirmed'), 103, 1, now(), 1, now(), '0', '通知日志样例'),
(915002, '000000', 900002, 902003, 913002, 914002, 'WECHAT', '13800003333', 'SENT', 'REQ-NOTICE-DEMO-002', '', now(), jsonb_build_object('scene', 'photo_selection_ready'), 103, 1, now(), 1, now(), '0', '通知日志样例')
on conflict do nothing;

insert into yy_report_snapshot
(id, tenant_id, store_id, report_date, report_type, order_total, arrived_total, completed_total, revenue_total, selection_total, source_summary, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(916001, '000000', 900001, current_date, 'DAILY', 3, 1, 0, 199.00, 0.00, jsonb_build_object('LOCAL', 2, 'DOUYIN', 1), 103, 1, now(), 1, now(), '0', '门店日报快照样例'),
(916002, '000000', 900002, current_date, 'DAILY', 2, 1, 1, 899.00, 120.00, jsonb_build_object('MEITUAN', 1, 'H5', 1), 103, 1, now(), 1, now(), '0', '门店日报快照样例')
on conflict do nothing;

insert into yy_mobile_channel_config
(id, tenant_id, channel_type, channel_name, app_id, app_secret_enc, callback_url, enabled, sdk_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)
values
(917001, '000000', 'H5', '手机 H5 预约端', '', '', '/booking', '1', 'READY', 103, 1, now(), 1, now(), '0', '先上线 H5 预约'),
(917002, '000000', 'WECHAT_MINI_APP', '微信小程序预约端', '', '', '/api/wechat/miniapp/callback', '0', 'PENDING', 103, 1, now(), 1, now(), '0', '等待微信小程序 AppID/SDK 配置'),
(917003, '000000', 'APP', 'App 预约端', '', '', '', '0', 'PLANNED', 103, 1, now(), 1, now(), '0', 'App 后置评估')
on conflict do nothing;
