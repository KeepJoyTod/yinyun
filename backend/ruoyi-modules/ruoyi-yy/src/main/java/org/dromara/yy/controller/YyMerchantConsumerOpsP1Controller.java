package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyMerchantConsumerOpsP1OverviewVo;
import org.dromara.yy.service.IYyMerchantConsumerOpsP1Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/merchant/consumer-ops-p1")
public class YyMerchantConsumerOpsP1Controller {

    private final IYyMerchantConsumerOpsP1Service yyMerchantConsumerOpsP1Service;

    @SaCheckPermission("yy:store:list")
    @GetMapping("/overview")
    public R<YyMerchantConsumerOpsP1OverviewVo> overview() {
        return R.ok(yyMerchantConsumerOpsP1Service.overview());
    }
}
