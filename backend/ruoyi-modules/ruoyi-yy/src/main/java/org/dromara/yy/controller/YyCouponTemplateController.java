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
import org.dromara.yy.domain.bo.YyCouponIssueBo;
import org.dromara.yy.domain.bo.YyCouponTemplateBo;
import org.dromara.yy.domain.vo.YyCouponScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingCouponGrantRecordVo;
import org.dromara.yy.domain.vo.YyMarketingCouponInstanceVo;
import org.dromara.yy.domain.vo.YyMarketingCouponTemplateVo;
import org.dromara.yy.domain.vo.YyMarketingCouponWriteoffVo;
import org.dromara.yy.service.IYyCouponTemplateService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/couponTemplate")
public class YyCouponTemplateController extends BaseController {

    private final IYyCouponTemplateService couponTemplateService;

    @SaCheckPermission("yy:order:list")
    @GetMapping("/scaffold")
    public R<YyCouponScaffoldVo> scaffold() {
        return R.ok(couponTemplateService.getCouponScaffold());
    }

    @SaCheckPermission("yy:order:list")
    @GetMapping("/list")
    public TableDataInfo<YyMarketingCouponTemplateVo> list(YyCouponTemplateBo bo, PageQuery pageQuery) {
        return couponTemplateService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:order:list")
    @GetMapping("/{id}/grants")
    public R<List<YyMarketingCouponGrantRecordVo>> grants(@PathVariable Long id) {
        return R.ok(couponTemplateService.listGrantRecords(id));
    }

    @SaCheckPermission("yy:order:list")
    @GetMapping("/{id}/instances")
    public R<List<YyMarketingCouponInstanceVo>> instances(@PathVariable Long id) {
        return R.ok(couponTemplateService.listInstances(id));
    }

    @SaCheckPermission("yy:order:list")
    @GetMapping("/{id}/writeoffs")
    public R<List<YyMarketingCouponWriteoffVo>> writeoffs(@PathVariable Long id) {
        return R.ok(couponTemplateService.listWriteoffs(id));
    }

    @SaCheckPermission("yy:order:list")
    @Log(title = "营销券模板", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyCouponTemplateBo bo) {
        return toAjax(couponTemplateService.insertByBo(bo));
    }

    @SaCheckPermission("yy:order:list")
    @Log(title = "营销券模板", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyCouponTemplateBo bo) {
        return toAjax(couponTemplateService.updateByBo(bo));
    }

    @SaCheckPermission("yy:order:list")
    @Log(title = "营销发券", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping("/{id}/issue")
    public R<Void> issue(@NotNull(message = "券模板ID不能为空") @PathVariable Long id, @Validated @RequestBody YyCouponIssueBo bo) {
        bo.setTemplateId(id);
        return toAjax(couponTemplateService.issueCoupons(id, bo));
    }
}
