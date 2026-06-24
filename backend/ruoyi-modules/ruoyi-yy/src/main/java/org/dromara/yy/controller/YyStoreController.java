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
import org.dromara.yy.domain.bo.YyStoreBo;
import org.dromara.yy.domain.vo.YyStoreVo;
import org.dromara.yy.service.IYyStoreService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 门店管理
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/store")
public class YyStoreController extends BaseController {

    private final IYyStoreService yyStoreService;

    /**
     * 查询门店管理列表
     */
    @SaCheckPermission("yy:store:list")
    @GetMapping("/list")
    public TableDataInfo<YyStoreVo> list(YyStoreBo bo, PageQuery pageQuery) {
        return yyStoreService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出门店管理列表
     */
    @SaCheckPermission("yy:store:export")
    @Log(title = "门店管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyStoreBo bo, HttpServletResponse response) {
        List<YyStoreVo> list = yyStoreService.queryList(bo);
        ExcelUtil.exportExcel(list, "门店管理", YyStoreVo.class, response);
    }

    /**
     * 获取门店管理详细信息
     */
    @SaCheckPermission("yy:store:query")
    @GetMapping("/{id}")
    public R<YyStoreVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyStoreService.queryById(id));
    }

    /**
     * 新增门店管理
     */
    @SaCheckPermission("yy:store:add")
    @Log(title = "门店管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyStoreBo bo) {
        return toAjax(yyStoreService.insertByBo(bo));
    }

    /**
     * 修改门店管理
     */
    @SaCheckPermission("yy:store:edit")
    @Log(title = "门店管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyStoreBo bo) {
        return toAjax(yyStoreService.updateByBo(bo));
    }

    /**
     * 删除门店管理
     */
    @SaCheckPermission("yy:store:remove")
    @Log(title = "门店管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyStoreService.deleteWithValidByIds(List.of(ids), true));
    }
}
