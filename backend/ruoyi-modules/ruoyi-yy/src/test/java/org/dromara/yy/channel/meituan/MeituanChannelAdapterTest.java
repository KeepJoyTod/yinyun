package org.dromara.yy.channel.meituan;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import java.io.IOException;
import java.io.Serializable;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class MeituanChannelAdapterTest {

    private HttpServer server;

    @Mock
    private YyChannelAccountMapper channelAccountMapper;

    @Mock
    private YyChannelOrderMappingMapper channelOrderMappingMapper;

    @Mock
    private YyChannelSyncLogMapper channelSyncLogMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private IdentifierGenerator identifierGenerator;

    @Mock
    private Environment environment;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void searchListShouldReturnUnopenedFallbackWithoutMockCustomerWhenUnauthorized() {
        when(channelAccountMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        MeituanChannelAdapter adapter = adapter();
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStoreId(900002L);

        List<YyChannelOrderVo> orders = adapter.searchList(query);

        assertEquals(1, orders.size());
        YyChannelOrderVo order = orders.get(0);
        assertEquals("MEITUAN", order.getChannelType());
        assertEquals("UNAUTHORIZED", order.getExternalStatus());
        assertEquals("FAILED", order.getSyncStatus());
        assertTrue(order.getRawPayload().contains("美团门店未授权"));
        assertFalse(order.getRawPayload().contains("13900000000"));
        verify(channelOrderMappingMapper, never()).insert(any(YyChannelOrderMapping.class));
    }

    @Test
    void clientTokenShouldReportAuthorizedWhenAccountTokenExists() {
        when(channelAccountMapper.selectOne(any(Wrapper.class))).thenReturn(account("shop-001", "mt-token-001"));
        MeituanChannelAdapter adapter = adapter();
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStoreId(900002L);

        YyChannelApiResultVo result = adapter.clientToken(query);

        assertTrue(result.getSuccess());
        assertEquals("MEITUAN", result.getChannelType());
        assertEquals("meituan_token_status", result.getApiName());
        assertTrue(result.getMessage().contains("已授权"));
        assertFalse(result.getRawResponse().contains("mt-token-001"));
    }

    @Test
    void clientTokenShouldReportAuthorizedWhenEnvironmentTokenExistsWithoutAccount() {
        when(channelAccountMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(environment.getProperty(anyString())).thenReturn("");
        when(environment.getProperty("yy.meituan.access-token")).thenReturn("env-mt-token-001");
        when(environment.getProperty("yy.meituan.shop-id")).thenReturn("env-shop-001");
        MeituanChannelAdapter adapter = adapter();

        YyChannelApiResultVo result = adapter.clientToken(new YyChannelOrderQuery());

        assertTrue(result.getSuccess());
        assertEquals("MEITUAN", result.getChannelType());
        assertTrue(result.getMessage().contains("已授权"));
        assertFalse(result.getRawResponse().contains("env-mt-token-001"));
    }

    @Test
    void syncOrdersShouldRecordFailureLogWhenUnauthorized() {
        when(channelAccountMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(environment.getProperty(anyString())).thenReturn("");
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(920000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        MeituanChannelAdapter adapter = adapter();

        YyChannelSyncResultVo result = adapter.syncOrders(new YyChannelOrderQuery());

        assertEquals("FAILED", result.getSyncStatus());
        assertEquals(1, result.getFailed());
        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        YyChannelSyncLog log = logCaptor.getValue();
        assertEquals("meituan_order_query", log.getApiName());
        assertEquals("0", log.getSuccess());
        assertTrue(log.getErrorMessage().contains("未授权"));
    }

    @Test
    void syncOrdersShouldFailFastWhenAuthorizedButOpenApiBaseUrlMissing() {
        when(channelAccountMapper.selectOne(any(Wrapper.class))).thenReturn(account("shop-001", "mt-token-001"));
        when(environment.getProperty(anyString())).thenReturn("");
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(920000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        MeituanChannelAdapter adapter = adapter();

        YyChannelSyncResultVo result = adapter.syncOrders(new YyChannelOrderQuery());

        assertEquals("FAILED", result.getSyncStatus());
        assertEquals(1, result.getFailed());
        assertTrue(result.getMessage().contains("OpenAPI 地址未配置"));
        verify(channelOrderMappingMapper, never()).insert(any(YyChannelOrderMapping.class));

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertTrue(logCaptor.getValue().getErrorMessage().contains("OpenAPI 地址未配置"));
    }

    @Test
    void syncOrdersShouldQueryRemoteOrdersAndPersistMappingAndLog() throws Exception {
        String baseUrl = startServer(exchange -> respond(exchange, 200, """
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
            """));
        when(environment.getProperty(anyString())).thenReturn("");
        when(environment.getProperty("yy.meituan.base-url")).thenReturn(baseUrl);
        when(channelAccountMapper.selectOne(any(Wrapper.class))).thenReturn(account("shop-001", "mt-token-001"));
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(920000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        MeituanChannelAdapter adapter = adapter();
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStoreId(900002L);
        query.setStartTime("2026-06-03 00:00:00");
        query.setEndTime("2026-06-03 23:59:59");

        YyChannelSyncResultVo result = adapter.syncOrders(query);

        assertEquals("SYNCED", result.getSyncStatus());
        assertEquals(1, result.getTotal());
        assertEquals(1, result.getCreated());
        assertEquals("mt-log-001", result.getLastLogId());

        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).insert(mappingCaptor.capture());
        YyChannelOrderMapping mapping = mappingCaptor.getValue();
        assertEquals("MEITUAN", mapping.getChannelType());
        assertEquals("MT-ORDER-001", mapping.getExternalOrderId());
        assertEquals("PAID", mapping.getExternalStatus());
        assertEquals("SYNCED", mapping.getSyncStatus());
        assertFalse(mapping.getRawPayload().contains("13800003333"));

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        YyChannelSyncLog log = logCaptor.getValue();
        assertEquals("meituan_order_query", log.getApiName());
        assertEquals("mt-log-001", log.getRequestId());
        assertEquals("1", log.getSuccess());
        assertFalse(log.getRemark().contains("mt-token-001"));
        assertFalse(log.getRemark().contains("13800003333"));
    }

    private MeituanChannelAdapter adapter() {
        return new MeituanChannelAdapter(
            channelAccountMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            identifierGenerator,
            environment
        );
    }

    private static YyChannelAccount account(String shopId, String accessToken) {
        YyChannelAccount account = new YyChannelAccount();
        account.setId(906002L);
        account.setStoreId(900002L);
        account.setChannelType("MEITUAN");
        account.setAccountName("美团门店账号");
        account.setAppKey("mt-app-key-001");
        account.setAppSecretEnc("mt-secret-001");
        account.setAccessTokenEnc(accessToken);
        account.setRefreshTokenEnc("mt-refresh-token-001");
        account.setServiceId(shopId);
        account.setStatus("AUTHORIZED");
        account.setExpiresAt(new Date(System.currentTimeMillis() + 3600_000L));
        return account;
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
