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
import org.dromara.yy.domain.bo.YyChannelOrderMappingBo;
import org.dromara.yy.domain.vo.YyChannelOrderMappingVo;
import org.dromara.yy.service.IYyChannelOrderMappingService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 渠道订单映射
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/channelOrderMapping")
public class YyChannelOrderMappingController extends BaseController {

    private final IYyChannelOrderMappingService yyChannelOrderMappingService;

    /**
     * 查询渠道订单映射列表
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/list")
    public TableDataInfo<YyChannelOrderMappingVo> list(YyChannelOrderMappingBo bo, PageQuery pageQuery) {
        return yyChannelOrderMappingService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出渠道订单映射列表
     */
    @SaCheckPermission("yy:channel:export")
    @Log(title = "渠道订单映射", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyChannelOrderMappingBo bo, HttpServletResponse response) {
        List<YyChannelOrderMappingVo> list = yyChannelOrderMappingService.queryList(bo);
        ExcelUtil.exportExcel(list, "渠道订单映射", YyChannelOrderMappingVo.class, response);
    }

    /**
     * 获取渠道订单映射详细信息
     */
    @SaCheckPermission("yy:channel:query")
    @GetMapping("/{id}")
    public R<YyChannelOrderMappingVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyChannelOrderMappingService.queryById(id));
    }

    /**
     * 新增渠道订单映射
     */
    @SaCheckPermission("yy:channel:add")
    @Log(title = "渠道订单映射", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyChannelOrderMappingBo bo) {
        return toAjax(yyChannelOrderMappingService.insertByBo(bo));
    }

    /**
     * 修改渠道订单映射
     */
    @SaCheckPermission("yy:channel:edit")
    @Log(title = "渠道订单映射", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyChannelOrderMappingBo bo) {
        return toAjax(yyChannelOrderMappingService.updateByBo(bo));
    }

    /**
     * 删除渠道订单映射
     */
    @SaCheckPermission("yy:channel:remove")
    @Log(title = "渠道订单映射", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyChannelOrderMappingService.deleteWithValidByIds(List.of(ids), true));
    }
}
