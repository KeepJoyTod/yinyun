package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import org.dromara.yy.service.IYyMemberAssetService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyMemberAssetControllerTest {

    @Mock
    private IYyMemberAssetService memberAssetService;

    @Test
    void memberAssetEndpointsShouldRequireCustomerListPermission() throws NoSuchMethodException {
        assertPermission("getOverview", Long.class);
        assertPermission("listCards", Long.class);
        assertPermission("listBenefits", Long.class);
        assertPermission("listCoupons", Long.class);
        assertPermission("listPointsLedger", Long.class, int.class);
        assertPermission("listGrowthLedger", Long.class, int.class);
        assertPermission("listBalanceLedger", Long.class, int.class);
    }

    private static void assertPermission(String methodName, Class<?>... parameterTypes) throws NoSuchMethodException {
        Method method = YyMemberAssetController.class.getDeclaredMethod(methodName, parameterTypes);
        SaCheckPermission permission = method.getAnnotation(SaCheckPermission.class);

        assertNotNull(permission);
        assertEquals("yy:customer:list", permission.value()[0]);
    }
}
