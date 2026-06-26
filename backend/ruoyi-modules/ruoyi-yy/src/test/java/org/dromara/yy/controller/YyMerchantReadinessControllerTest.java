package org.dromara.yy.controller;

import org.dromara.yy.domain.vo.YyMerchantReadinessItemVo;
import org.dromara.yy.service.IYyMerchantReadinessService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyMerchantReadinessControllerTest {

    @Mock
    private IYyMerchantReadinessService merchantReadinessService;

    @Test
    void summaryShouldDelegateToReadOnlyFacade() {
        YyMerchantReadinessItemVo item = new YyMerchantReadinessItemVo();
        item.setModuleKey("summary-module");
        when(merchantReadinessService.summary()).thenReturn(List.of(item));

        YyMerchantReadinessController controller = new YyMerchantReadinessController(merchantReadinessService);

        assertEquals("summary-module", controller.summary().getData().get(0).getModuleKey());
        verify(merchantReadinessService).summary();
    }

    @Test
    void scheduleShouldDelegateToReadOnlyFacade() {
        YyMerchantReadinessController controller = new YyMerchantReadinessController(merchantReadinessService);

        controller.schedule();

        verify(merchantReadinessService).schedule();
    }

    @Test
    void channelsShouldDelegateToReadOnlyFacade() {
        YyMerchantReadinessController controller = new YyMerchantReadinessController(merchantReadinessService);

        controller.channels();

        verify(merchantReadinessService).channels();
    }

    @Test
    void governanceShouldDelegateToReadOnlyFacade() {
        YyMerchantReadinessController controller = new YyMerchantReadinessController(merchantReadinessService);

        controller.governance();

        verify(merchantReadinessService).governance();
    }

    @Test
    void dependenciesShouldDelegateToReadOnlyFacade() {
        YyMerchantReadinessController controller = new YyMerchantReadinessController(merchantReadinessService);

        controller.dependencies();

        verify(merchantReadinessService).dependencies();
    }
}
