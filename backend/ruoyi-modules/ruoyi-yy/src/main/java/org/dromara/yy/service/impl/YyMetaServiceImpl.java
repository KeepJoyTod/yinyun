package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyEnterpriseModuleVo;
import org.dromara.yy.domain.vo.YyPriorityFeatureVo;
import org.dromara.yy.service.IYyMetaService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 影约云元数据服务实现
 */
@Service
public class YyMetaServiceImpl implements IYyMetaService {

    private static final List<YyPriorityFeatureVo> PRIORITY_FEATURES = List.of(
        new YyPriorityFeatureVo(
            "B-029",
            "预约订单",
            "预约订单列表",
            "P0-1",
            "优先开发",
            "订单列表、来源筛选、状态流转、导出与明细",
            "src/views/yy/order/index.vue",
            "先补可筛选的订单主列表"
        ),
        new YyPriorityFeatureVo(
            "B-002",
            "首页看板",
            "预约概况",
            "P0-2",
            "优先开发",
            "订单状态、时段工位、趋势聚合",
            "src/views/yy/dashboard/index.vue",
            "先做聚合看板"
        ),
        new YyPriorityFeatureVo(
            "B-008",
            "门店管理",
            "门店卡片",
            "P0-3",
            "优先开发",
            "门店状态、本月订单、待服务单、地址资料",
            "src/views/yy/store/index.vue",
            "先做门店 CRUD + 卡片指标"
        ),
        new YyPriorityFeatureVo(
            "B-022",
            "产品配置",
            "在线选片配置",
            "P0-4",
            "优先开发",
            "选片单价、入册产品、渠道产品映射",
            "src/views/yy/product/index.vue",
            "并入产品管理一起交付"
        ),
        new YyPriorityFeatureVo(
            "C-020",
            "底片/选片",
            "底片列表",
            "P0-5",
            "优先开发",
            "相册、底片、选片状态、公开分享入口",
            "src/views/yy/photo/index.vue",
            "后台先可管理客片与底片"
        ),
        new YyPriorityFeatureVo(
            "B-026",
            "渠道插件",
            "抖音产品",
            "P0-6",
            "优先开发",
            "服务市场已购查询、购买明细、订单事件 webhook、同步日志",
            "src/views/yy/channel/douyin/index.vue",
            "先做服务市场平台应用插件骨架与 mock adapter"
        ),
        new YyPriorityFeatureVo(
            "B-026-LIFE",
            "渠道插件",
            "抖音来客",
            "P0-7",
            "优先开发",
            "生活服务团购查单、接单/拒单、支付通知、订单映射",
            "src/views/yy/channel/life/index.vue",
            "先做生活服务订单闭环，再接本地预约同步"
        ),
        new YyPriorityFeatureVo(
            "B-027",
            "渠道插件",
            "美团产品",
            "P0-8",
            "优先开发",
            "未开通态、核销占位、商品映射、同步日志",
            "src/views/yy/channel/meituan/index.vue",
            "先做同一套插件抽象"
        )
    );

    private static final List<YyEnterpriseModuleVo> ENTERPRISE_MODULES = List.of(
        new YyEnterpriseModuleVo(
            "P1-BOOKING-CONFIG",
            "第二批运营底座",
            "预约配置",
            "P1",
            "结构已补",
            "src/views/yy/booking-config/index.vue",
            "yy_service_group / yy_schedule_rule",
            "服务组、预约时长、日容量、工作日时段、满员规则",
            "yy_store / yy_product / yy_order",
            "先接订单下单校验，再补 H5/小程序可预约时段"
        ),
        new YyEnterpriseModuleVo(
            "P1-EMPLOYEE",
            "第二批运营底座",
            "员工管理",
            "P1",
            "结构已补",
            "src/views/yy/employee/index.vue",
            "yy_employee",
            "员工台账、门店归属、系统用户绑定、岗位技能、启停状态",
            "sys_user / sys_role / yy_store / yy_order",
            "先让订单可分配员工，再接员工业绩报表"
        ),
        new YyEnterpriseModuleVo(
            "P1-CUSTOMER",
            "第二批运营底座",
            "客户管理",
            "P1",
            "结构已补",
            "src/views/yy/customer/index.vue",
            "yy_customer",
            "客户档案、手机号去重、预约历史、消费汇总、标签备注",
            "yy_order / yy_photo_album / yy_channel_order_mapping",
            "先从订单沉淀客户，再做客户详情页"
        ),
        new YyEnterpriseModuleVo(
            "P1-NOTIFICATION",
            "第二批运营底座",
            "通知中心",
            "P1",
            "结构已补",
            "src/views/yy/notification/index.vue",
            "yy_notification_template / yy_notification_log",
            "预约确认、到店提醒、选片提醒、渠道同步失败告警",
            "微信生态 / 短信服务商 / SnailJob",
            "先落发送日志和模板，再接真实微信/短信 SDK"
        ),
        new YyEnterpriseModuleVo(
            "P1-MOBILE",
            "多端入口",
            "H5/小程序/App",
            "P1",
            "结构已补",
            "src/views/yy/mobile/index.vue",
            "yy_mobile_channel_config",
            "多端预约入口、渠道 AppID、回调地址、SDK 接入状态",
            "预约配置 / 微信生态 / 支付配置",
            "先做 H5 和微信小程序配置，再评估 App"
        ),
        new YyEnterpriseModuleVo(
            "P2-REPORT",
            "第三批经营分析",
            "经营报表",
            "P2",
            "结构已补",
            "src/views/yy/report/index.vue",
            "yy_report_snapshot",
            "门店日报、预约来源、选片收入、员工绩效、渠道统计",
            "yy_order / yy_photo_asset / yy_channel_sync_log",
            "先做日报快照，再做趋势图和导出"
        )
    );

    @Override
    public List<YyPriorityFeatureVo> listPriorityFeatures() {
        return PRIORITY_FEATURES;
    }

    @Override
    public List<YyEnterpriseModuleVo> listEnterpriseModules() {
        return ENTERPRISE_MODULES;
    }
}
