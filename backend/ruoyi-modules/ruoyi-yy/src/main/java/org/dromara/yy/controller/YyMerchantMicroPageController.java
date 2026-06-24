package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotEmpty;
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
import org.dromara.yy.domain.bo.YyMerchantMicroPageBo;
import org.dromara.yy.domain.vo.YyMerchantMicroPageVo;
import org.dromara.yy.service.IYyMerchantMicroPageService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/microPage")
public class YyMerchantMicroPageController extends BaseController {

    private final IYyMerchantMicroPageService yyMerchantMicroPageService;

    @SaCheckPermission("yy:microPage:list")
    @GetMapping("/list")
    public TableDataInfo<YyMerchantMicroPageVo> list(YyMerchantMicroPageBo bo, PageQuery pageQuery) {
        return yyMerchantMicroPageService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:microPage:list")
    @GetMapping("/{id}")
    public R<YyMerchantMicroPageVo> getInfo(@NotNull(message = "id is required") @PathVariable Long id) {
        return R.ok(yyMerchantMicroPageService.queryById(id));
    }

    @SaCheckPermission("yy:microPage:add")
    @Log(title = "Merchant Micro Page", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyMerchantMicroPageBo bo) {
        return toAjax(yyMerchantMicroPageService.insertByBo(bo));
    }

    @SaCheckPermission("yy:microPage:edit")
    @Log(title = "Merchant Micro Page", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyMerchantMicroPageBo bo) {
        return toAjax(yyMerchantMicroPageService.updateByBo(bo));
    }

    @SaCheckPermission("yy:microPage:publish")
    @Log(title = "Merchant Micro Page", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/publish")
    public R<YyMerchantMicroPageVo> publish(@NotNull(message = "id is required") @PathVariable Long id) {
        return R.ok(yyMerchantMicroPageService.publish(id));
    }

    @SaCheckPermission("yy:microPage:publish")
    @Log(title = "Merchant Micro Page", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/offline")
    public R<YyMerchantMicroPageVo> offline(@NotNull(message = "id is required") @PathVariable Long id) {
        return R.ok(yyMerchantMicroPageService.offline(id));
    }

    @SaCheckPermission("yy:microPage:remove")
    @Log(title = "Merchant Micro Page", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "id is required") @PathVariable Long[] ids) {
        return toAjax(yyMerchantMicroPageService.deleteWithValidByIds(List.of(ids), true));
    }
}
