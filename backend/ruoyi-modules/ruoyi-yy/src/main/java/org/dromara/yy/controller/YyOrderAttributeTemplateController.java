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
import org.dromara.yy.domain.bo.YyOrderAttributeTemplateBo;
import org.dromara.yy.domain.vo.YyOrderAttributeTemplateVo;
import org.dromara.yy.service.IYyOrderAttributeTemplateService;
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
@RequestMapping("/yy/orderAttributeTemplate")
public class YyOrderAttributeTemplateController extends BaseController {

    private final IYyOrderAttributeTemplateService orderAttributeTemplateService;

    @SaCheckPermission("yy:bookingConfig:list")
    @GetMapping("/list")
    public TableDataInfo<YyOrderAttributeTemplateVo> list(YyOrderAttributeTemplateBo bo, PageQuery pageQuery) {
        return orderAttributeTemplateService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:bookingConfig:export")
    @Log(title = "订单属性模板", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyOrderAttributeTemplateBo bo, HttpServletResponse response) {
        List<YyOrderAttributeTemplateVo> list = orderAttributeTemplateService.queryList(bo);
        ExcelUtil.exportExcel(list, "订单属性模板", YyOrderAttributeTemplateVo.class, response);
    }

    @SaCheckPermission("yy:bookingConfig:query")
    @GetMapping("/{id}")
    public R<YyOrderAttributeTemplateVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(orderAttributeTemplateService.queryById(id));
    }

    @SaCheckPermission("yy:bookingConfig:add")
    @Log(title = "订单属性模板", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyOrderAttributeTemplateBo bo) {
        return toAjax(orderAttributeTemplateService.insertByBo(bo));
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "订单属性模板", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyOrderAttributeTemplateBo bo) {
        return toAjax(orderAttributeTemplateService.updateByBo(bo));
    }

    @SaCheckPermission("yy:bookingConfig:remove")
    @Log(title = "订单属性模板", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(orderAttributeTemplateService.deleteWithValidByIds(List.of(ids), true));
    }
}
