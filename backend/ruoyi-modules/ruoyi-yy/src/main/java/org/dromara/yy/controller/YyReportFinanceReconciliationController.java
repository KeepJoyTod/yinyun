package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;
import org.dromara.yy.service.IYyAsyncTaskService;
import org.dromara.yy.service.IYyReportFinanceReconciliationService;
import org.dromara.system.service.ISysOssService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/reportFinanceReconciliation")
public class YyReportFinanceReconciliationController {

    private final IYyReportFinanceReconciliationService reportFinanceReconciliationService;
    private final IYyAsyncTaskService asyncTaskService;
    private final ISysOssService ossService;

    @SaCheckPermission("yy:report:list")
    @GetMapping("/overview")
    public R<YyReportFinanceReconciliationVo> overview(
        @RequestParam(required = false) Long storeId,
        @RequestParam(required = false) String dateFrom,
        @RequestParam(required = false) String dateTo
    ) {
        return R.ok(reportFinanceReconciliationService.queryOverview(storeId, dateFrom, dateTo));
    }

    @SaCheckPermission("yy:report:export")
    @PostMapping("/export")
    public R<YyReportFinanceExportTaskVo> export(
        @RequestParam(required = false) Long storeId,
        @RequestParam(required = false) String dateFrom,
        @RequestParam(required = false) String dateTo
    ) {
        return R.ok(reportFinanceReconciliationService.createExportTask(storeId, dateFrom, dateTo));
    }

    @SaCheckPermission("yy:report:list")
    @GetMapping("/export/tasks")
    public R<List<YyReportFinanceExportTaskVo>> exportTasks(
        @RequestParam(required = false) Long storeId,
        @RequestParam(required = false) String dateFrom,
        @RequestParam(required = false) String dateTo
    ) {
        return R.ok(reportFinanceReconciliationService.listExportTasks(storeId, dateFrom, dateTo));
    }

    @SaCheckPermission("yy:report:export")
    @GetMapping("/export/tasks/{taskId}/download")
    public void downloadExportTask(@PathVariable String taskId, HttpServletResponse response) throws Exception {
        YyAsyncTask task = asyncTaskService.requireAccessibleTask(taskId);
        if (!"COMPLETED".equalsIgnoreCase(task.getStatus())) {
            throw new ServiceException("导出任务尚未完成");
        }
        if (task.getExpireTime() != null && task.getExpireTime().before(new java.util.Date())) {
            throw new ServiceException("导出文件已过期");
        }
        if (task.getOssId() == null) {
            throw new ServiceException("导出文件不存在");
        }
        ossService.download(task.getOssId(), response);
    }
}
