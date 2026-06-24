package org.dromara.yy.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.bo.WechatPaymentNotifyPayload;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.Date;

/**
 * 微信支付回调规范化解析器。
 */
@RequiredArgsConstructor
@Component
public class YyWechatPaymentNotifyPayloadParser {

    private final ObjectMapper objectMapper;

    public WechatPaymentNotifyPayload parse(String payload) {
        JsonNode root;
        try {
            root = objectMapper.readTree(StringUtils.isBlank(payload) ? "{}" : payload);
        } catch (IOException ex) {
            throw new IllegalArgumentException("INVALID_PAYLOAD");
        }
        WechatPaymentNotifyPayload result = new WechatPaymentNotifyPayload();
        result.setOutTradeNo(readText(root, "outTradeNo"));
        result.setPlatformOrderId(readText(root, "platformOrderId"));
        result.setTransactionId(readText(root, "transactionId"));
        result.setTradeState(readText(root, "tradeState"));
        result.setAmountCent(readLong(root, "amountCent"));
        result.setPaidAmountCent(firstNonNull(readLong(root, "paidAmountCent"), result.getAmountCent()));
        result.setPaidTime(readDate(root, "paidTime"));
        result.setRawPayload(payload);
        if (StringUtils.isBlank(result.getOutTradeNo())) {
            throw new IllegalArgumentException("OUT_TRADE_NO_REQUIRED");
        }
        return result;
    }

    private String readText(JsonNode root, String fieldName) {
        JsonNode value = root == null ? null : root.get(fieldName);
        return value == null || value.isNull() ? "" : StringUtils.trimToEmpty(value.asText());
    }

    private Long readLong(JsonNode root, String fieldName) {
        JsonNode value = root == null ? null : root.get(fieldName);
        if (value == null || value.isNull()) {
            return null;
        }
        if (value.isNumber()) {
            return value.longValue();
        }
        String text = StringUtils.trimToEmpty(value.asText());
        return StringUtils.isBlank(text) ? null : Long.parseLong(text);
    }

    private Date readDate(JsonNode root, String fieldName) {
        String text = readText(root, fieldName);
        if (StringUtils.isBlank(text)) {
            return null;
        }
        try {
            return Date.from(Instant.parse(text));
        } catch (DateTimeParseException ignored) {
            try {
                return Date.from(OffsetDateTime.parse(text).toInstant());
            } catch (DateTimeParseException ex) {
                throw new IllegalArgumentException("INVALID_PAID_TIME");
            }
        }
    }

    @SafeVarargs
    private static <T> T firstNonNull(T... values) {
        if (values == null) {
            return null;
        }
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }
}
