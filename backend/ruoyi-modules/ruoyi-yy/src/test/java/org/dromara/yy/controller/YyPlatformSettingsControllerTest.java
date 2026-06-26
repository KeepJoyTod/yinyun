package org.dromara.yy.controller;

import org.dromara.yy.domain.vo.YyPlatformIntegrationStatusVo;
import org.dromara.yy.service.IYyPlatformSettingsService;
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
class YyPlatformSettingsControllerTest {

    @Mock
    private IYyPlatformSettingsService platformSettingsService;

    @Test
    void integrationsShouldDelegateToReadOnlyFacade() {
        YyPlatformIntegrationStatusVo integration = new YyPlatformIntegrationStatusVo();
        integration.setChannelType("DOUYIN_LIFE");
        when(platformSettingsService.listIntegrations()).thenReturn(List.of(integration));

        YyPlatformSettingsController controller = new YyPlatformSettingsController(platformSettingsService);

        assertEquals("DOUYIN_LIFE", controller.integrations().getData().get(0).getChannelType());
        verify(platformSettingsService).listIntegrations();
    }

    @Test
    void servicePackagesShouldPassStoreScope() {
        YyPlatformSettingsController controller = new YyPlatformSettingsController(platformSettingsService);

        controller.servicePackages(1001L);

        verify(platformSettingsService).listServicePackages(eq(1001L));
    }

    @Test
    void loginRiskPoliciesShouldDelegateToPlatformFacade() {
        YyPlatformSettingsController controller = new YyPlatformSettingsController(platformSettingsService);

        controller.loginRiskPolicies();

        verify(platformSettingsService).listLoginRiskPolicies();
    }

    @Test
    void meituanReviewTracesShouldDelegateToPlatformFacade() {
        YyPlatformSettingsController controller = new YyPlatformSettingsController(platformSettingsService);

        controller.meituanReviewTraces();

        verify(platformSettingsService).listMeituanReviewTraces();
    }
}
