package org.dromara.yy.channel.meituan;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("dev")
class MeituanOpenApiClientTest {

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void queryOrdersShouldUseAccessTokenAndShopIdWithoutLeakingSecret() throws Exception {
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> authHeader = new AtomicReference<>();

        String baseUrl = startServer(exchange -> {
            requestPath.set(exchange.getRequestURI().toString());
            authHeader.set(exchange.getRequestHeaders().getFirst("Authorization"));
            respond(exchange, 200, """
                {
                  "code": 0,
                  "message": "success",
                  "data": {
                    "orders": [
                      {
                        "order_id": "MT-ORDER-001",
                        "order_status": "PAID",
                        "customer_name": "王女士",
                        "customer_phone": "13800003333",
                        "pay_amount": 499.00
                      }
                    ]
                  },
                  "request_id": "mt-log-001"
                }
                """);
        });
        MeituanOpenApiClient client = new MeituanOpenApiClient(new ObjectMapper(), baseUrl);
        Map<String, String> params = new LinkedHashMap<>();
        params.put("shop_id", "shop-001");
        params.put("start_time", "2026-06-03 00:00:00");
        params.put("end_time", "2026-06-03 23:59:59");

        YyChannelApiResultVo result = client.queryOrders("mt-token-001", params);

        assertTrue(result.getSuccess());
        assertEquals("/api/meituan/orders?shop_id=shop-001&start_time=2026-06-03+00%3A00%3A00&end_time=2026-06-03+23%3A59%3A59", requestPath.get());
        assertEquals("Bearer mt-token-001", authHeader.get());
        assertTrue(result.getRequestSummary().contains("access_token 已脱敏"));
        assertFalse(result.getRequestSummary().contains("mt-token-001"));
    }

    @Test
    void tokenStatusShouldReturnFailureWhenTokenMissing() {
        MeituanOpenApiClient client = new MeituanOpenApiClient(new ObjectMapper(), "http://127.0.0.1:1");

        YyChannelApiResultVo result = client.tokenStatus("", "shop-001");

        assertFalse(result.getSuccess());
        assertEquals("MEITUAN", result.getChannelType());
        assertTrue(result.getMissingConfig().contains("access_token"));
    }

    private String startServer(ExchangeHandler handler) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", handler::handle);
        server.start();
        return "http://127.0.0.1:" + server.getAddress().getPort();
    }

    private static void respond(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }

    @FunctionalInterface
    private interface ExchangeHandler {
        void handle(HttpExchange exchange) throws IOException;
    }
}
