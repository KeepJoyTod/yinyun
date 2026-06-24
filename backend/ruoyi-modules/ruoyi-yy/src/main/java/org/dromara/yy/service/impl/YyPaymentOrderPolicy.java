package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;

import java.util.Locale;
import java.util.Objects;
import java.util.Set;

final class YyPaymentOrderPolicy {

    private static final Set<String> INVALID_ORDER_STATUSES = Set.of("CANCELLED", "REFUNDED");

    private YyPaymentOrderPolicy() {
    }

    static void validateCustomerPayableOrder(YyOrder order, String tenantId) {
        if (order == null || order.getId() == null) {
            throw new ServiceException("订单不存在");
        }
        if (StringUtils.isNotBlank(tenantId) && !Objects.equals(StringUtils.trimToEmpty(tenantId), StringUtils.trimToEmpty(order.getTenantId()))) {
            throw new ServiceException("订单租户不匹配");
        }
        String channelType = normalizeChannelType(order);
        if ("DOUYIN_LIFE".equalsIgnoreCase(channelType)) {
            throw new ServiceException("抖音来客订单不走本地支付闭环");
        }
        String status = normalized(order.getStatus());
        if (INVALID_ORDER_STATUSES.contains(status)) {
            throw new ServiceException("当前订单状态不可支付");
        }
        if ("REFUNDED".equalsIgnoreCase(StringUtils.trimToEmpty(order.getPayStatus()))
            || "REFUNDED".equalsIgnoreCase(StringUtils.trimToEmpty(order.getRefundStatus()))) {
            throw new ServiceException("当前订单状态不可支付");
        }
    }

    static String normalizeChannelType(YyOrder order) {
        return normalizeChannelType(firstNonBlank(order == null ? null : order.getChannelType(), order == null ? null : order.getSource(), "CLIENT_WEB"));
    }

    static String normalizeChannelType(String channelType) {
        String normalized = StringUtils.trimToEmpty(channelType).toUpperCase(Locale.ROOT);
        return StringUtils.isBlank(normalized) ? "CLIENT_WEB" : normalized;
    }

    static String normalizePayStatus(String payStatus) {
        String normalized = StringUtils.trimToEmpty(payStatus).toUpperCase(Locale.ROOT);
        return StringUtils.isBlank(normalized) ? "UNPAID" : normalized;
    }

    static Long normalizeAmount(Long amount) {
        return amount == null ? 0L : Math.max(amount, 0L);
    }

    private static String normalized(String value) {
        return StringUtils.trimToEmpty(value).toUpperCase(Locale.ROOT);
    }

    private static String firstNonBlank(String... values) {
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
