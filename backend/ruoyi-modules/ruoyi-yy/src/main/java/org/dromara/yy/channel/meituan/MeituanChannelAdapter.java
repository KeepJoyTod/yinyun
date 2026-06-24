package org.dromara.yy.channel.meituan;

import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.dromara.yy.channel.YyChannelAdapter;
import org.dromara.yy.domain.YyChannelAccount;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelSyncResultVo;
import org.dromara.yy.mapper.YyChannelAccountMapper;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 美团渠道适配器。
 */
@Component
@RequiredArgsConstructor
public class MeituanChannelAdapter implements YyChannelAdapter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String CHANNEL_TYPE = "MEITUAN";
    private static final String ORDER_QUERY_API = "meituan_order_query";

    private final YyChannelAccountMapper channelAccountMapper;
    private final YyChannelOrderMappingMapper channelOrderMappingMapper;
    private final YyChannelSyncLogMapper channelSyncLogMapper;
    private final YyOrderMapper orderMapper;
    private final IdentifierGenerator identifierGenerator;
    private final Environment environment;

    private volatile MeituanOpenApiClient openApiClient;

    @Override
    public String channelType() {
        return CHANNEL_TYPE;
    }

    @Override
    public YyChannelApiResultVo clientToken(YyChannelOrderQuery query) {
        MeituanConfig config = resolveConfig(query);
        YyChannelApiResultVo result = client().tokenStatus(config.accessToken(), config.shopId());
        result.setChannelType(channelType());
        result.setRawResponse(redactSensitivePayload(result.getRawResponse()));
        result.setRequestSummary("本地检查美团授权，app_secret/access_token 已脱敏");
        recordSyncLog(config, "meituan_token_status", result);
        return result;
    }

    @Override
    public List<YyChannelOrderVo> searchList(YyChannelOrderQuery query) {
        MeituanConfig config = resolveConfig(query);
        if (!config.authorized()) {
            return List.of(unauthorizedFallback(query));
        }
        if (!config.openApiConfigured()) {
            YyChannelApiResultVo precheck = failureResult(ORDER_QUERY_API, "美团真实 OpenAPI 地址未配置，需先确认官方 base-url、path 和签名规则");
            precheck.getMissingConfig().add("yy.meituan.base-url");
            recordSyncLog(config, ORDER_QUERY_API, precheck);
            return List.of(fallback("CONFIG_PENDING", "FAILED", precheck.getMessage(), precheck.getRawResponse(), query));
        }
        YyChannelApiResultVo apiResult = client().queryOrders(config.accessToken(), buildQueryParams(config, query));
        recordSyncLog(config, ORDER_QUERY_API, apiResult);
        if (!Boolean.TRUE.equals(apiResult.getSuccess())) {
            return List.of(fallback("FAILED", "SYNC_FAILED", apiResult.getMessage(), apiResult.getRawResponse(), query));
        }
        List<YyChannelOrderVo> orders = extractOrders(apiResult.getRawResponse());
        for (YyChannelOrderVo order : orders) {
            upsertOrderMapping(config, order.getExternalOrderId(), order.getExternalStatus(), "PENDING", order.getRawPayload(), null);
        }
        if (orders.isEmpty()) {
            return List.of();
        }
        return orders;
    }

    @Override
    public YyChannelSyncResultVo syncOrders(YyChannelOrderQuery query) {
        MeituanConfig config = resolveConfig(query);
        YyChannelSyncResultVo result = new YyChannelSyncResultVo();
        result.setChannelType(channelType());
        if (!config.authorized()) {
            recordSyncLog(config, ORDER_QUERY_API, failureResult(ORDER_QUERY_API, "美团门店未授权，无法同步订单"));
            result.setSyncStatus("FAILED");
            result.setFailed(1);
            result.setMessage("美团门店未授权，无法同步订单");
            return result;
        }
        if (!config.openApiConfigured()) {
            YyChannelApiResultVo precheck = failureResult(ORDER_QUERY_API, "美团真实 OpenAPI 地址未配置，需先确认官方 base-url、path 和签名规则");
            precheck.getMissingConfig().add("yy.meituan.base-url");
            recordSyncLog(config, ORDER_QUERY_API, precheck);
            result.setSyncStatus("FAILED");
            result.setFailed(1);
            result.setMessage(precheck.getMessage());
            return result;
        }

        YyChannelApiResultVo apiResult = client().queryOrders(config.accessToken(), buildQueryParams(config, query));
        String requestId = extractRequestId(apiResult.getRawResponse());
        recordSyncLog(config, ORDER_QUERY_API, apiResult);
        result.setLastLogId(requestId);
        if (!Boolean.TRUE.equals(apiResult.getSuccess())) {
            result.setSyncStatus("FAILED");
            result.setFailed(1);
            result.setMessage(apiResult.getMessage());
            return result;
        }

        int created = 0;
        int updated = 0;
        int failed = 0;
        List<YyChannelOrderVo> orders = extractOrders(apiResult.getRawResponse());
        for (YyChannelOrderVo order : orders) {
            LocalOrderUpsertResult localResult = upsertLocalOrder(
                config,
                order.getExternalOrderId(),
                mapLocalStatus(order.getExternalStatus()),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getAmount()
            );
            order.setLocalOrderId(localResult.localOrderId());
            upsertOrderMapping(config, order.getExternalOrderId(), order.getExternalStatus(), "SYNCED", order.getRawPayload(), localResult.localOrderId());
            if (localResult.created()) {
                created++;
            } else if (localResult.localOrderId() != null) {
                updated++;
            } else {
                failed++;
            }
        }

        result.setSyncStatus(failed > 0 ? "PARTIAL" : "SYNCED");
        result.setTotal(orders.size());
        result.setCreated(created);
        result.setUpdated(updated);
        result.setFailed(failed);
        result.setMessage(failed > 0 ? "美团订单同步完成，部分订单未入库" : "美团订单同步完成");
        return result;
    }

    @Override
    public YyChannelOrderVo orderDetail(String externalOrderId) {
        YyChannelOrderMapping mapping = channelOrderMappingMapper.selectOne(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, CHANNEL_TYPE)
            .eq(YyChannelOrderMapping::getExternalOrderId, externalOrderId)
            .orderByDesc(YyChannelOrderMapping::getId)
            .last("limit 1"));
        if (mapping != null) {
            return toOrderVo(mapping);
        }
        YyChannelOrderVo order = new YyChannelOrderVo();
        order.setChannelType(channelType());
        order.setExternalOrderId(externalOrderId);
        order.setExternalStatus("UNOPENED");
        order.setAmount(BigDecimal.ZERO);
        order.setSyncStatus("FAILED");
        order.setRawPayload("{\"message\":\"美团核销工具未开通或门店未授权\"}");
        return order;
    }

    @Override
    public YyChannelApiResultVo verifyOrder(YyChannelOrderQuery query) {
        MeituanConfig config = resolveConfig(query);
        if (!config.authorized()) {
            YyChannelApiResultVo result = new YyChannelApiResultVo();
            result.setChannelType(channelType());
            result.setApiName("meituan_verify_record_query");
            result.setSuccess(false);
            result.setMessage("美团门店未授权，无法查询核销记录");
            result.getMissingConfig().add("access_token");
            return result;
        }
        if (!config.openApiConfigured()) {
            YyChannelApiResultVo result = failureResult("meituan_verify_record_query", "美团真实 OpenAPI 地址未配置，无法查询核销记录");
            result.getMissingConfig().add("yy.meituan.base-url");
            recordSyncLog(config, "meituan_verify_record_query", result);
            return result;
        }
        YyChannelApiResultVo result = client().queryVerifyRecords(config.accessToken(), buildQueryParams(config, query));
        recordSyncLog(config, "meituan_verify_record_query", result);
        return result;
    }

    private MeituanConfig resolveConfig(YyChannelOrderQuery query) {
        Long storeId = query == null ? null : query.getStoreId();
        YyChannelAccount account = channelAccountMapper.selectOne(Wrappers.<YyChannelAccount>lambdaQuery()
            .eq(YyChannelAccount::getChannelType, CHANNEL_TYPE)
            .eq(storeId != null, YyChannelAccount::getStoreId, storeId)
            .orderByDesc(YyChannelAccount::getId)
            .last("limit 1"));
        String appKey = account == null ? property("yy.meituan.app-key") : firstNotBlank(account.getAppKey(), property("yy.meituan.app-key"));
        String appSecret = account == null ? property("yy.meituan.app-secret") : firstNotBlank(account.getAppSecretEnc(), property("yy.meituan.app-secret"));
        String accessToken = account == null ? property("yy.meituan.access-token") : firstNotBlank(account.getAccessTokenEnc(), property("yy.meituan.access-token"));
        String refreshToken = account == null ? property("yy.meituan.refresh-token") : firstNotBlank(account.getRefreshTokenEnc(), property("yy.meituan.refresh-token"));
        String shopId = account == null ? property("yy.meituan.shop-id") : firstNotBlank(account.getServiceId(), property("yy.meituan.shop-id"));
        String status = account == null ? inferStatus(accessToken, shopId) : firstNotBlank(account.getStatus(), inferStatus(accessToken, shopId));
        Long accountStoreId = account == null ? storeId : firstNonNull(account.getStoreId(), storeId);
        String openApiBaseUrl = property("yy.meituan.base-url");
        return new MeituanConfig(accountStoreId, appKey, appSecret, accessToken, refreshToken, shopId, status, openApiBaseUrl);
    }

    private YyChannelApiResultVo failureResult(String apiName, String message) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(CHANNEL_TYPE);
        result.setApiName(apiName);
        result.setEndpoint("local://meituan/unauthorized");
        result.setSuccess(false);
        result.setMessage(message);
        result.setRawResponse("{\"status\":\"UNAUTHORIZED\",\"message\":\"" + escapeJson(message) + "\"}");
        return result;
    }

    private Map<String, String> buildQueryParams(MeituanConfig config, YyChannelOrderQuery query) {
        Map<String, String> params = new LinkedHashMap<>();
        putIfNotBlank(params, "shop_id", config.shopId());
        if (query != null) {
            putIfNotBlank(params, "order_id", query.getOrderId());
            putIfNotBlank(params, "out_order_no", query.getOutOrderNo());
            putIfNotBlank(params, "order_status", query.getOrderStatus());
            putIfNotBlank(params, "keyword", query.getKeyword());
            putIfNotBlank(params, "start_time", query.getStartTime());
            putIfNotBlank(params, "end_time", query.getEndTime());
            if (query.getPageNum() != null) {
                params.put("page_num", String.valueOf(query.getPageNum()));
            }
            if (query.getPageSize() != null) {
                params.put("page_size", String.valueOf(query.getPageSize()));
            }
        }
        return params;
    }

    private List<YyChannelOrderVo> extractOrders(String rawResponse) {
        List<YyChannelOrderVo> orders = new ArrayList<>();
        if (rawResponse == null || rawResponse.isBlank()) {
            return orders;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(rawResponse);
            JsonNode orderArray = firstArray(root, "orders", "list", "data_list");
            if (orderArray == null && root.path("data").isArray()) {
                orderArray = root.path("data");
            }
            if (orderArray == null) {
                return orders;
            }
            for (JsonNode orderNode : orderArray) {
                YyChannelOrderVo order = new YyChannelOrderVo();
                order.setChannelType(channelType());
                order.setExternalOrderId(firstText(orderNode, "order_id", "orderId", "deal_order_id", "external_order_id"));
                order.setExternalStatus(firstNotBlank(firstText(orderNode, "order_status", "status", "verify_status"), "UNKNOWN"));
                order.setCustomerName(firstNotBlank(firstText(orderNode, "customer_name", "user_name", "name"), "美团客户"));
                order.setCustomerPhone(redactPhone(firstText(orderNode, "customer_phone", "mobile", "phone")));
                order.setAmount(firstAmount(orderNode, "pay_amount", "amount", "total_amount", "receipt_amount"));
                order.setSyncStatus("REMOTE");
                order.setRawPayload(redactSensitivePayload(orderNode.toString()));
                if (order.getExternalOrderId() != null && !order.getExternalOrderId().isBlank()) {
                    orders.add(order);
                }
            }
        } catch (Exception ignored) {
            return List.of();
        }
        return orders;
    }

    private YyChannelOrderVo toOrderVo(YyChannelOrderMapping mapping) {
        YyChannelOrderVo order = new YyChannelOrderVo();
        order.setChannelType(CHANNEL_TYPE);
        order.setExternalOrderId(mapping.getExternalOrderId());
        order.setExternalStatus(mapping.getExternalStatus());
        order.setSyncStatus(mapping.getSyncStatus());
        order.setLocalOrderId(mapping.getOrderId());
        order.setRawPayload(redactSensitivePayload(mapping.getRawPayload()));
        YyOrder localOrder = mapping.getOrderId() == null ? null : orderMapper.selectById(mapping.getOrderId());
        if (localOrder != null) {
            order.setCustomerName(localOrder.getCustomerName());
            order.setCustomerPhone(redactPhone(localOrder.getCustomerPhone()));
        }
        return order;
    }

    private YyChannelOrderVo unauthorizedFallback(YyChannelOrderQuery query) {
        return fallback("UNAUTHORIZED", "FAILED", "美团门店未授权，请先完成美团开放平台应用、门店授权和 token 配置", "", query);
    }

    private YyChannelOrderVo fallback(String externalStatus, String syncStatus, String message, String rawPayload, YyChannelOrderQuery query) {
        YyChannelOrderVo order = new YyChannelOrderVo();
        order.setChannelType(channelType());
        order.setExternalOrderId(query == null ? "" : firstNotBlank(query.getOrderId(), query.getOutOrderNo(), "MEITUAN-UNAUTHORIZED"));
        order.setExternalStatus(externalStatus);
        order.setAmount(BigDecimal.ZERO);
        order.setSyncStatus(syncStatus);
        order.setRawPayload(redactSensitivePayload("{\"message\":\"" + escapeJson(firstNotBlank(message, "美团渠道暂不可用")) + "\",\"raw\":" + quote(rawPayload) + "}"));
        return order;
    }

    private LocalOrderUpsertResult upsertLocalOrder(
        MeituanConfig config,
        String externalOrderId,
        String localStatus,
        String customerName,
        String customerPhone,
        BigDecimal amount
    ) {
        YyOrder existing = orderMapper.selectOne(Wrappers.<YyOrder>lambdaQuery()
            .eq(YyOrder::getSource, CHANNEL_TYPE)
            .eq(YyOrder::getExternalOrderId, externalOrderId)
            .last("limit 1"));
        if (existing != null) {
            existing.setStatus(localStatus);
            existing.setCustomerName(firstNotBlank(customerName, existing.getCustomerName()));
            existing.setCustomerPhone(firstNotBlank(customerPhone, existing.getCustomerPhone()));
            orderMapper.updateById(existing);
            return new LocalOrderUpsertResult(existing.getId(), false);
        }
        YyOrder order = new YyOrder();
        order.setId(nextId());
        order.setStoreId(config.storeId());
        order.setOrderNo("MT-" + externalOrderId);
        order.setCustomerName(firstNotBlank(customerName, "美团客户"));
        order.setCustomerPhone(customerPhone);
        order.setSource(CHANNEL_TYPE);
        order.setBookingMethod("CHANNEL");
        order.setOrderTime(new Date());
        order.setStatus(localStatus);
        order.setExternalOrderId(externalOrderId);
        order.setRemark("美团订单同步，金额=" + (amount == null ? "0" : amount));
        orderMapper.insert(order);
        return new LocalOrderUpsertResult(order.getId(), true);
    }

    private void upsertOrderMapping(MeituanConfig config, String externalOrderId, String externalStatus, String syncStatus, String rawPayload, Long localOrderId) {
        YyChannelOrderMapping entity = channelOrderMappingMapper.selectOne(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, CHANNEL_TYPE)
            .eq(YyChannelOrderMapping::getExternalOrderId, externalOrderId)
            .last("limit 1"));
        if (entity == null) {
            entity = new YyChannelOrderMapping();
            entity.setId(nextId());
            entity.setStoreId(config.storeId());
            entity.setOrderId(localOrderId);
            entity.setChannelType(CHANNEL_TYPE);
            entity.setExternalOrderId(externalOrderId);
            entity.setExternalStatus(externalStatus);
            entity.setSyncStatus(syncStatus);
            entity.setRawPayload(redactSensitivePayload(rawPayload));
            channelOrderMappingMapper.insert(entity);
            return;
        }
        entity.setOrderId(localOrderId == null ? entity.getOrderId() : localOrderId);
        entity.setExternalStatus(externalStatus);
        entity.setSyncStatus(syncStatus);
        entity.setRawPayload(redactSensitivePayload(rawPayload));
        channelOrderMappingMapper.updateById(entity);
    }

    private void upsertOrderMapping(MeituanConfig config, String externalOrderId, String externalStatus, String syncStatus, String rawPayload) {
        upsertOrderMapping(config, externalOrderId, externalStatus, syncStatus, rawPayload, null);
    }

    private void recordSyncLog(MeituanConfig config, String apiName, YyChannelApiResultVo result) {
        YyChannelSyncLog log = new YyChannelSyncLog();
        log.setId(nextId());
        log.setStoreId(config == null ? null : config.storeId());
        log.setChannelType(CHANNEL_TYPE);
        log.setApiName(apiName);
        log.setRequestId(extractRequestId(result == null ? null : result.getRawResponse()));
        log.setSuccess(Boolean.TRUE.equals(result == null ? null : result.getSuccess()) ? "1" : "0");
        log.setErrorMessage(Boolean.TRUE.equals(result == null ? null : result.getSuccess()) ? "" : firstNotBlank(result == null ? null : result.getMessage(), ""));
        log.setRetryable(Boolean.TRUE.equals(result == null ? null : result.getSuccess()) ? "0" : "1");
        log.setRemark(redactSensitivePayload(result == null ? "" : firstNotBlank(result.getRawResponse(), result.getMessage(), "")));
        channelSyncLogMapper.insert(log);
    }

    private MeituanOpenApiClient client() {
        MeituanOpenApiClient current = openApiClient;
        if (current == null) {
            current = new MeituanOpenApiClient(OBJECT_MAPPER, property("yy.meituan.base-url"));
            openApiClient = current;
        }
        return current;
    }

    private String property(String key) {
        return environment == null ? "" : firstNotBlank(environment.getProperty(key), "");
    }

    private Long nextId() {
        if (identifierGenerator == null) {
            return null;
        }
        Object id = identifierGenerator.nextId((Serializable) null);
        return id instanceof Number number ? number.longValue() : null;
    }

    private static JsonNode firstArray(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode value = node.findValue(fieldName);
            if (value != null && value.isArray()) {
                return value;
            }
        }
        return null;
    }

    private static String firstText(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return null;
        }
        for (String fieldName : fieldNames) {
            JsonNode value = node.findValue(fieldName);
            if (value != null && value.isValueNode()) {
                return value.asText();
            }
        }
        return null;
    }

    private static BigDecimal firstAmount(JsonNode node, String... fieldNames) {
        String value = firstText(node, fieldNames);
        if (value == null || value.isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException ignored) {
            return BigDecimal.ZERO;
        }
    }

    private static void putIfNotBlank(Map<String, String> target, String key, String value) {
        if (value != null && !value.isBlank()) {
            target.put(key, value);
        }
    }

    private static String extractRequestId(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return "";
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(rawResponse);
            return firstNotBlank(firstText(root, "request_id", "logid", "trace_id"), "");
        } catch (Exception ignored) {
            return "";
        }
    }

    private static String mapLocalStatus(String externalStatus) {
        if (externalStatus == null) {
            return "PENDING";
        }
        return switch (externalStatus.toUpperCase()) {
            case "PAID", "PAY_SUCCESS", "WAIT_USE", "UNUSED" -> "PENDING";
            case "VERIFIED", "USED", "COMPLETED", "FINISHED" -> "COMPLETED";
            case "REFUND", "REFUNDED", "CANCELLED", "CANCELED" -> "CANCELLED";
            default -> "PENDING";
        };
    }

    private static String redactPhone(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return value.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
    }

    private static String redactSensitivePayload(String payload) {
        if (payload == null) {
            return "";
        }
        String redacted = payload;
        redacted = redacted.replaceAll("(\"(?:access_token|refresh_token|app_secret|secret|token)\"\\s*:\\s*\")([^\"]+)(\")", "$1***$3");
        redacted = redacted.replaceAll("(\"(?:customer_phone|mobile|phone)\"\\s*:\\s*\")([^\"]+)(\")", "$1***$3");
        redacted = redacted.replaceAll("(?<!\\d)1\\d{10}(?!\\d)", "***");
        return redacted;
    }

    private static String quote(String value) {
        if (value == null || value.isBlank()) {
            return "\"\"";
        }
        return "\"" + escapeJson(value) + "\"";
    }

    private static String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String inferStatus(String accessToken, String shopId) {
        return accessToken != null && !accessToken.isBlank() && shopId != null && !shopId.isBlank() ? "AUTHORIZED" : "UNAUTHORIZED";
    }

    @SafeVarargs
    private static <T> T firstNonNull(T... values) {
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private static String firstNotBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private record MeituanConfig(
        Long storeId,
        String appKey,
        String appSecret,
        String accessToken,
        String refreshToken,
        String shopId,
        String status,
        String openApiBaseUrl
    ) {
        boolean authorized() {
            return accessToken != null && !accessToken.isBlank() && shopId != null && !shopId.isBlank() && "AUTHORIZED".equalsIgnoreCase(status);
        }

        boolean openApiConfigured() {
            return openApiBaseUrl != null && !openApiBaseUrl.isBlank();
        }
    }

    private record LocalOrderUpsertResult(Long localOrderId, boolean created) {
    }
}
