package org.dromara.yy.channel.wechat;

import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.channel.YyChannelAdapter;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * 微信生态渠道适配器。
 *
 * <p>第一版先把公众号/小程序/微信支付回调统一落到渠道映射与同步日志，真实 SDK 在商户资料齐全后替换。</p>
 */
@Component
@RequiredArgsConstructor
public class WechatChannelAdapter implements YyChannelAdapter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String CHANNEL_TYPE = "WECHAT";

    private final YyChannelOrderMappingMapper channelOrderMappingMapper;
    private final YyChannelSyncLogMapper channelSyncLogMapper;
    private final YyOrderMapper orderMapper;
    private final IdentifierGenerator identifierGenerator;

    @Override
    public String channelType() {
        return CHANNEL_TYPE;
    }

    @Override
    public List<YyChannelOrderVo> searchList(YyChannelOrderQuery query) {
        List<YyChannelOrderMapping> mappings = channelOrderMappingMapper.selectList(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, CHANNEL_TYPE)
            .eq(query != null && query.getStoreId() != null, YyChannelOrderMapping::getStoreId, query == null ? null : query.getStoreId())
            .like(StringUtils.isNotBlank(query == null ? null : query.getOrderId()), YyChannelOrderMapping::getExternalOrderId, query == null ? null : query.getOrderId())
            .like(StringUtils.isNotBlank(query == null ? null : query.getOutOrderNo()), YyChannelOrderMapping::getExternalOrderId, query == null ? null : query.getOutOrderNo())
            .orderByDesc(YyChannelOrderMapping::getId)
            .last("limit 50"));
        String keyword = query == null ? null : query.getKeyword();
        List<YyChannelOrderVo> result = new ArrayList<>();
        for (YyChannelOrderMapping mapping : mappings) {
            YyChannelOrderVo order = toOrderVo(mapping);
            if (matchesKeyword(order, keyword)) {
                result.add(order);
            }
        }
        if (!result.isEmpty()) {
            return result;
        }
        return List.of(fallbackOrder(query));
    }

    @Override
    public YyChannelOrderVo orderDetail(String externalOrderId) {
        YyChannelOrderMapping mapping = findMapping(externalOrderId);
        if (mapping == null) {
            YyChannelOrderQuery query = new YyChannelOrderQuery();
            query.setOrderId(externalOrderId);
            return fallbackOrder(query);
        }
        return toOrderVo(mapping);
    }

    @Override
    public YyChannelWebhookResultVo handleWebhook(String payload) {
        YyChannelWebhookResultVo result = new YyChannelWebhookResultVo();
        result.setChannelType(CHANNEL_TYPE);
        result.setRawPayload(redactSensitivePayload(payload));
        try {
            JsonNode root = OBJECT_MAPPER.readTree(StringUtils.isBlank(payload) ? "{}" : payload);
            String eventName = firstText(root, "event_type", "event", "notify_type", "trade_type");
            String externalOrderId = firstText(root, "out_trade_no", "transaction_id", "order_id", "out_order_no", "book_id");
            String eventStatus = firstText(root, "trade_state", "result_code", "status", "order_status", "event_status");
            String localStatus = mapLocalStatus(eventStatus);
            String safePayload = redactSensitivePayload(payload);

            result.setEventName(StringUtils.isNotBlank(eventName) ? eventName : "wechat_callback");
            result.setEventStatus(eventStatus);
            result.setExternalOrderId(externalOrderId);
            result.setLocalStatus(localStatus);
            result.setRequiredPermission("公众号模板消息/小程序订阅消息/微信支付回调按实际开通能力配置");
            result.setProcessed(StringUtils.isNotBlank(externalOrderId));
            result.setMessage(StringUtils.isNotBlank(externalOrderId) ? "微信回调已记录到渠道订单映射" : "微信回调缺少外部订单号，已记录日志");

            if (StringUtils.isNotBlank(externalOrderId)) {
                upsertOrderMapping(externalOrderId, StringUtils.isNotBlank(eventStatus) ? eventStatus : "CALLBACK", localStatus, safePayload);
            }
            recordWebhookLog(externalOrderId, result.getEventName(), safePayload, StringUtils.isNotBlank(externalOrderId), result.getMessage());
        } catch (Exception ex) {
            result.setEventName("wechat_callback");
            result.setProcessed(false);
            result.setMessage("微信 webhook payload 解析失败: " + ex.getMessage());
            recordWebhookLog("", "wechat_callback", payload, false, ex.getMessage());
        }
        return result;
    }

    @Override
    public YyChannelApiResultVo serviceStatus(YyChannelOrderQuery query) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(CHANNEL_TYPE);
        result.setApiName("wechat_config_status");
        result.setEndpoint("/yy/channel/WECHAT/orders");
        result.setSuccess(true);
        result.setMessage("微信生态当前使用 yy_channel_account / yy_mobile_channel_config / yy_notification_template 管理配置；真实 SDK 待商户资料齐全后接入");
        result.setRequestSummary("公众号通知、小程序预约、微信支付、企业微信客户联系统一走微信生态工作台");
        return result;
    }

    private YyChannelOrderMapping findMapping(String externalOrderId) {
        if (StringUtils.isBlank(externalOrderId)) {
            return null;
        }
        return channelOrderMappingMapper.selectOne(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, CHANNEL_TYPE)
            .eq(YyChannelOrderMapping::getExternalOrderId, externalOrderId)
            .orderByDesc(YyChannelOrderMapping::getId)
            .last("limit 1"));
    }

    private YyChannelOrderVo toOrderVo(YyChannelOrderMapping mapping) {
        YyOrder localOrder = resolveLocalOrder(mapping);
        YyChannelOrderVo order = new YyChannelOrderVo();
        order.setChannelType(CHANNEL_TYPE);
        order.setExternalOrderId(mapping.getExternalOrderId());
        order.setExternalStatus(mapping.getExternalStatus());
        order.setCustomerName(localOrder == null ? "微信客户" : localOrder.getCustomerName());
        order.setCustomerPhone(localOrder == null ? "" : localOrder.getCustomerPhone());
        order.setAmount(BigDecimal.ZERO);
        order.setLocalOrderId(mapping.getOrderId());
        order.setSyncStatus(mapping.getSyncStatus());
        order.setRawPayload(StringUtils.isNotBlank(mapping.getRawPayload()) ? redactSensitivePayload(mapping.getRawPayload()) : "{}");
        return order;
    }

    private YyOrder resolveLocalOrder(YyChannelOrderMapping mapping) {
        if (mapping.getOrderId() != null) {
            YyOrder order = orderMapper.selectById(mapping.getOrderId());
            if (order != null) {
                return order;
            }
        }
        if (StringUtils.isBlank(mapping.getExternalOrderId())) {
            return null;
        }
        return orderMapper.selectOne(Wrappers.<YyOrder>lambdaQuery()
            .eq(YyOrder::getSource, CHANNEL_TYPE)
            .eq(YyOrder::getExternalOrderId, mapping.getExternalOrderId())
            .orderByDesc(YyOrder::getId)
            .last("limit 1"));
    }

    private YyChannelOrderVo fallbackOrder(YyChannelOrderQuery query) {
        String externalOrderId = firstNotBlank(query == null ? null : query.getOrderId(), query == null ? null : query.getOutOrderNo(), "WX-NOT-CONFIGURED");
        YyChannelOrderVo order = new YyChannelOrderVo();
        order.setChannelType(CHANNEL_TYPE);
        order.setExternalOrderId(externalOrderId);
        order.setExternalStatus("PENDING_CONFIG");
        order.setCustomerName("微信生态客户");
        order.setCustomerPhone("");
        order.setAmount(BigDecimal.ZERO);
        order.setSyncStatus("PENDING");
        order.setRawPayload("{\"message\":\"微信生态暂未查到本地映射，请先配置公众号/小程序/微信支付账号或等待回调写入\"}");
        return order;
    }

    private boolean matchesKeyword(YyChannelOrderVo order, String keyword) {
        if (StringUtils.isBlank(keyword)) {
            return true;
        }
        String normalized = keyword.toLowerCase(Locale.ROOT);
        return contains(order.getExternalOrderId(), normalized)
            || contains(order.getCustomerName(), normalized)
            || contains(order.getCustomerPhone(), normalized);
    }

    private boolean contains(String value, String keyword) {
        return StringUtils.isNotBlank(value) && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private void upsertOrderMapping(String externalOrderId, String externalStatus, String localStatus, String rawPayload) {
        YyChannelOrderMapping entity = findMapping(externalOrderId);
        boolean isNew = entity == null;
        if (entity == null) {
            entity = new YyChannelOrderMapping();
            entity.setId(nextLongId());
            entity.setChannelType(CHANNEL_TYPE);
            entity.setExternalOrderId(externalOrderId);
        }
        entity.setExternalStatus(externalStatus);
        entity.setSyncStatus("SYNCED");
        entity.setRawPayload(redactSensitivePayload(rawPayload));
        entity.setRemark("微信回调同步: " + localStatus);
        if (isNew) {
            channelOrderMappingMapper.insert(entity);
        } else {
            channelOrderMappingMapper.updateById(entity);
        }
    }

    private void recordWebhookLog(String externalOrderId, String eventName, String payload, boolean success, String errorMessage) {
        YyChannelSyncLog log = new YyChannelSyncLog();
        log.setId(nextLongId());
        log.setChannelType(CHANNEL_TYPE);
        log.setApiName(StringUtils.isNotBlank(eventName) ? eventName : "wechat_callback");
        log.setRequestId(StringUtils.isNotBlank(externalOrderId) ? externalOrderId : "");
        log.setSuccess(success ? "1" : "0");
        log.setErrorMessage(limitText(StringUtils.isNotBlank(errorMessage) ? errorMessage : "", 480));
        log.setDurationMs(0L);
        log.setRetryable(success ? "0" : "1");
        log.setRemark(limitText(redactSensitivePayload(payload), 480));
        channelSyncLogMapper.insert(log);
    }

    private Long nextLongId() {
        return identifierGenerator.nextId(null).longValue();
    }

    private String mapLocalStatus(String externalStatus) {
        if (StringUtils.isBlank(externalStatus)) {
            return "PENDING";
        }
        String normalized = externalStatus.toUpperCase(Locale.ROOT);
        if (normalized.contains("SUCCESS") || normalized.contains("PAID")) {
            return "CONFIRMED";
        }
        if (normalized.contains("CLOSE") || normalized.contains("FAIL") || normalized.contains("REFUND")) {
            return "CANCELLED";
        }
        return "PENDING";
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

    private static String limitText(String value, int maxLength) {
        if (StringUtils.isBlank(value) || value.length() <= maxLength) {
            return StringUtils.isBlank(value) ? "" : value;
        }
        return value.substring(0, maxLength);
    }

    private static String firstText(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return "";
        }
        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode value = node.get(fieldName);
                if (value != null && !value.isNull() && value.isValueNode()) {
                    return value.asText();
                }
            }
            for (JsonNode child : node) {
                String value = firstText(child, fieldNames);
                if (StringUtils.isNotBlank(value)) {
                    return value;
                }
            }
        } else if (node.isArray()) {
            for (JsonNode child : node) {
                String value = firstText(child, fieldNames);
                if (StringUtils.isNotBlank(value)) {
                    return value;
                }
            }
        }
        return "";
    }

    private static String redactSensitivePayload(String payload) {
        if (StringUtils.isBlank(payload)) {
            return "";
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            redactSensitiveNode(root);
            return OBJECT_MAPPER.writeValueAsString(root);
        } catch (Exception ignored) {
            return payload.replaceAll(
                "(?i)(\"(?:app_secret|mch_key|api_v3_key|access_token|refresh_token|openid|open_id|unionid|union_id|mobile|phone|payer_openid)\"\\s*:\\s*\")[^\"]+(\")",
                "$1***$2"
            );
        }
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
            arrayNode.forEach(WechatChannelAdapter::redactSensitiveNode);
        }
    }

    private static boolean isSensitiveField(String fieldName) {
        if (fieldName == null) {
            return false;
        }
        String normalized = fieldName.replace("_", "").replace("-", "").toLowerCase(Locale.ROOT);
        return normalized.contains("secret")
            || normalized.contains("token")
            || normalized.contains("openid")
            || normalized.contains("unionid")
            || normalized.contains("mobile")
            || normalized.contains("phone")
            || normalized.contains("apikey")
            || normalized.contains("mchkey");
    }
}
