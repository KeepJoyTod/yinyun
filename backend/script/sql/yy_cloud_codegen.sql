-- ----------------------------
-- 影约云代码生成配置 MySQL 脚本
-- 使用方式：
-- 1. 先执行 yy_cloud.sql 或 postgres/postgres_yy_cloud.sql 建表。
-- 2. 在“系统工具 / 代码生成”导入 yy_ 开头的业务表。
-- 3. 统一使用下方配置：package_name=org.dromara.yy，module_name=yy。
-- 4. 本脚本只固化 gen_table 基础配置；字段配置建议导入表后在页面点击“同步”。
-- ----------------------------

insert ignore into gen_table
(table_id, data_name, table_name, table_comment, sub_table_name, sub_table_fk_name, class_name, tpl_category, package_name, module_name, business_name, function_name, function_author, gen_type, gen_path, options, create_dept, create_by, create_time, update_by, update_time, remark)
values
(7201, 'default', 'yy_store', '影约云门店', null, null, 'YyStore', 'crud', 'org.dromara.yy', 'yy', 'store', '门店管理', 'yy', '0', '/', '', 103, 1, now(), null, null, 'B-008 门店管理'),
(7202, 'default', 'yy_product', '影约云产品', null, null, 'YyProduct', 'crud', 'org.dromara.yy', 'yy', 'product', '产品管理', 'yy', '0', '/', '', 103, 1, now(), null, null, 'B-022 在线选片配置'),
(7203, 'default', 'yy_order', '影约云预约订单', null, null, 'YyOrder', 'crud', 'org.dromara.yy', 'yy', 'order', '预约订单', 'yy', '0', '/', '', 103, 1, now(), null, null, 'B-029 预约订单列表'),
(7204, 'default', 'yy_photo_album', '影约云相册', null, null, 'YyPhotoAlbum', 'crud', 'org.dromara.yy', 'yy', 'photoAlbum', '客片相册', 'yy', '0', '/', '', 103, 1, now(), null, null, 'C-020 客片相册'),
(7205, 'default', 'yy_photo_asset', '影约云底片', null, null, 'YyPhotoAsset', 'crud', 'org.dromara.yy', 'yy', 'photoAsset', '底片列表', 'yy', '0', '/', '', 103, 1, now(), null, null, 'C-020 底片列表'),
(7206, 'default', 'yy_channel_plugin', '影约云渠道插件', null, null, 'YyChannelPlugin', 'crud', 'org.dromara.yy', 'yy', 'channelPlugin', '渠道插件', 'yy', '0', '/', '', 103, 1, now(), null, null, 'B-026/B-027 渠道插件'),
(7207, 'default', 'yy_channel_account', '影约云渠道授权账号', null, null, 'YyChannelAccount', 'crud', 'org.dromara.yy', 'yy', 'channelAccount', '渠道授权账号', 'yy', '0', '/', '', 103, 1, now(), null, null, '渠道授权'),
(7208, 'default', 'yy_channel_product_mapping', '影约云渠道商品映射', null, null, 'YyChannelProductMapping', 'crud', 'org.dromara.yy', 'yy', 'channelProductMapping', '渠道商品映射', 'yy', '0', '/', '', 103, 1, now(), null, null, '抖音/美团商品映射'),
(7209, 'default', 'yy_channel_order_mapping', '影约云渠道订单映射', null, null, 'YyChannelOrderMapping', 'crud', 'org.dromara.yy', 'yy', 'channelOrderMapping', '渠道订单映射', 'yy', '0', '/', '', 103, 1, now(), null, null, '外部订单映射'),
(7210, 'default', 'yy_channel_sync_log', '影约云渠道同步日志', null, null, 'YyChannelSyncLog', 'crud', 'org.dromara.yy', 'yy', 'channelSyncLog', '渠道同步日志', 'yy', '0', '/', '', 103, 1, now(), null, null, '渠道接口日志'),
(7211, 'default', 'yy_service_group', '影约云服务组', null, null, 'YyServiceGroup', 'crud', 'org.dromara.yy', 'yy', 'serviceGroup', '预约配置', 'yy', '0', '/', '', 103, 1, now(), null, null, '预约配置与排期'),
(7212, 'default', 'yy_schedule_rule', '影约云预约排期规则', null, null, 'YyScheduleRule', 'crud', 'org.dromara.yy', 'yy', 'scheduleRule', '预约排期', 'yy', '0', '/', '', 103, 1, now(), null, null, '预约配置与排期'),
(7213, 'default', 'yy_employee', '影约云员工', null, null, 'YyEmployee', 'crud', 'org.dromara.yy', 'yy', 'employee', '员工管理', 'yy', '0', '/', '', 103, 1, now(), null, null, '门店员工台账'),
(7214, 'default', 'yy_customer', '影约云客户', null, null, 'YyCustomer', 'crud', 'org.dromara.yy', 'yy', 'customer', '客户管理', 'yy', '0', '/', '', 103, 1, now(), null, null, '客户档案'),
(7215, 'default', 'yy_notification_template', '影约云通知模板', null, null, 'YyNotificationTemplate', 'crud', 'org.dromara.yy', 'yy', 'notificationTemplate', '通知模板', 'yy', '0', '/', '', 103, 1, now(), null, null, '公众号/短信/企微通知'),
(7216, 'default', 'yy_notification_log', '影约云通知日志', null, null, 'YyNotificationLog', 'crud', 'org.dromara.yy', 'yy', 'notificationLog', '通知日志', 'yy', '0', '/', '', 103, 1, now(), null, null, '通知发送记录'),
(7217, 'default', 'yy_report_snapshot', '影约云报表快照', null, null, 'YyReportSnapshot', 'crud', 'org.dromara.yy', 'yy', 'reportSnapshot', '经营报表', 'yy', '0', '/', '', 103, 1, now(), null, null, '经营报表快照'),
(7218, 'default', 'yy_mobile_channel_config', '影约云多端入口配置', null, null, 'YyMobileChannelConfig', 'crud', 'org.dromara.yy', 'yy', 'mobileChannelConfig', '多端预约', 'yy', '0', '/', '', 103, 1, now(), null, null, 'H5/小程序/App 入口配置');

-- 手写，不走代码生成：
-- yy_dashboard：预约概况聚合接口。
-- yy_channel_adapter：DouyinChannelAdapter / MeituanChannelAdapter。
