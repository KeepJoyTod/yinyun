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
import org.dromara.yy.domain.bo.YyProductDisplayConfigBo;
import org.dromara.yy.domain.vo.YyProductDisplayConfigVo;
import org.dromara.yy.service.IYyProductDisplayConfigService;
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
@RequestMapping("/yy/productDisplayConfig")
public class YyProductDisplayConfigController extends BaseController {
    private final IYyProductDisplayConfigService productDisplayConfigService;

    @SaCheckPermission("yy:product:list")
    @GetMapping("/list")
    public TableDataInfo<YyProductDisplayConfigVo> list(YyProductDisplayConfigBo bo, PageQuery pageQuery) {
        return productDisplayConfigService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:product:query")
    @GetMapping("/{id}")
    public R<YyProductDisplayConfigVo> getInfo(@NotNull(message = "id cannot be null") @PathVariable Long id) {
        return R.ok(productDisplayConfigService.queryById(id));
    }

    @SaCheckPermission("yy:product:add")
    @Log(title = "product display config", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyProductDisplayConfigBo bo) {
        return toAjax(productDisplayConfigService.insertByBo(bo));
    }

    @SaCheckPermission("yy:product:edit")
    @Log(title = "product display config", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyProductDisplayConfigBo bo) {
        return toAjax(productDisplayConfigService.updateByBo(bo));
    }

    @SaCheckPermission("yy:product:remove")
    @Log(title = "product display config", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "ids cannot be empty") @PathVariable Long[] ids) {
        return toAjax(productDisplayConfigService.deleteWithValidByIds(List.of(ids), true));
    }
}
