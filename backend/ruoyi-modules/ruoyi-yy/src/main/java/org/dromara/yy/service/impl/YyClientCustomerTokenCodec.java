package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Objects;

final class YyClientCustomerTokenCodec {

    static final long TOKEN_TTL_SECONDS = 30L * 24 * 60 * 60;
    static final String DEFAULT_TOKEN_SECRET = "yingyue-customer-dev-secret-change-me";

    private YyClientCustomerTokenCodec() {
    }

    static CustomerIdentity parse(String authorization, String tokenSecret) {
        String token = StringUtils.trimToEmpty(authorization);
        if (token.regionMatches(true, 0, "Bearer ", 0, 7)) {
            token = token.substring(7).trim();
        }
        if (StringUtils.isBlank(token)) {
            throw new ServiceException("请先登录会员账号");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            throw new ServiceException("会员登录已过期，请重新登录");
        }
        String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        if (!Objects.equals(parts[1], hmac(payload, tokenSecret))) {
            throw new ServiceException("会员登录已过期，请重新登录");
        }
        String[] fields = payload.split("\\|", -1);
        if (fields.length != 3) {
            throw new ServiceException("会员登录已过期，请重新登录");
        }
        long expiresAt;
        try {
            expiresAt = Long.parseLong(fields[2]);
        } catch (NumberFormatException ex) {
            throw new ServiceException("会员登录已过期，请重新登录");
        }
        if (expiresAt < Instant.now().getEpochSecond()) {
            throw new ServiceException("会员登录已过期，请重新登录");
        }
        return new CustomerIdentity(fields[0], fields[1], expiresAt);
    }

    static String build(String subject, String phone, String tokenSecret) {
        String payload = String.join("|",
            StringUtils.defaultIfBlank(subject, "guest"),
            StringUtils.defaultString(phone),
            String.valueOf(Instant.now().plusSeconds(TOKEN_TTL_SECONDS).getEpochSecond()));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8)) + "." + hmac(payload, tokenSecret);
    }

    static String sha256(String raw) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte b : digest) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (Exception ex) {
            throw new ServiceException("登录凭证处理失败");
        }
    }

    private static String hmac(String payload, String tokenSecret) {
        validateTokenSecret(tokenSecret);
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new ServiceException("会员令牌签名失败");
        }
    }

    private static void validateTokenSecret(String tokenSecret) {
        if (StringUtils.isBlank(tokenSecret) || DEFAULT_TOKEN_SECRET.equals(tokenSecret)) {
            throw new ServiceException("会员令牌密钥未配置，请设置 yy.client-public.token-secret");
        }
    }

    record CustomerIdentity(String subject, String phone, long expiresAt) {
    }
}
