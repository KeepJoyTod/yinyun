package org.dromara.yy.service.impl;

import org.dromara.common.core.utils.StringUtils;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 微信支付回调验签占位策略。
 */
@Component
public class YyWechatPaymentNotifySignaturePolicy {

    public SignatureCheck verify(Map<String, String> headers, String queryString, String payload) {
        if (headers == null || headers.isEmpty()) {
            return SignatureCheck.rejected("INVALID_SIGNATURE");
        }
        String signature = firstNonBlank(
            headers.get("X-Wechat-Signature"),
            headers.get("x-wechat-signature"),
            headers.get("Wechatpay-Signature"),
            headers.get("wechatpay-signature")
        );
        if (StringUtils.isBlank(signature)) {
            return SignatureCheck.rejected("INVALID_SIGNATURE");
        }
        boolean valid = "pass".equalsIgnoreCase(signature)
            || "ok".equalsIgnoreCase(signature)
            || "valid".equalsIgnoreCase(signature);
        return valid ? SignatureCheck.verified() : SignatureCheck.rejected("INVALID_SIGNATURE");
    }

    public record SignatureCheck(boolean valid, String message) {

        static SignatureCheck verified() {
            return new SignatureCheck(true, "OK");
        }

        static SignatureCheck rejected(String message) {
            return new SignatureCheck(false, message);
        }
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
