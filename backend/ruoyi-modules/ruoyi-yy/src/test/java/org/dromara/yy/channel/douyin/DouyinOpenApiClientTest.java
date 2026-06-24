package org.dromara.yy.channel.douyin;

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
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("dev")
class DouyinOpenApiClientTest {

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void queryLocalLifeOrderShouldUseAccountHeaderAndQueryParams() throws Exception {
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> accessToken = new AtomicReference<>();
        AtomicReference<String> lifeAccount = new AtomicReference<>();
        AtomicReference<String> testHeader = new AtomicReference<>();

        String baseUrl = startServer(exchange -> {
            requestPath.set(exchange.getRequestURI().toString());
            accessToken.set(exchange.getRequestHeaders().getFirst("access-token"));
            lifeAccount.set(exchange.getRequestHeaders().getFirst("Rpc-Transit-Life-Account"));
            testHeader.set(exchange.getRequestHeaders().getFirst("Rpc-Persist-Life-Test-Data-Access"));
            respond(exchange, 200, """
                {
                  "err_no": 0,
                  "data": {
                    "orders": [
                      {
                        "order_id": "dy-order-001",
                        "order_status": "PAY_SUCCESS",
                        "pay_amount": 100
                      }
                    ]
                  },
                  "extra": { "logid": "dy-log-001" }
                }
                """);
        });

        DouyinOpenApiClient client = new DouyinOpenApiClient(new ObjectMapper(), baseUrl);
        Map<String, String> params = new LinkedHashMap<>();
        params.put("order_id", "dy-order-001");
        params.put("page_num", "1");
        params.put("page_size", "10");

        YyChannelApiResultVo result = client.queryLocalLifeOrder("token-001", "account-001", params, true);

        assertTrue(result.getSuccess());
        assertEquals("/goodlife/v1/trade/order/query/?account_id=account-001&order_id=dy-order-001&page_num=1&page_size=10", requestPath.get());
        assertEquals("token-001", accessToken.get());
        assertEquals("account-001", lifeAccount.get());
        assertEquals("all", testHeader.get());
    }

    @Test
    void confirmComprehensiveOrderShouldTreatErrorCodeZeroAsSuccess() throws Exception {
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> requestBody = new AtomicReference<>();
        AtomicReference<String> lifeAccount = new AtomicReference<>();

        String baseUrl = startServer(exchange -> {
            requestPath.set(exchange.getRequestURI().toString());
            lifeAccount.set(exchange.getRequestHeaders().getFirst("Rpc-Transit-Life-Account"));
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            respond(exchange, 200, """
                {
                  "data": {
                    "error_code": 0,
                    "description": "success"
                  },
                  "extra": { "logid": "dy-confirm-log-001" }
                }
                """);
        });

        DouyinOpenApiClient client = new DouyinOpenApiClient(new ObjectMapper(), baseUrl);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("book_id", "book-001");
        body.put("confirm_result", 1);
        body.put("fulfil_type", 1);
        body.put("merchant_notes", "测试接单");

        YyChannelApiResultVo result = client.confirmComprehensiveOrder("token-001", "account-001", body);

        assertTrue(result.getSuccess());
        assertEquals("/goodlife/v1/comprehensive/trade/order/confirm/", requestPath.get());
        assertEquals("account-001", lifeAccount.get());
        assertTrue(requestBody.get().contains("\"book_id\":\"book-001\""));
    }

    @Test
    void verifyCertificateShouldPostWholeOrderVerifyBody() throws Exception {
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> requestBody = new AtomicReference<>();
        AtomicReference<String> accessToken = new AtomicReference<>();
        AtomicReference<String> lifeAccount = new AtomicReference<>();

        String baseUrl = startServer(exchange -> {
            requestPath.set(exchange.getRequestURI().toString());
            accessToken.set(exchange.getRequestHeaders().getFirst("access-token"));
            lifeAccount.set(exchange.getRequestHeaders().getFirst("Rpc-Transit-Life-Account"));
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            respond(exchange, 200, """
                {
                  "data": {
                    "error_code": 0,
                    "description": "success"
                  },
                  "extra": { "logid": "dy-verify-log-001" }
                }
                """);
        });

        DouyinOpenApiClient client = new DouyinOpenApiClient(new ObjectMapper(), baseUrl);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("poi_id", "7571364336015247401");
        body.put("codes", List.of("YYCODE001"));
        body.put("verify_extra", Map.of("total_verify", true));

        YyChannelApiResultVo result = client.verifyCertificate("token-001", "account-001", body);

        assertTrue(result.getSuccess());
        assertEquals("/goodlife/v1/fulfilment/certificate/verify/", requestPath.get());
        assertEquals("token-001", accessToken.get());
        assertEquals("account-001", lifeAccount.get());
        assertTrue(requestBody.get().contains("\"poi_id\":\"7571364336015247401\""));
        assertTrue(requestBody.get().contains("\"codes\":[\"YYCODE001\"]"));
        assertTrue(requestBody.get().contains("\"total_verify\":true"));
    }

    @Test
    void upsertReservationInventorySkuShouldPostAccountQueryAndTestHeader() throws Exception {
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> requestBody = new AtomicReference<>();
        AtomicReference<String> accessToken = new AtomicReference<>();
        AtomicReference<String> lifeAccount = new AtomicReference<>();
        AtomicReference<String> testHeader = new AtomicReference<>();

        String baseUrl = startServer(exchange -> {
            requestPath.set(exchange.getRequestURI().toString());
            accessToken.set(exchange.getRequestHeaders().getFirst("access-token"));
            lifeAccount.set(exchange.getRequestHeaders().getFirst("Rpc-Transit-Life-Account"));
            testHeader.set(exchange.getRequestHeaders().getFirst("Rpc-Persist-Life-Test-Data-Access"));
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            respond(exchange, 200, """
                {
                  "err_no": 0,
                  "data": { "description": "success" },
                  "extra": { "logid": "dy-inventory-sku-log-001" }
                }
                """);
        });

        DouyinOpenApiClient client = new DouyinOpenApiClient(new ObjectMapper(), baseUrl);
        Map<String, Object> sku = new LinkedHashMap<>();
        sku.put("sku_id", "1866940964963331");
        sku.put("sku_out_id", "YY-SKU-001");
        sku.put("time_slot", 30);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("poi_id", "7571364336015247401");
        body.put("sku_info_list", List.of(sku));

        YyChannelApiResultVo result = client.upsertReservationInventorySku("token-001", "account-001", body, true);

        assertTrue(result.getSuccess());
        assertEquals("/goodlife/v1/goods/comprehensive/reception/stock/sku/upsert/?account_id=account-001", requestPath.get());
        assertEquals("token-001", accessToken.get());
        assertEquals("account-001", lifeAccount.get());
        assertEquals("all", testHeader.get());
        assertTrue(requestBody.get().contains("\"poi_id\":\"7571364336015247401\""));
        assertTrue(requestBody.get().contains("\"sku_out_id\":\"YY-SKU-001\""));
    }

    @Test
    void saveReservationRealtimeStockShouldPostStockListAndExtractLogId() throws Exception {
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> requestBody = new AtomicReference<>();

        String baseUrl = startServer(exchange -> {
            requestPath.set(exchange.getRequestURI().toString());
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            respond(exchange, 200, """
                {
                  "err_no": 0,
                  "data": { "description": "success" },
                  "extra": { "logid": "dy-stock-save-log-001" }
                }
                """);
        });

        DouyinOpenApiClient client = new DouyinOpenApiClient(new ObjectMapper(), baseUrl);
        Map<String, Object> slot = new LinkedHashMap<>();
        slot.put("date", "2026-06-04");
        slot.put("start_time", "10:00");
        slot.put("end_time", "10:30");
        slot.put("available_stock", 6);
        Map<String, Object> sku = new LinkedHashMap<>();
        sku.put("sku_id", "1866940964963331");
        sku.put("sku_out_id", "YY-SKU-001");
        sku.put("real_time_stock_list", List.of(slot));
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("poi_id", "7571364336015247401");
        body.put("sku_real_time_stock_list", List.of(sku));

        YyChannelApiResultVo result = client.saveReservationRealtimeStock("token-001", "account-001", body, false);

        assertTrue(result.getSuccess());
        assertEquals("/goodlife/v1/goods/comprehensive/reception/save/stock/?account_id=account-001", requestPath.get());
        assertTrue(requestBody.get().contains("\"available_stock\":6"));
        assertTrue(result.getRawResponse().contains("dy-stock-save-log-001"));
    }

    @Test
    void getReservationTimeStockShouldUseAccountAndPoiQuery() throws Exception {
        AtomicReference<String> requestPath = new AtomicReference<>();
        AtomicReference<String> method = new AtomicReference<>();

        String baseUrl = startServer(exchange -> {
            method.set(exchange.getRequestMethod());
            requestPath.set(exchange.getRequestURI().toString());
            respond(exchange, 200, """
                {
                  "err_no": 0,
                  "data": { "room_time_rules": [] },
                  "extra": { "logid": "dy-time-stock-get-log-001" }
                }
                """);
        });

        DouyinOpenApiClient client = new DouyinOpenApiClient(new ObjectMapper(), baseUrl);

        YyChannelApiResultVo result = client.getReservationTimeStock("token-001", "account-001", "7571364336015247401", true);

        assertTrue(result.getSuccess());
        assertEquals("GET", method.get());
        assertEquals("/goodlife/v1/goods/open/comprehensive/booking/room/time_stock/get/?account_id=account-001&poi_id=7571364336015247401", requestPath.get());
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
