package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.bo.YyAccountProfileBo;
import org.dromara.yy.domain.vo.YyAccountBrandVo;
import org.dromara.yy.domain.vo.YyAccountProfileVo;
import org.dromara.yy.domain.vo.YyHelpCenterArticleVo;
import org.dromara.yy.service.IYyAccountCenterService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/account-center")
public class YyAccountCenterController {

    private final IYyAccountCenterService yyAccountCenterService;

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/profile")
    public R<YyAccountProfileVo> profile() {
        return R.ok(yyAccountCenterService.getProfile());
    }

    @SaCheckPermission("yy:dashboard:list")
    @PutMapping("/profile")
    public R<YyAccountProfileVo> updateProfile(@Validated @RequestBody YyAccountProfileBo bo) {
        return R.ok(yyAccountCenterService.updateProfile(bo));
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/brands")
    public R<List<YyAccountBrandVo>> brands() {
        return R.ok(yyAccountCenterService.listBrands());
    }

    @SaCheckPermission("yy:dashboard:list")
    @PutMapping("/brands/{brandId}/switch")
    public R<List<YyAccountBrandVo>> switchBrand(@PathVariable String brandId) {
        return R.ok(yyAccountCenterService.switchBrand(brandId));
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/help/articles")
    public R<List<YyHelpCenterArticleVo>> helpArticles(@RequestParam(required = false) String keyword) {
        return R.ok(yyAccountCenterService.listHelpArticles(keyword));
    }
}
