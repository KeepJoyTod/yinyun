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
import org.dromara.yy.domain.bo.YyProductBo;
import org.dromara.yy.domain.vo.YyProductVo;
import org.dromara.yy.service.IYyProductService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 产品管理
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/product")
public class YyProductController extends BaseController {

    private final IYyProductService yyProductService;

    /**
     * 查询产品管理列表
     */
    @SaCheckPermission("yy:product:list")
    @GetMapping("/list")
    public TableDataInfo<YyProductVo> list(YyProductBo bo, PageQuery pageQuery) {
        return yyProductService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出产品管理列表
     */
    @SaCheckPermission("yy:product:export")
    @Log(title = "产品管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyProductBo bo, HttpServletResponse response) {
        List<YyProductVo> list = yyProductService.queryList(bo);
        ExcelUtil.exportExcel(list, "产品管理", YyProductVo.class, response);
    }

    /**
     * 获取产品管理详细信息
     */
    @SaCheckPermission("yy:product:query")
    @GetMapping("/{id}")
    public R<YyProductVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyProductService.queryById(id));
    }

    /**
     * 新增产品管理
     */
    @SaCheckPermission("yy:product:add")
    @Log(title = "产品管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyProductBo bo) {
        return toAjax(yyProductService.insertByBo(bo));
    }

    /**
     * 修改产品管理
     */
    @SaCheckPermission("yy:product:edit")
    @Log(title = "产品管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyProductBo bo) {
        return toAjax(yyProductService.updateByBo(bo));
    }

    /**
     * 删除产品管理
     */
    @SaCheckPermission("yy:product:remove")
    @Log(title = "产品管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyProductService.deleteWithValidByIds(List.of(ids), true));
    }
}
