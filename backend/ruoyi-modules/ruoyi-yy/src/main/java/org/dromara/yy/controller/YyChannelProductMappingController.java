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
import org.dromara.yy.domain.bo.YyChannelProductMappingBo;
import org.dromara.yy.domain.vo.YyChannelProductMappingVo;
import org.dromara.yy.service.IYyChannelProductMappingService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 渠道商品映射
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/channelProductMapping")
public class YyChannelProductMappingController extends BaseController {

    private final IYyChannelProductMappingService yyChannelProductMappingService;

    /**
     * 查询渠道商品映射列表
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/list")
    public TableDataInfo<YyChannelProductMappingVo> list(YyChannelProductMappingBo bo, PageQuery pageQuery) {
        return yyChannelProductMappingService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出渠道商品映射列表
     */
    @SaCheckPermission("yy:channel:export")
    @Log(title = "渠道商品映射", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyChannelProductMappingBo bo, HttpServletResponse response) {
        List<YyChannelProductMappingVo> list = yyChannelProductMappingService.queryList(bo);
        ExcelUtil.exportExcel(list, "渠道商品映射", YyChannelProductMappingVo.class, response);
    }

    /**
     * 获取渠道商品映射详细信息
     */
    @SaCheckPermission("yy:channel:query")
    @GetMapping("/{id}")
    public R<YyChannelProductMappingVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyChannelProductMappingService.queryById(id));
    }

    /**
     * 新增渠道商品映射
     */
    @SaCheckPermission("yy:channel:add")
    @Log(title = "渠道商品映射", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyChannelProductMappingBo bo) {
        return toAjax(yyChannelProductMappingService.insertByBo(bo));
    }

    /**
     * 修改渠道商品映射
     */
    @SaCheckPermission("yy:channel:edit")
    @Log(title = "渠道商品映射", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyChannelProductMappingBo bo) {
        return toAjax(yyChannelProductMappingService.updateByBo(bo));
    }

    /**
     * 删除渠道商品映射
     */
    @SaCheckPermission("yy:channel:remove")
    @Log(title = "渠道商品映射", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyChannelProductMappingService.deleteWithValidByIds(List.of(ids), true));
    }
}
