package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyCampaignScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingDashboardVo;
import org.dromara.yy.service.IYyCampaignService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/campaign")
public class YyCampaignController {

    private final IYyCampaignService campaignService;

    @SaCheckPermission("yy:order:list")
    @GetMapping("/scaffold")
    public R<YyCampaignScaffoldVo> scaffold() {
        return R.ok(campaignService.getCampaignScaffold());
    }

    @SaCheckPermission("yy:order:list")
    @GetMapping("/dashboard")
    public R<YyMarketingDashboardVo> dashboard() {
        return R.ok(campaignService.getMarketingDashboard());
    }
}
