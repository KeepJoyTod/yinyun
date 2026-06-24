package org.dromara.yy.service.impl;

import org.dromara.yy.domain.bo.YyWechatNoticeTestBo;
import org.dromara.yy.domain.vo.YyWechatCapabilityVo;
import org.dromara.yy.domain.vo.YyWechatFieldMappingVo;
import org.dromara.yy.domain.vo.YyWechatWorkbenchVo;
import org.dromara.yy.service.IYyWechatService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 微信生态接入服务实现
 */
@Service
public class YyWechatServiceImpl implements IYyWechatService {

    @Override
    public YyWechatWorkbenchVo workbench() {
        YyWechatWorkbenchVo vo = new YyWechatWorkbenchVo();
        vo.setTitle("微信生态接入工作台");
        vo.setStrategy("第一版优先公众号通知和 H5/小程序预约，微信支付与企业微信客户联系保留接口壳。");
        vo.setH5BookingUrl("/h5/booking");
        vo.setMiniProgramPath("pages/booking/index");
        vo.setServicePhoneField("yy_order.customer_phone / yy_order.remark");
        vo.setCapabilities(List.of(
            new YyWechatCapabilityVo(
                "WECHAT-OA-NOTICE",
                "公众号通知",
                "预约确认、到店提醒、选片提醒、订单状态通知",
                "READY",
                "P1",
                "/yy/wechat/notice/test",
                "配置 appId、appSecret、templateId 后接入 WxJava 发送实现"
            ),
            new YyWechatCapabilityVo(
                "WECHAT-H5-BOOKING",
                "H5/小程序预约",
                "客户从公众号菜单或小程序进入预约页，生成本地预约订单",
                "READY",
                "P1",
                "/h5/booking",
                "复用 yy_order.customer_phone、booking_method、remark 字段"
            ),
            new YyWechatCapabilityVo(
                "WECHAT-PAY",
                "微信支付",
                "预约订金、尾款、加片、冲印等支付场景",
                "RESERVED",
                "P2",
                "/yy/wechat/pay/*",
                "等订单闭环稳定后接入商户号、回调验签和对账"
            ),
            new YyWechatCapabilityVo(
                "WEWORK-CONTACT",
                "企业微信客户联系",
                "客服手机号、客户绑定、企微外部联系人映射",
                "RESERVED",
                "P2",
                "/yy/wechat/work-contact/*",
                "先保留客户手机号与备注字段，后续接企微客户联系 API"
            )
        ));
        vo.setFieldMappings(List.of(
            new YyWechatFieldMappingVo("客户手机号", "yy_order.customer_phone", "通知触达、订单查询、客服回访", true),
            new YyWechatFieldMappingVo("微信 openId/unionId", "后续 yy_customer_wechat.open_id", "公众号通知与小程序身份绑定", false),
            new YyWechatFieldMappingVo("客服手机号", "yy_order.remark", "临时记录客服联系方式，后续独立客户表", false),
            new YyWechatFieldMappingVo("外部订单号", "yy_order.external_order_id", "微信支付单号、渠道单号、退款单号映射", false)
        ));
        return vo;
    }

    @Override
    public String previewNotice(YyWechatNoticeTestBo bo) {
        String orderNo = valueOrDefault(bo == null ? null : bo.getOrderNo(), "未填写订单号");
        String phone = valueOrDefault(bo == null ? null : bo.getCustomerPhone(), "未填写手机号");
        String templateCode = valueOrDefault(bo == null ? null : bo.getTemplateCode(), "booking_reminder");
        String remark = valueOrDefault(bo == null ? null : bo.getRemark(), "无备注");
        return "微信通知接口已预留，模板=" + templateCode + "，订单=" + orderNo + "，手机号=" + phone + "，备注=" + remark;
    }

    private static String valueOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
