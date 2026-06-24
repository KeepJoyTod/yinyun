package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.ratelimiter.annotation.RateLimiter;
import org.dromara.common.ratelimiter.enums.LimitType;
import org.dromara.yy.domain.vo.YyMerchantMicroPagePublicVo;
import org.dromara.yy.service.IYyMerchantMicroPageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SaIgnore
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/client/micro-page")
public class YyClientMicroPageController {

    private final IYyMerchantMicroPageService yyMerchantMicroPageService;

    @GetMapping("/{id}")
    @RateLimiter(time = 60, count = 120, limitType = LimitType.IP)
    public R<YyMerchantMicroPagePublicVo> getInfo(@PathVariable String id) {
        return R.ok(yyMerchantMicroPageService.publicPage(id));
    }
}
