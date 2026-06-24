package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyMarketingCapabilityVo;
import org.dromara.yy.service.IYyMarketingCapabilityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/marketingCapability")
public class YyMarketingCapabilityController {

    private final IYyMarketingCapabilityService capabilityService;

    @SaCheckPermission("yy:order:list")
    @GetMapping("/list")
    public R<List<YyMarketingCapabilityVo>> list() {
        return R.ok(capabilityService.listCapabilities());
    }
}
