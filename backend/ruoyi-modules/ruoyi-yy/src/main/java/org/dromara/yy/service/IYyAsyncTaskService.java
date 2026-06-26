package org.dromara.yy.service;

import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskDetailVo;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskVo;
import org.dromara.yy.domain.vo.YyReportFinanceExportPayloadVo;
import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;

import java.util.Date;
import java.util.List;

public interface IYyAsyncTaskService {

    String TASK_TYPE_FINANCE_EXPORT = "REPORT_FINANCE_RECONCILIATION_EXPORT";

    String QUEUE_PLATFORM_EXPORT = "platform-export";

    YyReportFinanceExportTaskVo enqueueFinanceExportTask(YyReportFinanceExportPayloadVo payload);

    List<YyReportFinanceExportTaskVo> listFinanceExportTasks(Long storeId, String dateFrom, String dateTo);

    YyAsyncTask claimNextTask(String taskType, String workerCode, Date now, Date claimExpireTime);

    void markTaskRunning(Long taskId, String workerCode, Date startedTime);

    void markTaskSuccess(Long taskId, String workerCode, Long ossId, String fileName, String contentType, Long fileSizeBytes, String downloadUrl, Date finishedTime, Date expireTime, String auditNote);

    void markTaskRetry(Long taskId, String workerCode, String errorMessage, Date nextRetryTime);

    void markTaskFailed(Long taskId, String workerCode, String errorMessage);

    List<YyPlatformAsyncTaskVo> listPlatformTaskSummaries();

    YyPlatformAsyncTaskDetailVo getPlatformTaskDetail(String taskType);

    YyAsyncTask requireAccessibleTask(String taskId);

    int expireAccessibleDownloads(Date now, int batchSize);

    YyReportFinanceExportPayloadVo parseFinanceExportPayload(YyAsyncTask task);
}
