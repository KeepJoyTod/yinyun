package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;

import java.util.List;

public interface IYyReportFinanceReconciliationService {

    YyReportFinanceReconciliationVo queryOverview(Long storeId, String dateFrom, String dateTo);

    YyReportFinanceExportTaskVo createExportTask(Long storeId, String dateFrom, String dateTo);

    List<YyReportFinanceExportTaskVo> listExportTasks(Long storeId, String dateFrom, String dateTo);
}
