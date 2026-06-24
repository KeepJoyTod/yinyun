package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.vo.YyStudioBootstrapVo;
import org.dromara.yy.service.IYyStudioService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyStudioControllerTest {

    @Mock
    private IYyStudioService studioService;

    @Test
    void bootstrapShouldDelegateAuthenticatedContext() {
        YyStudioBootstrapVo expected = new YyStudioBootstrapVo();
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(100L);
        YyStudioController controller = new YyStudioController(studioService);
        when(studioService.bootstrap(loginUser, true)).thenReturn(expected);

        try (MockedStatic<LoginHelper> loginHelper = org.mockito.Mockito.mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(true);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);

            assertEquals(expected, controller.bootstrap().getData());
        }

        verify(studioService).bootstrap(loginUser, true);
    }

    @Test
    void bootstrapEndpointShouldRequireDashboardPermission() throws NoSuchMethodException {
        Method method = YyStudioController.class.getDeclaredMethod("bootstrap");
        SaCheckPermission permission = method.getAnnotation(SaCheckPermission.class);

        assertNotNull(permission);
        assertEquals("yy:dashboard:list", permission.value()[0]);
    }
}
