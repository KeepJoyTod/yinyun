package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyCampaignBo;
import org.dromara.yy.domain.bo.YyCampaignProductBindBo;
import org.dromara.yy.domain.vo.YyCampaignScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingCampaignVo;
import org.dromara.yy.domain.vo.YyMarketingDashboardVo;
import org.dromara.yy.service.IYyCampaignService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/campaign")
public class YyCampaignController extends BaseController {

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

    @SaCheckPermission("yy:order:list")
    @GetMapping("/list")
    public TableDataInfo<YyMarketingCampaignVo> list(YyCampaignBo bo, PageQuery pageQuery) {
        return campaignService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:order:list")
    @Log(title = "营销活动", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyCampaignBo bo) {
        return toAjax(campaignService.insertByBo(bo));
    }

    @SaCheckPermission("yy:order:list")
    @Log(title = "营销活动", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyCampaignBo bo) {
        return toAjax(campaignService.updateByBo(bo));
    }

    @SaCheckPermission("yy:order:list")
    @PostMapping("/{id}/online")
    public R<Void> online(@NotNull(message = "活动ID不能为空") @PathVariable Long id) {
        return toAjax(campaignService.online(id));
    }

    @SaCheckPermission("yy:order:list")
    @PostMapping("/{id}/offline")
    public R<Void> offline(@NotNull(message = "活动ID不能为空") @PathVariable Long id) {
        return toAjax(campaignService.offline(id));
    }

    @SaCheckPermission("yy:order:list")
    @PutMapping("/{id}/products")
    public R<Void> bindProducts(@NotNull(message = "活动ID不能为空") @PathVariable Long id, @Validated @RequestBody YyCampaignProductBindBo bo) {
        return toAjax(campaignService.bindProducts(id, bo));
    }
}
