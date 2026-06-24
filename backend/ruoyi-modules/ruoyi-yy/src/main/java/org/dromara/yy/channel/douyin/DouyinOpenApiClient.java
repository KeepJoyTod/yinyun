package org.dromara.yy.channel.douyin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 抖音开放平台 HTTP 客户端。
 */
public class DouyinOpenApiClient {

    public static final String DEFAULT_BASE_URL = "https://open.douyin.com";
    public static final String CLIENT_TOKEN_PATH = "/oauth/client_token/";
    public static final String SERVICE_STATUS_PATH = "/aweme/v2/creator/service_market/user/service/status";
    public static final String PURCHASE_LIST_PATH = "/market/service/user/purchase/list/";
    public static final String LIFE_ORDER_QUERY_PATH = "/goodlife/v1/trade/order/query/";
    public static final String LIFE_ORDER_CONFIRM_PATH = "/goodlife/v1/comprehensive/trade/order/confirm/";
    public static final String LIFE_CERTIFICATE_VERIFY_PATH = "/goodlife/v1/fulfilment/certificate/verify/";
    public static final String LIFE_INVENTORY_SKU_UPSERT_PATH = "/goodlife/v1/goods/comprehensive/reception/stock/sku/upsert/";
    public static final String LIFE_REALTIME_STOCK_SAVE_PATH = "/goodlife/v1/goods/comprehensive/reception/save/stock/";
    public static final String LIFE_STOCK_UPDATE_TRIGGER_PATH = "/goodlife/v1/goods/comprehensive/reception/trigger/stock/";
    public static final String LIFE_TIME_STOCK_SAVE_PATH = "/goodlife/v1/goods/open/comprehensive/booking/room/time_stock/save/";
    public static final String LIFE_TIME_STOCK_GET_PATH = "/goodlife/v1/goods/open/comprehensive/booking/room/time_stock/get/";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String baseUrl;

    public DouyinOpenApiClient(ObjectMapper objectMapper, String baseUrl) {
        this.objectMapper = objectMapper;
        this.baseUrl = blankToDefault(baseUrl, DEFAULT_BASE_URL);
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    public YyChannelApiResultVo clientToken(String clientKey, String clientSecret) {
        YyChannelApiResultVo result = baseResult("client_token", CLIENT_TOKEN_PATH);
        try {
            Map<String, String> body = new LinkedHashMap<>();
            body.put("client_key", clientKey);
            body.put("client_secret", clientSecret);
            body.put("grant_type", "client_credential");

            HttpRequest request = HttpRequest.newBuilder()
                .uri(uri(CLIENT_TOKEN_PATH))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body), StandardCharsets.UTF_8))
                .build();
            return execute(result, request, "POST client_token，client_secret 已脱敏");
        } catch (Exception ex) {
            return fail(result, "生成 client_token 请求失败: " + ex.getMessage());
        }
    }

    public YyChannelApiResultVo serviceStatus(String clientToken, String openId, String serviceId, String serviceModeId) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("open_id", openId);
        params.put("service_id", serviceId);
        params.put("service_mode_id", serviceModeId);
        return getWithToken("service_status", SERVICE_STATUS_PATH, clientToken, params);
    }

    public YyChannelApiResultVo purchaseList(String clientToken, String openId, String serviceId, String serviceModeId) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("open_id", openId);
        params.put("service_id", serviceId);
        params.put("service_mode_id", serviceModeId);
        return getWithToken("purchase_list", PURCHASE_LIST_PATH, clientToken, params);
    }

    public YyChannelApiResultVo queryLocalLifeOrder(
        String clientToken,
        String accountId,
        Map<String, String> params,
        boolean useTestDataHeader
    ) {
        YyChannelApiResultVo result = baseResult("life_order_query", LIFE_ORDER_QUERY_PATH);
        try {
            Map<String, String> queryParams = new LinkedHashMap<>();
            queryParams.put("account_id", accountId);
            if (params != null) {
                params.forEach((key, value) -> {
                    if (!"account_id".equals(key)) {
                        queryParams.put(key, value);
                    }
                });
            }
            URI uri = uri(LIFE_ORDER_QUERY_PATH + (queryParams.isEmpty() ? "" : "?" + toQuery(queryParams)));
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(20))
                .header("access-token", clientToken)
                .header("Rpc-Transit-Life-Account", accountId)
                .GET();
            if (useTestDataHeader) {
                builder.header("Rpc-Persist-Life-Test-Data-Access", "all");
            }
            return execute(result, builder.build(), "GET life order query，access-token / Rpc-Transit-Life-Account 已脱敏");
        } catch (Exception ex) {
            return fail(result, "生活服务订单查询请求失败: " + ex.getMessage());
        }
    }

    public YyChannelApiResultVo confirmComprehensiveOrder(
        String clientToken,
        String accountId,
        Map<String, Object> body
    ) {
        YyChannelApiResultVo result = baseResult("life_order_confirm", LIFE_ORDER_CONFIRM_PATH);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(uri(LIFE_ORDER_CONFIRM_PATH))
                .timeout(Duration.ofSeconds(20))
                .header("access-token", clientToken)
                .header("Rpc-Transit-Life-Account", accountId)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body == null ? Map.of() : body), StandardCharsets.UTF_8))
                .build();
            return execute(result, request, "POST life order confirm，access-token / Rpc-Transit-Life-Account 已脱敏");
        } catch (Exception ex) {
            return fail(result, "生活服务订单确认请求失败: " + ex.getMessage());
        }
    }

    public YyChannelApiResultVo verifyCertificate(
        String clientToken,
        String accountId,
        Map<String, Object> body
    ) {
        YyChannelApiResultVo result = baseResult("life_order_verify", LIFE_CERTIFICATE_VERIFY_PATH);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(uri(LIFE_CERTIFICATE_VERIFY_PATH))
                .timeout(Duration.ofSeconds(20))
                .header("access-token", clientToken)
                .header("Rpc-Transit-Life-Account", accountId)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body == null ? Map.of() : body), StandardCharsets.UTF_8))
                .build();
            return execute(result, request, "POST life certificate verify，access-token / Rpc-Transit-Life-Account 已脱敏");
        } catch (Exception ex) {
            return fail(result, "生活服务券码核销请求失败: " + ex.getMessage());
        }
    }

    public YyChannelApiResultVo upsertReservationInventorySku(
        String clientToken,
        String accountId,
        Map<String, Object> body,
        boolean useTestDataHeader
    ) {
        return postLifeWithAccount(
            "life_inventory_sku_upsert",
            LIFE_INVENTORY_SKU_UPSERT_PATH,
            clientToken,
            accountId,
            body,
            useTestDataHeader,
            "POST life inventory sku upsert，access-token / Rpc-Transit-Life-Account 已脱敏"
        );
    }

    public YyChannelApiResultVo saveReservationRealtimeStock(
        String clientToken,
        String accountId,
        Map<String, Object> body,
        boolean useTestDataHeader
    ) {
        return postLifeWithAccount(
            "life_reception_stock_save",
            LIFE_REALTIME_STOCK_SAVE_PATH,
            clientToken,
            accountId,
            body,
            useTestDataHeader,
            "POST life realtime stock save，access-token / Rpc-Transit-Life-Account 已脱敏"
        );
    }

    public YyChannelApiResultVo triggerReservationStockUpdate(
        String clientToken,
        String accountId,
        Map<String, Object> body,
        boolean useTestDataHeader
    ) {
        return postLifeWithAccount(
            "life_reception_stock_trigger",
            LIFE_STOCK_UPDATE_TRIGGER_PATH,
            clientToken,
            accountId,
            body,
            useTestDataHeader,
            "POST life stock update trigger，access-token / Rpc-Transit-Life-Account 已脱敏"
        );
    }

    public YyChannelApiResultVo saveReservationTimeStock(
        String clientToken,
        String accountId,
        Map<String, Object> body,
        boolean useTestDataHeader
    ) {
        return postLifeWithAccount(
            "life_time_stock_save",
            LIFE_TIME_STOCK_SAVE_PATH,
            clientToken,
            accountId,
            body,
            useTestDataHeader,
            "POST life time stock save，access-token / Rpc-Transit-Life-Account 已脱敏"
        );
    }

    public YyChannelApiResultVo getReservationTimeStock(
        String clientToken,
        String accountId,
        String poiId,
        boolean useTestDataHeader
    ) {
        YyChannelApiResultVo result = baseResult("life_time_stock_get", LIFE_TIME_STOCK_GET_PATH);
        try {
            Map<String, String> params = new LinkedHashMap<>();
            params.put("account_id", accountId);
            params.put("poi_id", poiId);
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(uri(LIFE_TIME_STOCK_GET_PATH + "?" + toQuery(params)))
                .timeout(Duration.ofSeconds(20))
                .header("access-token", clientToken)
                .header("Rpc-Transit-Life-Account", accountId)
                .GET();
            if (useTestDataHeader) {
                builder.header("Rpc-Persist-Life-Test-Data-Access", "all");
            }
            return execute(result, builder.build(), "GET life time stock get，access-token / Rpc-Transit-Life-Account 已脱敏");
        } catch (Exception ex) {
            return fail(result, "生活服务查询时段库存请求失败: " + ex.getMessage());
        }
    }

    public String extractClientAccessToken(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return "";
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String direct = firstText(root, "client_access_token", "access_token");
            return direct == null ? "" : direct;
        } catch (Exception ignored) {
            return "";
        }
    }

    private YyChannelApiResultVo getWithToken(String apiName, String path, String clientToken, Map<String, String> params) {
        YyChannelApiResultVo result = baseResult(apiName, path);
        try {
            URI uri = uri(path + "?" + toQuery(params));
            HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(20))
                .header("access-token", clientToken)
                .GET()
                .build();
            return execute(result, request, "GET " + path + "，access-token 已脱敏");
        } catch (Exception ex) {
            return fail(result, apiName + " 请求失败: " + ex.getMessage());
        }
    }

    private YyChannelApiResultVo postLifeWithAccount(
        String apiName,
        String path,
        String clientToken,
        String accountId,
        Map<String, Object> body,
        boolean useTestDataHeader,
        String requestSummary
    ) {
        YyChannelApiResultVo result = baseResult(apiName, path);
        try {
            Map<String, String> params = new LinkedHashMap<>();
            params.put("account_id", accountId);
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(uri(path + "?" + toQuery(params)))
                .timeout(Duration.ofSeconds(20))
                .header("access-token", clientToken)
                .header("Rpc-Transit-Life-Account", accountId)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body == null ? Map.of() : body), StandardCharsets.UTF_8));
            if (useTestDataHeader) {
                builder.header("Rpc-Persist-Life-Test-Data-Access", "all");
            }
            return execute(result, builder.build(), requestSummary);
        } catch (Exception ex) {
            return fail(result, apiName + " 请求失败: " + ex.getMessage());
        }
    }

    private YyChannelApiResultVo execute(YyChannelApiResultVo result, HttpRequest request, String requestSummary)
        throws IOException, InterruptedException {
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        result.setRequestSummary(requestSummary);
        result.setRawResponse(response.body());
        result.setSuccess(response.statusCode() >= 200 && response.statusCode() < 300 && isOpenApiSuccess(response.body()));
        result.setMessage(buildMessage(response.statusCode(), response.body(), result.getSuccess()));
        result.setLogId(extractLogId(response.body()));
        result.setErrorCode(extractErrorCode(response.body()));
        return result;
    }

    private boolean isOpenApiSuccess(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return false;
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode errNo = root.findValue("err_no");
            JsonNode code = root.findValue("code");
            JsonNode errorCode = root.findValue("error_code");
            if (errNo != null && errNo.asInt(-1) != 0) {
                return false;
            }
            if (code != null && code.asInt(0) != 0) {
                return false;
            }
            return errorCode == null || errorCode.asInt(0) == 0;
        } catch (Exception ignored) {
            return false;
        }
    }

    private YyChannelApiResultVo baseResult(String apiName, String path) {
        YyChannelApiResultVo result = new YyChannelApiResultVo();
        result.setChannelType("DOUYIN");
        result.setApiName(apiName);
        result.setEndpoint(baseUrl + path);
        result.setSuccess(false);
        return result;
    }

    private YyChannelApiResultVo fail(YyChannelApiResultVo result, String message) {
        result.setSuccess(false);
        result.setMessage(message);
        return result;
    }

    private URI uri(String path) {
        return URI.create(baseUrl + path);
    }

    private static String toQuery(Map<String, String> params) {
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (query.length() > 0) {
                query.append('&');
            }
            query.append(encode(entry.getKey())).append('=').append(encode(entry.getValue()));
        }
        return query.toString();
    }

    private static String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private static String blankToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
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

    private String extractLogId(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return "";
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String logId = firstText(root, "logid", "log_id");
            return logId == null ? "" : logId;
        } catch (Exception ignored) {
            return "";
        }
    }

    private String extractErrorCode(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return "";
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String code = firstText(root, "err_no", "code", "error_code");
            return code == null ? "" : code;
        } catch (Exception ignored) {
            return "";
        }
    }

    private String buildMessage(int statusCode, String rawResponse, boolean success) {
        if (!success) {
            return "接口已返回，请检查 rawResponse 中的 err_no/code/error_code/message";
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String description = firstText(root, "message", "errmsg", "description");
            String logid = firstText(root, "logid");
            StringBuilder message = new StringBuilder();
            message.append(description == null || description.isBlank() ? "接口请求成功" : description);
            if (logid != null && !logid.isBlank()) {
                message.append("，logid=").append(logid);
            }
            return message.toString();
        } catch (Exception ignored) {
            return statusCode >= 200 && statusCode < 300 ? "接口请求成功" : "接口调用失败";
        }
    }
}
