package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.dev33.satoken.annotation.SaIgnore;
import org.dromara.yy.service.IYyOrderPaymentEntryService;
import org.dromara.yy.service.IYyWechatPaymentNotifyService;
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
class YyPaymentEntryControllerTest {

    @Mock
    private IYyOrderPaymentEntryService orderPaymentEntryService;

    @Mock
    private IYyWechatPaymentNotifyService wechatPaymentNotifyService;

    @Test
    void wechatNotifyEndpointShouldBePublic() throws NoSuchMethodException {
        Method method = YyWechatPaymentNotifyController.class.getDeclaredMethod("notify", String.class, java.util.Map.class, jakarta.servlet.http.HttpServletRequest.class);
        assertNotNull(YyWechatPaymentNotifyController.class.getAnnotation(SaIgnore.class));
        assertNotNull(method);
    }

    @Test
    void confirmPaymentEndpointShouldRequireOrderEditPermission() throws NoSuchMethodException {
        Method method = YyOrderPaymentController.class.getDeclaredMethod("confirmPayment", Long.class, org.dromara.yy.domain.bo.YyOrderPaymentConfirmBo.class);
        SaCheckPermission permission = method.getAnnotation(SaCheckPermission.class);

        assertNotNull(permission);
        assertEquals("yy:order:edit", permission.value()[0]);
    }
}
