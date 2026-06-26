package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.system.domain.vo.SysOssVo;
import org.dromara.system.service.ISysOssService;
import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.vo.YyReportFinanceDifferenceVo;
import org.dromara.yy.domain.vo.YyReportFinanceExportPayloadVo;
import org.dromara.yy.domain.vo.YyReportFinanceLedgerLineVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;
import org.dromara.yy.mapper.YyAsyncTaskMapper;
import org.dromara.yy.service.IYyAsyncTaskService;
import org.dromara.yy.service.IYyReportFinanceReconciliationService;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Service
@RequiredArgsConstructor
public class YyReportFinanceExportWorkerService {

    private static final DateTimeFormatter FILE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
    private static final int DEFAULT_BATCH_SIZE = 3;
    private static final int DEFAULT_CLAIM_LEASE_SECONDS = 300;
    private static final int DEFAULT_RETRY_DELAY_SECONDS = 120;
    private static final int DEFAULT_RETENTION_HOURS = 168;
    private static final int DEFAULT_CLEANUP_BATCH_SIZE = 10;

    private final IYyAsyncTaskService asyncTaskService;
    private final IYyReportFinanceReconciliationService reportFinanceReconciliationService;
    private final ISysOssService ossService;
    private final YyAsyncTaskMapper asyncTaskMapper;
    private final Environment environment;
    private final AtomicBoolean running = new AtomicBoolean(false);

    @Scheduled(
        initialDelayString = "${yy.report.finance.export-worker.initial-delay-ms:30000}",
        fixedDelayString = "${yy.report.finance.export-worker.fixed-delay-ms:30000}"
    )
    public void scheduledRun() {
        if (!isEnabled()) {
            log.debug("finance export worker skipped: disabled");
            return;
        }
        int processed = runOnce();
        if (processed > 0) {
            log.info("finance export worker completed: processed={}", processed);
        }
    }

    @Scheduled(
        initialDelayString = "${yy.report.finance.export-worker.cleanup-initial-delay-ms:60000}",
        fixedDelayString = "${yy.report.finance.export-worker.cleanup-fixed-delay-ms:3600000}"
    )
    public void scheduledCleanup() {
        if (!isEnabled()) {
            return;
        }
        int expired = cleanupExpiredDownloads();
        if (expired > 0) {
            log.info("finance export cleanup completed: expired={}", expired);
        }
    }

    public int runOnce() {
        if (!isEnabled()) {
            return 0;
        }
        if (!running.compareAndSet(false, true)) {
            log.info("finance export worker skipped: previous run still active");
            return 0;
        }
        try {
            int processed = 0;
            Date now = new Date();
            for (int i = 0; i < batchSize(); i++) {
                YyAsyncTask task = asyncTaskService.claimNextTask(
                    IYyAsyncTaskService.TASK_TYPE_FINANCE_EXPORT,
                    workerCode(),
                    now,
                    new Date(now.getTime() + claimLeaseSeconds() * 1000L)
                );
                if (task == null) {
                    break;
                }
                processed++;
                processOne(task);
            }
            return processed;
        } finally {
            running.set(false);
        }
    }

    public int cleanupExpiredDownloads() {
        List<YyAsyncTask> expiredTasks = listExpiredTasks();
        int expired = 0;
        for (YyAsyncTask task : expiredTasks) {
            try {
                if (task.getOssId() != null) {
                    ossService.deleteWithValidByIds(List.of(task.getOssId()), false);
                }
                expired += asyncTaskMapper.update(new YyAsyncTask(), Wrappers.<YyAsyncTask>lambdaUpdate()
                    .eq(YyAsyncTask::getId, task.getId())
                    .eq(YyAsyncTask::getStatus, "COMPLETED")
                    .set(YyAsyncTask::getStatus, "EXPIRED")
                    .set(YyAsyncTask::getRunStatus, "EXPIRED")
                    .set(YyAsyncTask::getDownloadUrl, "")
                    .set(YyAsyncTask::getAuditNote, appendAudit(task.getAuditNote(), "expired cleanup completed"))) > 0 ? 1 : 0;
            } catch (Exception ex) {
                log.warn("finance export cleanup failed: taskId={}, message={}", task.getTaskNo(), ex.getMessage());
            }
        }
        return expired;
    }

    private List<YyAsyncTask> listExpiredTasks() {
        return safeList(asyncTaskMapper.selectList(Wrappers.<YyAsyncTask>lambdaQuery()
            .eq(YyAsyncTask::getTaskType, IYyAsyncTaskService.TASK_TYPE_FINANCE_EXPORT)
            .eq(YyAsyncTask::getStatus, "COMPLETED")
            .isNotNull(YyAsyncTask::getOssId)
            .le(YyAsyncTask::getExpireTime, new Date())
            .orderByAsc(YyAsyncTask::getExpireTime)
            .last("limit " + cleanupBatchSize())));
    }

    private void processOne(YyAsyncTask task) {
        asyncTaskService.markTaskRunning(task.getId(), workerCode(), new Date());
        File tempFile = null;
        try {
            YyReportFinanceExportPayloadVo payload = asyncTaskService.parseFinanceExportPayload(task);
            if (payload == null) {
                throw new ServiceException("finance export payload is missing");
            }
            YyReportFinanceReconciliationVo report = reportFinanceReconciliationService.queryOverviewForExportTask(payload);
            tempFile = createCsvFile(task, payload, report);
            SysOssVo oss = ossService.upload(tempFile);
            asyncTaskService.markTaskSuccess(
                task.getId(),
                workerCode(),
                oss.getOssId(),
                resolveFileName(tempFile, oss),
                "text/csv",
                tempFile.length(),
                "/yy/reportFinanceReconciliation/export/tasks/" + task.getTaskNo() + "/download",
                new Date(),
                new Date(System.currentTimeMillis() + retentionHours() * 3600_000L),
                "uploaded to sys_oss"
            );
        } catch (Exception ex) {
            handleFailure(task, ex);
        } finally {
            deleteQuietly(tempFile);
        }
    }

    private File createCsvFile(YyAsyncTask task, YyReportFinanceExportPayloadVo payload, YyReportFinanceReconciliationVo report) throws IOException {
        String fileName = "finance-reconciliation-" + FILE_TIME_FORMATTER.format(LocalDateTime.now()) + ".csv";
        File file = File.createTempFile(task.getTaskNo() + "-", ".csv");
        try (BufferedWriter writer = Files.newBufferedWriter(file.toPath(), StandardCharsets.UTF_8)) {
            writer.write('\uFEFF');
            writeLine(writer, "section", "label", "value_1", "value_2", "value_3", "note");
            writeLine(writer, "meta", "task_id", task.getTaskNo(), "", "", "");
            writeLine(writer, "meta", "date_range", payload.getDateFrom(), payload.getDateTo(), "", "");
            writeLine(writer, "meta", "requested_store_id", value(payload.getRequestedStoreId()), "", "", "");
            writeLine(writer, "meta", "scoped_store_ids", joinIds(payload.getScopedStoreIds()), "", "", "");
            writeLine(writer, "overview", "order_amount_cent", String.valueOf(report.getOverview().getOrderAmountCent()), "", "", report.getOverview().getBoundaryNote());
            writeLine(writer, "overview", "paid_amount_cent", String.valueOf(report.getOverview().getPaidAmountCent()), "", "", "");
            writeLine(writer, "overview", "refund_amount_cent", String.valueOf(report.getOverview().getRefundAmountCent()), "", "", "");
            writeLine(writer, "overview", "stored_value_consume_cent", String.valueOf(report.getOverview().getStoredValueConsumeCent()), "", "", "");
            writeLine(writer, "overview", "stored_value_reversal_cent", String.valueOf(report.getOverview().getStoredValueReversalCent()), "", "", "");
            writeLine(writer, "overview", "withdraw_paid_cent", String.valueOf(report.getOverview().getWithdrawPaidCent()), "", "", "");
            writeLine(writer, "overview", "discount_amount_cent", String.valueOf(report.getOverview().getDiscountAmountCent()), "", "", "");
            writeLine(writer, "overview", "waive_amount_cent", String.valueOf(report.getOverview().getWaiveAmountCent()), "", "", "");
            writeLine(writer, "overview", "reconciliation_diff_cent", String.valueOf(report.getOverview().getReconciliationDiffCent()), "", "", "");
            writeLine(writer, "overview", "attention_count", String.valueOf(report.getOverview().getAttentionCount()), "", "", "");
            for (YyReportFinanceLedgerLineVo row : safeList(report.getOrderLedgers())) {
                writeLine(writer, "order_ledger", row.getLedgerLabel(), String.valueOf(row.getRecordCount()), String.valueOf(row.getAmountCent()), String.valueOf(row.getRefundAmountCent()), row.getSourceTable());
            }
            for (YyReportFinanceLedgerLineVo row : safeList(report.getFundLedgers())) {
                writeLine(writer, "fund_ledger", row.getLedgerLabel(), String.valueOf(row.getRecordCount()), String.valueOf(row.getAmountCent()), String.valueOf(row.getRefundAmountCent()), row.getSourceTable());
            }
            for (YyReportFinanceDifferenceVo row : safeList(report.getDifferences())) {
                writeLine(writer, "difference", row.getDifferenceLabel(), String.valueOf(row.getAmountCent()), String.valueOf(row.getRecordCount()), row.getSeverity(), row.getNote());
            }
        }
        File renamed = new File(file.getParentFile(), fileName);
        if (file.renameTo(renamed)) {
            return renamed;
        }
        return file;
    }

    private void handleFailure(YyAsyncTask task, Exception ex) {
        String message = limitText(firstNotBlank(ex.getMessage(), ex.getClass().getSimpleName()), 500);
        int retryCount = task.getRetryCount() == null ? 0 : task.getRetryCount();
        int maxRetryCount = task.getMaxRetryCount() == null ? 3 : task.getMaxRetryCount();
        if (retryCount + 1 >= maxRetryCount) {
            asyncTaskService.markTaskFailed(task.getId(), workerCode(), message);
            return;
        }
        asyncTaskService.markTaskRetry(
            task.getId(),
            workerCode(),
            message,
            new Date(System.currentTimeMillis() + retryDelaySeconds() * 1000L)
        );
    }

    private void writeLine(BufferedWriter writer, String... values) throws IOException {
        writer.write(String.join(",", List.of(values).stream().map(this::escapeCsv).toList()));
        writer.newLine();
    }

    private String escapeCsv(String value) {
        String normalized = StringUtils.defaultString(value).replace("\r", " ").replace("\n", " ");
        if (normalized.contains(",") || normalized.contains("\"")) {
            return "\"" + normalized.replace("\"", "\"\"") + "\"";
        }
        return normalized;
    }

    private String resolveFileName(File tempFile, SysOssVo oss) {
        if (oss != null && StringUtils.isNotBlank(oss.getOriginalName())) {
            return oss.getOriginalName();
        }
        return tempFile == null ? "" : tempFile.getName();
    }

    private void deleteQuietly(File file) {
        if (file == null) {
            return;
        }
        try {
            Files.deleteIfExists(file.toPath());
        } catch (Exception ignored) {
            log.debug("delete temp finance export file failed: {}", file.getAbsolutePath());
        }
    }

    private boolean isEnabled() {
        return Boolean.parseBoolean(prop("yy.report.finance.export-worker.enabled", "true"));
    }

    private int batchSize() {
        return positiveInt(prop("yy.report.finance.export-worker.batch-size", String.valueOf(DEFAULT_BATCH_SIZE)), DEFAULT_BATCH_SIZE);
    }

    private int claimLeaseSeconds() {
        return positiveInt(prop("yy.report.finance.export-worker.claim-lease-seconds", String.valueOf(DEFAULT_CLAIM_LEASE_SECONDS)), DEFAULT_CLAIM_LEASE_SECONDS);
    }

    private int retryDelaySeconds() {
        return positiveInt(prop("yy.report.finance.export-worker.retry-delay-seconds", String.valueOf(DEFAULT_RETRY_DELAY_SECONDS)), DEFAULT_RETRY_DELAY_SECONDS);
    }

    private int retentionHours() {
        return positiveInt(prop("yy.report.finance.export-worker.retention-hours", String.valueOf(DEFAULT_RETENTION_HOURS)), DEFAULT_RETENTION_HOURS);
    }

    private int cleanupBatchSize() {
        return positiveInt(prop("yy.report.finance.export-worker.cleanup-batch-size", String.valueOf(DEFAULT_CLEANUP_BATCH_SIZE)), DEFAULT_CLEANUP_BATCH_SIZE);
    }

    private String workerCode() {
        return firstNotBlank(prop("spring.application.name", ""), "yy-report-finance-worker") + "@" + ZoneId.systemDefault();
    }

    private String prop(String key, String fallback) {
        String value = environment.getProperty(key, fallback);
        return StringUtils.isBlank(value) ? fallback : value;
    }

    private int positiveInt(String value, int fallback) {
        try {
            int parsed = Integer.parseInt(value);
            return parsed > 0 ? parsed : fallback;
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private String joinIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return "";
        }
        return ids.stream().map(String::valueOf).reduce((left, right) -> left + "|" + right).orElse("");
    }

    private String value(Long number) {
        return number == null ? "" : String.valueOf(number);
    }

    private String firstNotBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private String limitText(String value, int maxLength) {
        if (StringUtils.isBlank(value) || value.length() <= maxLength) {
            return StringUtils.defaultString(value);
        }
        return value.substring(0, maxLength);
    }

    private String appendAudit(String existing, String append) {
        if (StringUtils.isBlank(existing)) {
            return append;
        }
        return limitText(existing + "; " + append, 500);
    }

    private <T> List<T> safeList(List<T> rows) {
        return rows == null ? List.of() : rows;
    }
}
