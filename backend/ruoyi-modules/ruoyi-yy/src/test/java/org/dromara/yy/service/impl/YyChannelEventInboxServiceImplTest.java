package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyChannelEventInbox;
import org.dromara.yy.domain.vo.YyChannelEventInboxVo;
import org.dromara.yy.domain.vo.YyChannelEventInboxStatusVo;
import org.dromara.yy.mapper.YyChannelEventInboxMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyChannelEventInboxServiceImplTest {

    @Mock
    private YyChannelEventInboxMapper mapper;

    @Test
    void receiveEventShouldAllowRetryWhenExistingEventIsStillReceived() {
        YyChannelEventInbox existing = new YyChannelEventInbox();
        existing.setId(880001L);
        existing.setChannelType("DOUYIN_LIFE");
        existing.setEventType("RESERVATION_PAY_NOTIFY");
        existing.setEventId("event-001");
        existing.setProcessStatus("RECEIVED");
        when(mapper.selectOne(any())).thenReturn(existing);
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        YyChannelEventInboxVo result = service.receiveEvent(
            "DOUYIN_LIFE",
            "reservation_pay_notify",
            "1095657667861145988",
            "dy-log-retry-001",
            "{\"order_id\":\"1095657667861145988\"}",
            true,
            ""
        );

        assertEquals("RECEIVED", result.getProcessStatus());
    }

    @Test
    void receiveEventShouldTreatOnlyProcessedExistingEventAsDuplicate() {
        YyChannelEventInbox existing = new YyChannelEventInbox();
        existing.setId(880002L);
        existing.setChannelType("DOUYIN_LIFE");
        existing.setEventType("RESERVATION_PAY_NOTIFY");
        existing.setEventId("event-002");
        existing.setProcessStatus("PROCESSED");
        when(mapper.selectOne(any())).thenReturn(existing);
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        YyChannelEventInboxVo result = service.receiveEvent(
            "DOUYIN_LIFE",
            "reservation_pay_notify",
            "1095657667861145988",
            "dy-log-processed-001",
            "{\"order_id\":\"1095657667861145988\"}",
            true,
            ""
        );

        assertEquals("DUPLICATE", result.getProcessStatus());
    }

    @Test
    void receiveEventShouldTreatDoneExistingEventAsDuplicate() {
        YyChannelEventInbox existing = new YyChannelEventInbox();
        existing.setId(880012L);
        existing.setChannelType("DOUYIN_LIFE");
        existing.setEventType("RESERVATION_PAY_NOTIFY");
        existing.setEventId("event-done-001");
        existing.setProcessStatus("DONE");
        when(mapper.selectOne(any())).thenReturn(existing);
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        YyChannelEventInboxVo result = service.receiveEvent(
            "DOUYIN_LIFE",
            "reservation_pay_notify",
            "1095657667861145988",
            "dy-log-done-001",
            "{\"order_id\":\"1095657667861145988\"}",
            true,
            ""
        );

        assertEquals("DUPLICATE", result.getProcessStatus());
    }

    @Test
    void receiveEventShouldNotTreatConcurrentReceivedInsertAsDuplicate() {
        YyChannelEventInbox concurrent = new YyChannelEventInbox();
        concurrent.setId(880003L);
        concurrent.setChannelType("DOUYIN_LIFE");
        concurrent.setEventType("RESERVATION_PAY_NOTIFY");
        concurrent.setEventId("event-003");
        concurrent.setProcessStatus("RECEIVED");
        when(mapper.selectOne(any())).thenReturn(null, concurrent);
        when(mapper.insert(any(YyChannelEventInbox.class))).thenThrow(new DuplicateKeyException("duplicate"));
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        YyChannelEventInboxVo result = service.receiveEvent(
            "DOUYIN_LIFE",
            "reservation_pay_notify",
            "1095657667861145988",
            "dy-log-race-001",
            "{\"order_id\":\"1095657667861145988\"}",
            true,
            ""
        );

        assertEquals("RECEIVED", result.getProcessStatus());
    }

    @Test
    void receiveEventShouldUseBusinessOrderIdForStableEventIdAcrossRetryLogIds() {
        when(mapper.selectOne(any())).thenReturn(null);
        when(mapper.insert(any(YyChannelEventInbox.class))).thenReturn(1);
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        service.receiveEvent(
            "DOUYIN_LIFE",
            "reservation_pay_notify",
            "1095657667861145988",
            "dy-log-first",
            "{\"order_id\":\"1095657667861145988\",\"mobile\":\"13800000000\"}",
            true,
            ""
        );
        service.receiveEvent(
            "DOUYIN_LIFE",
            "reservation_pay_notify",
            "1095657667861145988",
            "dy-log-retry",
            "{ \"mobile\" : \"13800000000\", \"order_id\" : \"1095657667861145988\" }",
            true,
            ""
        );

        ArgumentCaptor<YyChannelEventInbox> captor = ArgumentCaptor.forClass(YyChannelEventInbox.class);
        verify(mapper, times(2)).insert(captor.capture());
        assertEquals(captor.getAllValues().get(0).getEventId(), captor.getAllValues().get(1).getEventId());
        assertFalse(captor.getAllValues().get(0).getRawPayload().contains("13800000000"));
    }

    @Test
    void queryStatusShouldSummarizeRetryableAndLatestEvent() {
        YyChannelEventInbox latest = new YyChannelEventInbox();
        latest.setId(880005L);
        latest.setChannelType("DOUYIN_LIFE");
        latest.setEventType("RESERVATION_PAY_NOTIFY");
        latest.setExternalOrderId("1095657667861145999");
        latest.setRequestId("dy-log-latest");
        latest.setProcessStatus("FAILED");
        latest.setErrorMessage("本地订单落库失败");
        latest.setCreateTime(new Date(1_780_000_000_000L));
        when(mapper.selectCount(any())).thenReturn(11L, 2L, 6L, 1L, 1L, 1L, 0L);
        when(mapper.selectOne(any())).thenReturn(latest);
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        YyChannelEventInboxStatusVo status = service.queryStatus("douyin_life");

        assertEquals("DOUYIN_LIFE", status.getChannelType());
        assertEquals(11L, status.getTotalCount());
        assertEquals(2L, status.getReceivedCount());
        assertEquals(7L, status.getProcessedCount());
        assertEquals(1L, status.getFailedCount());
        assertEquals(4L, status.getRetryableCount());
        assertEquals(0L, status.getDeadCount());
        assertEquals("dy-log-latest", status.getLatestRequestId());
        assertEquals("本地订单落库失败", status.getLatestErrorMessage());
    }

    @Test
    void retryEventShouldResetFailedEventToReceived() {
        YyChannelEventInbox existing = new YyChannelEventInbox();
        existing.setId(880006L);
        existing.setChannelType("DOUYIN_LIFE");
        existing.setEventType("RESERVATION_PAY_NOTIFY");
        existing.setProcessStatus("FAILED");
        existing.setRetryCount(3);
        when(mapper.selectById(eq(880006L))).thenReturn(existing);
        when(mapper.updateById(any(YyChannelEventInbox.class))).thenReturn(1);
        YyChannelEventInbox reset = new YyChannelEventInbox();
        reset.setId(880006L);
        reset.setChannelType("DOUYIN_LIFE");
        reset.setEventType("RESERVATION_PAY_NOTIFY");
        reset.setProcessStatus("RECEIVED");
        reset.setRetryCount(4);
        when(mapper.selectVoById(eq(880006L))).thenReturn(toVo(reset));
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        YyChannelEventInboxVo result = service.retryEvent(880006L, "manual retry");

        assertEquals("RECEIVED", result.getProcessStatus());
        assertEquals(4, result.getRetryCount());
        ArgumentCaptor<YyChannelEventInbox> captor = ArgumentCaptor.forClass(YyChannelEventInbox.class);
        verify(mapper).updateById(captor.capture());
        assertEquals("RECEIVED", captor.getValue().getProcessStatus());
        assertEquals("", captor.getValue().getErrorMessage());
        assertEquals(4, captor.getValue().getRetryCount());
    }

    @Test
    void claimPendingEventsShouldUseMapperAndReturnProcessingEvents() {
        YyChannelEventInbox claimed = new YyChannelEventInbox();
        claimed.setId(880007L);
        claimed.setChannelType("DOUYIN_LIFE");
        claimed.setEventType("RESERVATION_PAY_NOTIFY");
        claimed.setProcessStatus("PROCESSING");
        when(mapper.claimPendingEvents(eq("DOUYIN_LIFE"), eq(3))).thenReturn(List.of(claimed));
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        List<YyChannelEventInboxVo> result = service.claimPendingEvents("douyin_life", 3);

        assertEquals(1, result.size());
        assertEquals("PROCESSING", result.get(0).getProcessStatus());
        verify(mapper).claimPendingEvents(eq("DOUYIN_LIFE"), eq(3));
    }

    @Test
    void markDoneShouldSetDoneStatusAndProcessedTime() {
        when(mapper.updateById(any(YyChannelEventInbox.class))).thenReturn(1);
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        service.markDone(880008L, "worker done");

        ArgumentCaptor<YyChannelEventInbox> captor = ArgumentCaptor.forClass(YyChannelEventInbox.class);
        verify(mapper).updateById(captor.capture());
        assertEquals(880008L, captor.getValue().getId());
        assertEquals("DONE", captor.getValue().getProcessStatus());
        assertEquals("worker done", captor.getValue().getRemark());
    }

    @Test
    void markRetryShouldSetRetryStatusAndNextRetryTime() {
        Date nextRetryTime = new Date(1_780_001_000_000L);
        when(mapper.selectById(eq(880009L))).thenReturn(eventWithRetryCount(880009L, 2));
        when(mapper.updateById(any(YyChannelEventInbox.class))).thenReturn(1);
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        service.markRetry(880009L, "temporary failure", nextRetryTime);

        ArgumentCaptor<YyChannelEventInbox> captor = ArgumentCaptor.forClass(YyChannelEventInbox.class);
        verify(mapper).updateById(captor.capture());
        assertEquals("RETRY", captor.getValue().getProcessStatus());
        assertEquals(3, captor.getValue().getRetryCount());
        assertEquals(nextRetryTime, captor.getValue().getNextRetryTime());
        assertEquals("temporary failure", captor.getValue().getErrorMessage());
    }

    @Test
    void markDeadShouldSetDeadStatusAndErrorMessage() {
        when(mapper.updateById(any(YyChannelEventInbox.class))).thenReturn(1);
        YyChannelEventInboxServiceImpl service = new YyChannelEventInboxServiceImpl(mapper);

        service.markDead(880010L, "permanent failure");

        ArgumentCaptor<YyChannelEventInbox> captor = ArgumentCaptor.forClass(YyChannelEventInbox.class);
        verify(mapper).updateById(captor.capture());
        assertEquals("DEAD", captor.getValue().getProcessStatus());
        assertEquals("permanent failure", captor.getValue().getErrorMessage());
    }

    private static YyChannelEventInboxVo toVo(YyChannelEventInbox entity) {
        YyChannelEventInboxVo vo = new YyChannelEventInboxVo();
        vo.setId(entity.getId());
        vo.setChannelType(entity.getChannelType());
        vo.setEventType(entity.getEventType());
        vo.setProcessStatus(entity.getProcessStatus());
        vo.setRetryCount(entity.getRetryCount());
        return vo;
    }

    private static YyChannelEventInbox eventWithRetryCount(Long id, int retryCount) {
        YyChannelEventInbox entity = new YyChannelEventInbox();
        entity.setId(id);
        entity.setRetryCount(retryCount);
        return entity;
    }
}
