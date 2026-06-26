package org.dromara.yy.controller;

import org.dromara.yy.domain.vo.YyOrderAnalysisOverviewVo;
import org.dromara.yy.domain.vo.YyOrderAnalysisScaffoldVo;
import org.dromara.yy.service.IYyOrderAnalysisService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyOrderAnalysisControllerTest {

    @Mock
    private IYyOrderAnalysisService orderAnalysisService;

    @Test
    void overviewShouldDelegateToReadOnlyOrderAnalysisFacade() {
        YyOrderAnalysisScaffoldVo scaffold = new YyOrderAnalysisScaffoldVo();
        YyOrderAnalysisOverviewVo overview = new YyOrderAnalysisOverviewVo();
        overview.setOrderedCount(3L);
        scaffold.setOverview(overview);
        when(orderAnalysisService.queryOverview(eq(1001L), eq("2026-06-01"), eq("2026-06-30"))).thenReturn(scaffold);

        YyOrderAnalysisController controller = new YyOrderAnalysisController(orderAnalysisService);

        assertEquals(3L, controller.overview(1001L, "2026-06-01", "2026-06-30").getData().getOverview().getOrderedCount());
        verify(orderAnalysisService).queryOverview(eq(1001L), eq("2026-06-01"), eq("2026-06-30"));
    }
}
