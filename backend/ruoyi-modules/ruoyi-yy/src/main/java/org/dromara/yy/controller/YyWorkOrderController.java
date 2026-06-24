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
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyWorkOrderBo;
import org.dromara.yy.domain.bo.YyWorkOrderTransitionBo;
import org.dromara.yy.domain.vo.YyWorkOrderEventVo;
import org.dromara.yy.domain.vo.YyWorkOrderVo;
import org.dromara.yy.service.IYyWorkOrderService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工单
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/workOrder")
public class YyWorkOrderController extends BaseController {

    private final IYyWorkOrderService yyWorkOrderService;

    @SaCheckPermission("yy:workOrder:list")
    @GetMapping("/list")
    public TableDataInfo<YyWorkOrderVo> list(YyWorkOrderBo bo, PageQuery pageQuery) {
        return yyWorkOrderService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:workOrder:export")
    @Log(title = "工单", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyWorkOrderBo bo, HttpServletResponse response) {
        List<YyWorkOrderVo> list = yyWorkOrderService.queryList(bo);
        ExcelUtil.exportExcel(list, "工单", YyWorkOrderVo.class, response);
    }

    @SaCheckPermission("yy:workOrder:query")
    @GetMapping("/{id}")
    public R<YyWorkOrderVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyWorkOrderService.queryById(id));
    }

    @SaCheckPermission("yy:workOrder:query")
    @GetMapping("/{id}/events")
    public R<List<YyWorkOrderEventVo>> events(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyWorkOrderService.queryEventList(id));
    }

    @SaCheckPermission("yy:workOrder:edit")
    @Log(title = "工单状态流转", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/transition")
    public R<YyWorkOrderVo> transition(@NotNull(message = "主键不能为空") @PathVariable Long id,
                                       @Validated @RequestBody YyWorkOrderTransitionBo bo) {
        return R.ok(yyWorkOrderService.transitionStatus(id, bo.getExpectedStatus(), bo.getTargetStatus(), bo.getRemark()));
    }

    @SaCheckPermission("yy:workOrder:add")
    @Log(title = "工单", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyWorkOrderBo bo) {
        return toAjax(yyWorkOrderService.insertByBo(bo));
    }

    @SaCheckPermission("yy:workOrder:edit")
    @Log(title = "工单", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyWorkOrderBo bo) {
        return toAjax(yyWorkOrderService.updateByBo(bo));
    }

    @SaCheckPermission("yy:workOrder:remove")
    @Log(title = "工单", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyWorkOrderService.deleteWithValidByIds(List.of(ids), true));
    }
}
