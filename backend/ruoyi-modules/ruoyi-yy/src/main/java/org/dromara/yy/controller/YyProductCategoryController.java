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
import org.dromara.yy.domain.bo.YyProductCategoryBo;
import org.dromara.yy.domain.vo.YyProductCategoryVo;
import org.dromara.yy.service.IYyProductCategoryService;
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
@RequestMapping("/yy/productCategory")
public class YyProductCategoryController extends BaseController {
    private final IYyProductCategoryService productCategoryService;

    @SaCheckPermission("yy:product:list")
    @GetMapping("/list")
    public TableDataInfo<YyProductCategoryVo> list(YyProductCategoryBo bo, PageQuery pageQuery) {
        return productCategoryService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:product:query")
    @GetMapping("/{id}")
    public R<YyProductCategoryVo> getInfo(@NotNull(message = "id cannot be null") @PathVariable Long id) {
        return R.ok(productCategoryService.queryById(id));
    }

    @SaCheckPermission("yy:product:add")
    @Log(title = "product category", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyProductCategoryBo bo) {
        return toAjax(productCategoryService.insertByBo(bo));
    }

    @SaCheckPermission("yy:product:edit")
    @Log(title = "product category", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyProductCategoryBo bo) {
        return toAjax(productCategoryService.updateByBo(bo));
    }

    @SaCheckPermission("yy:product:remove")
    @Log(title = "product category", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "ids cannot be empty") @PathVariable Long[] ids) {
        return toAjax(productCategoryService.deleteWithValidByIds(List.of(ids), true));
    }
}
