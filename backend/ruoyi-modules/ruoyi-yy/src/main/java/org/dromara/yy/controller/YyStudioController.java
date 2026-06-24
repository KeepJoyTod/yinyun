package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.vo.YyStudioBootstrapVo;
import org.dromara.yy.service.IYyStudioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 门店工作台启动接口。
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/studio")
public class YyStudioController {

    private final IYyStudioService studioService;

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/bootstrap")
    public R<YyStudioBootstrapVo> bootstrap() {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null) {
            throw new ServiceException("登录状态已失效");
        }
        boolean globalStoreScope = LoginHelper.isSuperAdmin() || LoginHelper.isTenantAdmin();
        return R.ok(studioService.bootstrap(loginUser, globalStoreScope));
    }
}
