package org.dromara.yy.controller;

import org.dromara.yy.channel.douyin.DouyinLifeChannelAdapter;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyDouyinLifeSpiControllerTest {

    @Mock
    private DouyinLifeChannelAdapter douyinLifeChannelAdapter;

    @Test
    void lifeOrderQueryShouldUseDedicatedApiName() {
        YyDouyinLifeSpiController controller = new YyDouyinLifeSpiController(douyinLifeChannelAdapter);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setQueryString("action=life.order.query");
        Map<String, String> headers = Map.of("X-Bytedance-Logid", "dy-life-order-query-log-001");
        Map<String, Object> expected = success();
        when(douyinLifeChannelAdapter.handleLifeSpi(
            eq("life_order_query"),
            eq("{\"order_id\":\"1095598420357785988\"}"),
            eq(headers),
            eq("action=life.order.query")
        )).thenReturn(expected);

        Map<String, Object> actual = controller.lifeOrderQuery(
            "{\"order_id\":\"1095598420357785988\"}",
            headers,
            request
        );

        assertSame(expected, actual);
        verify(douyinLifeChannelAdapter).handleLifeSpi(
            eq("life_order_query"),
            eq("{\"order_id\":\"1095598420357785988\"}"),
            eq(headers),
            eq("action=life.order.query")
        );
    }

    @Test
    void fulfilCheckInfoSyncShouldUseDedicatedApiName() {
        YyDouyinLifeSpiController controller = new YyDouyinLifeSpiController(douyinLifeChannelAdapter);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setQueryString("action=life.fulfil.fulfil_check_info_sync");
        Map<String, String> headers = Map.of("X-Bytedance-Logid", "dy-check-sync-log-001");
        Map<String, Object> expected = success();
        when(douyinLifeChannelAdapter.handleLifeSpi(
            eq("fulfil_check_info_sync"),
            eq("{\"order_id\":\"1095598420357785988\"}"),
            eq(headers),
            eq("action=life.fulfil.fulfil_check_info_sync")
        )).thenReturn(expected);

        Map<String, Object> actual = controller.fulfilCheckInfoSync(
            "{\"order_id\":\"1095598420357785988\"}",
            headers,
            request
        );

        assertSame(expected, actual);
        verify(douyinLifeChannelAdapter).handleLifeSpi(
            eq("fulfil_check_info_sync"),
            eq("{\"order_id\":\"1095598420357785988\"}"),
            eq(headers),
            eq("action=life.fulfil.fulfil_check_info_sync")
        );
    }

    @Test
    void webhookChallengeShouldReturnJsonBody() {
        YyDouyinLifeSpiController controller = new YyDouyinLifeSpiController(douyinLifeChannelAdapter);
        MockHttpServletRequest request = new MockHttpServletRequest();
        Map<String, String> headers = Map.of("X-Bytedance-Logid", "dy-webhook-challenge-001");
        when(douyinLifeChannelAdapter.handleOpenPlatformWebhook(
            eq("""
                {
                  "CHALLENGE": "yy_ping"
                }
                """),
            eq(headers),
            eq(null)
        )).thenReturn("yy_ping");

        Object actual = controller.webhook(
            """
                {
                  "CHALLENGE": "yy_ping"
                }
                """,
            headers,
            request
        );

        Map<String, String> expected = Map.of("challenge", "yy_ping");
        assertEquals(expected, actual);
        verify(douyinLifeChannelAdapter).handleOpenPlatformWebhook(
            eq("""
                {
                  "CHALLENGE": "yy_ping"
                }
                """),
            eq(headers),
            eq(null)
        );
    }

    private static Map<String, Object> success() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", 0);
        data.put("description", "success");
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", data);
        return response;
    }
}
