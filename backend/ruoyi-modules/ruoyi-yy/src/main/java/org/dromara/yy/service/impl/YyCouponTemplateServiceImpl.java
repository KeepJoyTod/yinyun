package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyCouponGrantRecordVo;
import org.dromara.yy.domain.vo.YyCouponInstanceScaffoldVo;
import org.dromara.yy.domain.vo.YyCouponScaffoldVo;
import org.dromara.yy.domain.vo.YyCouponTemplateScaffoldVo;
import org.dromara.yy.service.IYyCouponTemplateService;
import org.springframework.stereotype.Service;

@Service
public class YyCouponTemplateServiceImpl implements IYyCouponTemplateService {

    @Override
    public YyCouponScaffoldVo getCouponScaffold() {
        YyCouponScaffoldVo scaffold = new YyCouponScaffoldVo();
        scaffold.setStatus("scaffold");
        scaffold.setBoundary("券模板、发券记录和券实例为真实营销域预留结构；当前返回脚手架示意数据，不复制订单账本。");
        scaffold.getTemplates().add(template("coupon-cash-01", "新客立减券", "CASH", "scaffold", "全门店", "全服务产品", 3_000L, "与优惠码互斥；不与权益叠加", true, 6, 2, "2026-12-31"));
        scaffold.getTemplates().add(template("coupon-redeem-01", "兑换券脚手架", "REDEEM", "scaffold", "指定门店", "指定套餐", 9_900L, "命中后直接替代指定商品价格", true, 2, 0, "2026-10-01"));
        scaffold.getGrantRecords().add(grant("grant-1", "coupon-cash-01", "新客立减券", "张三", "138****8000", "商家发券", "scaffold"));
        scaffold.getGrantRecords().add(grant("grant-2", "coupon-redeem-01", "兑换券脚手架", "李四", "139****9000", "活动自动发券", "scaffold"));
        scaffold.getInstances().add(instance("instance-1", "coupon-cash-01", "新客立减券", "张三", "USED", "order-1001", "2026-12-31"));
        scaffold.getInstances().add(instance("instance-2", "coupon-redeem-01", "兑换券脚手架", "李四", "RESTORE_PENDING", "order-1002", "2026-10-01"));
        return scaffold;
    }

    private static YyCouponTemplateScaffoldVo template(
        String id,
        String name,
        String type,
        String status,
        String storeScope,
        String productScope,
        Long faceValueCent,
        String stackedWith,
        boolean restoreOnRefund,
        int issuedCount,
        int writeoffCount,
        String expiresAt
    ) {
        YyCouponTemplateScaffoldVo vo = new YyCouponTemplateScaffoldVo();
        vo.setTemplateId(id);
        vo.setTemplateName(name);
        vo.setTemplateType(type);
        vo.setStatus(status);
        vo.setStoreScopeLabel(storeScope);
        vo.setProductScopeLabel(productScope);
        vo.setFaceValueCent(faceValueCent);
        vo.setStackedWith(stackedWith);
        vo.setRestoreOnRefund(restoreOnRefund);
        vo.setIssuedCount(issuedCount);
        vo.setWriteoffCount(writeoffCount);
        vo.setExpiresAt(expiresAt);
        return vo;
    }

    private static YyCouponGrantRecordVo grant(String id, String templateId, String templateName, String customer, String mobile, String source, String status) {
        YyCouponGrantRecordVo vo = new YyCouponGrantRecordVo();
        vo.setGrantId(id);
        vo.setTemplateId(templateId);
        vo.setTemplateName(templateName);
        vo.setTargetCustomer(customer);
        vo.setTargetMobile(mobile);
        vo.setGrantSource(source);
        vo.setStatus(status);
        return vo;
    }

    private static YyCouponInstanceScaffoldVo instance(String id, String templateId, String templateName, String holder, String status, String orderId, String expiresAt) {
        YyCouponInstanceScaffoldVo vo = new YyCouponInstanceScaffoldVo();
        vo.setInstanceId(id);
        vo.setTemplateId(templateId);
        vo.setTemplateName(templateName);
        vo.setHolderName(holder);
        vo.setStatus(status);
        vo.setOrderId(orderId);
        vo.setExpiresAt(expiresAt);
        return vo;
    }
}
