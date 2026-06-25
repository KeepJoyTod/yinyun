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
import org.dromara.yy.domain.bo.YyProductChannelConfigBo;
import org.dromara.yy.domain.vo.YyProductChannelConfigVo;
import org.dromara.yy.service.IYyProductChannelConfigService;
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
@RequestMapping("/yy/productChannelConfig")
public class YyProductChannelConfigController extends BaseController {
    private final IYyProductChannelConfigService productChannelConfigService;

    @SaCheckPermission("yy:channel:list")
    @GetMapping("/list")
    public TableDataInfo<YyProductChannelConfigVo> list(YyProductChannelConfigBo bo, PageQuery pageQuery) {
        return productChannelConfigService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:channel:query")
    @GetMapping("/{id}")
    public R<YyProductChannelConfigVo> getInfo(@NotNull(message = "id cannot be null") @PathVariable Long id) {
        return R.ok(productChannelConfigService.queryById(id));
    }

    @SaCheckPermission("yy:channel:add")
    @Log(title = "product channel config", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyProductChannelConfigBo bo) {
        return toAjax(productChannelConfigService.insertByBo(bo));
    }

    @SaCheckPermission("yy:channel:edit")
    @Log(title = "product channel config", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyProductChannelConfigBo bo) {
        return toAjax(productChannelConfigService.updateByBo(bo));
    }

    @SaCheckPermission("yy:channel:remove")
    @Log(title = "product channel config", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "ids cannot be empty") @PathVariable Long[] ids) {
        return toAjax(productChannelConfigService.deleteWithValidByIds(List.of(ids), true));
    }
}
