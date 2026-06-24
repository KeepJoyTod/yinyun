package org.dromara.yy.service.impl;

import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.service.IYyBookingSlotInventoryService;

import java.util.Objects;

final class YyOrderInventoryUpdateCoordinator {

    private YyOrderInventoryUpdateCoordinator() {
    }

    static void mergeExistingOrderState(YyOrder update, YyOrder existing) {
        if (StringUtils.isBlank(update.getSource())) {
            update.setSource(existing.getSource());
        }
        if (StringUtils.isBlank(update.getChannelType())) {
            update.setChannelType(firstNotBlank(existing.getChannelType(), update.getSource(), existing.getSource()));
        }
        if (StringUtils.isBlank(update.getExternalOrderId())) {
            update.setExternalOrderId(existing.getExternalOrderId());
        }
        if (StringUtils.isBlank(update.getPayStatus())) {
            update.setPayStatus(existing.getPayStatus());
        }
        if (update.getPaidTime() == null) {
            update.setPaidTime(existing.getPaidTime());
        }
        if (update.getTotalAmountCent() == null) {
            update.setTotalAmountCent(existing.getTotalAmountCent());
        }
        if (update.getPaidAmountCent() == null) {
            update.setPaidAmountCent(existing.getPaidAmountCent());
        }
        if (StringUtils.isBlank(update.getRefundStatus())) {
            update.setRefundStatus(existing.getRefundStatus());
        }
        if (update.getRefundAmountCent() == null) {
            update.setRefundAmountCent(existing.getRefundAmountCent());
        }
        if (StringUtils.isBlank(update.getExternalProductId())) {
            update.setExternalProductId(existing.getExternalProductId());
        }
        if (StringUtils.isBlank(update.getExternalSkuId())) {
            update.setExternalSkuId(existing.getExternalSkuId());
        }
        if (StringUtils.isBlank(update.getExternalPoiId())) {
            update.setExternalPoiId(existing.getExternalPoiId());
        }
        if (update.getServiceGroupId() == null) {
            update.setServiceGroupId(existing.getServiceGroupId());
        }
        if (update.getInventorySlotId() == null) {
            update.setInventorySlotId(existing.getInventorySlotId());
        }
        if (StringUtils.isBlank(update.getSlotDate())) {
            update.setSlotDate(existing.getSlotDate());
        }
        if (StringUtils.isBlank(update.getSlotStartTime())) {
            update.setSlotStartTime(existing.getSlotStartTime());
        }
        if (StringUtils.isBlank(update.getSlotEndTime())) {
            update.setSlotEndTime(existing.getSlotEndTime());
        }
        if (StringUtils.isBlank(update.getInventoryStatus())) {
            update.setInventoryStatus(existing.getInventoryStatus());
        }
        if (StringUtils.isBlank(update.getConflictReason())) {
            update.setConflictReason(existing.getConflictReason());
        }
        if (update.getTenantId() == null) {
            update.setTenantId(existing.getTenantId());
        }
    }

    static void handleInventoryAfterOrderUpdate(YyOrder existing, YyOrder update, boolean slotChanged,
                                                IYyBookingSlotInventoryService bookingSlotInventoryService) {
        if (slotChanged && "CONFIRMED".equals(existing.getInventoryStatus())) {
            bookingSlotInventoryService.releaseConfirmedOrderSlot(existing);
        }
        if (shouldConfirmInventoryAfterUpdate(existing, update, slotChanged)) {
            bookingSlotInventoryService.confirmPaidOrderSlot(update);
        }
    }

    static boolean shouldConfirmInventoryAfterUpdate(YyOrder existing, YyOrder update, boolean slotChanged) {
        if (!shouldReserveInventory(existing, update) || !hasSlotIdentity(update)) {
            return false;
        }
        if (slotChanged) {
            return true;
        }
        return !shouldReserveInventory(existing, existing)
            && !"CONFIRMED".equals(existing.getInventoryStatus());
    }

    static boolean shouldReserveInventory(YyOrder existing, YyOrder update) {
        String payStatus = firstNotBlank(update == null ? "" : update.getPayStatus(), existing == null ? "" : existing.getPayStatus());
        if ("PAID".equals(payStatus)) {
            return true;
        }
        String bookingMethod = firstNotBlank(
            update == null ? "" : update.getBookingMethod(),
            existing == null ? "" : existing.getBookingMethod()
        );
        String source = firstNotBlank(
            update == null ? "" : update.getSource(),
            existing == null ? "" : existing.getSource(),
            update == null ? "" : update.getChannelType(),
            existing == null ? "" : existing.getChannelType()
        );
        return "STAFF_MANUAL".equals(bookingMethod)
            || "WEB_INTENT".equals(bookingMethod)
            || "LOCAL".equals(source)
            || "CLIENT_WEB".equals(source);
    }

    static boolean isSlotIdentityChanged(YyOrder existing, YyOrder update) {
        return !Objects.equals(existing.getStoreId(), update.getStoreId())
            || !Objects.equals(existing.getServiceGroupId(), update.getServiceGroupId())
            || !Objects.equals(firstNotBlank(existing.getExternalSkuId(), ""), firstNotBlank(update.getExternalSkuId(), ""))
            || !Objects.equals(firstNotBlank(existing.getSlotDate(), ""), firstNotBlank(update.getSlotDate(), ""))
            || !Objects.equals(firstNotBlank(existing.getSlotStartTime(), ""), firstNotBlank(update.getSlotStartTime(), ""))
            || !Objects.equals(firstNotBlank(existing.getSlotEndTime(), ""), firstNotBlank(update.getSlotEndTime(), ""));
    }

    static boolean hasSlotIdentity(YyOrder order) {
        return order != null
            && order.getStoreId() != null
            && (order.getServiceGroupId() != null || StringUtils.isNotBlank(order.getExternalSkuId()))
            && StringUtils.isNotBlank(order.getSlotDate())
            && StringUtils.isNotBlank(order.getSlotStartTime())
            && StringUtils.isNotBlank(order.getSlotEndTime());
    }

    static boolean explicitlyClearsRequiredSlotField(YyOrder update) {
        return (update.getSlotDate() != null && StringUtils.isBlank(update.getSlotDate()))
            || (update.getSlotStartTime() != null && StringUtils.isBlank(update.getSlotStartTime()))
            || (update.getSlotEndTime() != null && StringUtils.isBlank(update.getSlotEndTime()));
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
}
