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
import org.dromara.yy.domain.bo.YyEmployeeStoreBo;
import org.dromara.yy.domain.vo.YyEmployeeStoreVo;
import org.dromara.yy.service.IYyEmployeeStoreService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 员工-门店关联管理
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/employeeStore")
public class YyEmployeeStoreController extends BaseController {

    private final IYyEmployeeStoreService yyEmployeeStoreService;

    @SaCheckPermission("yy:employeeStore:list")
    @GetMapping("/list")
    public TableDataInfo<YyEmployeeStoreVo> list(YyEmployeeStoreBo bo, PageQuery pageQuery) {
        return yyEmployeeStoreService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:employeeStore:export")
    @Log(title = "员工-门店关联管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyEmployeeStoreBo bo, HttpServletResponse response) {
        List<YyEmployeeStoreVo> list = yyEmployeeStoreService.queryList(bo);
        ExcelUtil.exportExcel(list, "员工-门店关联管理", YyEmployeeStoreVo.class, response);
    }

    @SaCheckPermission("yy:employeeStore:query")
    @GetMapping("/{id}")
    public R<YyEmployeeStoreVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyEmployeeStoreService.queryById(id));
    }

    @SaCheckPermission("yy:employeeStore:add")
    @Log(title = "员工-门店关联管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyEmployeeStoreBo bo) {
        return toAjax(yyEmployeeStoreService.insertByBo(bo));
    }

    @SaCheckPermission("yy:employeeStore:edit")
    @Log(title = "员工-门店关联管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyEmployeeStoreBo bo) {
        return toAjax(yyEmployeeStoreService.updateByBo(bo));
    }

    @SaCheckPermission("yy:employeeStore:remove")
    @Log(title = "员工-门店关联管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyEmployeeStoreService.deleteWithValidByIds(List.of(ids), true));
    }
}
