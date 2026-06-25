package org.dromara.yy.controller;

import org.dromara.yy.domain.bo.YyFinanceTransactionQueryBo;
import org.dromara.yy.domain.vo.YyAccountProfileVo;
import org.dromara.yy.domain.vo.YyFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyToolPrecisionDeliverySummaryVo;
import org.dromara.yy.domain.vo.YyToolSampleWorkVo;
import org.dromara.yy.service.IYyAccountCenterService;
import org.dromara.yy.service.IYyFinanceCenterService;
import org.dromara.yy.service.IYyToolCenterService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyPhase34CenterControllerTest {

    @Mock
    private IYyToolCenterService toolCenterService;

    @Mock
    private IYyAccountCenterService accountCenterService;

    @Mock
    private IYyFinanceCenterService financeCenterService;

    @Test
    void toolCenterShouldExposeSampleWorksAndDeliverySummary() {
        YyToolSampleWorkVo sample = new YyToolSampleWorkVo();
        sample.setSampleId("album-1");
        YyToolPrecisionDeliverySummaryVo summary = new YyToolPrecisionDeliverySummaryVo();
        summary.setAudienceCount(2);
        when(toolCenterService.listSampleWorks()).thenReturn(List.of(sample));
        when(toolCenterService.getPrecisionDeliverySummary()).thenReturn(summary);

        YyToolCenterController controller = new YyToolCenterController(toolCenterService);

        assertEquals("album-1", controller.sampleWorks().getData().get(0).getSampleId());
        assertEquals(2, controller.precisionDeliverySummary().getData().getAudienceCount());
        verify(toolCenterService).listSampleWorks();
        verify(toolCenterService).getPrecisionDeliverySummary();
    }

    @Test
    void accountCenterShouldExposeProfileAndBrandSwitch() {
        YyAccountProfileVo profile = new YyAccountProfileVo();
        profile.setAccountId("7001");
        when(accountCenterService.getProfile()).thenReturn(profile);

        YyAccountCenterController controller = new YyAccountCenterController(accountCenterService);

        assertEquals("7001", controller.profile().getData().getAccountId());
        controller.switchBrand("1001");
        verify(accountCenterService).getProfile();
        verify(accountCenterService).switchBrand(eq("1001"));
    }

    @Test
    void financeCenterShouldDelegateReadOnlyLedgerQueries() {
        YyFinanceOverviewVo overview = new YyFinanceOverviewVo();
        overview.setAccountId("yy-payment-record");
        when(financeCenterService.getOverview()).thenReturn(overview);

        YyFinanceCenterController controller = new YyFinanceCenterController(financeCenterService);

        assertEquals("yy-payment-record", controller.overview().getData().getAccountId());
        controller.transactions(new YyFinanceTransactionQueryBo());
        verify(financeCenterService).getOverview();
        verify(financeCenterService).listTransactions(any(YyFinanceTransactionQueryBo.class));
    }
}
