package org.dromara.yy.controller;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.system.service.ISysOssService;
import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;
import org.dromara.yy.domain.vo.YyReportFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;
import org.dromara.yy.service.IYyAsyncTaskService;
import org.dromara.yy.service.IYyReportFinanceReconciliationService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyReportFinanceReconciliationControllerTest {

    @Mock
    private IYyReportFinanceReconciliationService service;
    @Mock
    private IYyAsyncTaskService asyncTaskService;
    @Mock
    private ISysOssService ossService;

    @Test
    void overviewShouldDelegateToFinanceReconciliationService() {
        YyReportFinanceReconciliationVo scaffold = new YyReportFinanceReconciliationVo();
        YyReportFinanceOverviewVo overview = new YyReportFinanceOverviewVo();
        overview.setPaidAmountCent(9900L);
        scaffold.setOverview(overview);
        when(service.queryOverview(eq(1L), eq("2026-06-01"), eq("2026-06-30"))).thenReturn(scaffold);

        YyReportFinanceReconciliationController controller = new YyReportFinanceReconciliationController(service, asyncTaskService, ossService);

        assertEquals(9900L, controller.overview(1L, "2026-06-01", "2026-06-30").getData().getOverview().getPaidAmountCent());
        verify(service).queryOverview(eq(1L), eq("2026-06-01"), eq("2026-06-30"));
    }

    @Test
    void exportShouldCreateAndListAsyncTaskSkeleton() {
        YyReportFinanceExportTaskVo task = new YyReportFinanceExportTaskVo();
        task.setTaskId("FIN-REC-1");
        task.setStatus("PENDING");
        when(service.createExportTask(eq(null), eq("2026-06-01"), eq("2026-06-30"))).thenReturn(task);
        when(service.listExportTasks(eq(null), eq("2026-06-01"), eq("2026-06-30"))).thenReturn(List.of(task));

        YyReportFinanceReconciliationController controller = new YyReportFinanceReconciliationController(service, asyncTaskService, ossService);

        assertEquals("FIN-REC-1", controller.export(null, "2026-06-01", "2026-06-30").getData().getTaskId());
        assertEquals(1, controller.exportTasks(null, "2026-06-01", "2026-06-30").getData().size());
    }

    @Test
    void downloadShouldRequireAccessibleCompletedTask() throws Exception {
        YyAsyncTask task = new YyAsyncTask();
        task.setTaskNo("FIN-REC-1");
        task.setStatus("COMPLETED");
        task.setOssId(99L);
        when(asyncTaskService.requireAccessibleTask(eq("FIN-REC-1"))).thenReturn(task);

        YyReportFinanceReconciliationController controller = new YyReportFinanceReconciliationController(service, asyncTaskService, ossService);

        controller.downloadExportTask("FIN-REC-1", null);

        verify(ossService).download(eq(99L), eq(null));
    }

    @Test
    void downloadShouldRejectIncompleteTask() throws Exception {
        YyAsyncTask task = new YyAsyncTask();
        task.setTaskNo("FIN-REC-1");
        task.setStatus("RUNNING");
        when(asyncTaskService.requireAccessibleTask(eq("FIN-REC-1"))).thenReturn(task);

        YyReportFinanceReconciliationController controller = new YyReportFinanceReconciliationController(service, asyncTaskService, ossService);

        ServiceException ex = assertThrows(ServiceException.class, () -> invokeDownload(controller, "FIN-REC-1"));

        assertEquals("导出任务尚未完成", ex.getMessage());
        verify(ossService, never()).download(any(), any());
    }

    @Test
    void downloadShouldRejectExpiredTask() throws Exception {
        YyAsyncTask task = new YyAsyncTask();
        task.setTaskNo("FIN-REC-1");
        task.setStatus("COMPLETED");
        task.setOssId(99L);
        task.setExpireTime(new Date(System.currentTimeMillis() - 1_000L));
        when(asyncTaskService.requireAccessibleTask(eq("FIN-REC-1"))).thenReturn(task);

        YyReportFinanceReconciliationController controller = new YyReportFinanceReconciliationController(service, asyncTaskService, ossService);

        ServiceException ex = assertThrows(ServiceException.class, () -> invokeDownload(controller, "FIN-REC-1"));

        assertEquals("导出文件已过期", ex.getMessage());
        verify(ossService, never()).download(any(), any());
    }

    @Test
    void downloadShouldRejectMissingOssFile() throws Exception {
        YyAsyncTask task = new YyAsyncTask();
        task.setTaskNo("FIN-REC-1");
        task.setStatus("COMPLETED");
        task.setExpireTime(new Date(System.currentTimeMillis() + 60_000L));
        when(asyncTaskService.requireAccessibleTask(eq("FIN-REC-1"))).thenReturn(task);

        YyReportFinanceReconciliationController controller = new YyReportFinanceReconciliationController(service, asyncTaskService, ossService);

        ServiceException ex = assertThrows(ServiceException.class, () -> invokeDownload(controller, "FIN-REC-1"));

        assertEquals("导出文件不存在", ex.getMessage());
        verify(ossService, never()).download(any(), any());
    }

    private void invokeDownload(YyReportFinanceReconciliationController controller, String taskId) {
        try {
            controller.downloadExportTask(taskId, null);
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AssertionError(ex);
        }
    }
}
