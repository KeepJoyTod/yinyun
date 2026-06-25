package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyFeatureScopeVo;
import org.dromara.yy.domain.vo.YyServiceLicenseBindingVo;
import org.dromara.yy.service.IYyServiceProductionService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyFeatureScopeServiceImplTest {

    @Mock
    private IYyServiceProductionService yyServiceProductionService;

    @InjectMocks
    private YyFeatureScopeServiceImpl service;

    @Test
    void collaborationOpenSettingsShouldReturnMissingWhenNoLicenseExists() {
        when(yyServiceProductionService.queryLicenseBindings(null)).thenReturn(List.of());

        YyFeatureScopeVo result = service.listFeatureScopes(List.of("collaboration-open-settings")).get(0);

        assertEquals("collaboration-open-settings", result.getFeatureKey());
        assertEquals("missing", result.getLicenseState());
        assertEquals("not_applicable", result.getPluginState());
        assertEquals("not_applicable", result.getApprovalState());
        assertNull(result.getLicenseSummary());
        verify(yyServiceProductionService).queryLicenseBindings(null);
    }

    @Test
    void collaborationOpenSettingsShouldReturnActiveWhenValidActiveLicenseExists() {
        when(yyServiceProductionService.queryLicenseBindings(null)).thenReturn(List.of(buildLicense("ACTIVE", 86_400_000L)));

        YyFeatureScopeVo result = service.listFeatureScopes(List.of("collaboration-open-settings")).get(0);

        assertEquals("active", result.getLicenseState());
        assertEquals("LIC-001", result.getLicenseSummary().getLicenseKey());
        assertEquals("PLAN-A", result.getLicenseSummary().getPlanName());
        verify(yyServiceProductionService).queryLicenseBindings(null);
    }

    @Test
    void collaborationOpenSettingsShouldReturnExpiredWhenOnlyExpiredOrDisabledLicensesExist() {
        when(yyServiceProductionService.queryLicenseBindings(null)).thenReturn(List.of(
            buildLicense("ACTIVE", -86_400_000L),
            buildLicense("DISABLED", 86_400_000L)
        ));

        YyFeatureScopeVo result = service.listFeatureScopes(List.of("collaboration-open-settings")).get(0);

        assertEquals("expired", result.getLicenseState());
        assertEquals("not_applicable", result.getPluginState());
        assertEquals("not_applicable", result.getApprovalState());
        verify(yyServiceProductionService).queryLicenseBindings(null);
    }

    @Test
    void unknownFeatureShouldReturnNotApplicableWithoutReadingLicenseLedger() {
        YyFeatureScopeVo result = service.listFeatureScopes(List.of("marketing-center")).get(0);

        assertEquals("marketing-center", result.getFeatureKey());
        assertEquals("not_applicable", result.getLicenseState());
        assertEquals("not_applicable", result.getPluginState());
        assertEquals("not_applicable", result.getApprovalState());
        assertNull(result.getLicenseSummary());
        verify(yyServiceProductionService, never()).queryLicenseBindings(null);
    }

    @Test
    void resourceAndWorkOrderFeatureKeysShouldReturnNotApplicableWithoutReadingLicenseLedger() {
        List<YyFeatureScopeVo> results = service.listFeatureScopes(List.of(
            "resource-manage",
            "resource-tags",
            "resource-usage",
            "collaboration-work-orders"
        ));

        assertEquals(4, results.size());
        for (YyFeatureScopeVo result : results) {
            assertEquals("not_applicable", result.getLicenseState());
            assertEquals("not_applicable", result.getPluginState());
            assertEquals("not_applicable", result.getApprovalState());
            assertNull(result.getLicenseSummary());
        }
        verify(yyServiceProductionService, never()).queryLicenseBindings(null);
    }

    private static YyServiceLicenseBindingVo buildLicense(String status, long offsetMillis) {
        YyServiceLicenseBindingVo vo = new YyServiceLicenseBindingVo();
        vo.setId(1L);
        vo.setLicenseKey("LIC-001");
        vo.setPlanName("PLAN-A");
        vo.setStatus(status);
        vo.setBoundStoreIds("1001,1002");
        vo.setExpireTime(new Date(System.currentTimeMillis() + offsetMillis));
        return vo;
    }
}
