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
import org.dromara.yy.domain.bo.YyReportSnapshotBo;
import org.dromara.yy.domain.vo.YyReportSnapshotVo;
import org.dromara.yy.service.IYyReportSnapshotService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 经营报表快照
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/reportSnapshot")
public class YyReportSnapshotController extends BaseController {

    private final IYyReportSnapshotService yyReportSnapshotService;

    @SaCheckPermission("yy:report:list")
    @GetMapping("/list")
    public TableDataInfo<YyReportSnapshotVo> list(YyReportSnapshotBo bo, PageQuery pageQuery) {
        return yyReportSnapshotService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:report:export")
    @Log(title = "经营报表快照", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyReportSnapshotBo bo, HttpServletResponse response) {
        List<YyReportSnapshotVo> list = yyReportSnapshotService.queryList(bo);
        ExcelUtil.exportExcel(list, "经营报表快照", YyReportSnapshotVo.class, response);
    }

    @SaCheckPermission("yy:report:query")
    @GetMapping("/{id}")
    public R<YyReportSnapshotVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyReportSnapshotService.queryById(id));
    }

    @SaCheckPermission("yy:report:add")
    @Log(title = "经营报表快照", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyReportSnapshotBo bo) {
        return toAjax(yyReportSnapshotService.insertByBo(bo));
    }

    @SaCheckPermission("yy:report:edit")
    @Log(title = "经营报表快照", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyReportSnapshotBo bo) {
        return toAjax(yyReportSnapshotService.updateByBo(bo));
    }

    @SaCheckPermission("yy:report:remove")
    @Log(title = "经营报表快照", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyReportSnapshotService.deleteWithValidByIds(List.of(ids), true));
    }
}
