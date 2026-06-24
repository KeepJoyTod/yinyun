package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyNotificationLogBo;
import org.dromara.yy.domain.vo.YyNotificationLogVo;
import org.dromara.yy.service.IYyNotificationLogService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 通知发送日志
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/notificationLog")
public class YyNotificationLogController extends BaseController {

    private final IYyNotificationLogService yyNotificationLogService;

    @SaCheckPermission("yy:notification:list")
    @GetMapping("/list")
    public TableDataInfo<YyNotificationLogVo> list(YyNotificationLogBo bo, PageQuery pageQuery) {
        return yyNotificationLogService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:notification:export")
    @Log(title = "通知发送日志", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyNotificationLogBo bo, HttpServletResponse response) {
        List<YyNotificationLogVo> list = yyNotificationLogService.queryList(bo);
        ExcelUtil.exportExcel(list, "通知发送日志", YyNotificationLogVo.class, response);
    }

    @SaCheckPermission("yy:notification:query")
    @GetMapping("/{id}")
    public R<YyNotificationLogVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyNotificationLogService.queryById(id));
    }

    @SaCheckPermission("yy:notification:remove")
    @Log(title = "通知发送日志", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyNotificationLogService.deleteWithValidByIds(List.of(ids), true));
    }
}
