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
import org.dromara.yy.domain.bo.YyChannelPluginBo;
import org.dromara.yy.domain.vo.YyChannelPluginVo;
import org.dromara.yy.service.IYyChannelPluginService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 渠道插件
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/channelPlugin")
public class YyChannelPluginController extends BaseController {

    private final IYyChannelPluginService yyChannelPluginService;

    /**
     * 查询渠道插件列表
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/list")
    public TableDataInfo<YyChannelPluginVo> list(YyChannelPluginBo bo, PageQuery pageQuery) {
        return yyChannelPluginService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出渠道插件列表
     */
    @SaCheckPermission("yy:channel:export")
    @Log(title = "渠道插件", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyChannelPluginBo bo, HttpServletResponse response) {
        List<YyChannelPluginVo> list = yyChannelPluginService.queryList(bo);
        ExcelUtil.exportExcel(list, "渠道插件", YyChannelPluginVo.class, response);
    }

    /**
     * 获取渠道插件详细信息
     */
    @SaCheckPermission("yy:channel:query")
    @GetMapping("/{id}")
    public R<YyChannelPluginVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyChannelPluginService.queryById(id));
    }

    /**
     * 新增渠道插件
     */
    @SaCheckPermission("yy:channel:add")
    @Log(title = "渠道插件", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyChannelPluginBo bo) {
        return toAjax(yyChannelPluginService.insertByBo(bo));
    }

    /**
     * 修改渠道插件
     */
    @SaCheckPermission("yy:channel:edit")
    @Log(title = "渠道插件", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyChannelPluginBo bo) {
        return toAjax(yyChannelPluginService.updateByBo(bo));
    }

    /**
     * 删除渠道插件
     */
    @SaCheckPermission("yy:channel:remove")
    @Log(title = "渠道插件", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyChannelPluginService.deleteWithValidByIds(List.of(ids), true));
    }
}
