package org.dromara.yy.channel.meituan;

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
 * 美团开放平台 HTTP 客户端。
 *
 * <p>当前 V1 先固定影约云内部接口契约，真实美团文档确认后只替换 path/签名参数。</p>
 */
public class MeituanOpenApiClient {

    public static final String DEFAULT_BASE_URL = "https://developer.meituan.com";
    public static final String ORDER_QUERY_PATH = "/api/meituan/orders";
    public static final String SHOP_QUERY_PATH = "/api/meituan/shop";
    public static final String PRODUCT_QUERY_PATH = "/api/meituan/products";
    public static final String VERIFY_RECORD_QUERY_PATH = "/api/meituan/verify-records";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String baseUrl;

    public MeituanOpenApiClient(ObjectMapper objectMapper, String baseUrl) {
        this.objectMapper = objectMapper;
        this.baseUrl = blankToDefault(baseUrl, DEFAULT_BASE_URL);
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    public YyChannelApiResultVo tokenStatus(String accessToken, String shopId) {
        YyChannelApiResultVo result = baseResult("meituan_token_status", "/token-status");
        if (isBlank(accessToken)) {
            result.getMissingConfig().add("access_token");
        }
        if (isBlank(shopId)) {
            result.getMissingConfig().add("shop_id");
        }
        if (!result.getMissingConfig().isEmpty()) {
            result.setSuccess(false);
            result.setMessage("美团门店未授权，请先配置 AppKey/AppSecret 并完成门店授权");
            result.setRawResponse("{\"status\":\"UNAUTHORIZED\"}");
            return result;
        }
        result.setSuccess(true);
        result.setMessage("美团门店已授权，access_token 已配置");
        result.setRawResponse("{\"status\":\"AUTHORIZED\",\"shop_id\":\"" + escapeJson(shopId) + "\"}");
        result.setRequestSummary("本地检查美团 access_token / shop_id，敏感字段已脱敏");
        return result;
    }

    public YyChannelApiResultVo queryOrders(String accessToken, Map<String, String> params) {
        return getWithToken("meituan_order_query", ORDER_QUERY_PATH, accessToken, params);
    }

    public YyChannelApiResultVo queryShop(String accessToken, Map<String, String> params) {
        return getWithToken("meituan_shop_query", SHOP_QUERY_PATH, accessToken, params);
    }

    public YyChannelApiResultVo queryProducts(String accessToken, Map<String, String> params) {
        return getWithToken("meituan_product_query", PRODUCT_QUERY_PATH, accessToken, params);
    }

    public YyChannelApiResultVo queryVerifyRecords(String accessToken, Map<String, String> params) {
        return getWithToken("meituan_verify_record_query", VERIFY_RECORD_QUERY_PATH, accessToken, params);
    }

    private YyChannelApiResultVo getWithToken(String apiName, String path, String accessToken, Map<String, String> params) {
        YyChannelApiResultVo result = baseResult(apiName, path);
        if (isBlank(accessToken)) {
            result.getMissingConfig().add("access_token");
            result.setSuccess(false);
            result.setMessage("美团 access_token 未配置");
            return result;
        }
        try {
            URI uri = uri(path + (params == null || params.isEmpty() ? "" : "?" + toQuery(params)));
            HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();
            return execute(result, request, "GET " + path + "，access_token 已脱敏");
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
        return result;
    }

    private boolean isOpenApiSuccess(String rawResponse) {
        if (isBlank(rawResponse)) {
            return false;
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode code = root.findValue("code");
            JsonNode errorCode = root.findValue("error_code");
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
        result.setChannelType("MEITUAN");
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
        return isBlank(value) ? defaultValue : value;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
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

    private String buildMessage(int statusCode, String rawResponse, boolean success) {
        if (!success) {
            return "接口已返回，请检查 rawResponse 中的 code/error_code/message";
        }
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String description = firstText(root, "message", "errmsg", "description");
            String requestId = firstText(root, "request_id", "logid");
            StringBuilder message = new StringBuilder();
            message.append(isBlank(description) ? "接口请求成功" : description);
            if (!isBlank(requestId)) {
                message.append("，request_id=").append(requestId);
            }
            return message.toString();
        } catch (Exception ignored) {
            return statusCode >= 200 && statusCode < 300 ? "接口请求成功" : "接口调用失败";
        }
    }

    private static String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
