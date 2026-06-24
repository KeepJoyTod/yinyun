package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyCouponScaffoldVo;
import org.dromara.yy.service.IYyCouponTemplateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/couponTemplate")
public class YyCouponTemplateController {

    private final IYyCouponTemplateService couponTemplateService;

    @SaCheckPermission("yy:order:list")
    @GetMapping("/scaffold")
    public R<YyCouponScaffoldVo> scaffold() {
        return R.ok(couponTemplateService.getCouponScaffold());
    }
}
