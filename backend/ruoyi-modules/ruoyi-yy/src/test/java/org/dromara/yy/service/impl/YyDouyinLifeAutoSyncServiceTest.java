package org.dromara.yy.service.impl;

import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.vo.YyChannelSyncResultVo;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.dromara.yy.service.YyChannelAdapterService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Tag("dev")
@ExtendWith(MockitoExtension.class)
class YyDouyinLifeAutoSyncServiceTest {

    @Mock
    private YyChannelAdapterService channelAdapterService;

    @Mock
    private YyChannelSyncLogMapper channelSyncLogMapper;

    @Mock
    private Environment environment;

    @Test
    void runOnceShouldBuildOverlapWindowAndPersistAutoSyncLog() {
        when(environment.getProperty("yy.douyin.life.auto-sync.enabled", "true")).thenReturn("true");
        when(environment.getProperty("yy.douyin.life.auto-sync.window-minutes", "30")).thenReturn("30");
        when(environment.getProperty("yy.douyin.life.auto-sync.overlap-minutes", "10")).thenReturn("10");
        when(environment.getProperty("yy.douyin.life.auto-sync.page-size", "50")).thenReturn("50");
        YyChannelSyncResultVo syncResult = new YyChannelSyncResultVo();
        syncResult.setChannelType("DOUYIN_LIFE");
        syncResult.setSyncStatus("SYNCED");
        syncResult.setTotal(3);
        syncResult.setCreated(1);
        syncResult.setUpdated(2);
        syncResult.setFailed(0);
        syncResult.setLastLogId("life-auto-log-001");
        syncResult.setMessage("同步完成");
        when(channelAdapterService.syncOrders(eq("DOUYIN_LIFE"), org.mockito.ArgumentMatchers.any(YyChannelOrderQuery.class))).thenReturn(syncResult);
        YyDouyinLifeAutoSyncService service = new YyDouyinLifeAutoSyncService(channelAdapterService, channelSyncLogMapper, environment);

        YyChannelSyncResultVo result = service.runOnce();

        assertEquals("SYNCED", result.getSyncStatus());
        ArgumentCaptor<YyChannelOrderQuery> queryCaptor = ArgumentCaptor.forClass(YyChannelOrderQuery.class);
        verify(channelAdapterService).syncOrders(eq("DOUYIN_LIFE"), queryCaptor.capture());
        YyChannelOrderQuery query = queryCaptor.getValue();
        assertEquals(50, query.getPageSize());
        assertNotNull(query.getStartTime());
        assertNotNull(query.getEndTime());
        assertTrue(query.getStartTime().compareTo(query.getEndTime()) < 0);
        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        YyChannelSyncLog log = logCaptor.getValue();
        assertEquals("DOUYIN_LIFE", log.getChannelType());
        assertEquals("life_order_auto_sync", log.getApiName());
        assertEquals("life-auto-log-001", log.getRequestId());
        assertEquals("1", log.getSuccess());
        assertTrue(log.getRemark().contains("total=3"));
        assertTrue(log.getRemark().contains("created=1"));
        assertTrue(log.getRemark().contains("updated=2"));
    }

    @Test
    void runOnceShouldAttachSafetyLimitsToAutoSyncQuery() {
        when(environment.getProperty("yy.douyin.life.auto-sync.enabled", "true")).thenReturn("true");
        when(environment.getProperty("yy.douyin.life.auto-sync.window-minutes", "30")).thenReturn("30");
        when(environment.getProperty("yy.douyin.life.auto-sync.overlap-minutes", "10")).thenReturn("10");
        when(environment.getProperty("yy.douyin.life.auto-sync.page-size", "50")).thenReturn("50");
        YyChannelSyncResultVo syncResult = new YyChannelSyncResultVo();
        syncResult.setChannelType("DOUYIN_LIFE");
        syncResult.setSyncStatus("SYNCED");
        when(channelAdapterService.syncOrders(eq("DOUYIN_LIFE"), org.mockito.ArgumentMatchers.any(YyChannelOrderQuery.class))).thenReturn(syncResult);
        YyDouyinLifeAutoSyncService service = new YyDouyinLifeAutoSyncService(channelAdapterService, channelSyncLogMapper, environment);

        service.runOnce();

        ArgumentCaptor<YyChannelOrderQuery> queryCaptor = ArgumentCaptor.forClass(YyChannelOrderQuery.class);
        verify(channelAdapterService).syncOrders(eq("DOUYIN_LIFE"), queryCaptor.capture());
        YyChannelOrderQuery query = queryCaptor.getValue();
        assertEquals(2, query.getMaxPages());
        assertEquals(80, query.getMaxTotal());
    }

    @Test
    void runOnceShouldReturnSkippedWhenDisabled() {
        when(environment.getProperty("yy.douyin.life.auto-sync.enabled", "true")).thenReturn("false");
        YyDouyinLifeAutoSyncService service = new YyDouyinLifeAutoSyncService(channelAdapterService, channelSyncLogMapper, environment);

        YyChannelSyncResultVo result = service.runOnce();

        assertEquals("SKIPPED", result.getSyncStatus());
        assertEquals("抖音来客自动同步未启用", result.getMessage());
    }

    @Test
    void runReconcileOnceShouldBuildDailyWindowAndPersistReconcileLog() {
        when(environment.getProperty("yy.douyin.life.reconcile.enabled", "true")).thenReturn("true");
        when(environment.getProperty("yy.douyin.life.reconcile.window-hours", "24")).thenReturn("24");
        when(environment.getProperty("yy.douyin.life.reconcile.page-size", "100")).thenReturn("100");
        when(environment.getProperty("yy.douyin.life.reconcile.max-pages", "3")).thenReturn("3");
        when(environment.getProperty("yy.douyin.life.reconcile.max-total", "300")).thenReturn("300");
        YyChannelSyncResultVo syncResult = new YyChannelSyncResultVo();
        syncResult.setChannelType("DOUYIN_LIFE");
        syncResult.setSyncStatus("SYNCED");
        syncResult.setTotal(7);
        syncResult.setCreated(7);
        syncResult.setUpdated(0);
        syncResult.setFailed(0);
        syncResult.setLastLogId("life-reconcile-log-001");
        when(channelAdapterService.syncOrders(eq("DOUYIN_LIFE"), org.mockito.ArgumentMatchers.any(YyChannelOrderQuery.class))).thenReturn(syncResult);
        YyDouyinLifeAutoSyncService service = new YyDouyinLifeAutoSyncService(channelAdapterService, channelSyncLogMapper, environment);

        YyChannelSyncResultVo result = service.runReconcileOnce();

        assertEquals("SYNCED", result.getSyncStatus());
        ArgumentCaptor<YyChannelOrderQuery> queryCaptor = ArgumentCaptor.forClass(YyChannelOrderQuery.class);
        verify(channelAdapterService).syncOrders(eq("DOUYIN_LIFE"), queryCaptor.capture());
        YyChannelOrderQuery query = queryCaptor.getValue();
        assertEquals("DOUYIN_LIFE", query.getChannelType());
        assertEquals(100, query.getPageSize());
        assertEquals(1, query.getPageNum());
        assertEquals(3, query.getMaxPages());
        assertEquals(300, query.getMaxTotal());
        assertEquals(false, query.getUseTestDataHeader());
        assertNotNull(query.getStartTime());
        assertNotNull(query.getEndTime());
        assertTrue(query.getStartTime().compareTo(query.getEndTime()) < 0);

        ArgumentCaptor<YyChannelSyncLog> logCaptor = ArgumentCaptor.forClass(YyChannelSyncLog.class);
        verify(channelSyncLogMapper).insert(logCaptor.capture());
        YyChannelSyncLog log = logCaptor.getValue();
        assertEquals("DOUYIN_LIFE", log.getChannelType());
        assertEquals("life_order_reconcile_sync", log.getApiName());
        assertEquals("life-reconcile-log-001", log.getRequestId());
        assertEquals("1", log.getSuccess());
        assertTrue(log.getRemark().contains("total=7"));
        assertTrue(log.getRemark().contains("maxPages=3"));
        assertTrue(log.getRemark().contains("maxTotal=300"));
    }

    @Test
    void runReconcileOnceShouldReturnSkippedWhenDisabled() {
        when(environment.getProperty("yy.douyin.life.reconcile.enabled", "true")).thenReturn("false");
        YyDouyinLifeAutoSyncService service = new YyDouyinLifeAutoSyncService(channelAdapterService, channelSyncLogMapper, environment);

        YyChannelSyncResultVo result = service.runReconcileOnce();

        assertEquals("SKIPPED", result.getSyncStatus());
        assertEquals("抖音来客订单对账同步未启用", result.getMessage());
    }
}
