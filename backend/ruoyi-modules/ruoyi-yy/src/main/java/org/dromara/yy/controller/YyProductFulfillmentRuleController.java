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
import org.dromara.yy.domain.bo.YyProductFulfillmentRuleBo;
import org.dromara.yy.domain.vo.YyProductFulfillmentRuleVo;
import org.dromara.yy.service.IYyProductFulfillmentRuleService;
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
@RequestMapping("/yy/productFulfillmentRule")
public class YyProductFulfillmentRuleController extends BaseController {
    private final IYyProductFulfillmentRuleService productFulfillmentRuleService;

    @SaCheckPermission("yy:product:list")
    @GetMapping("/list")
    public TableDataInfo<YyProductFulfillmentRuleVo> list(YyProductFulfillmentRuleBo bo, PageQuery pageQuery) {
        return productFulfillmentRuleService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:product:query")
    @GetMapping("/{id}")
    public R<YyProductFulfillmentRuleVo> getInfo(@NotNull(message = "id cannot be null") @PathVariable Long id) {
        return R.ok(productFulfillmentRuleService.queryById(id));
    }

    @SaCheckPermission("yy:product:add")
    @Log(title = "product fulfillment rule", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyProductFulfillmentRuleBo bo) {
        return toAjax(productFulfillmentRuleService.insertByBo(bo));
    }

    @SaCheckPermission("yy:product:edit")
    @Log(title = "product fulfillment rule", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyProductFulfillmentRuleBo bo) {
        return toAjax(productFulfillmentRuleService.updateByBo(bo));
    }

    @SaCheckPermission("yy:product:remove")
    @Log(title = "product fulfillment rule", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "ids cannot be empty") @PathVariable Long[] ids) {
        return toAjax(productFulfillmentRuleService.deleteWithValidByIds(List.of(ids), true));
    }
}
