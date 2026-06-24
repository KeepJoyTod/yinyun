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
import org.dromara.yy.domain.bo.YyServiceGroupBo;
import org.dromara.yy.domain.vo.YyServiceGroupVo;
import org.dromara.yy.service.IYyServiceGroupService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 服务组管理
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/serviceGroup")
public class YyServiceGroupController extends BaseController {

    private final IYyServiceGroupService yyServiceGroupService;

    @SaCheckPermission("yy:bookingConfig:list")
    @GetMapping("/list")
    public TableDataInfo<YyServiceGroupVo> list(YyServiceGroupBo bo, PageQuery pageQuery) {
        return yyServiceGroupService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:bookingConfig:export")
    @Log(title = "服务组管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyServiceGroupBo bo, HttpServletResponse response) {
        List<YyServiceGroupVo> list = yyServiceGroupService.queryList(bo);
        ExcelUtil.exportExcel(list, "服务组管理", YyServiceGroupVo.class, response);
    }

    @SaCheckPermission("yy:bookingConfig:query")
    @GetMapping("/{id}")
    public R<YyServiceGroupVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyServiceGroupService.queryById(id));
    }

    @SaCheckPermission("yy:bookingConfig:add")
    @Log(title = "服务组管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyServiceGroupBo bo) {
        return toAjax(yyServiceGroupService.insertByBo(bo));
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "服务组管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyServiceGroupBo bo) {
        return toAjax(yyServiceGroupService.updateByBo(bo));
    }

    @SaCheckPermission("yy:bookingConfig:remove")
    @Log(title = "服务组管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyServiceGroupService.deleteWithValidByIds(List.of(ids), true));
    }
}
