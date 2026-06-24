package org.dromara.yy.channel.wechat;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelOrderVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.Serializable;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class WechatChannelAdapterTest {

    @Mock
    private YyChannelOrderMappingMapper channelOrderMappingMapper;

    @Mock
    private YyChannelSyncLogMapper channelSyncLogMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private IdentifierGenerator identifierGenerator;

    @Test
    void handleWebhookShouldRedactSensitivePayloadAndPersistMapping() {
        when(channelOrderMappingMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(channelOrderMappingMapper.insert(any(YyChannelOrderMapping.class))).thenReturn(1);
        when(channelSyncLogMapper.insert(any(YyChannelSyncLog.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(910000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        WechatChannelAdapter adapter = new WechatChannelAdapter(channelOrderMappingMapper, channelSyncLogMapper, orderMapper, identifierGenerator);
        String payload = """
            {
              "event_type": "TRANSACTION.SUCCESS",
              "out_trade_no": "WX-20260602-0001",
              "trade_state": "SUCCESS",
              "payer": {
                "openid": "wx-openid-sensitive"
              },
              "phone": "13800000000",
              "app_secret": "wx-secret-sensitive"
            }
            """;

        YyChannelWebhookResultVo result = adapter.handleWebhook(payload);

        assertTrue(result.getProcessed());
        assertEquals("WX-20260602-0001", result.getExternalOrderId());
        assertEquals("CONFIRMED", result.getLocalStatus());
        assertRedacted(result.getRawPayload());

        ArgumentCaptor<YyChannelOrderMapping> mappingCaptor = ArgumentCaptor.forClass(YyChannelOrderMapping.class);
        verify(channelOrderMappingMapper).insert(mappingCaptor.capture());
        YyChannelOrderMapping mapping = mappingCaptor.getValue();
        assertEquals("WECHAT", mapping.getChannelType());
        assertEquals("WX-20260602-0001", mapping.getExternalOrderId());
        assertEquals("SUCCESS", mapping.getExternalStatus());
        assertEquals("SYNCED", mapping.getSyncStatus());
        assertRedacted(mapping.getRawPayload());

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        assertEquals("1", logCaptor.getValue().getSuccess());
        assertRedacted(logCaptor.getValue().getRemark());
    }

    @Test
    void searchListShouldReturnLocalOrderFromMapping() {
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setId(908003L);
        mapping.setChannelType("WECHAT");
        mapping.setOrderId(902005L);
        mapping.setExternalOrderId("WX-20260601-0005");
        mapping.setExternalStatus("PENDING");
        mapping.setSyncStatus("PENDING");
        mapping.setRawPayload("{\"source\":\"demo\",\"openid\":\"sensitive-openid\"}");
        YyOrder order = new YyOrder();
        order.setId(902005L);
        order.setCustomerName("周女士");
        order.setCustomerPhone("13800005555");
        when(channelOrderMappingMapper.selectList(any(Wrapper.class))).thenReturn(List.of(mapping));
        when(orderMapper.selectById(902005L)).thenReturn(order);
        WechatChannelAdapter adapter = new WechatChannelAdapter(channelOrderMappingMapper, channelSyncLogMapper, orderMapper, identifierGenerator);
        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setKeyword("周女士");

        List<YyChannelOrderVo> orders = adapter.searchList(query);

        assertEquals(1, orders.size());
        YyChannelOrderVo result = orders.get(0);
        assertEquals("WECHAT", result.getChannelType());
        assertEquals("WX-20260601-0005", result.getExternalOrderId());
        assertEquals("周女士", result.getCustomerName());
        assertEquals("13800005555", result.getCustomerPhone());
        assertEquals(902005L, result.getLocalOrderId());
        assertFalse(result.getRawPayload().contains("sensitive-openid"));
    }

    private static void assertRedacted(String payload) {
        assertFalse(payload.contains("wx-openid-sensitive"));
        assertFalse(payload.contains("13800000000"));
        assertFalse(payload.contains("wx-secret-sensitive"));
        assertTrue(payload.contains("\"openid\":\"***\"") || payload.contains("\"open_id\":\"***\""));
        assertTrue(payload.contains("\"phone\":\"***\""));
        assertTrue(payload.contains("\"app_secret\":\"***\""));
    }
}
