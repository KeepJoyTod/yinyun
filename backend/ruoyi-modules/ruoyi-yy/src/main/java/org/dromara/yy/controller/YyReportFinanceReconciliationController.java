package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;
import org.dromara.yy.service.IYyReportFinanceReconciliationService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
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
}
