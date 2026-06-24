package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyMobileChannelConfigBo;
import org.dromara.yy.domain.vo.YyMobileChannelConfigVo;
import org.dromara.yy.service.IYyMobileChannelConfigService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 多端预约入口配置
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/mobileChannelConfig")
public class YyMobileChannelConfigController extends BaseController {

    private final IYyMobileChannelConfigService yyMobileChannelConfigService;

    @SaCheckPermission("yy:mobile:list")
    @GetMapping("/list")
    public TableDataInfo<YyMobileChannelConfigVo> list(YyMobileChannelConfigBo bo, PageQuery pageQuery) {
        return yyMobileChannelConfigService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:mobile:export")
    @Log(title = "多端预约入口配置", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyMobileChannelConfigBo bo, HttpServletResponse response) {
        List<YyMobileChannelConfigVo> list = yyMobileChannelConfigService.queryList(bo);
        ExcelUtil.exportExcel(list, "多端预约入口配置", YyMobileChannelConfigVo.class, response);
    }

    @SaCheckPermission("yy:mobile:query")
    @GetMapping("/{id}")
    public R<YyMobileChannelConfigVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyMobileChannelConfigService.queryById(id));
    }

    @SaCheckPermission("yy:mobile:add")
    @Log(title = "多端预约入口配置", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyMobileChannelConfigBo bo) {
        return toAjax(yyMobileChannelConfigService.insertByBo(bo));
    }

    @SaCheckPermission("yy:mobile:edit")
    @Log(title = "多端预约入口配置", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyMobileChannelConfigBo bo) {
        return toAjax(yyMobileChannelConfigService.updateByBo(bo));
    }

    @SaCheckPermission("yy:mobile:remove")
    @Log(title = "多端预约入口配置", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyMobileChannelConfigService.deleteWithValidByIds(List.of(ids), true));
    }
}
