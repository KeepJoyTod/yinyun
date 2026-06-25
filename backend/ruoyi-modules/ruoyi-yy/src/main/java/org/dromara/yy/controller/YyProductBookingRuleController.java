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
import org.dromara.yy.domain.bo.YyProductBookingRuleBo;
import org.dromara.yy.domain.vo.YyProductBookingRuleVo;
import org.dromara.yy.service.IYyProductBookingRuleService;
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
@RequestMapping("/yy/productBookingRule")
public class YyProductBookingRuleController extends BaseController {
    private final IYyProductBookingRuleService productBookingRuleService;

    @SaCheckPermission("yy:product:list")
    @GetMapping("/list")
    public TableDataInfo<YyProductBookingRuleVo> list(YyProductBookingRuleBo bo, PageQuery pageQuery) {
        return productBookingRuleService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:product:query")
    @GetMapping("/{id}")
    public R<YyProductBookingRuleVo> getInfo(@NotNull(message = "id cannot be null") @PathVariable Long id) {
        return R.ok(productBookingRuleService.queryById(id));
    }

    @SaCheckPermission("yy:product:add")
    @Log(title = "product booking rule", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyProductBookingRuleBo bo) {
        return toAjax(productBookingRuleService.insertByBo(bo));
    }

    @SaCheckPermission("yy:product:edit")
    @Log(title = "product booking rule", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyProductBookingRuleBo bo) {
        return toAjax(productBookingRuleService.updateByBo(bo));
    }

    @SaCheckPermission("yy:product:remove")
    @Log(title = "product booking rule", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "ids cannot be empty") @PathVariable Long[] ids) {
        return toAjax(productBookingRuleService.deleteWithValidByIds(List.of(ids), true));
    }
}
