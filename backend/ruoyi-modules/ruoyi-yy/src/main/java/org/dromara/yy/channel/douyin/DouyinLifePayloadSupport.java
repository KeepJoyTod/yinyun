package org.dromara.yy.channel.douyin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.dromara.common.core.utils.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

final class DouyinLifePayloadSupport {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String CHANNEL_TYPE = "DOUYIN_LIFE";

    private DouyinLifePayloadSupport() {
    }

    static String redactSensitivePayload(String payload) {
        if (StringUtils.isBlank(payload)) {
            return "";
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            redactSensitiveNode(root);
            return OBJECT_MAPPER.writeValueAsString(root);
        } catch (Exception ignored) {
            return payload.replaceAll(
                "(?i)(\"(?:client_secret|client_access_token|access_token|refresh_token|open_id|openid|mobile|phone|encrypt_mobile|receiver_phone)\"\\s*:\\s*\")[^\"]+(\")",
                "$1***$2"
            );
        }
    }

    static String toJson(Object value) {
        if (value == null) {
            return "";
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (Exception ignored) {
            return String.valueOf(value);
        }
    }

    static String limitText(String value, int maxLength) {
        if (StringUtils.isBlank(value) || value.length() <= maxLength) {
            return StringUtils.isBlank(value) ? "" : value;
        }
        return value.substring(0, maxLength);
    }

    private static void redactSensitiveNode(JsonNode node) {
        if (node == null || node.isNull()) {
            return;
        }
        if (node instanceof ObjectNode objectNode) {
            List<String> fieldNames = new ArrayList<>();
            objectNode.fieldNames().forEachRemaining(fieldNames::add);
            for (String fieldName : fieldNames) {
                JsonNode value = objectNode.get(fieldName);
                if (isSensitiveField(fieldName)) {
                    objectNode.put(fieldName, "***");
                } else {
                    redactSensitiveNode(value);
                }
            }
            return;
        }
        if (node instanceof ArrayNode arrayNode) {
            arrayNode.forEach(DouyinLifePayloadSupport::redactSensitiveNode);
        }
    }

    private static boolean isSensitiveField(String fieldName) {
        if (StringUtils.isBlank(fieldName)) {
            return false;
        }
        String normalized = fieldName.replace("_", "").replace("-", "").toLowerCase(Locale.ROOT);
        return normalized.endsWith("token")
            || normalized.equals("clientsecret")
            || normalized.equals("openid")
            || normalized.equals("mobile")
            || normalized.equals("phone")
            || normalized.equals("encryptmobile")
            || normalized.equals("receiverphone")
            || normalized.equals("customerphone")
            || normalized.equals("customermobile")
            || normalized.equals("buyerphone");
    }

    static BigDecimal parseAmount(String value) {
        if (StringUtils.isBlank(value)) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(value);
        } catch (Exception ignored) {
            return BigDecimal.ZERO;
        }
    }

    static Long amountToCent(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return 0L;
        }
        return amount.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValue();
    }

    static int parsePositiveInt(String value, int defaultValue, int maxValue) {
        if (StringUtils.isBlank(value)) {
            return defaultValue;
        }
        try {
            int parsed = Integer.parseInt(value);
            if (parsed < 1) {
                return defaultValue;
            }
            return Math.min(parsed, maxValue);
        } catch (Exception ignored) {
            return defaultValue;
        }
    }

    static Integer parseOptionalInt(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    static List<String> splitCsv(String value) {
        if (StringUtils.isBlank(value)) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        for (String item : value.split(",")) {
            if (StringUtils.isNotBlank(item)) {
                values.add(item.trim());
            }
        }
        return values;
    }

    static Object extractChallenge(String payload) {
        if (StringUtils.isBlank(payload)) {
            return null;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            JsonNode challenge = firstValueNode(root, "CHALLENGE", "challenge");
            if (challenge == null) {
                challenge = firstValueNode(parseJsonObjectText(firstText(root, "content", "Content", "data", "Data")), "CHALLENGE", "challenge");
            }
            return jsonScalarValue(challenge);
        } catch (Exception ignored) {
            return null;
        }
    }

    static boolean hasChallengeValue(Object value) {
        return value != null && (!(value instanceof CharSequence text) || StringUtils.isNotBlank(text));
    }

    static JsonNode parseJsonObjectText(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        try {
            JsonNode node = OBJECT_MAPPER.readTree(value);
            return node != null && node.isObject() ? node : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    static JsonNode firstValueNode(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode value = node.get(fieldName);
                if (value != null && value.isValueNode() && !value.isNull()) {
                    return value;
                }
            }
            for (JsonNode child : node) {
                JsonNode value = firstValueNode(child, fieldNames);
                if (value != null) {
                    return value;
                }
            }
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                JsonNode value = firstValueNode(item, fieldNames);
                if (value != null) {
                    return value;
                }
            }
        }
        return null;
    }

    private static Object jsonScalarValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            return node.asText();
        }
        if (node.isNumber()) {
            return node.numberValue();
        }
        if (node.isBoolean()) {
            return node.asBoolean();
        }
        return node.asText();
    }

    static String headerValue(Map<String, String> headers, String expectedName) {
        if (headers == null || headers.isEmpty() || StringUtils.isBlank(expectedName)) {
            return "";
        }
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            if (entry.getKey() != null && expectedName.equalsIgnoreCase(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "";
    }

    static String computeLifeSpiSignature(String clientSecret, String rawQuery, String payload) {
        String signSource = buildLifeSpiSignSource(clientSecret, rawQuery, payload);
        return sha256HexLower(signSource);
    }

    private static String buildLifeSpiSignSource(String clientSecret, String rawQuery, String payload) {
        List<String> parts = new ArrayList<>();
        parts.add(firstNotBlank(clientSecret, ""));
        Map<String, List<String>> query = parseRawQuery(rawQuery);
        List<String> keys = new ArrayList<>(query.keySet());
        Collections.sort(keys);
        for (String key : keys) {
            if ("sign".equalsIgnoreCase(key)) {
                continue;
            }
            List<String> values = new ArrayList<>(query.getOrDefault(key, List.of("")));
            if (values.isEmpty()) {
                values.add("");
            }
            Collections.sort(values);
            for (String value : values) {
                parts.add(key + "=" + firstNotBlank(value, ""));
            }
        }
        if (StringUtils.isNotBlank(payload)) {
            parts.add("http_body=" + payload);
        }
        return String.join("&", parts);
    }

    static Map<String, List<String>> parseRawQuery(String rawQuery) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        if (StringUtils.isBlank(rawQuery)) {
            return result;
        }
        String decoded = URLDecoder.decode(rawQuery, StandardCharsets.UTF_8);
        for (String pair : decoded.split("&")) {
            if (StringUtils.isBlank(pair)) {
                continue;
            }
            int index = pair.indexOf('=');
            String key = index >= 0 ? pair.substring(0, index) : pair;
            String value = index >= 0 ? pair.substring(index + 1) : "";
            result.computeIfAbsent(key, ignored -> new ArrayList<>()).add(value);
        }
        return result;
    }

    static String certificateId(String orderId, String skuId, int index) {
        return numericDigest("cert|" + orderId + "|" + skuId + "|" + index, 18);
    }

    static String certificateCode(String orderId, String skuId, int index) {
        return numericDigest("code|" + orderId + "|" + skuId + "|" + index, 12);
    }

    static String generatedVerifyToken(String accountId, String poiId, String orderId, List<String> codes) {
        String seed = String.join(":", CHANNEL_TYPE, firstNotBlank(accountId), firstNotBlank(poiId),
            firstNotBlank(orderId), String.join(",", codes == null ? List.of() : codes));
        return UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8)).toString();
    }

    static String stableUuid(String seed) {
        return UUID.nameUUIDFromBytes(firstNotBlank(seed, CHANNEL_TYPE).getBytes(StandardCharsets.UTF_8)).toString();
    }

    static String numericDigest(String value, int length) {
        String hex = sha256Hex(value);
        StringBuilder digits = new StringBuilder(length);
        for (int i = 0; digits.length() < length && i < hex.length(); i++) {
            int digit = Character.digit(hex.charAt(i), 16);
            if (digit >= 0) {
                digits.append(digit % 10);
            }
        }
        while (digits.length() < length) {
            digits.append('0');
        }
        return digits.toString();
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8))).toUpperCase(Locale.ROOT);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 不可用", ex);
        }
    }

    private static String sha256HexLower(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8))).toLowerCase(Locale.ROOT);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 不可用", ex);
        }
    }

    static Long parseLong(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (Exception ignored) {
            return null;
        }
    }

    static Long firstNonNull(Long... values) {
        if (values == null) {
            return null;
        }
        for (Long value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    static boolean looksLikeOrderId(String externalOrderId) {
        return StringUtils.isNotBlank(externalOrderId) && externalOrderId.chars().allMatch(Character::isDigit);
    }

    static String firstText(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            JsonNode parsed = parseJsonObjectText(node.asText());
            return parsed == null ? null : firstText(parsed, fieldNames);
        }
        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode value = node.get(fieldName);
                if (value != null && value.isValueNode()) {
                    return value.asText();
                }
            }
            for (JsonNode child : node) {
                String value = firstText(child, fieldNames);
                if (value != null) {
                    return value;
                }
            }
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                String value = firstText(item, fieldNames);
                if (value != null) {
                    return value;
                }
            }
        }
        return null;
    }

    static List<String> firstTextArray(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return Collections.emptyList();
        }
        if (node.isTextual()) {
            JsonNode parsed = parseJsonObjectText(node.asText());
            return parsed == null ? Collections.emptyList() : firstTextArray(parsed, fieldNames);
        }
        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode value = node.get(fieldName);
                if (value != null && value.isArray()) {
                    List<String> values = new ArrayList<>();
                    for (JsonNode item : value) {
                        if (item != null && item.isValueNode()) {
                            values.add(item.asText());
                        }
                    }
                    if (!values.isEmpty()) {
                        return values;
                    }
                }
            }
            for (JsonNode child : node) {
                List<String> values = firstTextArray(child, fieldNames);
                if (!values.isEmpty()) {
                    return values;
                }
            }
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                List<String> values = firstTextArray(item, fieldNames);
                if (!values.isEmpty()) {
                    return values;
                }
            }
        }
        return Collections.emptyList();
    }

    static String extractLogId(String rawResponse) {
        if (StringUtils.isBlank(rawResponse)) {
            return "";
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(rawResponse);
            String logId = firstText(root, "logid", "log_id");
            return logId == null ? "" : logId;
        } catch (Exception ignored) {
            return "";
        }
    }

    static String firstNotBlank(String... values) {
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }
}
