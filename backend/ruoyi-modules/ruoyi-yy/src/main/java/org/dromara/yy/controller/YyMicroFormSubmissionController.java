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
import org.dromara.yy.domain.bo.YyMicroFormFollowBo;
import org.dromara.yy.domain.bo.YyMicroFormSubmissionBo;
import org.dromara.yy.domain.vo.YyMicroFormSubmissionVo;
import org.dromara.yy.service.IYyMicroFormSubmissionService;
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
@RequestMapping("/yy/microFormSubmission")
public class YyMicroFormSubmissionController extends BaseController {

    private final IYyMicroFormSubmissionService yyMicroFormSubmissionService;

    @SaCheckPermission("yy:microFormSubmission:list")
    @GetMapping("/list")
    public TableDataInfo<YyMicroFormSubmissionVo> list(YyMicroFormSubmissionBo bo, PageQuery pageQuery) {
        return yyMicroFormSubmissionService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:microFormSubmission:export")
    @Log(title = "Merchant Micro Form Submission", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyMicroFormSubmissionBo bo, HttpServletResponse response) {
        List<YyMicroFormSubmissionVo> list = yyMicroFormSubmissionService.queryList(bo);
        ExcelUtil.exportExcel(list, "merchant_micro_form_submission", YyMicroFormSubmissionVo.class, response);
    }

    @SaCheckPermission("yy:microFormSubmission:list")
    @GetMapping("/{id}")
    public R<YyMicroFormSubmissionVo> getInfo(@NotNull(message = "id is required") @PathVariable Long id) {
        return R.ok(yyMicroFormSubmissionService.queryById(id));
    }

    @SaCheckPermission("yy:microFormSubmission:edit")
    @Log(title = "Merchant Micro Form Submission", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/{id}/follow")
    public R<Void> follow(
        @NotNull(message = "id is required") @PathVariable Long id,
        @Validated @RequestBody YyMicroFormFollowBo bo
    ) {
        return toAjax(yyMicroFormSubmissionService.updateFollow(id, bo));
    }

    @SaCheckPermission("yy:microFormSubmission:edit")
    @Log(title = "Merchant Micro Form Submission", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/follow")
    public R<Void> follow(@Validated @RequestBody YyMicroFormFollowBo bo) {
        return toAjax(yyMicroFormSubmissionService.updateFollow(bo.getId(), bo));
    }

    @SaCheckPermission("yy:microFormSubmission:edit")
    @Log(title = "Merchant Micro Form Submission", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyMicroFormSubmissionBo bo) {
        return toAjax(yyMicroFormSubmissionService.insertByBo(bo));
    }

    @SaCheckPermission("yy:microFormSubmission:edit")
    @Log(title = "Merchant Micro Form Submission", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyMicroFormSubmissionBo bo) {
        return toAjax(yyMicroFormSubmissionService.updateByBo(bo));
    }

    @SaCheckPermission("yy:microFormSubmission:edit")
    @Log(title = "Merchant Micro Form Submission", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "id is required") @PathVariable Long[] ids) {
        return toAjax(yyMicroFormSubmissionService.deleteWithValidByIds(List.of(ids), true));
    }
}
