package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyOrderCopyBo;

import java.util.Date;
import java.util.List;
import java.util.Locale;

final class YyOrderCopyFactory {

    private YyOrderCopyFactory() {
    }

    static CopyDraft createCopy(YyOrder source, YyOrderCopyBo bo) {
        if (source == null) {
            throw new ServiceException("Source order not found");
        }
        if (bo == null) {
            throw new ServiceException("Copy payload must not be null");
        }
        if (source.getStoreId() == null) {
            throw new ServiceException("Source order store is required");
        }
        if (source.getServiceGroupId() == null) {
            throw new ServiceException("Source order service group is required");
        }
        String customerName = StringUtils.substring(StringUtils.trimToEmpty(source.getCustomerName()), 0, 64);
        String customerPhone = YyClientOrderPhoneMatcher.normalizePhone(source.getCustomerPhone());
        if (StringUtils.isBlank(customerName)) {
            throw new ServiceException("Source order customer name is required");
        }
        if (!YyClientOrderPhoneMatcher.isClientLookupPhone(customerPhone)) {
            throw new ServiceException("Source order customer phone is invalid");
        }

        String scheduleMode = StringUtils.defaultIfBlank(bo.getScheduleMode(), "REUSE_SLOT")
            .trim()
            .toUpperCase(Locale.ROOT);
        boolean scheduled = !"UNDECIDED".equals(scheduleMode);
        String slotDate = StringUtils.trimToEmpty(bo.getSlotDate());
        String slotStartTime = StringUtils.trimToEmpty(bo.getSlotStartTime());
        String slotEndTime = StringUtils.trimToEmpty(bo.getSlotEndTime());
        if (scheduled) {
            if (bo.getArrivalTime() == null) {
                throw new ServiceException("arrivalTime is required when reusing slot");
            }
            if (StringUtils.isAnyBlank(slotDate, slotStartTime, slotEndTime)) {
                throw new ServiceException("slotDate/slotStartTime/slotEndTime are required when reusing slot");
            }
        }

        Long id = IdWorker.getId();
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setTenantId(source.getTenantId());
        order.setStoreId(source.getStoreId());
        order.setServiceGroupId(source.getServiceGroupId());
        order.setOrderNo("YY-COPY-" + id);
        order.setCustomerName(customerName);
        order.setCustomerPhone(customerPhone);
        order.setSource("LOCAL");
        order.setChannelType("LOCAL");
        order.setBookingMethod("STAFF_COPY");
        order.setOrderTime(new Date());
        order.setArrivalTime(scheduled ? bo.getArrivalTime() : null);
        order.setStatus("PENDING");
        order.setPayStatus("UNPAID");
        order.setWorkstationNo(StringUtils.substring(StringUtils.trimToEmpty(source.getWorkstationNo()), 0, 64));
        order.setTotalAmountCent(source.getTotalAmountCent());
        order.setPaidAmountCent(0L);
        order.setPaidTime(null);
        order.setRefundStatus("");
        order.setRefundAmountCent(0L);
        order.setExternalOrderId("");
        order.setExternalProductId("");
        order.setExternalSkuId("");
        order.setExternalPoiId("");
        order.setInventorySlotId(null);
        order.setInventoryStatus("");
        order.setConflictReason("");
        order.setOrderAttributeJson(StringUtils.defaultString(source.getOrderAttributeJson(), ""));
        order.setSlotDate(scheduled ? slotDate : null);
        order.setSlotStartTime(scheduled ? slotStartTime : null);
        order.setSlotEndTime(scheduled ? slotEndTime : null);
        order.setRemark(buildRemark(source, bo.getRemark()));
        return new CopyDraft(order, scheduled);
    }

    private static String buildRemark(YyOrder source, String remark) {
        String sourceOrderNo = StringUtils.defaultIfBlank(StringUtils.trimToEmpty(source.getOrderNo()), String.valueOf(source.getId()));
        String sourceHint = String.format("Copied from order %s/%s", sourceOrderNo, source.getId());
        return StringUtils.substring(
            String.join("\n", List.of(
                StringUtils.trimToEmpty(source.getRemark()),
                sourceHint,
                StringUtils.trimToEmpty(remark)
            )).trim(),
            0,
            500
        );
    }

    record CopyDraft(YyOrder order, boolean scheduled) {
    }
}
