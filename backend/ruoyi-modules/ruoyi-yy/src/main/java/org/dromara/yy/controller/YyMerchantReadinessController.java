package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyMerchantReadinessItemVo;
import org.dromara.yy.service.IYyMerchantReadinessService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/merchant/readiness")
public class YyMerchantReadinessController {

    private final IYyMerchantReadinessService yyMerchantReadinessService;

    @SaCheckPermission("yy:store:list")
    @GetMapping("/summary")
    public R<List<YyMerchantReadinessItemVo>> summary() {
        return R.ok(yyMerchantReadinessService.summary());
    }

    @SaCheckPermission("yy:bookingInventory:list")
    @GetMapping("/schedule")
    public R<List<YyMerchantReadinessItemVo>> schedule() {
        return R.ok(yyMerchantReadinessService.schedule());
    }

    @SaCheckPermission("yy:store:list")
    @GetMapping("/channels")
    public R<List<YyMerchantReadinessItemVo>> channels() {
        return R.ok(yyMerchantReadinessService.channels());
    }

    @SaCheckPermission("yy:store:list")
    @GetMapping("/governance")
    public R<List<YyMerchantReadinessItemVo>> governance() {
        return R.ok(yyMerchantReadinessService.governance());
    }

    @SaCheckPermission("yy:store:list")
    @GetMapping("/dependencies")
    public R<List<YyMerchantReadinessItemVo>> dependencies() {
        return R.ok(yyMerchantReadinessService.dependencies());
    }
}
