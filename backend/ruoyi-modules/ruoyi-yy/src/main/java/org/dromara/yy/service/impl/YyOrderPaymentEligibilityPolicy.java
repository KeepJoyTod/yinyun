package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;

/**
 * 工作台确认收款订单准入策略。
 */
@Component
public class YyOrderPaymentEligibilityPolicy {

    private static final Set<String> INVALID_ORDER_STATUS = Set.of("CANCELLED", "REFUNDED");
    private static final String PAY_STATUS_UNPAID = "UNPAID";
    private static final String CHANNEL_CLIENT_WEB = "CLIENT_WEB";

    public String validateStoreConfirmOrder(YyOrder order, Long amountCent) {
        if (order == null || order.getId() == null) {
            throw new ServiceException("订单不存在");
        }
        String channelType = normalizedChannelType(order);
        if ("DOUYIN_LIFE".equalsIgnoreCase(channelType)) {
            throw new ServiceException("抖音来客订单不允许通过工作台确认收款");
        }
        if (INVALID_ORDER_STATUS.contains(normalized(order.getStatus()))) {
            throw new ServiceException("当前订单状态不可确认收款");
        }
        if (!PAY_STATUS_UNPAID.equals(normalized(order.getPayStatus()))) {
            throw new ServiceException("当前订单不是待支付状态");
        }
        if ("REFUNDED".equals(normalized(order.getRefundStatus()))) {
            throw new ServiceException("当前订单状态不可确认收款");
        }
        Long orderAmount = order.getTotalAmountCent() == null ? 0L : Math.max(order.getTotalAmountCent(), 0L);
        if (orderAmount > 0 && !Objects.equals(orderAmount, amountCent)) {
            throw new ServiceException("支付金额校验失败");
        }
        return channelType;
    }

    private String normalizedChannelType(YyOrder order) {
        return firstNonBlank(order == null ? null : order.getChannelType(), order == null ? null : order.getSource(), CHANNEL_CLIENT_WEB).toUpperCase();
    }

    private String normalized(String value) {
        return StringUtils.trimToEmpty(value).toUpperCase();
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value.trim();
            }
        }
        return "";
    }
}
