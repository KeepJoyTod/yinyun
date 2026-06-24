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
import org.dromara.yy.domain.bo.YyMicroFormBo;
import org.dromara.yy.domain.vo.YyMicroFormVo;
import org.dromara.yy.service.IYyMicroFormService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/microForm")
public class YyMicroFormController extends BaseController {

    private final IYyMicroFormService yyMicroFormService;

    @SaCheckPermission("yy:microForm:list")
    @GetMapping("/list")
    public TableDataInfo<YyMicroFormVo> list(YyMicroFormBo bo, PageQuery pageQuery) {
        return yyMicroFormService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:microForm:export")
    @Log(title = "Merchant Micro Form", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyMicroFormBo bo, HttpServletResponse response) {
        List<YyMicroFormVo> list = yyMicroFormService.queryList(bo);
        ExcelUtil.exportExcel(list, "merchant_micro_form", YyMicroFormVo.class, response);
    }

    @SaCheckPermission("yy:microForm:list")
    @GetMapping("/{id}")
    public R<YyMicroFormVo> getInfo(@NotNull(message = "id is required") @PathVariable Long id) {
        return R.ok(yyMicroFormService.queryById(id));
    }

    @SaCheckPermission("yy:microForm:add")
    @Log(title = "Merchant Micro Form", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyMicroFormBo bo) {
        return toAjax(yyMicroFormService.insertByBo(bo));
    }

    @SaCheckPermission("yy:microForm:edit")
    @Log(title = "Merchant Micro Form", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyMicroFormBo bo) {
        return toAjax(yyMicroFormService.updateByBo(bo));
    }

    @SaCheckPermission("yy:microForm:publish")
    @Log(title = "Merchant Micro Form", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/publish")
    public R<YyMicroFormVo> publish(@NotNull(message = "id is required") @PathVariable Long id) {
        return R.ok(yyMicroFormService.publish(id));
    }

    @SaCheckPermission("yy:microForm:publish")
    @Log(title = "Merchant Micro Form", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/offline")
    public R<YyMicroFormVo> offline(@NotNull(message = "id is required") @PathVariable Long id) {
        return R.ok(yyMicroFormService.offline(id));
    }

    @SaCheckPermission("yy:microForm:remove")
    @Log(title = "Merchant Micro Form", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "id is required") @PathVariable Long[] ids) {
        return toAjax(yyMicroFormService.deleteWithValidByIds(List.of(ids), true));
    }
}
