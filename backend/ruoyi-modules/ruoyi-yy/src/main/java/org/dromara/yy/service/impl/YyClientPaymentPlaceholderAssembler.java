package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyOrder;

import java.util.LinkedHashMap;
import java.util.Map;

final class YyClientPaymentPlaceholderAssembler {

    private static final String PROVIDER_WECHAT_MINI_APP = "WECHAT_MINI_APP";
    private static final String PAYMENT_PLACEHOLDER_MESSAGE = "在线支付暂未接入，订单已创建，请到店或联系门店确认。";
    private static final String ORDER_ALREADY_PAID_MESSAGE = "订单已支付";

    private YyClientPaymentPlaceholderAssembler() {
    }

    static Map<String, Object> customerPayResponse(YyOrder order) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("timeStamp", "");
        data.put("nonceStr", "");
        data.put("package", "");
        data.put("signType", "");
        data.put("paySign", "");
        data.put("paymentReady", false);
        data.put("message", placeholderMessage(order));
        data.put("transactionNo", "");
        data.put("orderId", String.valueOf(order.getId()));
        data.put("orderNo", firstNotBlank(order.getOrderNo(), String.valueOf(order.getId())));
        data.put("amount", YyPaymentOrderPolicy.normalizeAmount(order.getTotalAmountCent()));
        data.put("provider", PROVIDER_WECHAT_MINI_APP);
        data.put("outTradeNo", "");
        data.put("payStatus", YyPaymentOrderPolicy.normalizePayStatus(order.getPayStatus()));
        data.put("paymentRecordId", "");
        return data;
    }

    private static String placeholderMessage(YyOrder order) {
        String payStatus = YyPaymentOrderPolicy.normalizePayStatus(order == null ? "" : order.getPayStatus());
        if ("PAID".equals(payStatus)) {
            return ORDER_ALREADY_PAID_MESSAGE;
        }
        return PAYMENT_PLACEHOLDER_MESSAGE;
    }

    private static String firstNotBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
