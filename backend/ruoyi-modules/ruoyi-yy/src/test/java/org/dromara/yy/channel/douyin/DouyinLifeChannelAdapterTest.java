package org.dromara.yy.channel.douyin;

import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyChannelInventorySlot;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.vo.YyChannelEventInboxVo;
import org.dromara.yy.domain.bo.YyChannelInventoryBo;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelSyncResultVo;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.dromara.yy.mapper.YyChannelAccountMapper;
import org.dromara.yy.mapper.YyChannelInventorySlotMapper;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.service.IDouyinLifeStoreResolver;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyChannelEventInboxService;
import org.dromara.yy.service.IYyCustomerService;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.io.Serializable;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class DouyinLifeChannelAdapterTest {

    private HttpServer server;

    @Mock
    private YyChannelAccountMapper channelAccountMapper;

    @Mock
    private YyChannelInventorySlotMapper channelInventorySlotMapper;

    @Mock
    private YyBookingSlotInventoryMapper bookingSlotInventoryMapper;

    @Mock
    private YyChannelOrderMappingMapper channelOrderMappingMapper;

    @Mock
    private YyChannelSyncLogMapper channelSyncLogMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private YyPhotoAlbumMapper photoAlbumMapper;

    @Mock
    private YyStoreMapper storeMapper;

    @Mock
    private IYyCustomerService customerService;

    @Mock
    private IYyChannelEventInboxService eventInboxService;

    @Mock
    private IYyBookingSlotInventoryService bookingSlotInventoryService;

    @Mock
    private IDouyinLifeStoreResolver storeResolver;

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
    void openPlatformWebhookChallengeShouldReturnJsonChallenge() {
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Object response = adapter.handleOpenPlatformWebhook(
            """
                {
                  "CHALLENGE": "yy_ping"
                }
                """,
            Map.of()
        );

        assertEquals(Map.of("challenge", "yy_ping"), response);
    }

    @Test
    void openPlatformWebhookChallengeShouldPreserveNumericContentValue() {
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Object response = adapter.handleOpenPlatformWebhook(
            """
                {
                  "event": "verify_webhook",
                  "content": {
                    "challenge": 12345
                  }
                }
                """,
            Map.of()
        );

        assertEquals(Map.of("challenge", 12345), response);
    }

    @Test
    void openPlatformWebhookChallengeShouldParseStringifiedContent() {
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Object response = adapter.handleOpenPlatformWebhook(
            """
                {
                  "event": "verify_webhook",
                  "content": "{\\"challenge\\":\\"yy_ping_string\\"}"
                }
                """,
            Map.of()
        );

        assertEquals(Map.of("challenge", "yy_ping_string"), response);
    }

    @Test
    void openPlatformWebhookCertificateRefundShouldUpdateLocalOrderThroughInbox() {
        YyChannelEventInboxVo inbox = new YyChannelEventInboxVo();
        inbox.setId(880106L);
        inbox.setProcessStatus("RECEIVED");
        when(eventInboxService.receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("life_event_webhook"),
            eq("1095657667861145991"),
            eq("dy-certificate-refund-log-001"),
            any(String.class),
            eq(true),
            eq("")
        )).thenReturn(inbox);
        YyOrder existingOrder = new YyOrder();
        existingOrder.setId(900106L);
        existingOrder.setStoreId(903001L);
        existingOrder.setSource("DOUYIN_LIFE");
        existingOrder.setChannelType("DOUYIN_LIFE");
        existingOrder.setExternalOrderId("1095657667861145991");
        existingOrder.setStatus("PENDING");
        existingOrder.setPayStatus("PAID");
        existingOrder.setCustomerName("券退款客户");
        existingOrder.setCustomerPhone("13800000000");
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(existingOrder);
        YyChannelOrderMapping existingMapping = new YyChannelOrderMapping();
        existingMapping.setId(901106L);
        existingMapping.setOrderId(900106L);
        existingMapping.setChannelType("DOUYIN_LIFE");
        existingMapping.setExternalOrderId("1095657667861145991");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(existingMapping);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.updateById(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "eventInboxService", eventInboxService);

        Object response = adapter.handleOpenPlatformWebhook(
            """
                {
                  "event": "life_trade_certificate_notify",
                  "content": "{\\"order_id\\":\\"1095657667861145991\\",\\"action\\":\\"refund_success\\",\\"refund_amount\\":\\"88.50\\"}"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-certificate-refund-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) ((Map<?, ?>) response).get("data");
        assertEquals(0, data.get("error_code"));
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        assertEquals(900106L, orderCaptor.getValue().getId());
        assertEquals("REFUNDED", orderCaptor.getValue().getStatus());
        assertEquals("REFUNDED", orderCaptor.getValue().getPayStatus());
        assertEquals("REFUNDED", orderCaptor.getValue().getRefundStatus());
        assertEquals(8850L, orderCaptor.getValue().getRefundAmountCent());
        verify(eventInboxService).markProcessed(eq(880106L), any(String.class));
    }

    @Test
    void openPlatformWebhookCertificateVerifyShouldCompleteLocalOrderThroughInbox() {
        YyChannelEventInboxVo inbox = new YyChannelEventInboxVo();
        inbox.setId(880107L);
        inbox.setProcessStatus("RECEIVED");
        when(eventInboxService.receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("life_event_webhook"),
            eq("1095657667861145992"),
            eq("dy-certificate-verify-log-001"),
            any(String.class),
            eq(true),
            eq("")
        )).thenReturn(inbox);
        YyOrder existingOrder = new YyOrder();
        existingOrder.setId(900107L);
        existingOrder.setStoreId(903001L);
        existingOrder.setSource("DOUYIN_LIFE");
        existingOrder.setChannelType("DOUYIN_LIFE");
        existingOrder.setExternalOrderId("1095657667861145992");
        existingOrder.setStatus("PENDING");
        existingOrder.setPayStatus("PAID");
        existingOrder.setCustomerName("核销客户");
        existingOrder.setCustomerPhone("13800000000");
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(existingOrder);
        YyChannelOrderMapping existingMapping = new YyChannelOrderMapping();
        existingMapping.setId(901107L);
        existingMapping.setOrderId(900107L);
        existingMapping.setChannelType("DOUYIN_LIFE");
        existingMapping.setExternalOrderId("1095657667861145992");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(existingMapping);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.updateById(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "eventInboxService", eventInboxService);

        Object response = adapter.handleOpenPlatformWebhook(
            """
                {
                  "event": "life_trade_certificate_notify",
                  "content": "{\\"order_id\\":\\"1095657667861145992\\",\\"action\\":\\"verify_success\\"}"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-certificate-verify-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) ((Map<?, ?>) response).get("data");
        assertEquals(0, data.get("error_code"));
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        assertEquals(900107L, orderCaptor.getValue().getId());
        assertEquals("COMPLETED", orderCaptor.getValue().getStatus());
        assertEquals("PAID", orderCaptor.getValue().getPayStatus());
        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).updateById(mappingCaptor.capture());
        assertEquals("verify_success", mappingCaptor.getValue().getExternalStatus());
        assertEquals("SYNCED", mappingCaptor.getValue().getSyncStatus());
        verify(eventInboxService).markProcessed(eq(880107L), any(String.class));
    }

    @Test
    void openPlatformWebhookCertificateVerifyActionShouldCompleteLocalOrderThroughInbox() {
        YyChannelEventInboxVo inbox = new YyChannelEventInboxVo();
        inbox.setId(880108L);
        inbox.setProcessStatus("RECEIVED");
        when(eventInboxService.receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("life_event_webhook"),
            eq("1111441941770264693"),
            eq("dy-certificate-verify-action-log-001"),
            any(String.class),
            eq(true),
            eq("")
        )).thenReturn(inbox);
        YyOrder existingOrder = new YyOrder();
        existingOrder.setId(900108L);
        existingOrder.setStoreId(903001L);
        existingOrder.setSource("DOUYIN_LIFE");
        existingOrder.setChannelType("DOUYIN_LIFE");
        existingOrder.setExternalOrderId("1111441941770264693");
        existingOrder.setStatus("PENDING");
        existingOrder.setPayStatus("PAID");
        existingOrder.setCustomerName("核销客户");
        existingOrder.setCustomerPhone("13800000000");
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(existingOrder);
        YyChannelOrderMapping existingMapping = new YyChannelOrderMapping();
        existingMapping.setId(901108L);
        existingMapping.setOrderId(900108L);
        existingMapping.setChannelType("DOUYIN_LIFE");
        existingMapping.setExternalOrderId("1111441941770264693");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(existingMapping);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.updateById(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "eventInboxService", eventInboxService);

        Object response = adapter.handleOpenPlatformWebhook(
            """
                {
                  "event": "life_trade_certificate_notify",
                  "content": "{\\"action\\":\\"verify\\",\\"certificate\\":{\\"account_id\\":\\"7228763224957519924\\",\\"certificate_id\\":\\"7653728204007948338\\",\\"order_id\\":\\"1111441941770264693\\"}}"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-certificate-verify-action-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) ((Map<?, ?>) response).get("data");
        assertEquals(0, data.get("error_code"));
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        assertEquals(900108L, orderCaptor.getValue().getId());
        assertEquals("COMPLETED", orderCaptor.getValue().getStatus());
        assertEquals("PAID", orderCaptor.getValue().getPayStatus());
        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).updateById(mappingCaptor.capture());
        assertEquals("verify", mappingCaptor.getValue().getExternalStatus());
        assertEquals("SYNCED", mappingCaptor.getValue().getSyncStatus());
        verify(eventInboxService).markProcessed(eq(880108L), any(String.class));
    }

    @Test
    void issueTripartiteCodeShouldReturnDouyinShapeAndPersistLogId() {
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Map<String, Object> response = adapter.issueTripartiteCode(
            """
                {
                  "order_id": "1095532996628185988",
                  "sku_id": "1866866896807962",
                  "third_sku_id": "123",
                  "count": 1,
                  "open_id": "open-sensitive-001",
                  "mobile": "13800000000",
                  "extra": {
                    "access_token": "token-sensitive-001",
                    "receiver_phone": "13900000000"
                  }
                }
                """,
            Map.of(
                "X-Bytedance-Logid", "dy-spi-log-001",
                "x-life-clientkey", "client-key-001"
            )
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        assertEquals("success", data.get("description"));
        assertEquals(1, data.get("result"));
        List<?> certificates = (List<?>) data.get("certificates");
        assertEquals(1, certificates.size());
        Map<?, ?> certificate = (Map<?, ?>) certificates.get(0);
        assertTrue(String.valueOf(certificate.get("certificate_id")).matches("\\d{18}"));
        assertTrue(String.valueOf(certificate.get("code")).matches("\\d{12}"));

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertEquals("tripartite_code_create", logCaptor.getValue().getApiName());
        assertEquals("dy-spi-log-001", logCaptor.getValue().getRequestId());
        assertRedacted(logCaptor.getValue().getRemark());
    }

    @Test
    void issueTripartiteCodeShouldBeIdempotentByOrderAndSku() {
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        String payload = """
            {
              "order_id": "1095532996628185988",
              "sku_id": "1866866896807962",
              "count": 1
            }
            """;

        Map<String, Object> first = adapter.issueTripartiteCode(payload, Map.of("x-life-clientkey", "client-key-001"));
        Map<String, Object> second = adapter.issueTripartiteCode(payload, Map.of("x-life-clientkey", "client-key-001"));

        Map<?, ?> firstCertificate = (Map<?, ?>) ((List<?>) ((Map<?, ?>) first.get("data")).get("certificates")).get(0);
        Map<?, ?> secondCertificate = (Map<?, ?>) ((List<?>) ((Map<?, ?>) second.get("data")).get("certificates")).get(0);
        assertEquals(firstCertificate.get("certificate_id"), secondCertificate.get("certificate_id"));
        assertEquals(firstCertificate.get("code"), secondCertificate.get("code"));
    }

    @Test
    void issueTripartiteCodeShouldRejectInvalidLifeSign() {
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        String payload = """
            {
              "order_id": "1095532996628185988",
              "sku_id": "1866866896807962",
              "count": 1
            }
            """;

        Map<String, Object> response = adapter.issueTripartiteCode(
            payload,
            Map.of(
                "X-Bytedance-Logid", "dy-spi-log-invalid-sign",
                "x-life-clientkey", "client-key-001",
                "x-life-sign", "bad-sign"
            ),
            "client_key=client-key-001&timestamp=1780411200000"
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(9999, data.get("error_code"));
        assertEquals(2, data.get("result"));
        assertTrue(String.valueOf(data.get("description")).contains("验签失败"));
        verify(channelOrderMappingMapper, never()).insert(any(YyChannelOrderMapping.class));

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertEquals("0", logCaptor.getValue().getSuccess());
        assertEquals("dy-spi-log-invalid-sign", logCaptor.getValue().getRequestId());
    }

    @Test
    void issueTripartiteCodeShouldRejectMissingLifeSignWhenSignatureRequired() {
        when(environment.getProperty(any(String.class))).thenAnswer(invocation -> switch (invocation.getArgument(0, String.class)) {
            case "yy.douyin.life.client-key" -> "client-key-001";
            case "yy.douyin.life.client-secret" -> "client-secret-001";
            case "yy.douyin.life.require-signature" -> "true";
            default -> null;
        });
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Map<String, Object> response = adapter.issueTripartiteCode(
            """
                {
                  "order_id": "1095532996628185988",
                  "sku_id": "1866866896807962",
                  "count": 1
                }
                """,
            Map.of(
                "X-Bytedance-Logid", "dy-spi-log-missing-sign",
                "x-life-clientkey", "client-key-001"
            ),
            "client_key=client-key-001&timestamp=1780411200000"
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(9999, data.get("error_code"));
        assertEquals(2, data.get("result"));
        assertTrue(String.valueOf(data.get("description")).contains("缺少 x-life-sign"));
        verify(channelOrderMappingMapper, never()).insert(any(YyChannelOrderMapping.class));
    }

    @Test
    void issueTripartiteCodeShouldAcceptValidLifeSign() {
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        String payload = """
            {
              "order_id": "1095532996628185988",
              "sku_id": "1866866896807962",
              "count": 1
            }
            """;
        String rawQuery = "client_key=client-key-001&timestamp=1780411200000";

        Map<String, Object> response = adapter.issueTripartiteCode(
            payload,
            Map.of(
                "x-life-clientkey", "client-key-001",
                "x-life-sign", lifeSign("client-secret-001", rawQuery, payload)
            ),
            rawQuery
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        assertEquals(1, data.get("result"));
        verify(channelOrderMappingMapper).insert(any(YyChannelOrderMapping.class));
    }

    @Test
    void handleWebhookShouldRedactSensitivePayloadBeforeReturningAndPersisting() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        String payload = """
            {
              "event": "order_payment_notice",
              "order_id": "1095291724056029149",
              "order_status": "PAY_SUCCESS",
              "open_id": "open-sensitive-001",
              "mobile": "13800000000",
              "extra": {
                "access_token": "token-sensitive-001",
                "receiver_phone": "13900000000"
              }
            }
            """;

        YyChannelWebhookResultVo result = adapter.handleWebhook(payload);

        assertTrue(result.getProcessed());
        assertRedacted(result.getRawPayload());

        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).insert(mappingCaptor.capture());
        assertRedacted(mappingCaptor.getValue().getRawPayload());

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertRedacted(logCaptor.getValue().getRemark());
    }

    @Test
    void handleWebhookShouldCreateLocalOrderAndLinkMapping() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        String payload = """
            {
              "event": "order_payment_notice",
              "order_id": "1095291724056029149",
              "order_status": "PAY_SUCCESS",
              "buyer_name": "测试客户",
              "mobile": "13800000000"
            }
            """;

        YyChannelWebhookResultVo result = adapter.handleWebhook(payload);

        assertTrue(result.getProcessed());
        assertEquals("PENDING", result.getLocalStatus());

        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        YyOrder localOrder = orderCaptor.getValue();
        assertNotNull(localOrder.getId());
        assertEquals("DYL-1095291724056029149", localOrder.getOrderNo());
        assertEquals("测试客户", localOrder.getCustomerName());
        assertEquals("13800000000", localOrder.getCustomerPhone());
        assertEquals("DOUYIN_LIFE", localOrder.getSource());
        assertEquals("CHANNEL", localOrder.getBookingMethod());
        assertEquals("PENDING", localOrder.getStatus());
        assertEquals("1095291724056029149", localOrder.getExternalOrderId());

        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).insert(mappingCaptor.capture());
        assertEquals(localOrder.getId(), mappingCaptor.getValue().getOrderId());
        assertEquals("1095291724056029149", mappingCaptor.getValue().getExternalOrderId());
        verify(customerService).upsertByMobile(eq("测试客户"), eq("13800000000"), eq("DOUYIN_LIFE"), any(), any(), eq("抖音来客 webhook 自动同步"));
    }

    @Test
    void reservationOrderCreateSpiShouldCreateLocalOrderAndPersistLogId() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        String payload = """
            {
              "book_id": "book-20260604-001",
              "book_info": {
                "booking_start_time": 1780730400000,
                "booking_end_time": 1780732200000
              },
              "count": 1,
              "poi_id": "7647419894213445642",
              "product_info": [
                {
                  "sku_id": "1867049646914595",
                  "sku_name": "挡丑照单人形象照套餐",
                  "out_source_sku_id": "YY_PHOTO_001"
                }
              ],
              "buyer_name": "预约客户",
              "mobile": "13800000000",
              "order_status": "PAY_SUCCESS"
            }
            """;

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_order_create",
            payload,
            Map.of("X-Bytedance-Logid", "dy-order-create-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        assertEquals(1, data.get("result"));
        assertEquals("book-20260604-001", data.get("book_id"));
        assertEquals("YYB-book-20260604-001", data.get("out_book_id"));
        Map<?, ?> confirmInfo = (Map<?, ?>) data.get("confirm_info");
        assertNotNull(confirmInfo);
        assertEquals(1, confirmInfo.get("confirm_mode"));
        assertEquals(1, confirmInfo.get("confirm_result"));
        assertEquals(1, confirmInfo.get("fulfil_type"));

        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        assertEquals("DYL-book-20260604-001", orderCaptor.getValue().getOrderNo());
        assertEquals("预约客户", orderCaptor.getValue().getCustomerName());
        assertEquals("PENDING", orderCaptor.getValue().getStatus());
        assertEquals("7647419894213445642", orderCaptor.getValue().getExternalPoiId());
        assertEquals("1867049646914595", orderCaptor.getValue().getExternalSkuId());
        assertEquals("2026-06-06", orderCaptor.getValue().getSlotDate());
        assertEquals("15:20", orderCaptor.getValue().getSlotStartTime());
        assertEquals("15:50", orderCaptor.getValue().getSlotEndTime());
        assertNotNull(orderCaptor.getValue().getArrivalTime());

        ArgumentCaptor<YyPhotoAlbum> albumCaptor = ArgumentCaptor.forClass(YyPhotoAlbum.class);
        verify(photoAlbumMapper).insert(albumCaptor.capture());
        YyPhotoAlbum album = albumCaptor.getValue();
        assertEquals(orderCaptor.getValue().getId(), album.getOrderId());
        assertEquals("DOUYIN_LIFE", album.getChannelType());
        assertEquals("ACTIVE", album.getStatus());
        assertEquals("WAITING", album.getSelectionStatus());
        assertEquals("预约客户", album.getCustomerName());
        assertEquals("13800000000", album.getCustomerPhone());
        assertEquals("book-20260604-001", album.getDouyinOrderId());
        assertEquals("book-20260604-001", album.getBookId());
        assertTrue(album.getAlbumName().contains("预约客户"));
        assertTrue(album.getAccessCode().matches("PICK-[0-9A-Z]{8}"));
        assertNotNull(album.getPublicToken());
        assertNotNull(album.getExpireTime());

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper, org.mockito.Mockito.atLeastOnce()).insert(logCaptor.capture());
        assertTrue(logCaptor.getAllValues().stream().anyMatch(log ->
            "reservation_order_create".equals(log.getApiName()) && "dy-order-create-log-001".equals(log.getRequestId())
        ));
    }

    @Test
    void reservationPayNotifySpiShouldCreateLocalOrderAndPhotoAlbumPlaceholder() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_pay_notify",
            """
                {
                  "order_id": "1095657667861145988",
                  "book_id": "book-pay-20260609-001",
                  "buyer_name": "支付客户",
                  "mobile": "13800000000",
                  "order_status": "PAY_SUCCESS",
                  "certificate_code": "YYCODE20260609"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-pay-notify-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));

        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        YyOrder order = orderCaptor.getValue();
        assertEquals("DYL-1095657667861145988", order.getOrderNo());
        assertEquals("支付客户", order.getCustomerName());
        assertEquals("13800000000", order.getCustomerPhone());
        assertEquals("PENDING", order.getStatus());

        ArgumentCaptor<YyPhotoAlbum> albumCaptor = ArgumentCaptor.forClass(YyPhotoAlbum.class);
        verify(photoAlbumMapper).insert(albumCaptor.capture());
        YyPhotoAlbum album = albumCaptor.getValue();
        assertEquals(order.getId(), album.getOrderId());
        assertEquals("DOUYIN_LIFE", album.getChannelType());
        assertEquals("1095657667861145988", album.getDouyinOrderId());
        assertEquals("book-pay-20260609-001", album.getBookId());
        assertEquals("YYCODE20260609", album.getCertificateCode());
        assertEquals("WAITING", album.getSelectionStatus());

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper, org.mockito.Mockito.atLeastOnce()).insert(logCaptor.capture());
        assertTrue(logCaptor.getAllValues().stream().anyMatch(log ->
            "reservation_pay_notify".equals(log.getApiName()) && "dy-pay-notify-log-001".equals(log.getRequestId())
        ));
    }

    @Test
    void reservationPayNotifySpiShouldParseNestedReserveTimeRangeIntoLocalOrder() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_pay_notify",
            """
                {
                  "order_id": "1095657667861145999",
                  "buyer_name": "时段客户",
                  "mobile": "13800000000",
                  "order_status": "PAY_SUCCESS",
                  "reserve_info": {
                    "reserve_date": "2026-06-18",
                    "time_range": ["09:00", "09:30"],
                    "poi_id": "poi-time-range-001",
                    "sku_id": "sku-time-range-001"
                  }
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-pay-notify-log-time-range")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));

        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        YyOrder order = orderCaptor.getValue();
        assertEquals("poi-time-range-001", order.getExternalPoiId());
        assertEquals("sku-time-range-001", order.getExternalSkuId());
        assertEquals("2026-06-18", order.getSlotDate());
        assertEquals("09:00", order.getSlotStartTime());
        assertEquals("09:30", order.getSlotEndTime());
        assertNotNull(order.getArrivalTime());
    }

    @Test
    void reservationPayNotifySpiShouldParseReserveTimestampFieldsAndConfirmInventory() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "bookingSlotInventoryService", bookingSlotInventoryService);

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_pay_notify",
            """
                {
                  "order_id": "1095657667861146000",
                  "buyer_name": "时段客户",
                  "mobile": "test-mobile",
                  "order_status": "PAY_SUCCESS",
                  "reservation_info": {
                    "reserve_start_timestamp": 1781659800,
                    "reserve_end_timestamp": 1781661600,
                    "poi_id": "poi-timestamp-001"
                  },
                  "products": [
                    {
                      "sku_id": "sku-timestamp-001"
                    }
                  ]
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-pay-notify-log-timestamp")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));

        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        YyOrder order = orderCaptor.getValue();
        assertEquals("poi-timestamp-001", order.getExternalPoiId());
        assertEquals("sku-timestamp-001", order.getExternalSkuId());
        assertEquals("2026-06-17", order.getSlotDate());
        assertEquals("09:30", order.getSlotStartTime());
        assertEquals("10:00", order.getSlotEndTime());
        assertNotNull(order.getArrivalTime());
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(order);
    }

    @Test
    void reservationPayNotifySpiShouldMapServiceStatusAliases() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        adapter.handleLifeSpi("reservation_pay_notify", """
            {
              "order_id": "1095657667861146101",
              "buyer_name": "待服务客户",
              "mobile": "13800000000",
              "order_status": "TO_BE_USED"
            }
            """, Map.of("X-Bytedance-Logid", "dy-status-waiting"));
        adapter.handleLifeSpi("reservation_pay_notify", """
            {
              "order_id": "1095657667861146102",
              "buyer_name": "服务中客户",
              "mobile": "13800000000",
              "order_status": "IN_SERVICE"
            }
            """, Map.of("X-Bytedance-Logid", "dy-status-serving"));
        adapter.handleLifeSpi("reservation_pay_notify", """
            {
              "order_id": "1095657667861146103",
              "buyer_name": "已完成客户",
              "mobile": "13800000000",
              "order_status": "SERVICE_FINISHED"
            }
            """, Map.of("X-Bytedance-Logid", "dy-status-completed"));

        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper, org.mockito.Mockito.times(3)).insert(orderCaptor.capture());
        List<YyOrder> orders = orderCaptor.getAllValues();
        assertEquals("PENDING", orders.get(0).getStatus());
        assertEquals("SERVING", orders.get(1).getStatus());
        assertEquals("COMPLETED", orders.get(2).getStatus());
    }

    @Test
    void refundNotifySpiShouldUpdateLocalOrderThroughInbox() {
        YyChannelEventInboxVo inbox = new YyChannelEventInboxVo();
        inbox.setId(880105L);
        inbox.setProcessStatus("RECEIVED");
        when(eventInboxService.receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("refund_notify"),
            eq("1095657667861145990"),
            eq("dy-refund-notify-log-001"),
            any(String.class),
            eq(true),
            eq("")
        )).thenReturn(inbox);
        YyOrder existingOrder = new YyOrder();
        existingOrder.setId(900105L);
        existingOrder.setStoreId(903001L);
        existingOrder.setSource("DOUYIN_LIFE");
        existingOrder.setChannelType("DOUYIN_LIFE");
        existingOrder.setExternalOrderId("1095657667861145990");
        existingOrder.setStatus("PENDING");
        existingOrder.setPayStatus("PAID");
        existingOrder.setCustomerName("退款客户");
        existingOrder.setCustomerPhone("13800000000");
        existingOrder.setPaidAmountCent(9900L);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(existingOrder);
        YyChannelOrderMapping existingMapping = new YyChannelOrderMapping();
        existingMapping.setId(901105L);
        existingMapping.setOrderId(900105L);
        existingMapping.setChannelType("DOUYIN_LIFE");
        existingMapping.setExternalOrderId("1095657667861145990");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(existingMapping);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.updateById(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "eventInboxService", eventInboxService);

        Map<String, Object> response = adapter.handleLifeSpi(
            "refund_notify",
            """
                {
                  "order_id": "1095657667861145990",
                  "store_id": 903001,
                  "buyer_name": "退款客户",
                  "mobile": "13800000000",
                  "order_status": "REFUND_SUCCESS",
                  "refund_amount": 99.00
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-refund-notify-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        assertEquals(900105L, orderCaptor.getValue().getId());
        assertEquals("REFUNDED", orderCaptor.getValue().getStatus());
        assertEquals("REFUNDED", orderCaptor.getValue().getPayStatus());
        assertEquals("REFUNDED", orderCaptor.getValue().getRefundStatus());
        assertEquals(9900L, orderCaptor.getValue().getRefundAmountCent());
        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).updateById(mappingCaptor.capture());
        assertEquals("REFUND_SUCCESS", mappingCaptor.getValue().getExternalStatus());
        assertEquals("SYNCED", mappingCaptor.getValue().getSyncStatus());
        verify(eventInboxService).markProcessed(eq(880105L), any(String.class));
    }

    @Test
    void reservationPayNotifySpiShouldSkipLocalOrderWhenInboxMarksDuplicate() {
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        YyChannelEventInboxVo duplicate = new YyChannelEventInboxVo();
        duplicate.setId(880001L);
        duplicate.setProcessStatus("DUPLICATE");
        when(eventInboxService.receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("reservation_pay_notify"),
            eq("1095657667861145988"),
            eq("dy-pay-notify-duplicate"),
            any(String.class),
            eq(true),
            eq("")
        )).thenReturn(duplicate);
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "eventInboxService", eventInboxService);

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_pay_notify",
            """
                {
                  "order_id": "1095657667861145988",
                  "book_id": "book-pay-duplicate",
                  "buyer_name": "重复客户",
                  "mobile": "13800000000",
                  "order_status": "PAY_SUCCESS"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-pay-notify-duplicate")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        verify(orderMapper, never()).insert(any(YyOrder.class));
        verify(channelOrderMappingMapper, never()).insert(any(YyChannelOrderMapping.class));
        verify(photoAlbumMapper, never()).insert(any(YyPhotoAlbum.class));
        verify(eventInboxService, never()).markProcessed(any(Long.class), any(String.class));
    }

    @Test
    void reservationPayNotifySpiShouldProcessWhenInboxIsStillReceived() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        YyChannelEventInboxVo received = new YyChannelEventInboxVo();
        received.setId(880003L);
        received.setProcessStatus("RECEIVED");
        when(eventInboxService.receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("reservation_pay_notify"),
            eq("1095657667861145988"),
            eq("dy-pay-notify-received"),
            any(String.class),
            eq(true),
            eq("")
        )).thenReturn(received);
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "eventInboxService", eventInboxService);

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_pay_notify",
            """
                {
                  "order_id": "1095657667861145988",
                  "book_id": "book-pay-received",
                  "buyer_name": "重试客户",
                  "mobile": "13800000000",
                  "order_status": "PAY_SUCCESS"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-pay-notify-received")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        verify(orderMapper).insert(any(YyOrder.class));
        verify(channelOrderMappingMapper).insert(any(YyChannelOrderMapping.class));
        verify(eventInboxService).markProcessed(eq(880003L), any(String.class));
    }

    @Test
    void reservationPayNotifySpiShouldKeepInboxRetryableWhenLocalOrderCannotBeCreated() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        YyChannelEventInboxVo received = new YyChannelEventInboxVo();
        received.setId(880004L);
        received.setProcessStatus("RECEIVED");
        when(eventInboxService.receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("reservation_pay_notify"),
            eq("1095657667861145999"),
            eq("dy-pay-notify-no-store"),
            any(String.class),
            eq(true),
            eq("")
        )).thenReturn(received);
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "eventInboxService", eventInboxService);

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_pay_notify",
            """
                {
                  "order_id": "1095657667861145999",
                  "book_id": "book-pay-no-store",
                  "buyer_name": "无门店客户",
                  "mobile": "13800000000",
                  "order_status": "PAY_SUCCESS"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-pay-notify-no-store")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        verify(orderMapper, never()).insert(any(YyOrder.class));
        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).insert(mappingCaptor.capture());
        assertEquals("FAILED_LOCAL", mappingCaptor.getValue().getSyncStatus());
        assertEquals(null, mappingCaptor.getValue().getOrderId());
        verify(eventInboxService).markFailed(eq(880004L), org.mockito.ArgumentMatchers.contains("本地订单"));
        verify(eventInboxService, never()).markProcessed(any(Long.class), any(String.class));
    }

    @Test
    void reservationPayNotifySpiShouldRecordInboxFailureWhenSignatureInvalid() {
        when(environment.getProperty(any(String.class))).thenAnswer(invocation -> switch (invocation.getArgument(0, String.class)) {
            case "yy.douyin.life.client-secret" -> "client-secret-001";
            default -> null;
        });
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        YyChannelEventInboxVo failed = new YyChannelEventInboxVo();
        failed.setId(880002L);
        failed.setProcessStatus("FAILED");
        when(eventInboxService.receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("reservation_pay_notify"),
            eq("1095657667861145988"),
            eq("dy-pay-notify-invalid-sign"),
            any(String.class),
            eq(false),
            org.mockito.ArgumentMatchers.contains("验签失败")
        )).thenReturn(failed);
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "eventInboxService", eventInboxService);
        String payload = """
            {
              "order_id": "1095657667861145988",
              "book_id": "book-pay-invalid-sign",
              "order_status": "PAY_SUCCESS"
            }
            """;

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_pay_notify",
            payload,
            Map.of(
                "X-Bytedance-Logid", "dy-pay-notify-invalid-sign",
                "x-life-sign", "bad-sign"
            ),
            "timestamp=1780411200000"
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(9999, data.get("error_code"));
        assertEquals(2, data.get("result"));
        verify(orderMapper, never()).insert(any(YyOrder.class));
        verify(channelOrderMappingMapper, never()).insert(any(YyChannelOrderMapping.class));
        verify(eventInboxService).receiveEvent(
            eq("DOUYIN_LIFE"),
            eq("reservation_pay_notify"),
            eq("1095657667861145988"),
            eq("dy-pay-notify-invalid-sign"),
            any(String.class),
            eq(false),
            org.mockito.ArgumentMatchers.contains("验签失败")
        );
    }

    @Test
    void reservationPayNotifySpiShouldUpdateExistingPhotoAlbumWithoutDuplicateInsert() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        YyOrder existingOrder = new YyOrder();
        existingOrder.setId(900001L);
        existingOrder.setOrderNo("DYL-1095657667861145988");
        existingOrder.setStoreId(903001L);
        existingOrder.setCustomerName("");
        existingOrder.setCustomerPhone("");
        existingOrder.setSource("DOUYIN_LIFE");
        existingOrder.setExternalOrderId("1095657667861145988");
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(existingOrder);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);

        YyPhotoAlbum existingAlbum = new YyPhotoAlbum();
        existingAlbum.setId(910001L);
        existingAlbum.setChannelType("DOUYIN_LIFE");
        existingAlbum.setDouyinOrderId("1095657667861145988");
        existingAlbum.setStatus("ACTIVE");
        existingAlbum.setSelectionStatus("WAITING");
        existingAlbum.setDelFlag("0");
        when(photoAlbumMapper.selectOne(any(Wrapper.class))).thenReturn(existingAlbum);
        when(photoAlbumMapper.updateById(any(YyPhotoAlbum.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        adapter.handleLifeSpi(
            "reservation_pay_notify",
            """
                {
                  "order_id": "1095657667861145988",
                  "book_id": "book-pay-updated",
                  "buyer_name": "更新客户",
                  "mobile": "13800000000",
                  "order_status": "PAY_SUCCESS",
                  "certificate_code": "YYCODEUPDATED"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-pay-notify-log-dup")
        );

        verify(photoAlbumMapper, never()).insert(any(YyPhotoAlbum.class));
        ArgumentCaptor<YyPhotoAlbum> albumCaptor = ArgumentCaptor.forClass(YyPhotoAlbum.class);
        verify(photoAlbumMapper).updateById(albumCaptor.capture());
        YyPhotoAlbum album = albumCaptor.getValue();
        assertEquals(910001L, album.getId());
        assertEquals(900001L, album.getOrderId());
        assertEquals("book-pay-updated", album.getBookId());
        assertEquals("YYCODEUPDATED", album.getCertificateCode());
        assertEquals("更新客户", album.getCustomerName());
        assertEquals("13800000000", album.getCustomerPhone());
    }

    @Test
    void reservationOrderCreateSpiShouldNotCreatePhotoAlbumWhenPhoneMissing() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        adapter.handleLifeSpi(
            "reservation_order_create",
            """
                {
                  "book_id": "book-no-phone-001",
                  "buyer_name": "无手机号客户",
                  "order_status": "PAY_SUCCESS"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-order-create-no-phone")
        );

        verify(orderMapper).insert(any(YyOrder.class));
        verify(photoAlbumMapper, never()).insert(any(YyPhotoAlbum.class));
        verify(photoAlbumMapper, never()).updateById(any(YyPhotoAlbum.class));
        verify(customerService, never()).upsertByMobile(any(), any(), any(), any(), any(), any());
    }

    @Test
    void refundApplySpiShouldDefaultToProcessingInsteadOfAllowingRefund() {
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Map<String, Object> response = adapter.handleLifeSpi(
            "refund_apply",
            """
                {
                  "after_sale_id": "764781928507503620030345988",
                  "order_id": "1095643678301785988",
                  "certificates": [
                    {
                      "certificate_id": "742015362664535982",
                      "code": "082422154145"
                    }
                  ]
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-refund-apply-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        assertEquals(0, data.get("result"));
        assertEquals("退款申请已接收，等待服务商审核回调", data.get("description"));

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertEquals("refund_apply", logCaptor.getValue().getApiName());
        assertEquals("dy-refund-apply-log-001", logCaptor.getValue().getRequestId());
    }

    @Test
    void refundApplySpiRejectModeShouldReturnReasonAndCertificateCodes() {
        when(environment.getProperty(any(String.class))).thenAnswer(invocation -> switch (invocation.getArgument(0, String.class)) {
            case "yy.douyin.life.refund-apply-mode" -> "reject";
            case "yy.douyin.life.refund-reject-reason" -> "服务商侧已发码，暂不支持退款";
            default -> null;
        });
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Map<String, Object> response = adapter.handleLifeSpi(
            "refund_apply",
            """
                {
                  "after_sale_id": "764781412258298473830045988",
                  "order_id": "1095664357474905988",
                  "certificates": [
                    {
                      "certificate_id": "742015362664535982",
                      "code": ""
                    }
                  ]
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-refund-reject-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        assertEquals(2, data.get("result"));
        assertEquals("服务商侧已发码，暂不支持退款", data.get("reason"));
        assertEquals("服务商侧已发码，暂不支持退款", data.get("description"));

        List<?> certificates = (List<?>) data.get("certificate");
        assertEquals(1, certificates.size());
        Map<?, ?> certificate = (Map<?, ?>) certificates.get(0);
        assertEquals("742015362664535982", certificate.get("certificate_id"));
        assertTrue(String.valueOf(certificate.get("code")).matches("\\d{12}"));
        assertEquals(List.of(certificate.get("code")), data.get("codes"));
    }

    @Test
    void searchListShouldCreateLocalOrderAndReturnLocalOrderId() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029149",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "查询客户",
                            "mobile": "13800000000",
                            "pay_amount": "100"
                          }
                        ]
                      },
                      "extra": { "logid": "life-query-log-001" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setOrderId("1095291724056029149");

        List<YyChannelOrderVo> orders = adapter.searchList(query);

        assertEquals(1, orders.size());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        YyOrder localOrder = orderCaptor.getValue();
        assertEquals("DYL-1095291724056029149", localOrder.getOrderNo());
        assertEquals("查询客户", localOrder.getCustomerName());
        assertEquals("PENDING", localOrder.getStatus());
        assertEquals(localOrder.getId(), orders.get(0).getLocalOrderId());
        verify(customerService).upsertByMobile(eq("查询客户"), eq("13800000000"), eq("DOUYIN_LIFE"), any(), any(), eq("抖音来客查单同步"));
    }

    @Test
    void bindOfficialOrderShouldRejectWhenPhoneLast4Mismatch() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029149",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "查询客户",
                            "mobile": "13800000000",
                            "pay_amount": "100"
                          }
                        ]
                      },
                      "extra": { "logid": "life-query-log-001" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setOrderId("1095291724056029149");
        query.setPhoneLast4("9999");

        YyChannelOrderVo order = adapter.bindOrder(query);

        assertEquals("1095291724056029149", order.getExternalOrderId());
        assertEquals("FAILED", order.getSyncStatus());
        assertTrue(order.getRawPayload().contains("手机号后四位不匹配"));
        verify(orderMapper, never()).insert(any(YyOrder.class));
        verify(channelOrderMappingMapper, never()).insert(any(YyChannelOrderMapping.class));
    }

    @Test
    void bindOfficialOrderShouldCreateLocalOrderWhenPhoneLast4Matches() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029149",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "查询客户",
                            "mobile": "13800000000",
                            "pay_amount": "100"
                          }
                        ]
                      },
                      "extra": { "logid": "life-query-log-001" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setOrderId("1095291724056029149");
        query.setPhoneLast4("0000");

        YyChannelOrderVo order = adapter.bindOrder(query);

        assertEquals("1095291724056029149", order.getExternalOrderId());
        assertEquals("SYNCED", order.getSyncStatus());
        assertNotNull(order.getLocalOrderId());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        assertEquals("DYL-1095291724056029149", orderCaptor.getValue().getOrderNo());
        assertEquals("PENDING", orderCaptor.getValue().getStatus());
        verify(customerService).upsertByMobile(eq("查询客户"), eq("13800000000"), eq("DOUYIN_LIFE"), any(), any(), eq("抖音来客订单号绑定同步"));
    }

    @Test
    void bindOfficialOrderShouldRejectWhenPhoneLast4Missing() {
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setOrderId("1095291724056029149");

        YyChannelOrderVo order = adapter.bindOrder(query);

        assertEquals("FAILED", order.getSyncStatus());
        assertTrue(order.getRawPayload().contains("手机号后四位"));
        verify(channelSyncLogMapper, never()).insert(any(YyChannelSyncLog.class));
    }

    @Test
    void syncOrdersShouldQueryByTimeRangeWithoutOrderIdAndCreateLocalOrders() throws Exception {
        AtomicReference<String> queryString = new AtomicReference<>("");
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                queryString.set(exchange.getRequestURI().getQuery());
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029149",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "同步客户A",
                            "mobile": "13800000000",
                            "pay_amount": "100"
                          },
                          {
                            "order_id": "1095291724056029150",
                            "order_status": "COMPLETED",
                            "buyer_name": "同步客户B",
                            "mobile": "13900000000",
                            "pay_amount": "200"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-001" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setOrderStatus("PAY_SUCCESS");
        query.setStartTime("2026-06-17 12:20:00");
        query.setEndTime("2026-06-17 12:25:00");
        query.setPageSize(50);

        YyChannelSyncResultVo result = adapter.syncOrders(query);

        assertEquals("DOUYIN_LIFE", result.getChannelType());
        assertEquals("SYNCED", result.getSyncStatus());
        assertEquals(2, result.getTotal());
        assertEquals(2, result.getCreated());
        assertEquals(0, result.getUpdated());
        assertEquals(0, result.getFailed());
        assertEquals("life-sync-log-001", result.getLastLogId());
        assertFalse(queryString.get().contains("order_id="));
        assertTrue(queryString.get().contains("create_order_start_time="));
        assertTrue(queryString.get().contains("create_order_end_time="));
        assertFalse(queryString.get().contains("2026-06-17"));
        assertFalse(queryString.get().startsWith("start_time="));
        assertFalse(queryString.get().contains("&start_time="));
        assertFalse(queryString.get().startsWith("end_time="));
        assertFalse(queryString.get().contains("&end_time="));
        verify(orderMapper, org.mockito.Mockito.times(2)).insert(any(YyOrder.class));
        verify(channelOrderMappingMapper, org.mockito.Mockito.times(2)).insert(any(YyChannelOrderMapping.class));
    }

    @Test
    void syncOrdersShouldPersistNeedMappingBeforeInsertWhenResolverMisses() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029301",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "缺映射客户",
                            "mobile": "13800000000",
                            "pay_amount": "100",
                            "poi_id": "poi-missing",
                            "sku_id": "sku-missing"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-need-mapping" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        when(storeResolver.resolveStore(eq("poi-missing"), eq("sku-missing"), eq("DOUYIN_LIFE")))
            .thenReturn(new IDouyinLifeStoreResolver.StoreResolution(
                IDouyinLifeStoreResolver.ResolutionResult.NOT_FOUND,
                null,
                "POI 无活跃映射: poi-missing"
            ));
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "storeResolver", storeResolver);
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStartTime("2026-06-05 00:00:00");
        query.setEndTime("2026-06-07 23:59:59");

        YyChannelSyncResultVo result = adapter.syncOrders(query);

        assertEquals("SYNCED", result.getSyncStatus());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        assertEquals(903001L, orderCaptor.getValue().getStoreId());
        assertEquals("NEED_MAPPING", orderCaptor.getValue().getInventoryStatus());
        assertTrue(orderCaptor.getValue().getConflictReason().contains("POI 无活跃映射"));
    }

    @Test
    void syncOrdersShouldReassignExistingDefaultStoreWhenResolverHits() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029302",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "重归店客户",
                            "mobile": "13800000000",
                            "pay_amount": "100",
                            "poi_id": "poi-real",
                            "sku_id": "sku-real"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-reassign-store" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        YyOrder existingOrder = new YyOrder();
        existingOrder.setId(900001L);
        existingOrder.setStoreId(903001L);
        existingOrder.setSource("DOUYIN_LIFE");
        existingOrder.setChannelType("DOUYIN_LIFE");
        existingOrder.setExternalOrderId("1095291724056029302");
        existingOrder.setOrderNo("DYL-1095291724056029302");
        existingOrder.setStatus("PENDING");
        existingOrder.setPayStatus("PAID");
        existingOrder.setInventoryStatus("NEED_MAPPING");
        existingOrder.setConflictReason("DOUYIN_LIFE POI/SKU 映射缺失，已归入默认门店");
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(existingOrder);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        when(storeResolver.resolveStore(eq("poi-real"), eq("sku-real"), eq("DOUYIN_LIFE")))
            .thenReturn(new IDouyinLifeStoreResolver.StoreResolution(
                IDouyinLifeStoreResolver.ResolutionResult.HIT,
                900000000000000100L,
                null
            ));
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "storeResolver", storeResolver);
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStartTime("2026-06-05 00:00:00");
        query.setEndTime("2026-06-07 23:59:59");

        YyChannelSyncResultVo result = adapter.syncOrders(query);

        assertEquals("SYNCED", result.getSyncStatus());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        assertEquals(900000000000000100L, orderCaptor.getValue().getStoreId());
        assertEquals("", orderCaptor.getValue().getInventoryStatus());
        assertEquals("", orderCaptor.getValue().getConflictReason());
    }

    @Test
    void syncOrdersShouldPersistDouyinPoiSkuAndReservationSlotWhenResolverHits() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029401",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "带映射客户",
                            "mobile": "13800000000",
                            "pay_amount": "100",
                            "poi_id": "poi-real",
                            "sku_id": "sku-real",
                            "booking_date": "2026-06-20",
                            "booking_start_time": "10:00",
                            "booking_end_time": "10:30"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-slot-fields" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        when(storeResolver.resolveStore(eq("poi-real"), eq("sku-real"), eq("DOUYIN_LIFE")))
            .thenReturn(new IDouyinLifeStoreResolver.StoreResolution(
                IDouyinLifeStoreResolver.ResolutionResult.HIT,
                900000000000000100L,
                null
            ));
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "storeResolver", storeResolver);
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStartTime("2026-06-20 00:00:00");
        query.setEndTime("2026-06-20 23:59:59");

        YyChannelSyncResultVo result = adapter.syncOrders(query);

        assertEquals("SYNCED", result.getSyncStatus());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        YyOrder order = orderCaptor.getValue();
        assertEquals(900000000000000100L, order.getStoreId());
        assertEquals("poi-real", order.getExternalPoiId());
        assertEquals("sku-real", order.getExternalSkuId());
        assertEquals("2026-06-20", order.getSlotDate());
        assertEquals("10:00", order.getSlotStartTime());
        assertEquals("10:30", order.getSlotEndTime());
    }

    @Test
    void syncOrdersShouldUseIntentionPoiIdWhenResolvingStore() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029402",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "真实POI客户",
                            "mobile": "13800000000",
                            "pay_amount": "100",
                            "intention_poi_id": "poi-real",
                            "sku_id": "sku-real"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-intention-poi" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        when(storeResolver.resolveStore(eq("poi-real"), eq("sku-real"), eq("DOUYIN_LIFE")))
            .thenReturn(new IDouyinLifeStoreResolver.StoreResolution(
                IDouyinLifeStoreResolver.ResolutionResult.HIT,
                900000000000000100L,
                null
            ));
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "storeResolver", storeResolver);

        YyChannelSyncResultVo result = adapter.syncOrders(new YyChannelOrderQuery());

        assertEquals("SYNCED", result.getSyncStatus());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        assertEquals(900000000000000100L, orderCaptor.getValue().getStoreId());
        assertEquals("poi-real", orderCaptor.getValue().getExternalPoiId());
        assertEquals("sku-real", orderCaptor.getValue().getExternalSkuId());
    }

    @Test
    void backfillOrdersShouldUpdateMissingPoiSkuAndResolvedStoreFromMappingPayload() {
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setId(800001L);
        mapping.setOrderId(900001L);
        mapping.setChannelType("DOUYIN_LIFE");
        mapping.setExternalOrderId("1095291724056029501");
        mapping.setRawPayload("""
            {
              "order_id": "1095291724056029501",
              "intention_poi_id": "poi-real",
              "sku_id": "sku-real",
              "booking_date": "2026-06-21",
              "booking_start_time": "11:00",
              "booking_end_time": "11:30"
            }
            """);
        YyOrder order = new YyOrder();
        order.setId(900001L);
        order.setStoreId(903001L);
        order.setSource("DOUYIN_LIFE");
        order.setChannelType("DOUYIN_LIFE");
        order.setExternalOrderId("1095291724056029501");
        when(channelOrderMappingMapper.selectList(any(Wrapper.class))).thenReturn(List.of(mapping));
        when(orderMapper.selectById(900001L)).thenReturn(order);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(storeResolver.resolveStore(eq("poi-real"), eq("sku-real"), eq("DOUYIN_LIFE")))
            .thenReturn(new IDouyinLifeStoreResolver.StoreResolution(
                IDouyinLifeStoreResolver.ResolutionResult.HIT,
                900000000000000100L,
                null
            ));
        when(identifierGenerator.nextId((Serializable) null)).thenReturn(900000000000000200L);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "storeResolver", storeResolver);
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setMaxTotal(50);

        YyChannelSyncResultVo result = adapter.backfillLocalOrders(query);

        assertEquals("DOUYIN_LIFE", result.getChannelType());
        assertEquals("SYNCED", result.getSyncStatus());
        assertEquals(1, result.getTotal());
        assertEquals(1, result.getUpdated());
        assertEquals(0, result.getFailed());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        YyOrder updated = orderCaptor.getValue();
        assertEquals(900000000000000100L, updated.getStoreId());
        assertEquals("poi-real", updated.getExternalPoiId());
        assertEquals("sku-real", updated.getExternalSkuId());
        assertEquals("2026-06-21", updated.getSlotDate());
        assertEquals("11:00", updated.getSlotStartTime());
        assertEquals("11:30", updated.getSlotEndTime());
        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertEquals("life_order_field_backfill", logCaptor.getValue().getApiName());
    }

    @Test
    void backfillOrdersShouldConfirmPaidInventoryWhenPayloadHasCompleteSlot() {
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setId(800011L);
        mapping.setOrderId(900011L);
        mapping.setChannelType("DOUYIN_LIFE");
        mapping.setExternalOrderId("1095291724056029511");
        mapping.setRawPayload("""
            {
              "order_id": "1095291724056029511",
              "intention_poi_id": "poi-real",
              "sku_id": "sku-real",
              "booking_date": "2026-06-21",
              "booking_start_time": "11:00",
              "booking_end_time": "11:30"
            }
            """);
        YyOrder order = new YyOrder();
        order.setId(900011L);
        order.setStoreId(903001L);
        order.setSource("DOUYIN_LIFE");
        order.setChannelType("DOUYIN_LIFE");
        order.setExternalOrderId("1095291724056029511");
        order.setStatus("PENDING");
        order.setPayStatus("PAID");
        when(channelOrderMappingMapper.selectList(any(Wrapper.class))).thenReturn(List.of(mapping));
        when(orderMapper.selectById(900011L)).thenReturn(order);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(storeResolver.resolveStore(eq("poi-real"), eq("sku-real"), eq("DOUYIN_LIFE")))
            .thenReturn(new IDouyinLifeStoreResolver.StoreResolution(
                IDouyinLifeStoreResolver.ResolutionResult.HIT,
                900000000000000100L,
                null
            ));
        when(identifierGenerator.nextId((Serializable) null)).thenReturn(900000000000000211L);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "storeResolver", storeResolver);
        ReflectionTestUtils.setField(adapter, "bookingSlotInventoryService", bookingSlotInventoryService);

        YyChannelSyncResultVo result = adapter.backfillLocalOrders(new YyChannelOrderQuery());

        assertEquals("SYNCED", result.getSyncStatus());
        assertEquals(1, result.getUpdated());
        ArgumentCaptor<YyOrder> inventoryOrderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(inventoryOrderCaptor.capture());
        YyOrder inventoryOrder = inventoryOrderCaptor.getValue();
        assertEquals(900000000000000100L, inventoryOrder.getStoreId());
        assertEquals("sku-real", inventoryOrder.getExternalSkuId());
        assertEquals("2026-06-21", inventoryOrder.getSlotDate());
        assertEquals("11:00", inventoryOrder.getSlotStartTime());
        assertEquals("11:30", inventoryOrder.getSlotEndTime());
    }

    @Test
    void backfillOrdersShouldKeepStoreWhenResolverMisses() {
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setId(800002L);
        mapping.setOrderId(900002L);
        mapping.setChannelType("DOUYIN_LIFE");
        mapping.setExternalOrderId("1095291724056029502");
        mapping.setRawPayload("""
            {
              "order_id": "1095291724056029502",
              "intention_poi_id": "poi-missing",
              "sku_id": "sku-missing"
            }
            """);
        YyOrder order = new YyOrder();
        order.setId(900002L);
        order.setStoreId(903001L);
        order.setSource("DOUYIN_LIFE");
        order.setChannelType("DOUYIN_LIFE");
        order.setExternalOrderId("1095291724056029502");
        when(channelOrderMappingMapper.selectList(any(Wrapper.class))).thenReturn(List.of(mapping));
        when(orderMapper.selectById(900002L)).thenReturn(order);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(storeResolver.resolveStore(eq("poi-missing"), eq("sku-missing"), eq("DOUYIN_LIFE")))
            .thenReturn(new IDouyinLifeStoreResolver.StoreResolution(
                IDouyinLifeStoreResolver.ResolutionResult.NOT_FOUND,
                null,
                "POI 无活跃映射: poi-missing"
            ));
        when(identifierGenerator.nextId((Serializable) null)).thenReturn(900000000000000201L);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "storeResolver", storeResolver);

        YyChannelSyncResultVo result = adapter.backfillLocalOrders(new YyChannelOrderQuery());

        assertEquals("SYNCED", result.getSyncStatus());
        assertEquals(1, result.getUpdated());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        YyOrder updated = orderCaptor.getValue();
        assertEquals(903001L, updated.getStoreId());
        assertEquals("poi-missing", updated.getExternalPoiId());
        assertEquals("sku-missing", updated.getExternalSkuId());
        assertEquals("NEED_MAPPING", updated.getInventoryStatus());
        assertTrue(updated.getConflictReason().contains("POI 无活跃映射"));
    }

    @Test
    void syncOrdersShouldTreatExternalStatus201AsPaidPendingOrder() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029201",
                            "order_status": 201,
                            "buyer_name": "201状态客户",
                            "mobile": "13800000000",
                            "pay_amount": "100"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-201" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        YyChannelSyncResultVo result = adapter.syncOrders(new YyChannelOrderQuery());

        assertEquals("SYNCED", result.getSyncStatus());
        assertEquals(1, result.getCreated());
        assertEquals(0, result.getFailed());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        assertEquals("PENDING", orderCaptor.getValue().getStatus());
        assertEquals("PAID", orderCaptor.getValue().getPayStatus());
    }

    @Test
    void syncOrdersShouldStopAtSafetyLimitsWhenRemoteKeepsReturningFullPages() throws Exception {
        AtomicInteger orderQueryCalls = new AtomicInteger();
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                int call = orderQueryCalls.incrementAndGet();
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "1095291724056029%s01",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "安全上限客户A",
                            "mobile": "13800000000",
                            "pay_amount": "100"
                          },
                          {
                            "order_id": "1095291724056029%s02",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "安全上限客户B",
                            "mobile": "13900000000",
                            "pay_amount": "200"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-limit" }
                    }
                    """.formatted(call, call));
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        mockFirstStore(903001L);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStartTime("2026-06-12 15:50:00");
        query.setEndTime("2026-06-12 16:00:00");
        query.setPageSize(2);
        query.setMaxPages(2);
        query.setMaxTotal(3);

        YyChannelSyncResultVo result = adapter.syncOrders(query);

        assertEquals("SUSPICIOUS", result.getSyncStatus());
        assertEquals(3, result.getTotal());
        assertEquals(3, result.getCreated());
        assertEquals(0, result.getFailed());
        assertTrue(result.getMessage().contains("安全上限"));
        assertEquals(2, orderQueryCalls.get());
        verify(orderMapper, times(3)).insert(any(YyOrder.class));
    }

    @Test
    void syncOrdersShouldFallbackToFirstStoreWhenOrderHasNoStoreId() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "8000010230007933698",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "默认门店客户",
                            "mobile": "13800000000",
                            "pay_amount": "100"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-store-fallback" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        YyStore store = new YyStore();
        store.setId(903001L);
        org.mockito.Mockito.lenient().when(storeMapper.selectOne(any(Wrapper.class))).thenReturn(store);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStartTime("2026-06-05 00:00:00");
        query.setEndTime("2026-06-07 23:59:59");
        query.setPageSize(10);

        YyChannelSyncResultVo result = adapter.syncOrders(query);

        assertEquals("SYNCED", result.getSyncStatus());
        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(orderCaptor.capture());
        assertEquals(903001L, orderCaptor.getValue().getStoreId());
    }

    @Test
    void syncOrdersShouldMarkMappingFailedLocalWhenNoStoreExists() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/trade/order/query/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "orders": [
                          {
                            "order_id": "8000010230007933698",
                            "order_status": "PAY_SUCCESS",
                            "buyer_name": "无门店客户",
                            "mobile": "13800000000",
                            "pay_amount": "100"
                          }
                        ]
                      },
                      "extra": { "logid": "life-sync-log-no-store" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(orderMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setStartTime("2026-06-05 00:00:00");
        query.setEndTime("2026-06-07 23:59:59");
        query.setPageSize(10);

        YyChannelSyncResultVo result = adapter.syncOrders(query);

        assertEquals("PARTIAL", result.getSyncStatus());
        assertEquals(1, result.getTotal());
        assertEquals(0, result.getCreated());
        assertEquals(0, result.getUpdated());
        assertEquals(1, result.getFailed());
        verify(orderMapper, never()).insert(any(YyOrder.class));
        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).insert(mappingCaptor.capture());
        assertEquals("FAILED_LOCAL", mappingCaptor.getValue().getSyncStatus());
        assertEquals(null, mappingCaptor.getValue().getOrderId());
    }

    @Test
    void upsertReservationInventorySkuShouldUseOfficialTimeSlotAndSkuFields() throws Exception {
        AtomicReference<String> requestBody = new AtomicReference<>();
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/goods/comprehensive/reception/stock/sku/upsert/".equals(path)) {
                requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "description": "success"
                      },
                      "extra": { "logid": "dy-inventory-sku-log-001" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
    when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
    when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
    when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
    AtomicLong idSequence = new AtomicLong(900000000000000000L);
    when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
    DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
        channelAccountMapper,
        channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelInventoryBo bo = new YyChannelInventoryBo();
        bo.setPoiId("7571364336015247401");
        bo.setSkuOutId("YY-SKU-001");
        bo.setSkuName("证件照预约");
        bo.setSkuOperateType(1);
        bo.setTimeSlot(30);
        bo.setUseTestDataHeader(true);

        YyChannelApiResultVo result = adapter.upsertReservationInventorySku(bo);

        assertTrue(result.getSuccess());
        assertTrue(requestBody.get().contains("\"time_slot\":30"));
        assertTrue(requestBody.get().contains("\"sku_out_id\":\"YY-SKU-001\""));
        assertTrue(requestBody.get().contains("\"sku_name\":\"证件照预约\""));
        assertTrue(requestBody.get().contains("\"sku_operate_type\":1"));
        assertFalse(requestBody.get().contains("\"sku_info_list\":[{\"sku_out_id\":\"YY-SKU-001\",\"time_slot\":30"));
    }

    @Test
    void saveReservationStockShouldPersistLocalSlotAndRecordLogId() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/goods/comprehensive/reception/save/stock/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "description": "success"
                      },
                      "extra": { "logid": "dy-stock-save-log-001" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelInventorySlotMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelInventorySlotMapper.insert(any(YyChannelInventorySlot.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelInventoryBo bo = new YyChannelInventoryBo();
        bo.setPoiId("7571364336015247401");
        bo.setSkuId("1866940964963331");
        bo.setSkuOutId("YY-SKU-001");
        bo.setDate("2026-06-04");
        bo.setStartTime("10:00");
        bo.setEndTime("10:30");
        bo.setAvailableStock(6);

        YyChannelApiResultVo result = adapter.saveReservationRealtimeStock(bo);

        assertTrue(result.getSuccess());
        ArgumentCaptor<YyChannelInventorySlot> slotCaptor = ArgumentCaptor.forClass(YyChannelInventorySlot.class);
        verify(channelInventorySlotMapper).insert(slotCaptor.capture());
        assertEquals("DOUYIN_LIFE", slotCaptor.getValue().getChannelType());
        assertEquals("7571364336015247401", slotCaptor.getValue().getPoiId());
        assertEquals("1866940964963331", slotCaptor.getValue().getSkuId());
        assertEquals("YY-SKU-001", slotCaptor.getValue().getSkuOutId());
        assertEquals("2026-06-04", slotCaptor.getValue().getBizDate());
        assertEquals(6, slotCaptor.getValue().getAvailableStock());
        assertEquals("dy-stock-save-log-001", slotCaptor.getValue().getLastLogId());

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertEquals("life_reception_stock_save", logCaptor.getValue().getApiName());
        assertEquals("dy-stock-save-log-001", logCaptor.getValue().getRequestId());
    }

    @Test
    void saveReservationStockShouldMirrorUnifiedBookingInventory() throws Exception {
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/goods/comprehensive/reception/save/stock/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "err_no": 0,
                      "data": {
                        "description": "success"
                      },
                      "extra": { "logid": "dy-stock-save-log-002" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelInventorySlotMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelInventorySlotMapper.insert(any(YyChannelInventorySlot.class))).thenReturn(1);
        when(bookingSlotInventoryMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(bookingSlotInventoryMapper.insert(any(YyBookingSlotInventory.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000100L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "bookingSlotInventoryMapper", bookingSlotInventoryMapper);
        YyChannelInventoryBo bo = new YyChannelInventoryBo();
        bo.setStoreId(900000000000000200L);
        bo.setPoiId("7228779175929186363");
        bo.setSkuId("1866940964963331");
        bo.setSkuOutId("YY-SKU-001");
        bo.setDate("2026-06-16");
        bo.setStartTime("10:00");
        bo.setEndTime("10:30");
        bo.setAvailableStock(6);

        YyChannelApiResultVo result = adapter.saveReservationRealtimeStock(bo);

        assertTrue(result.getSuccess());
        ArgumentCaptor<YyBookingSlotInventory> bookingSlotCaptor = ArgumentCaptor.forClass(YyBookingSlotInventory.class);
        verify(bookingSlotInventoryMapper).insert(bookingSlotCaptor.capture());
        YyBookingSlotInventory bookingSlot = bookingSlotCaptor.getValue();
        assertEquals(900000000000000200L, bookingSlot.getStoreId());
        assertEquals("1866940964963331", bookingSlot.getExternalSkuId());
        assertEquals("2026-06-16", bookingSlot.getBizDate());
        assertEquals("10:00", bookingSlot.getStartTime());
        assertEquals("10:30", bookingSlot.getEndTime());
        assertEquals(6, bookingSlot.getCapacity());
        assertEquals(0, bookingSlot.getPaidCount());
        assertEquals("ACTIVE", bookingSlot.getStatus());
        assertTrue(String.valueOf(bookingSlot.getRemark()).contains("dy-stock-save-log-002"));
    }

    @Test
    void saveReservationTimeStockShouldBuildDouyinRuleBody() throws Exception {
        AtomicReference<String> requestBody = new AtomicReference<>();
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/goods/open/comprehensive/booking/room/time_stock/save/".equals(path)) {
                requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                respond(exchange, 200, """
                    {
                      "data": {
                        "description": "",
                        "error_code": 0
                      },
                      "extra": { "logid": "dy-time-stock-save-log-001" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelInventorySlotMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelInventorySlotMapper.insert(any(YyChannelInventorySlot.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelInventoryBo bo = new YyChannelInventoryBo();
        bo.setPoiId("7571364336015247401");
        bo.setReceptionUnitId("1867049646914595");
        bo.setSkuId("1867049646914595");
        bo.setSkuOutId("YY-SKU-001");
        bo.setDate("2026-06-05");
        bo.setStartTime("10:00");
        bo.setEndTime("10:30");
        bo.setAvailableStock(6);

        YyChannelApiResultVo result = adapter.saveReservationTimeStock(bo);

        assertTrue(result.getSuccess());
        assertTrue(requestBody.get().contains("\"date_range\":[\"2026-06-05\",\"2026-06-05\"]"));
        assertTrue(requestBody.get().contains("\"week_range\":5"));
        assertTrue(requestBody.get().contains("\"time_range\":[\"10:00\",\"10:30\"]"));
        assertTrue(requestBody.get().contains("\"stock\":6"));
        assertFalse(requestBody.get().contains("\"date\":\"2026-06-05\""));
    }

    @Test
    void stockQuerySpiShouldPreferUnifiedBookingInventoryBeforeChannelMirror() {
        YyBookingSlotInventory bookingSlot = new YyBookingSlotInventory();
        bookingSlot.setStoreId(900001L);
        bookingSlot.setExternalSkuId("YY-SKU-001");
        bookingSlot.setBizDate("2026-06-04");
        bookingSlot.setStartTime("10:00");
        bookingSlot.setEndTime("10:30");
        bookingSlot.setCapacity(6);
        bookingSlot.setPaidCount(2);
        bookingSlot.setStatus("ACTIVE");
        when(bookingSlotInventoryMapper.selectOne(any(Wrapper.class))).thenReturn(bookingSlot);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        ReflectionTestUtils.setField(adapter, "bookingSlotInventoryMapper", bookingSlotInventoryMapper);

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_stock_query",
            """
                {
                  "store_id": 900001,
                  "poi_id": "7571364336015247401",
                  "sku_id": "1866940964963331",
                  "sku_out_id": "YY-SKU-001",
                  "date": "2026-06-04",
                  "start_time": "10:00",
                  "end_time": "10:30"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-stock-query-booking-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(4, data.get("stock"));
        assertEquals(4, data.get("available_stock"));
        assertEquals(true, data.get("available"));
        verify(channelInventorySlotMapper, never()).selectOne(any(Wrapper.class));
    }

    @Test
    void stockQuerySpiShouldReturnLocalInventorySlotAndRecordLogId() {
        YyChannelInventorySlot slot = new YyChannelInventorySlot();
        slot.setPoiId("7571364336015247401");
        slot.setSkuId("1866940964963331");
        slot.setSkuOutId("YY-SKU-001");
        slot.setBizDate("2026-06-04");
        slot.setStartTime("10:00");
        slot.setEndTime("10:30");
        slot.setAvailableStock(6);
        when(channelInventorySlotMapper.selectOne(any(Wrapper.class))).thenReturn(slot);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );

        Map<String, Object> response = adapter.handleLifeSpi(
            "reservation_stock_query",
            """
                {
                  "poi_id": "7571364336015247401",
                  "sku_id": "1866940964963331",
                  "sku_out_id": "YY-SKU-001",
                  "date": "2026-06-04",
                  "start_time": "10:00",
                  "end_time": "10:30"
                }
                """,
            Map.of("X-Bytedance-Logid", "dy-stock-query-spi-log-001")
        );

        Map<?, ?> data = (Map<?, ?>) response.get("data");
        assertEquals(0, data.get("error_code"));
        assertEquals(6, data.get("stock"));
        assertEquals(6, data.get("available_stock"));
        assertEquals(true, data.get("available"));
        List<?> skuInfoList = (List<?>) data.get("sku_info_list");
        assertEquals(1, skuInfoList.size());
        Map<?, ?> skuInfo = (Map<?, ?>) skuInfoList.get(0);
        assertEquals("1866940964963331", skuInfo.get("sku_id"));
        List<?> stockInfoList = (List<?>) skuInfo.get("stock_info_list");
        assertEquals(1, stockInfoList.size());
        Map<?, ?> stockInfo = (Map<?, ?>) stockInfoList.get(0);
        assertEquals("2026-06-04", stockInfo.get("date"));
        assertEquals("10:00", stockInfo.get("start_time"));
        assertEquals("10:30", stockInfo.get("end_time"));
        assertEquals(List.of("10:00", "10:30"), stockInfo.get("time_range"));
        assertEquals(6, stockInfo.get("available_stock"));
        assertNotNull(data.get("reception_stock_list"));

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertEquals("reservation_stock_query", logCaptor.getValue().getApiName());
        assertEquals("dy-stock-query-spi-log-001", logCaptor.getValue().getRequestId());
    }

    @Test
    void verifyWholeOrderShouldRecordOpenApiLogId() throws Exception {
        AtomicReference<String> verifyRequestBody = new AtomicReference<>();
        String baseUrl = startServer(exchange -> {
            String path = exchange.getRequestURI().getPath();
            if ("/oauth/client_token/".equals(path)) {
                respond(exchange, 200, """
                    {
                      "data": {
                        "client_access_token": "token-001"
                      }
                    }
                    """);
                return;
            }
            if ("/goodlife/v1/fulfilment/certificate/verify/".equals(path)) {
                verifyRequestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                respond(exchange, 200, """
                    {
                      "data": {
                        "error_code": 0,
                        "description": "success"
                      },
                      "extra": { "logid": "dy-verify-log-001" }
                    }
                    """);
                return;
            }
            respond(exchange, 404, "{}");
        });
        when(environment.getProperty("yy.douyin.life.base-url")).thenReturn(baseUrl);
        when(environment.getProperty("yy.douyin.life.client-key")).thenReturn("client-key-001");
        when(environment.getProperty("yy.douyin.life.client-secret")).thenReturn("client-secret-001");
        when(environment.getProperty("yy.douyin.life.account-id")).thenReturn("account-001");
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        DouyinLifeChannelAdapter adapter = new DouyinLifeChannelAdapter(
            channelAccountMapper,
            channelInventorySlotMapper,
            channelOrderMappingMapper,
            channelSyncLogMapper,
            orderMapper,
            photoAlbumMapper,
            storeMapper,
            customerService,
            identifierGenerator,
            environment
        );
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setPoiId("7571364336015247401");
        query.setCodes("YYCODE001");
        query.setOrderId("1095657667861145988");

        YyChannelApiResultVo result = adapter.verifyOrder(query);

        assertTrue(result.getSuccess());
        assertTrue(verifyRequestBody.get().contains("\"verify_token\":"));
        assertTrue(verifyRequestBody.get().contains("\"order_id\":\"1095657667861145988\""));
        assertTrue(verifyRequestBody.get().contains("\"account_id\":\"account-001\""));
        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertEquals("life_order_verify", logCaptor.getValue().getApiName());
        assertEquals("dy-verify-log-001", logCaptor.getValue().getRequestId());
    }

    private static void assertRedacted(String payload) {
        assertFalse(payload.contains("open-sensitive-001"));
        assertFalse(payload.contains("13800000000"));
        assertFalse(payload.contains("13900000000"));
        assertFalse(payload.contains("token-sensitive-001"));
        assertTrue(payload.contains("\"open_id\":\"***\""));
        assertTrue(payload.contains("\"mobile\":\"***\""));
        assertTrue(payload.contains("\"access_token\":\"***\""));
        assertTrue(payload.contains("\"receiver_phone\":\"***\""));
    }

    private static String lifeSign(String clientSecret, String rawQuery, String payload) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String source = clientSecret + "&client_key=client-key-001&timestamp=1780411200000&http_body=" + payload;
            return HexFormat.of().formatHex(digest.digest(source.getBytes(StandardCharsets.UTF_8))).toLowerCase(Locale.ROOT);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private String startServer(ExchangeHandler handler) throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/", handler::handle);
        server.start();
        return "http://localhost:" + server.getAddress().getPort();
    }

    private void mockFirstStore(long storeId) {
        YyStore store = new YyStore();
        store.setId(storeId);
        when(storeMapper.selectOne(any(Wrapper.class))).thenReturn(store);
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
