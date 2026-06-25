package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import org.dromara.yy.domain.bo.YyMemberStoredValueTransactionQueryBo;
import org.dromara.yy.service.IYyMemberStoredValueService;
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
class YyMemberStoredValueControllerTest {

    @Mock
    private IYyMemberStoredValueService memberStoredValueService;

    @Test
    void rechargeSettingShouldRequireCustomerListPermission() throws NoSuchMethodException {
        assertCustomerListPermission(YyMemberStoredValueController.class.getDeclaredMethod("getRechargeSetting"));
    }

    @Test
    void rechargeCapabilityShouldRequireCustomerListPermission() throws NoSuchMethodException {
        assertCustomerListPermission(YyMemberStoredValueController.class.getDeclaredMethod("getRechargeCapability"));
    }

    @Test
    void storedValueTransactionsShouldRequireCustomerListPermission() throws NoSuchMethodException {
        assertCustomerListPermission(YyMemberStoredValueController.class.getDeclaredMethod(
            "listStoredValueTransactions",
            YyMemberStoredValueTransactionQueryBo.class
        ));
    }

    private static void assertCustomerListPermission(Method method) {
        SaCheckPermission permission = method.getAnnotation(SaCheckPermission.class);

        assertNotNull(permission);
        assertEquals("yy:customer:list", permission.value()[0]);
    }
}
