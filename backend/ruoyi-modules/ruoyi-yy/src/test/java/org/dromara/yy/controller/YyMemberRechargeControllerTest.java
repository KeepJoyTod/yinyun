package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.yy.service.IYyMemberRechargeService;
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
class YyMemberRechargeControllerTest {

    @Mock
    private IYyMemberRechargeService memberRechargeService;

    @Test
    void listRechargeOrdersShouldRequireCustomerListPermission() throws NoSuchMethodException {
        Method method = YyMemberRechargeController.class.getDeclaredMethod("listRechargeOrders", Long.class, int.class);
        SaCheckPermission permission = method.getAnnotation(SaCheckPermission.class);

        assertNotNull(permission);
        assertEquals("yy:customer:list", permission.value()[0]);
    }

    @Test
    void createRechargeOrderShouldRequireCustomerEditPermissionAndInsertLog() throws NoSuchMethodException {
        Method method = YyMemberRechargeController.class.getDeclaredMethod(
            "createRechargeOrder",
            Long.class,
            org.dromara.yy.domain.bo.YyMemberRechargeCreateBo.class
        );
        SaCheckPermission permission = method.getAnnotation(SaCheckPermission.class);
        Log log = method.getAnnotation(Log.class);

        assertNotNull(permission);
        assertEquals("yy:customer:edit", permission.value()[0]);
        assertNotNull(log);
        assertEquals(BusinessType.INSERT, log.businessType());
    }

    @Test
    void confirmRechargeOrderShouldRequireCustomerEditPermissionAndUpdateLog() throws NoSuchMethodException {
        Method method = YyMemberRechargeController.class.getDeclaredMethod("confirmRechargeOrder", Long.class);
        SaCheckPermission permission = method.getAnnotation(SaCheckPermission.class);
        Log log = method.getAnnotation(Log.class);

        assertNotNull(permission);
        assertEquals("yy:customer:edit", permission.value()[0]);
        assertNotNull(log);
        assertEquals(BusinessType.UPDATE, log.businessType());
    }
}
