package org.dromara.yy.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.bo.ClientPhotoPlatformLoginRequest;
import org.dromara.yy.service.ClientPhotoPhoneAuthProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 微信/抖音小程序手机号授权解析器。
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "yy.client-photo.phone-auth", name = "enabled", havingValue = "true")
public class ClientPhotoMiniAppPhoneAuthProvider implements ClientPhotoPhoneAuthProvider {

    private static final String DEFAULT_WECHAT_BASE_URL = "https://api.weixin.qq.com";
    private static final String DEFAULT_DOUYIN_BASE_URL = "https://open.douyin.com";
    private static final String WECHAT_PHONE_PATH = "/wxa/business/getuserphonenumber";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String baseUrl;
    private final String wechatAccessToken;
    private final String douyinAccessToken;
    private final String douyinPhonePath;
    private final String wechatAppId;
    private final String wechatAppSecret;
    private volatile String cachedWechatAccessToken;
    private volatile long cachedWechatAccessTokenExpiresAtMillis;

    public ClientPhotoMiniAppPhoneAuthProvider(
        ObjectMapper objectMapper,
        @Value("${yy.client-photo.phone-auth.base-url:}") String baseUrl,
        @Value("${yy.client-photo.phone-auth.wechat-access-token:}") String wechatAccessToken,
        @Value("${yy.client-photo.phone-auth.douyin-access-token:}") String douyinAccessToken,
        @Value("${yy.client-photo.phone-auth.douyin-phone-path:}") String douyinPhonePath,
        @Value("${yy.client-photo.phone-auth.wechat-app-id:}") String wechatAppId,
        @Value("${yy.client-photo.phone-auth.wechat-app-secret:}") String wechatAppSecret
    ) {
        this.objectMapper = objectMapper;
        this.baseUrl = StringUtils.trimToEmpty(baseUrl);
        this.wechatAccessToken = StringUtils.trimToEmpty(wechatAccessToken);
        this.douyinAccessToken = StringUtils.trimToEmpty(douyinAccessToken);
        this.douyinPhonePath = StringUtils.trimToEmpty(douyinPhonePath);
        this.wechatAppId = StringUtils.trimToEmpty(wechatAppId);
        this.wechatAppSecret = StringUtils.trimToEmpty(wechatAppSecret);
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();
    }

    ClientPhotoMiniAppPhoneAuthProvider(
        ObjectMapper objectMapper,
        String baseUrl,
        String wechatAccessToken,
        String douyinAccessToken,
        String douyinPhonePath
    ) {
        this(objectMapper, baseUrl, wechatAccessToken, douyinAccessToken, douyinPhonePath, "", "");
    }

    @Override
    public String resolvePhone(ClientPhotoPlatformLoginRequest request) {
        String platform = normalizePlatform(request.getPlatform());
        if ("WECHAT_MINI_APP".equals(platform)) {
            return resolveWechatPhone(request);
        }
        if ("DOUYIN_MINI_APP".equals(platform)) {
            return resolveDouyinPhone(request);
        }
        return "";
    }

    private String resolveWechatPhone(ClientPhotoPlatformLoginRequest request) {
        if (StringUtils.isBlank(request.getPhoneCode())) {
            return "";
        }
        String accessToken = resolveWechatAccessToken();
        if (StringUtils.isBlank(accessToken)) {
            return "";
        }
        String url = resolveBaseUrl(DEFAULT_WECHAT_BASE_URL) + WECHAT_PHONE_PATH + "?access_token=" + encodeQueryValue(accessToken);
        Map<String, String> body = Map.of("code", request.getPhoneCode());
        JsonNode root = postJson(url, body);
        String phone = firstText(root, "phoneNumber", "purePhoneNumber", "phone_number", "mobile", "phone");
        if (StringUtils.isBlank(phone)) {
            throw new ServiceException("平台手机号授权失败，请使用手机号和取片码登录");
        }
        return phone;
    }

    private String resolveWechatAccessToken() {
        if (StringUtils.isNotBlank(wechatAccessToken)) {
            return wechatAccessToken;
        }
        if (StringUtils.isBlank(wechatAppId) || StringUtils.isBlank(wechatAppSecret)) {
            return "";
        }
        long now = System.currentTimeMillis();
        if (StringUtils.isNotBlank(cachedWechatAccessToken) && now < cachedWechatAccessTokenExpiresAtMillis) {
            return cachedWechatAccessToken;
        }
        synchronized (this) {
            now = System.currentTimeMillis();
            if (StringUtils.isNotBlank(cachedWechatAccessToken) && now < cachedWechatAccessTokenExpiresAtMillis) {
                return cachedWechatAccessToken;
            }
            JsonNode root = getJson(resolveBaseUrl(DEFAULT_WECHAT_BASE_URL)
                + "/cgi-bin/token?grant_type=client_credential&appid="
                + encodeQueryValue(wechatAppId)
                + "&secret="
                + encodeQueryValue(wechatAppSecret));
            String accessToken = firstText(root, "access_token");
            if (StringUtils.isBlank(accessToken)) {
                throw new ServiceException("平台手机号授权失败，请使用手机号和取片码登录");
            }
            long expiresInSeconds = Math.max(60L, root.path("expires_in").asLong(7200L));
            cachedWechatAccessToken = accessToken;
            cachedWechatAccessTokenExpiresAtMillis = now + Math.max(1L, expiresInSeconds - 60L) * 1000L;
            return accessToken;
        }
    }

    private String resolveDouyinPhone(ClientPhotoPlatformLoginRequest request) {
        if (StringUtils.isBlank(douyinAccessToken) || StringUtils.isBlank(douyinPhonePath) || StringUtils.isBlank(request.getPhoneCode())) {
            return "";
        }
        String path = douyinPhonePath.startsWith("/") ? douyinPhonePath : "/" + douyinPhonePath;
        Map<String, String> body = new LinkedHashMap<>();
        body.put("code", request.getPhoneCode());
        body.put("phone_code", request.getPhoneCode());
        if (StringUtils.isNotBlank(request.getLoginCode())) {
            body.put("login_code", request.getLoginCode());
        }
        JsonNode root = postJson(resolveBaseUrl(DEFAULT_DOUYIN_BASE_URL) + path, body, douyinAccessToken);
        String phone = firstText(root, "phoneNumber", "purePhoneNumber", "phone_number", "mobile", "phone", "phone_num");
        if (StringUtils.isBlank(phone)) {
            throw new ServiceException("平台手机号授权失败，请使用手机号和取片码登录");
        }
        return phone;
    }

    private JsonNode postJson(String url, Object body) {
        return postJson(url, body, "");
    }

    private JsonNode postJson(String url, Object body, String accessToken) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body), StandardCharsets.UTF_8));
            if (StringUtils.isNotBlank(accessToken)) {
                builder.header("access-token", accessToken);
                builder.header("Authorization", "Bearer " + accessToken);
            }
            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            JsonNode root = objectMapper.readTree(response.body());
            if (response.statusCode() < 200 || response.statusCode() >= 300 || !isSuccess(root)) {
                throw new ServiceException("平台手机号授权失败，请使用手机号和取片码登录");
            }
            return root;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.warn("平台手机号授权 HTTP 请求失败");
            throw new ServiceException("平台手机号授权失败，请使用手机号和取片码登录");
        }
    }

    private JsonNode getJson(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .GET()
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            JsonNode root = objectMapper.readTree(response.body());
            if (response.statusCode() < 200 || response.statusCode() >= 300 || !isSuccess(root)) {
                throw new ServiceException("平台手机号授权失败，请使用手机号和取片码登录");
            }
            return root;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.warn("平台手机号授权 token 请求失败");
            throw new ServiceException("平台手机号授权失败，请使用手机号和取片码登录");
        }
    }

    private boolean isSuccess(JsonNode root) {
        JsonNode errCode = root.findValue("errcode");
        if (errCode != null && errCode.asInt(0) != 0) {
            return false;
        }
        JsonNode errorCode = root.findValue("error_code");
        if (errorCode != null && errorCode.asInt(0) != 0) {
            return false;
        }
        JsonNode code = root.findValue("code");
        return code == null || !code.canConvertToInt() || code.asInt(0) == 0;
    }

    private String resolveBaseUrl(String defaultBaseUrl) {
        return StringUtils.isBlank(baseUrl) ? defaultBaseUrl : baseUrl.replaceAll("/+$", "");
    }

    private static String normalizePlatform(String platform) {
        String normalized = StringUtils.upperCase(StringUtils.defaultIfBlank(platform, ""));
        return switch (normalized) {
            case "WECHAT", "WECHAT_MINI_APP" -> "WECHAT_MINI_APP";
            case "DOUYIN", "DOUYIN_MINI_APP" -> "DOUYIN_MINI_APP";
            default -> normalized;
        };
    }

    private static String firstText(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return "";
        }
        for (String fieldName : fieldNames) {
            JsonNode value = node.findValue(fieldName);
            if (value != null && value.isValueNode() && StringUtils.isNotBlank(value.asText())) {
                return value.asText();
            }
        }
        return "";
    }

    private static String encodeQueryValue(String value) {
        return java.net.URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
