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
import org.dromara.yy.domain.bo.YyNotificationTemplateBo;
import org.dromara.yy.domain.vo.YyNotificationTemplateVo;
import org.dromara.yy.service.IYyNotificationTemplateService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 通知模板管理
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/notificationTemplate")
public class YyNotificationTemplateController extends BaseController {

    private final IYyNotificationTemplateService yyNotificationTemplateService;

    @SaCheckPermission("yy:notification:list")
    @GetMapping("/list")
    public TableDataInfo<YyNotificationTemplateVo> list(YyNotificationTemplateBo bo, PageQuery pageQuery) {
        return yyNotificationTemplateService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:notification:export")
    @Log(title = "通知模板", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyNotificationTemplateBo bo, HttpServletResponse response) {
        List<YyNotificationTemplateVo> list = yyNotificationTemplateService.queryList(bo);
        ExcelUtil.exportExcel(list, "通知模板", YyNotificationTemplateVo.class, response);
    }

    @SaCheckPermission("yy:notification:query")
    @GetMapping("/{id}")
    public R<YyNotificationTemplateVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyNotificationTemplateService.queryById(id));
    }

    @SaCheckPermission("yy:notification:add")
    @Log(title = "通知模板", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyNotificationTemplateBo bo) {
        return toAjax(yyNotificationTemplateService.insertByBo(bo));
    }

    @SaCheckPermission("yy:notification:edit")
    @Log(title = "通知模板", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyNotificationTemplateBo bo) {
        return toAjax(yyNotificationTemplateService.updateByBo(bo));
    }

    @SaCheckPermission("yy:notification:remove")
    @Log(title = "通知模板", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyNotificationTemplateService.deleteWithValidByIds(List.of(ids), true));
    }
}
