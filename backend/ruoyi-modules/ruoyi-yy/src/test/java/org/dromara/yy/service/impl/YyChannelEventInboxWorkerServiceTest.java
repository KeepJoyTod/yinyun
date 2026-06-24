package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyChannelEventInboxVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.dromara.yy.service.IYyChannelEventInboxService;
import org.dromara.yy.service.YyChannelAdapterService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyChannelEventInboxWorkerServiceTest {

    @Mock
    private IYyChannelEventInboxService eventInboxService;

    @Mock
    private YyChannelAdapterService channelAdapterService;

    @Mock
    private Environment environment;

    @Test
    void runOnceShouldMarkDoneWhenClaimedEventProcessesSuccessfully() {
        YyChannelEventInboxVo event = event(880101L, 0, "{\"order_id\":\"dy-001\"}");
        when(eventInboxService.claimPendingEvents("DOUYIN_LIFE", 10)).thenReturn(List.of(event));
        when(channelAdapterService.handleWebhook("DOUYIN_LIFE", event.getRawPayload())).thenReturn(webhookResult(true, "ok"));
        YyChannelEventInboxWorkerService worker = new YyChannelEventInboxWorkerService(eventInboxService, channelAdapterService, environment);

        int processed = worker.runOnce();

        assertEquals(1, processed);
        verify(eventInboxService).markDone(eq(880101L), eq("processed by inbox worker"));
        verify(eventInboxService, never()).markRetry(any(), any(), any());
        verify(eventInboxService, never()).markDead(any(), any());
    }

    @Test
    void runOnceShouldMarkRetryWhenWebhookReturnsUnprocessedBelowMaxRetries() {
        YyChannelEventInboxVo event = event(880102L, 1, "{\"order_id\":\"dy-002\"}");
        when(eventInboxService.claimPendingEvents("DOUYIN_LIFE", 10)).thenReturn(List.of(event));
        when(channelAdapterService.handleWebhook("DOUYIN_LIFE", event.getRawPayload())).thenReturn(webhookResult(false, "local write failed"));
        YyChannelEventInboxWorkerService worker = new YyChannelEventInboxWorkerService(eventInboxService, channelAdapterService, environment);

        int processed = worker.runOnce();

        assertEquals(1, processed);
        ArgumentCaptor<Date> nextRetry = ArgumentCaptor.forClass(Date.class);
        verify(eventInboxService).markRetry(eq(880102L), eq("local write failed"), nextRetry.capture());
        verify(eventInboxService, never()).markDone(any(), any());
        verify(eventInboxService, never()).markDead(any(), any());
    }

    @Test
    void runOnceShouldMarkDeadWhenRetryCountReachedMaxRetries() {
        YyChannelEventInboxVo event = event(880103L, 5, "{\"order_id\":\"dy-003\"}");
        when(eventInboxService.claimPendingEvents("DOUYIN_LIFE", 10)).thenReturn(List.of(event));
        when(channelAdapterService.handleWebhook("DOUYIN_LIFE", event.getRawPayload())).thenThrow(new IllegalStateException("payload invalid"));
        YyChannelEventInboxWorkerService worker = new YyChannelEventInboxWorkerService(eventInboxService, channelAdapterService, environment);

        int processed = worker.runOnce();

        assertEquals(1, processed);
        verify(eventInboxService).markDead(eq(880103L), eq("payload invalid"));
        verify(eventInboxService, never()).markDone(any(), any());
        verify(eventInboxService, never()).markRetry(any(), any(), any());
    }

    private static YyChannelEventInboxVo event(Long id, int retryCount, String rawPayload) {
        YyChannelEventInboxVo event = new YyChannelEventInboxVo();
        event.setId(id);
        event.setChannelType("DOUYIN_LIFE");
        event.setEventType("RESERVATION_PAY_NOTIFY");
        event.setRetryCount(retryCount);
        event.setRawPayload(rawPayload);
        return event;
    }

    private static YyChannelWebhookResultVo webhookResult(boolean processed, String message) {
        YyChannelWebhookResultVo result = new YyChannelWebhookResultVo();
        result.setChannelType("DOUYIN_LIFE");
        result.setProcessed(processed);
        result.setMessage(message);
        return result;
    }
}
