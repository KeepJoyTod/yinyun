package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.system.domain.vo.SysOssVo;
import org.dromara.system.service.ISysOssService;
import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.vo.YyReportFinanceExportPayloadVo;
import org.dromara.yy.domain.vo.YyReportFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;
import org.dromara.yy.mapper.YyAsyncTaskMapper;
import org.dromara.yy.service.IYyAsyncTaskService;
import org.dromara.yy.service.IYyReportFinanceReconciliationService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyReportFinanceExportWorkerServiceTest {

    @BeforeAll
    static void initTableInfo() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyAsyncTask.class);
    }

    @Mock
    private IYyAsyncTaskService asyncTaskService;
    @Mock
    private IYyReportFinanceReconciliationService reportFinanceReconciliationService;
    @Mock
    private ISysOssService ossService;
    @Mock
    private YyAsyncTaskMapper asyncTaskMapper;
    @Mock
    private Environment environment;

    @InjectMocks
    private YyReportFinanceExportWorkerService workerService;

    @Test
    void runOnceShouldClaimGenerateUploadAndMarkSuccess() {
        YyAsyncTask task = new YyAsyncTask();
        task.setId(88L);
        task.setTaskNo("FIN-REC-1");
        task.setTaskType("REPORT_FINANCE_RECONCILIATION_EXPORT");

        YyReportFinanceExportPayloadVo payload = new YyReportFinanceExportPayloadVo();
        payload.setDateFrom("2026-06-01");
        payload.setDateTo("2026-06-30");

        YyReportFinanceReconciliationVo report = new YyReportFinanceReconciliationVo();
        YyReportFinanceOverviewVo overview = new YyReportFinanceOverviewVo();
        overview.setBoundaryNote("yy_order");
        report.setOverview(overview);

        SysOssVo oss = new SysOssVo();
        oss.setOssId(123L);
        oss.setOriginalName("finance-reconciliation.csv");

        when(environment.getProperty(anyString(), anyString())).thenAnswer(invocation -> invocation.getArgument(1));
        when(asyncTaskService.claimNextTask(eq(IYyAsyncTaskService.TASK_TYPE_FINANCE_EXPORT), any(), any(), any()))
            .thenReturn(task)
            .thenReturn(null);
        when(asyncTaskService.parseFinanceExportPayload(eq(task))).thenReturn(payload);
        when(reportFinanceReconciliationService.queryOverviewForExportTask(eq(payload))).thenReturn(report);
        when(ossService.upload(any(java.io.File.class))).thenReturn(oss);

        int processed = workerService.runOnce();

        assertEquals(1, processed);
        verify(asyncTaskService).markTaskRunning(eq(88L), any(), any());
        verify(asyncTaskService).markTaskSuccess(eq(88L), any(), eq(123L), eq("finance-reconciliation.csv"), eq("text/csv"), any(), eq("/yy/reportFinanceReconciliation/export/tasks/FIN-REC-1/download"), any(), any(), eq("uploaded to sys_oss"));
    }

    @Test
    void runOnceShouldMarkRetryWhenProcessingFailsBeforeMaxRetryCount() {
        YyAsyncTask task = new YyAsyncTask();
        task.setId(89L);
        task.setTaskNo("FIN-REC-2");
        task.setTaskType("REPORT_FINANCE_RECONCILIATION_EXPORT");
        task.setRetryCount(0);
        task.setMaxRetryCount(3);

        YyReportFinanceExportPayloadVo payload = new YyReportFinanceExportPayloadVo();
        payload.setDateFrom("2026-06-01");
        payload.setDateTo("2026-06-30");

        when(environment.getProperty(anyString(), anyString())).thenAnswer(invocation -> invocation.getArgument(1));
        when(asyncTaskService.claimNextTask(eq(IYyAsyncTaskService.TASK_TYPE_FINANCE_EXPORT), any(), any(), any()))
            .thenReturn(task)
            .thenReturn(null);
        when(asyncTaskService.parseFinanceExportPayload(eq(task))).thenReturn(payload);
        when(reportFinanceReconciliationService.queryOverviewForExportTask(eq(payload)))
            .thenThrow(new ServiceException("db unavailable"));

        int processed = workerService.runOnce();

        assertEquals(1, processed);
        verify(asyncTaskService).markTaskRetry(eq(89L), any(), eq("db unavailable"), any());
        verify(asyncTaskService, never()).markTaskFailed(eq(89L), any(), anyString());
    }

    @Test
    void runOnceShouldMarkFailedWhenRetryBudgetIsExhausted() {
        YyAsyncTask task = new YyAsyncTask();
        task.setId(90L);
        task.setTaskNo("FIN-REC-3");
        task.setTaskType("REPORT_FINANCE_RECONCILIATION_EXPORT");
        task.setRetryCount(2);
        task.setMaxRetryCount(3);

        YyReportFinanceExportPayloadVo payload = new YyReportFinanceExportPayloadVo();
        payload.setDateFrom("2026-06-01");
        payload.setDateTo("2026-06-30");

        when(environment.getProperty(anyString(), anyString())).thenAnswer(invocation -> invocation.getArgument(1));
        when(asyncTaskService.claimNextTask(eq(IYyAsyncTaskService.TASK_TYPE_FINANCE_EXPORT), any(), any(), any()))
            .thenReturn(task)
            .thenReturn(null);
        when(asyncTaskService.parseFinanceExportPayload(eq(task))).thenReturn(payload);
        when(reportFinanceReconciliationService.queryOverviewForExportTask(eq(payload)))
            .thenThrow(new ServiceException("oss unavailable"));

        int processed = workerService.runOnce();

        assertEquals(1, processed);
        verify(asyncTaskService).markTaskFailed(eq(90L), any(), eq("oss unavailable"));
        verify(asyncTaskService, never()).markTaskRetry(eq(90L), any(), anyString(), any());
    }

    @Test
    void cleanupExpiredDownloadsShouldDeleteOssAndExpireTask() {
        YyAsyncTask task = new YyAsyncTask();
        task.setId(91L);
        task.setTaskNo("FIN-REC-4");
        task.setStatus("COMPLETED");
        task.setOssId(321L);
        task.setAuditNote("uploaded to sys_oss");

        when(environment.getProperty(anyString(), anyString())).thenAnswer(invocation -> invocation.getArgument(1));
        when(asyncTaskMapper.selectList(any())).thenReturn(java.util.List.of(task));
        when(asyncTaskMapper.update(any(YyAsyncTask.class), any())).thenReturn(1);

        int expired = workerService.cleanupExpiredDownloads();

        assertEquals(1, expired);
        verify(ossService).deleteWithValidByIds(eq(java.util.List.of(321L)), eq(false));
    }
}
