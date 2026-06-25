package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyCampaignParticipationBo;
import org.dromara.yy.domain.vo.YyCampaignParticipationScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingParticipationRowVo;
import org.dromara.yy.service.IYyCampaignParticipationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/campaignParticipation")
public class YyCampaignParticipationController {

    private final IYyCampaignParticipationService participationService;

    @SaCheckPermission("yy:order:list")
    @GetMapping("/scaffold")
    public R<List<YyCampaignParticipationScaffoldVo>> scaffold() {
        return R.ok(participationService.listScaffold());
    }

    @SaCheckPermission("yy:order:list")
    @GetMapping("/list")
    public TableDataInfo<YyMarketingParticipationRowVo> list(YyCampaignParticipationBo bo, PageQuery pageQuery) {
        return participationService.queryPageList(bo, pageQuery);
    }
}
