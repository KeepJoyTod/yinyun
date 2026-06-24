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
import org.dromara.yy.domain.bo.YyChannelSyncLogBo;
import org.dromara.yy.domain.vo.YyChannelSyncLogVo;
import org.dromara.yy.service.IYyChannelSyncLogService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 渠道同步日志
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/channelSyncLog")
public class YyChannelSyncLogController extends BaseController {

    private final IYyChannelSyncLogService yyChannelSyncLogService;

    /**
     * 查询渠道同步日志列表
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/list")
    public TableDataInfo<YyChannelSyncLogVo> list(YyChannelSyncLogBo bo, PageQuery pageQuery) {
        return yyChannelSyncLogService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出渠道同步日志列表
     */
    @SaCheckPermission("yy:channel:export")
    @Log(title = "渠道同步日志", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyChannelSyncLogBo bo, HttpServletResponse response) {
        List<YyChannelSyncLogVo> list = yyChannelSyncLogService.queryList(bo);
        ExcelUtil.exportExcel(list, "渠道同步日志", YyChannelSyncLogVo.class, response);
    }

    /**
     * 获取渠道同步日志详细信息
     */
    @SaCheckPermission("yy:channel:query")
    @GetMapping("/{id}")
    public R<YyChannelSyncLogVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyChannelSyncLogService.queryById(id));
    }

    /**
     * 新增渠道同步日志
     */
    @SaCheckPermission("yy:channel:add")
    @Log(title = "渠道同步日志", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyChannelSyncLogBo bo) {
        return toAjax(yyChannelSyncLogService.insertByBo(bo));
    }

    /**
     * 修改渠道同步日志
     */
    @SaCheckPermission("yy:channel:edit")
    @Log(title = "渠道同步日志", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyChannelSyncLogBo bo) {
        return toAjax(yyChannelSyncLogService.updateByBo(bo));
    }

    /**
     * 删除渠道同步日志
     */
    @SaCheckPermission("yy:channel:remove")
    @Log(title = "渠道同步日志", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyChannelSyncLogService.deleteWithValidByIds(List.of(ids), true));
    }
}
