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
import org.dromara.yy.domain.bo.YyScheduleRuleBo;
import org.dromara.yy.domain.vo.YyScheduleRuleVo;
import org.dromara.yy.service.IYyScheduleRuleService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 预约规则管理
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/scheduleRule")
public class YyScheduleRuleController extends BaseController {

    private final IYyScheduleRuleService yyScheduleRuleService;

    @SaCheckPermission("yy:bookingConfig:list")
    @GetMapping("/list")
    public TableDataInfo<YyScheduleRuleVo> list(YyScheduleRuleBo bo, PageQuery pageQuery) {
        return yyScheduleRuleService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:bookingConfig:export")
    @Log(title = "预约规则管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyScheduleRuleBo bo, HttpServletResponse response) {
        List<YyScheduleRuleVo> list = yyScheduleRuleService.queryList(bo);
        ExcelUtil.exportExcel(list, "预约规则管理", YyScheduleRuleVo.class, response);
    }

    @SaCheckPermission("yy:bookingConfig:query")
    @GetMapping("/{id}")
    public R<YyScheduleRuleVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyScheduleRuleService.queryById(id));
    }

    @SaCheckPermission("yy:bookingConfig:add")
    @Log(title = "预约规则管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyScheduleRuleBo bo) {
        return toAjax(yyScheduleRuleService.insertByBo(bo));
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "预约规则管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyScheduleRuleBo bo) {
        return toAjax(yyScheduleRuleService.updateByBo(bo));
    }

    @SaCheckPermission("yy:bookingConfig:remove")
    @Log(title = "预约规则管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyScheduleRuleService.deleteWithValidByIds(List.of(ids), true));
    }
}
