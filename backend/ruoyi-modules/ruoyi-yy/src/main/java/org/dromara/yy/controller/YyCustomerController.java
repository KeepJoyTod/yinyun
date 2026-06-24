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
import org.dromara.yy.domain.bo.YyCustomerBo;
import org.dromara.yy.domain.vo.YyCustomerVo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.service.IYyCustomerService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客户管理
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/customer")
public class YyCustomerController extends BaseController {

    private final IYyCustomerService yyCustomerService;

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/list")
    public TableDataInfo<YyCustomerVo> list(YyCustomerBo bo, PageQuery pageQuery) {
        return yyCustomerService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:customer:export")
    @Log(title = "客户管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyCustomerBo bo, HttpServletResponse response) {
        List<YyCustomerVo> list = yyCustomerService.queryList(bo);
        ExcelUtil.exportExcel(list, "客户管理", YyCustomerVo.class, response);
    }

    @SaCheckPermission("yy:customer:query")
    @GetMapping("/{id}")
    public R<YyCustomerVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyCustomerService.queryById(id));
    }

    @SaCheckPermission("yy:customer:query")
    @GetMapping("/{id}/orders")
    public R<List<YyOrderVo>> recentOrders(@NotNull(message = "主键不能为空") @PathVariable Long id,
                                           @RequestParam(defaultValue = "5") int limit) {
        return R.ok(yyCustomerService.queryRecentOrdersByCustomerId(id, limit));
    }

    @SaCheckPermission("yy:customer:add")
    @Log(title = "客户管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyCustomerBo bo) {
        return toAjax(yyCustomerService.insertByBo(bo));
    }

    @SaCheckPermission("yy:customer:edit")
    @Log(title = "客户管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyCustomerBo bo) {
        return toAjax(yyCustomerService.updateByBo(bo));
    }

    @SaCheckPermission("yy:customer:remove")
    @Log(title = "客户管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyCustomerService.deleteWithValidByIds(List.of(ids), true));
    }
}
