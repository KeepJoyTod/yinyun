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
import org.dromara.yy.domain.bo.YyEmployeeBo;
import org.dromara.yy.domain.vo.YyEmployeeVo;
import org.dromara.yy.service.IYyEmployeeService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 员工管理
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/employee")
public class YyEmployeeController extends BaseController {

    private final IYyEmployeeService yyEmployeeService;

    @SaCheckPermission("yy:employee:list")
    @GetMapping("/list")
    public TableDataInfo<YyEmployeeVo> list(YyEmployeeBo bo, PageQuery pageQuery) {
        return yyEmployeeService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:employee:export")
    @Log(title = "员工管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyEmployeeBo bo, HttpServletResponse response) {
        List<YyEmployeeVo> list = yyEmployeeService.queryList(bo);
        ExcelUtil.exportExcel(list, "员工管理", YyEmployeeVo.class, response);
    }

    @SaCheckPermission("yy:employee:query")
    @GetMapping("/{id}")
    public R<YyEmployeeVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyEmployeeService.queryById(id));
    }

    @SaCheckPermission("yy:employee:add")
    @Log(title = "员工管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyEmployeeBo bo) {
        return toAjax(yyEmployeeService.insertByBo(bo));
    }

    @SaCheckPermission("yy:employee:edit")
    @Log(title = "员工管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyEmployeeBo bo) {
        return toAjax(yyEmployeeService.updateByBo(bo));
    }

    @SaCheckPermission("yy:employee:remove")
    @Log(title = "员工管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyEmployeeService.deleteWithValidByIds(List.of(ids), true));
    }
}
