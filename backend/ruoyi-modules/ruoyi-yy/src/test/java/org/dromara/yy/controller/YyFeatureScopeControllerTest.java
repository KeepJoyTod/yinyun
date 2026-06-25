package org.dromara.yy.controller;

import org.dromara.yy.domain.vo.YyFeatureScopeVo;
import org.dromara.yy.service.IYyFeatureScopeService;
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
class YyFeatureScopeControllerTest {

    @Mock
    private IYyFeatureScopeService featureScopeService;

    @Test
    void listShouldNormalizeCsvAndDelegateToService() {
        YyFeatureScopeVo collaboration = new YyFeatureScopeVo();
        collaboration.setFeatureKey("collaboration-open-settings");
        YyFeatureScopeController controller = new YyFeatureScopeController(featureScopeService);
        List<String> featureKeys = List.of("collaboration-open-settings", "marketing-center");
        when(featureScopeService.listFeatureScopes(eq(featureKeys))).thenReturn(List.of(collaboration));

        List<YyFeatureScopeVo> result = controller.list(" collaboration-open-settings , marketing-center , collaboration-open-settings ")
            .getData();

        assertEquals(1, result.size());
        assertEquals("collaboration-open-settings", result.get(0).getFeatureKey());
        verify(featureScopeService).listFeatureScopes(eq(featureKeys));
    }
}
