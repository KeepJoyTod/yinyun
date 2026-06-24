package org.dromara.yy.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.bo.ClientPhotoPlatformLoginRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("dev")
class ClientPhotoMiniAppPhoneAuthProviderTest {

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void wechatShouldPostPhoneCodeAndExtractPhoneNumber() throws Exception {
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> requestBody = new AtomicReference<>();
        String baseUrl = startServer(exchange -> {
            requestPath.set(exchange.getRequestURI().toString());
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            respond(exchange, 200, """
                {
                  "errcode": 0,
                  "phone_info": {
                    "phoneNumber": "13900000002",
                    "purePhoneNumber": "13900000002",
                    "countryCode": "86"
                  }
                }
                """);
        });
        ClientPhotoMiniAppPhoneAuthProvider provider = new ClientPhotoMiniAppPhoneAuthProvider(
            new ObjectMapper(),
            baseUrl,
            "wx-token",
            "",
            ""
        );
        ClientPhotoPlatformLoginRequest request = request("WECHAT_MINI_APP", "login-code", "phone-code");

        String phone = provider.resolvePhone(request);

        assertEquals("13900000002", phone);
        assertEquals("/wxa/business/getuserphonenumber?access_token=wx-token", requestPath.get());
        assertTrue(requestBody.get().contains("\"code\":\"phone-code\""));
    }

    @Test
    void wechatShouldFetchAccessTokenWithAppSecretAndReuseCachedToken() throws Exception {
        AtomicInteger tokenRequests = new AtomicInteger();
        AtomicInteger phoneRequests = new AtomicInteger();
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().toString();
            if (path.startsWith("/cgi-bin/token")) {
                tokenRequests.incrementAndGet();
                assertTrue(path.contains("grant_type=client_credential"));
                assertTrue(path.contains("appid=wx-app-id"));
                assertTrue(path.contains("secret=wx-secret"));
                respond(exchange, 200, """
                    {
                      "access_token": "fetched-wx-token",
                      "expires_in": 7200
                    }
                    """);
                return;
            }
            phoneRequests.incrementAndGet();
            assertEquals("/wxa/business/getuserphonenumber?access_token=fetched-wx-token", path);
            respond(exchange, 200, """
                {
                  "errcode": 0,
                  "phone_info": {
                    "phoneNumber": "13900000003"
                  }
                }
                """);
        });
        ClientPhotoMiniAppPhoneAuthProvider provider = new ClientPhotoMiniAppPhoneAuthProvider(
            new ObjectMapper(),
            baseUrl,
            "",
            "",
            "",
            "wx-app-id",
            "wx-secret"
        );

        assertEquals("13900000003", provider.resolvePhone(request("WECHAT_MINI_APP", "login-code-1", "phone-code-1")));
        assertEquals("13900000003", provider.resolvePhone(request("WECHAT_MINI_APP", "login-code-2", "phone-code-2")));
        assertEquals(1, tokenRequests.get());
        assertEquals(2, phoneRequests.get());
    }

    @Test
    void unsupportedPlatformShouldReturnBlank() {
        ClientPhotoMiniAppPhoneAuthProvider provider = new ClientPhotoMiniAppPhoneAuthProvider(
            new ObjectMapper(),
            "https://example.invalid",
            "wx-token",
            "dy-token",
            "/api/apps/v1/user/phonenumber/get"
        );

        assertEquals("", provider.resolvePhone(request("H5", "login-code", "phone-code")));
    }

    @Test
    void configuredPlatformWithoutTokenShouldReturnBlank() {
        ClientPhotoMiniAppPhoneAuthProvider provider = new ClientPhotoMiniAppPhoneAuthProvider(
            new ObjectMapper(),
            "https://example.invalid",
            "",
            "",
            "/api/apps/v1/user/phonenumber/get"
        );

        assertEquals("", provider.resolvePhone(request("WECHAT_MINI_APP", "login-code", "phone-code")));
        assertEquals("", provider.resolvePhone(request("DOUYIN_MINI_APP", "login-code", "phone-code")));
    }

    @Test
    void apiErrorShouldThrowServiceExceptionWithoutLeakingCodes() throws Exception {
        String baseUrl = startServer(exchange -> respond(exchange, 200, """
            {
              "errcode": 40029,
              "errmsg": "invalid code"
            }
            """));
        ClientPhotoMiniAppPhoneAuthProvider provider = new ClientPhotoMiniAppPhoneAuthProvider(
            new ObjectMapper(),
            baseUrl,
            "wx-token",
            "",
            ""
        );

        ServiceException ex = assertThrows(ServiceException.class, () -> provider.resolvePhone(request("WECHAT_MINI_APP", "login-code", "secret-phone-code")));

        assertTrue(ex.getMessage().contains("平台手机号授权失败"));
        assertTrue(!ex.getMessage().contains("secret-phone-code"));
    }

    private static ClientPhotoPlatformLoginRequest request(String platform, String loginCode, String phoneCode) {
        ClientPhotoPlatformLoginRequest request = new ClientPhotoPlatformLoginRequest();
        request.setPlatform(platform);
        request.setLoginCode(loginCode);
        request.setPhoneCode(phoneCode);
        return request;
    }

    private String startServer(Handler handler) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            try {
                handler.handle(exchange);
            } catch (Exception e) {
                respond(exchange, 500, "{\"errcode\":500,\"errmsg\":\"test server error\"}");
            }
        });
        server.start();
        return "http://127.0.0.1:" + server.getAddress().getPort();
    }

    private static void respond(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }

    @FunctionalInterface
    private interface Handler {
        void handle(HttpExchange exchange) throws Exception;
    }
}
