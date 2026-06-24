package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

final class YyClientOrderTokenCodec {

    static final long TOKEN_TTL_SECONDS = 7200L;
    static final String DEFAULT_TOKEN_SECRET = "yingyue-client-order-dev-secret-change-me";

    private static final String TOKEN_VERSION = "v1";

    private YyClientOrderTokenCodec() {
    }

    static String build(Long storeId, List<Long> orderIds, String tokenSecret, String activeProfiles) {
        if (storeId == null || orderIds == null || orderIds.isEmpty()) {
            throw new ServiceException("订单访问授权为空");
        }
        long expiresAtEpoch = Instant.now().plusSeconds(TOKEN_TTL_SECONDS).getEpochSecond();
        String orderScope = encodeOrderScope(orderIds);
        String payload = String.join("|",
            TOKEN_VERSION,
            String.valueOf(storeId),
            String.valueOf(expiresAtEpoch),
            UUID.randomUUID().toString(),
            orderScope
        );
        return base64Url(payload) + "." + hmac(payload, tokenSecret, activeProfiles);
    }

    static ClientOrderIdentity parse(String clientOrderToken, String tokenSecret, String activeProfiles) {
        if (StringUtils.isBlank(clientOrderToken)) {
            throw new ServiceException("订单访问已失效，请重新验证手机号");
        }
        String token = clientOrderToken;
        if (StringUtils.startsWithIgnoreCase(token, "Bearer ")) {
            token = token.substring(7).trim();
        }
        String[] parts = token.split("\\.", 2);
        if (parts.length != 2) {
            throw new ServiceException("订单访问已失效，请重新验证手机号");
        }
        String payload;
        try {
            payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new ServiceException("订单访问已失效，请重新验证手机号");
        }
        String expected = hmac(payload, tokenSecret, activeProfiles);
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), parts[1].getBytes(StandardCharsets.UTF_8))) {
            throw new ServiceException("订单访问已失效，请重新验证手机号");
        }
        String[] payloadParts = payload.split("\\|", -1);
        if (payloadParts.length != 5 || !TOKEN_VERSION.equals(payloadParts[0])) {
            throw new ServiceException("订单访问已失效，请重新验证手机号");
        }
        long storeId;
        long expiresAt;
        try {
            storeId = Long.parseLong(payloadParts[1]);
            expiresAt = Long.parseLong(payloadParts[2]);
        } catch (NumberFormatException e) {
            throw new ServiceException("订单访问已失效，请重新验证手机号");
        }
        if (expiresAt <= Instant.now().getEpochSecond()) {
            throw new ServiceException("订单访问已过期，请重新验证手机号");
        }
        Set<Long> orderIds = decodeOrderScope(payloadParts[4]);
        if (orderIds.isEmpty()) {
            throw new ServiceException("订单访问已失效，请重新验证手机号");
        }
        return new ClientOrderIdentity(storeId, orderIds);
    }

    private static String encodeOrderScope(List<Long> orderIds) {
        String scope = orderIds.stream()
            .filter(Objects::nonNull)
            .distinct()
            .sorted()
            .map(String::valueOf)
            .collect(Collectors.joining(","));
        if (StringUtils.isBlank(scope)) {
            throw new ServiceException("订单访问授权为空");
        }
        return scope;
    }

    private static Set<Long> decodeOrderScope(String orderScope) {
        if (StringUtils.isBlank(orderScope)) {
            return Set.of();
        }
        Set<Long> orderIds = new LinkedHashSet<>();
        for (String rawId : orderScope.split(",")) {
            if (StringUtils.isBlank(rawId)) {
                continue;
            }
            try {
                orderIds.add(Long.parseLong(rawId.trim()));
            } catch (NumberFormatException e) {
                throw new ServiceException("订单访问已失效，请重新验证手机号");
            }
        }
        return Set.copyOf(orderIds);
    }

    private static String hmac(String payload, String tokenSecret, String activeProfiles) {
        validateTokenSecret(tokenSecret, activeProfiles);
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new ServiceException("订单访问令牌生成失败");
        }
    }

    private static void validateTokenSecret(String tokenSecret, String activeProfiles) {
        if (!isProductionProfile(activeProfiles)) {
            return;
        }
        if (StringUtils.isBlank(tokenSecret) || DEFAULT_TOKEN_SECRET.equals(tokenSecret)) {
            throw new ServiceException("客户订单令牌密钥未配置，请设置 yy.client-order.token-secret");
        }
    }

    private static boolean isProductionProfile(String activeProfiles) {
        if (StringUtils.isBlank(activeProfiles)) {
            return false;
        }
        for (String profile : activeProfiles.split(",")) {
            if ("prod".equalsIgnoreCase(profile.trim()) || "production".equalsIgnoreCase(profile.trim())) {
                return true;
            }
        }
        return false;
    }

    private static String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    record ClientOrderIdentity(Long storeId, Set<Long> orderIds) {
    }
}
