package org.dromara.yy.controller;

import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;
import org.dromara.yy.domain.vo.YyReportFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;
import org.dromara.yy.service.IYyReportFinanceReconciliationService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyReportFinanceReconciliationControllerTest {

    @Mock
    private IYyReportFinanceReconciliationService service;

    @Test
    void overviewShouldDelegateToFinanceReconciliationService() {
        YyReportFinanceReconciliationVo scaffold = new YyReportFinanceReconciliationVo();
        YyReportFinanceOverviewVo overview = new YyReportFinanceOverviewVo();
        overview.setPaidAmountCent(9900L);
        scaffold.setOverview(overview);
        when(service.queryOverview(eq(1L), eq("2026-06-01"), eq("2026-06-30"))).thenReturn(scaffold);

        YyReportFinanceReconciliationController controller = new YyReportFinanceReconciliationController(service);

        assertEquals(9900L, controller.overview(1L, "2026-06-01", "2026-06-30").getData().getOverview().getPaidAmountCent());
        verify(service).queryOverview(eq(1L), eq("2026-06-01"), eq("2026-06-30"));
    }

    @Test
    void exportShouldCreateAndListAsyncTaskSkeleton() {
        YyReportFinanceExportTaskVo task = new YyReportFinanceExportTaskVo();
        task.setTaskId("FIN-REC-1");
        task.setStatus("COMPLETED");
        when(service.createExportTask(eq(null), eq("2026-06-01"), eq("2026-06-30"))).thenReturn(task);
        when(service.listExportTasks(eq(null), eq("2026-06-01"), eq("2026-06-30"))).thenReturn(List.of(task));

        YyReportFinanceReconciliationController controller = new YyReportFinanceReconciliationController(service);

        assertEquals("FIN-REC-1", controller.export(null, "2026-06-01", "2026-06-30").getData().getTaskId());
        assertEquals(1, controller.exportTasks(null, "2026-06-01", "2026-06-30").getData().size());
    }
}
