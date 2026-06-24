package org.dromara.yy.channel.douyin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.channel.YyChannelAdapter;
import org.dromara.yy.domain.YyChannelAccount;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.dromara.yy.mapper.YyChannelAccountMapper;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 抖音服务市场平台应用类服务适配器占位实现
 */
@Component
public class DouyinChannelAdapter implements YyChannelAdapter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String CHANNEL_TYPE = "DOUYIN";
    private static final String SERVICE_MARKET_ORDER_EVENT = "service_market_order";
    private static final Map<String, String> EVENT_STATUS_TEXT = Map.of(
        "1", "已支付",
        "2", "已接单",
        "3", "已确认实施",
        "4", "用户已确认",
        "5", "已取消"
    );
    private static final Map<String, String> LOCAL_STATUS_MAPPING = Map.of(
        "1", "PAID",
        "2", "ACCEPTED",
        "3", "IMPLEMENT_CONFIRMED",
        "4", "USER_CONFIRMED",
        "5", "CANCELED"
    );

    private final YyChannelAccountMapper channelAccountMapper;
    private final Environment environment;
    private final String douyinBaseUrl;
    private final DouyinOpenApiClient openApiClient;

    public DouyinChannelAdapter(YyChannelAccountMapper channelAccountMapper, Environment environment) {
        this.channelAccountMapper = channelAccountMapper;
        this.environment = environment;
        String configuredBaseUrl = prop("yy.douyin.base-url", "DOUYIN_BASE_URL");
        this.douyinBaseUrl = StringUtils.isBlank(configuredBaseUrl) ? DouyinOpenApiClient.DEFAULT_BASE_URL : configuredBaseUrl;
        this.openApiClient = new DouyinOpenApiClient(OBJECT_MAPPER, this.douyinBaseUrl);
    }

    @Override
    public String channelType() {
        return CHANNEL_TYPE;
    }

    @Override
    public List<YyChannelOrderVo> searchList(YyChannelOrderQuery query) {
        DouyinConfig config = resolveConfig(query);
        if (StringUtils.isNotBlank(config.openId()) && StringUtils.isNotBlank(config.serviceId()) && StringUtils.isNotBlank(config.serviceModeId())) {
            YyChannelApiResultVo purchaseResult = purchaseList(query);
            YyChannelOrderVo order = orderDetail(config.serviceId() + ":" + config.openId());
            order.setSyncStatus(Boolean.TRUE.equals(purchaseResult.getSuccess()) ? "REAL_API_OK" : "REAL_API_FAILED");
            order.setRawPayload(purchaseResult.getRawResponse());
            return List.of(order);
        }
        YyChannelOrderVo order = orderDetail("DY-MOCK-ORDER");
        order.setCustomerName("抖音客户");
        order.setCustomerPhone("13800000000");
        return List.of(order);
    }

    @Override
    public YyChannelOrderVo orderDetail(String externalOrderId) {
        YyChannelOrderVo order = new YyChannelOrderVo();
        order.setChannelType(channelType());
        order.setExternalOrderId(externalOrderId);
        order.setExternalStatus("UNOPENED");
        order.setAmount(BigDecimal.ZERO);
        order.setSyncStatus("MOCK");
        order.setRawPayload("""
            {
              "integrationType": "SERVICE_MARKET_PLATFORM_APP",
              "message": "抖音服务市场平台应用已接入 client_token、已购状态、购买明细和 webhook；未配置沙盒参数时返回占位数据",
              "token": "client_key/client_secret -> client_access_token",
              "requiredFields": ["client_key", "client_secret", "service_id", "service_mode_id", "open_id", "test_whitelist", "webhook_url"],
              "statusEndpoint": "GET /aweme/v2/creator/service_market/user/service/status",
              "purchaseListEndpoint": "GET /market/service/user/purchase/list/",
              "webhook": {
                "callback": "POST /yy/channel/DOUYIN/webhook",
                "event": "service_market_order",
                "permission": "market.service.user",
                "states": ["1 支付", "2 接单", "3 确认实施", "4 用户确认", "5 取消"]
              },
              "fallback": "如果确认是普通抖音电商店铺订单，再切换到电商开放平台订单接口"
            }
            """);
        return order;
    }

    @Override
    public YyChannelApiResultVo clientToken(YyChannelOrderQuery query) {
        DouyinConfig config = resolveConfig(query);
        YyChannelApiResultVo missing = validateConfig("client_token", config, List.of("client_key", "client_secret"));
        if (missing != null) {
            return missing;
        }
        return openApiClient.clientToken(config.clientKey(), config.clientSecret());
    }

    @Override
    public YyChannelApiResultVo serviceStatus(YyChannelOrderQuery query) {
        DouyinConfig config = resolveConfig(query);
        YyChannelApiResultVo missing = validateConfig(
            "service_status",
            config,
            List.of("client_key", "client_secret", "open_id", "service_id", "service_mode_id")
        );
        if (missing != null) {
            return missing;
        }
        String clientAccessToken = requireClientAccessToken(config);
        if (StringUtils.isBlank(clientAccessToken)) {
            YyChannelApiResultVo result = missingResult("service_status");
            result.setMessage("client_token 接口未返回 client_access_token，请检查 rawResponse、沙盒应用类型和权限");
            return result;
        }
        return openApiClient.serviceStatus(clientAccessToken, config.openId(), config.serviceId(), config.serviceModeId());
    }

    @Override
    public YyChannelApiResultVo purchaseList(YyChannelOrderQuery query) {
        DouyinConfig config = resolveConfig(query);
        YyChannelApiResultVo missing = validateConfig(
            "purchase_list",
            config,
            List.of("client_key", "client_secret", "open_id", "service_id", "service_mode_id")
        );
        if (missing != null) {
            return missing;
        }
        String clientAccessToken = requireClientAccessToken(config);
        if (StringUtils.isBlank(clientAccessToken)) {
            YyChannelApiResultVo result = missingResult("purchase_list");
            result.setMessage("client_token 接口未返回 client_access_token，请检查 rawResponse、沙盒应用类型和权限");
            return result;
        }
        return openApiClient.purchaseList(clientAccessToken, config.openId(), config.serviceId(), config.serviceModeId());
    }

    @Override
    public YyChannelWebhookResultVo handleWebhook(String payload) {
        YyChannelWebhookResultVo result = new YyChannelWebhookResultVo();
        result.setChannelType(channelType());
        result.setRequiredPermission("market.service.user");
        result.setRawPayload(payload);

        if (payload == null || payload.isBlank()) {
            result.setEventName(SERVICE_MARKET_ORDER_EVENT);
            result.setProcessed(false);
            result.setMessage("抖音服务市场 webhook payload 为空");
            return result;
        }

        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            String eventName = firstText(root, "event", "event_type", "eventType", "msg_type", "type");
            String eventStatus = firstText(root, "event_status", "eventStatus", "order_status", "orderStatus", "status", "status_code", "state");
            String externalOrderId = firstText(root, "order_id", "orderId", "service_order_id", "serviceOrderId", "purchase_id", "purchaseId");

            result.setEventName(eventName == null ? SERVICE_MARKET_ORDER_EVENT : eventName);
            result.setEventStatus(toStatusText(eventStatus));
            result.setExternalOrderId(externalOrderId);
            result.setLocalStatus(LOCAL_STATUS_MAPPING.getOrDefault(eventStatus, "UNKNOWN"));
            result.setProcessed(SERVICE_MARKET_ORDER_EVENT.equalsIgnoreCase(result.getEventName()) || EVENT_STATUS_TEXT.containsKey(eventStatus));
            result.setMessage("已识别抖音服务市场订单事件；真实联调时需校验签名并落库到渠道订单映射与同步日志");
        } catch (Exception ex) {
            result.setEventName(SERVICE_MARKET_ORDER_EVENT);
            result.setProcessed(false);
            result.setMessage("抖音服务市场 webhook payload 解析失败: " + ex.getMessage());
        }
        return result;
    }

    private String requireClientAccessToken(DouyinConfig config) {
        if (StringUtils.isNotBlank(config.clientAccessToken())) {
            return config.clientAccessToken();
        }
        YyChannelApiResultVo tokenResult = openApiClient.clientToken(config.clientKey(), config.clientSecret());
        return openApiClient.extractClientAccessToken(tokenResult.getRawResponse());
    }

    private YyChannelApiResultVo validateConfig(String apiName, DouyinConfig config, List<String> requiredFields) {
        YyChannelApiResultVo result = missingResult(apiName);
        for (String field : requiredFields) {
            if (StringUtils.isBlank(config.value(field))) {
                result.getMissingConfig().add(field);
            }
        }
        if (result.getMissingConfig().isEmpty()) {
            return null;
        }
        result.setMessage("抖音沙盒参数未配置完整: " + String.join(", ", result.getMissingConfig()));
        result.setRequestSummary("配置来源优先级：请求参数 -> 环境变量/配置文件 -> yy_channel_account；client_secret/access_token 不回显");
        return result;
    }

    private YyChannelApiResultVo missingResult(String apiName) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType(channelType());
        result.setApiName(apiName);
        result.setSuccess(false);
        result.setEndpoint(switch (apiName) {
            case "client_token" -> endpoint(DouyinOpenApiClient.CLIENT_TOKEN_PATH);
            case "service_status" -> endpoint(DouyinOpenApiClient.SERVICE_STATUS_PATH);
            case "purchase_list" -> endpoint(DouyinOpenApiClient.PURCHASE_LIST_PATH);
            default -> douyinBaseUrl;
        });
        return result;
    }

    private String endpoint(String path) {
        return douyinBaseUrl + path;
    }

    private DouyinConfig resolveConfig(YyChannelOrderQuery query) {
        YyChannelAccount account = findAccount(query == null ? null : query.getStoreId());
        return new DouyinConfig(
            firstNotBlank(prop("yy.douyin.client-key", "DOUYIN_CLIENT_KEY"), account == null ? null : account.getAppKey()),
            firstNotBlank(prop("yy.douyin.client-secret", "DOUYIN_CLIENT_SECRET"), account == null ? null : account.getAppSecretEnc()),
            firstNotBlank(query == null ? null : query.getOpenId(), prop("yy.douyin.test-open-id", "DOUYIN_TEST_OPEN_ID"), account == null ? null : account.getTestOpenId()),
            firstNotBlank(query == null ? null : query.getServiceId(), prop("yy.douyin.service-id", "DOUYIN_SERVICE_ID"), account == null ? null : account.getServiceId()),
            firstNotBlank(query == null ? null : query.getServiceModeId(), prop("yy.douyin.service-mode-id", "DOUYIN_SERVICE_MODE_ID"), account == null ? null : account.getServiceModeId()),
            firstNotBlank(prop("yy.douyin.client-access-token", "DOUYIN_CLIENT_ACCESS_TOKEN"), account == null ? null : account.getAccessTokenEnc())
        );
    }

    private YyChannelAccount findAccount(Long storeId) {
        if (storeId != null) {
            YyChannelAccount account = channelAccountMapper.selectOne(Wrappers.<YyChannelAccount>lambdaQuery()
                .eq(YyChannelAccount::getChannelType, CHANNEL_TYPE)
                .eq(YyChannelAccount::getStoreId, storeId)
                .orderByDesc(YyChannelAccount::getId)
                .last("limit 1"));
            if (account != null) {
                return account;
            }
        }
        return channelAccountMapper.selectOne(Wrappers.<YyChannelAccount>lambdaQuery()
            .eq(YyChannelAccount::getChannelType, CHANNEL_TYPE)
            .orderByDesc(YyChannelAccount::getId)
            .last("limit 1"));
    }

    private String prop(String propertyKey, String envKey) {
        String propertyValue = environment.getProperty(propertyKey);
        return StringUtils.isNotBlank(propertyValue) ? propertyValue : System.getenv(envKey);
    }

    private static String firstNotBlank(String... values) {
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private static String toStatusText(String eventStatus) {
        if (eventStatus == null || eventStatus.isBlank()) {
            return "UNKNOWN";
        }
        return EVENT_STATUS_TEXT.getOrDefault(eventStatus, eventStatus);
    }

    private static String firstText(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                for (String fieldName : fieldNames) {
                    if (field.getKey().equalsIgnoreCase(fieldName)) {
                        JsonNode value = field.getValue();
                        return value.isValueNode() ? value.asText() : value.toString();
                    }
                }
            }
            fields = node.fields();
            while (fields.hasNext()) {
                String value = firstText(fields.next().getValue(), fieldNames);
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

    private record DouyinConfig(
        String clientKey,
        String clientSecret,
        String openId,
        String serviceId,
        String serviceModeId,
        String clientAccessToken
    ) {
        private String value(String field) {
            return switch (field) {
                case "client_key" -> clientKey;
                case "client_secret" -> clientSecret;
                case "open_id" -> openId;
                case "service_id" -> serviceId;
                case "service_mode_id" -> serviceModeId;
                case "client_access_token" -> clientAccessToken;
                default -> "";
            };
        }
    }
}
