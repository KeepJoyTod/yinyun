package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.ClientBookingIntentRequest;
import org.dromara.yy.domain.bo.YyStaffBookingCreateBo;
import org.dromara.yy.domain.vo.ClientBookingIntentVo;

import java.util.Date;

final class YyOrderBookingFactory {

    private YyOrderBookingFactory() {
    }

    static StaffBookingDraft createStaffBooking(YyStaffBookingCreateBo bo) {
        if (bo == null) {
            throw new ServiceException("预约信息不能为空");
        }
        String customerName = StringUtils.substring(StringUtils.trimToEmpty(bo.getCustomerName()), 0, 64);
        String customerPhone = YyClientOrderPhoneMatcher.normalizePhone(bo.getCustomerPhone());
        if (StringUtils.isBlank(customerName)) {
            throw new ServiceException("客户姓名不能为空");
        }
        if (!YyClientOrderPhoneMatcher.isClientLookupPhone(customerPhone)) {
            throw new ServiceException("手机号格式不正确");
        }
        if (bo.getStoreId() == null) {
            throw new ServiceException("门店不能为空");
        }
        if (bo.getServiceGroupId() == null) {
            throw new ServiceException("服务组不能为空");
        }
        String scheduleMode = firstNotBlank(bo.getScheduleMode(), "SCHEDULED").trim().toUpperCase(java.util.Locale.ROOT);
        boolean scheduled = !"UNDECIDED".equals(scheduleMode);
        String slotDate = StringUtils.trimToEmpty(bo.getSlotDate());
        String slotStartTime = StringUtils.trimToEmpty(bo.getSlotStartTime());
        String slotEndTime = StringUtils.trimToEmpty(bo.getSlotEndTime());
        if (scheduled && bo.getArrivalTime() == null) {
            throw new ServiceException("到店时间不能为空");
        }
        if (scheduled && (StringUtils.isBlank(slotDate) || StringUtils.isBlank(slotStartTime) || StringUtils.isBlank(slotEndTime))) {
            throw new ServiceException("预约时段不能为空");
        }
        return new StaffBookingDraft(buildStaffBookingOrder(bo, customerName, customerPhone, scheduled, slotDate, slotStartTime, slotEndTime), scheduled);
    }

    static YyOrder createClientBookingIntent(ClientBookingIntentRequest request, Long defaultStoreId, String defaultTenantId, String ip) {
        String name = StringUtils.substring(StringUtils.trimToEmpty(request.getName()), 0, 64);
        String phone = YyClientOrderPhoneMatcher.normalizePhone(request.getPhone());
        String maskedPhone = YyClientOrderPhoneMatcher.maskPhone(phone);
        String service = StringUtils.trimToEmpty(request.getService());
        if (StringUtils.isBlank(name)) {
            throw new ServiceException("姓名不能为空");
        }
        if (!YyClientOrderPhoneMatcher.isClientLookupPhone(phone)) {
            throw new ServiceException("手机号格式不正确");
        }
        if (StringUtils.isBlank(service)) {
            throw new ServiceException("服务项目不能为空");
        }
        Date now = new Date();
        YyOrder order = new YyOrder();
        order.setTenantId(defaultTenantId);
        order.setStoreId(defaultStoreId);
        order.setOrderNo(generateClientWebOrderNo());
        order.setCustomerName(name);
        order.setCustomerPhone(maskedPhone);
        order.setSource("CLIENT_WEB");
        order.setChannelType("CLIENT_WEB");
        order.setBookingMethod("WEB_INTENT");
        order.setOrderTime(now);
        order.setArrivalTime(request.getArrivalTime());
        order.setStatus("PENDING");
        order.setPayStatus("UNPAID");
        order.setExternalOrderId("");
        order.setWorkstationNo("");
        order.setRemark(buildClientBookingRemark(service, ip));
        return order;
    }

    static ClientBookingIntentVo toClientBookingIntentVo(YyOrder order) {
        ClientBookingIntentVo vo = new ClientBookingIntentVo();
        vo.setOrderNo(order.getOrderNo());
        vo.setStatus(order.getStatus());
        vo.setCustomerPhoneMasked(YyClientOrderPhoneMatcher.maskPhone(order.getCustomerPhone()));
        vo.setArrivalTime(order.getArrivalTime());
        return vo;
    }

    private static YyOrder buildStaffBookingOrder(YyStaffBookingCreateBo bo, String customerName, String customerPhone,
                                                  boolean scheduled, String slotDate, String slotStartTime, String slotEndTime) {
        String submitMode = firstNotBlank(bo.getSubmitMode(), "SAVE").trim().toUpperCase(java.util.Locale.ROOT);
        Long id = IdWorker.getId();
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setStoreId(bo.getStoreId());
        order.setServiceGroupId(bo.getServiceGroupId());
        order.setOrderNo("YY-STAFF-" + id);
        order.setCustomerName(customerName);
        order.setCustomerPhone(customerPhone);
        order.setSource("LOCAL");
        order.setChannelType("LOCAL");
        order.setBookingMethod("STAFF_MANUAL");
        order.setOrderTime(new Date());
        order.setArrivalTime(scheduled ? bo.getArrivalTime() : null);
        order.setStatus("SAVE_AND_RECEIVE".equals(submitMode) ? "SERVING" : firstNotBlank(bo.getStatus(), "PENDING"));
        order.setPayStatus(firstNotBlank(bo.getPayStatus(), "UNPAID"));
        order.setWorkstationNo(StringUtils.substring(StringUtils.trimToEmpty(bo.getWorkstationNo()), 0, 64));
        order.setExternalOrderId("");
        order.setSlotDate(scheduled ? slotDate : null);
        order.setSlotStartTime(scheduled ? slotStartTime : null);
        order.setSlotEndTime(scheduled ? slotEndTime : null);
        order.setRemark(StringUtils.substring(StringUtils.trimToEmpty(bo.getRemark()), 0, 500));
        return order;
    }

    private static String generateClientWebOrderNo() {
        return "YYWEB-" + IdWorker.getIdStr();
    }

    private static String buildClientBookingRemark(String service, String ip) {
        String safeService = StringUtils.substring(service, 0, 160);
        String safeIp = StringUtils.substring(firstClientIp(ip), 0, 64);
        return StringUtils.substring("客户网页预约意向；服务项目：" + safeService + "；来源IP：" + safeIp, 0, 500);
    }

    private static String firstClientIp(String ip) {
        String value = StringUtils.trimToEmpty(ip);
        if (StringUtils.isBlank(value)) {
            return "";
        }
        return value.split(",")[0].trim();
    }

    private static String firstNotBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }

    record StaffBookingDraft(YyOrder order, boolean scheduled) {
    }
}
