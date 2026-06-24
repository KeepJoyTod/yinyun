package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelSyncResultVo;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.dromara.yy.service.YyChannelAdapterService;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 抖音来客订单自动同步。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class YyDouyinLifeAutoSyncService {

    public static final String CHANNEL_TYPE = "DOUYIN_LIFE";
    public static final String API_NAME = "life_order_auto_sync";
    public static final String RECONCILE_API_NAME = "life_order_reconcile_sync";

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final YyChannelAdapterService channelAdapterService;
    private final YyChannelSyncLogMapper channelSyncLogMapper;
    private final Environment environment;
    private final AtomicBoolean running = new AtomicBoolean(false);

    @PostConstruct
    public void logStartupConfig() {
        log.info(
            "抖音来客自动同步配置: enabled={}, initialDelayMs={}, fixedDelayMs={}, windowMinutes={}, overlapMinutes={}, pageSize={}, maxPages={}, maxTotal={}, reconcileEnabled={}, reconcileInitialDelayMs={}, reconcileFixedDelayMs={}, reconcileWindowHours={}, reconcilePageSize={}, reconcileMaxPages={}, reconcileMaxTotal={}",
            prop("yy.douyin.life.auto-sync.enabled", "true"),
            prop("yy.douyin.life.auto-sync.initial-delay-ms", "60000"),
            prop("yy.douyin.life.auto-sync.fixed-delay-ms", "300000"),
            prop("yy.douyin.life.auto-sync.window-minutes", "30"),
            prop("yy.douyin.life.auto-sync.overlap-minutes", "10"),
            prop("yy.douyin.life.auto-sync.page-size", "50"),
            prop("yy.douyin.life.auto-sync.max-pages", "2"),
            prop("yy.douyin.life.auto-sync.max-total", "80"),
            prop("yy.douyin.life.reconcile.enabled", "true"),
            prop("yy.douyin.life.reconcile.initial-delay-ms", "120000"),
            prop("yy.douyin.life.reconcile.fixed-delay-ms", "86400000"),
            prop("yy.douyin.life.reconcile.window-hours", "24"),
            prop("yy.douyin.life.reconcile.page-size", "100"),
            prop("yy.douyin.life.reconcile.max-pages", "3"),
            prop("yy.douyin.life.reconcile.max-total", "300")
        );
    }

    @Scheduled(
        initialDelayString = "${yy.douyin.life.auto-sync.initial-delay-ms:60000}",
        fixedDelayString = "${yy.douyin.life.auto-sync.fixed-delay-ms:300000}"
    )
    public void scheduledRun() {
        if (!isEnabled()) {
            log.debug("抖音来客自动同步跳过: disabled");
            return;
        }
        if (!running.compareAndSet(false, true)) {
            log.info("抖音来客自动同步跳过: previous run still active");
            return;
        }
        try {
            log.info("抖音来客自动同步开始");
            YyChannelSyncResultVo result = runOnceInternal();
            log.info(
                "抖音来客自动同步完成: status={}, total={}, created={}, updated={}, failed={}, logid={}",
                result.getSyncStatus(),
                value(result.getTotal()),
                value(result.getCreated()),
                value(result.getUpdated()),
                value(result.getFailed()),
                firstNotBlank(result.getLastLogId(), "")
            );
        } catch (Exception ex) {
            log.warn("抖音来客自动同步失败: {}", ex.getMessage());
            recordFailure(ex.getMessage());
        } finally {
            running.set(false);
        }
    }

    @Scheduled(
        initialDelayString = "${yy.douyin.life.reconcile.initial-delay-ms:120000}",
        fixedDelayString = "${yy.douyin.life.reconcile.fixed-delay-ms:86400000}"
    )
    public void scheduledReconcileRun() {
        if (!isReconcileEnabled()) {
            log.debug("抖音来客订单对账同步跳过: disabled");
            return;
        }
        if (!running.compareAndSet(false, true)) {
            log.info("抖音来客订单对账同步跳过: another sync still active");
            return;
        }
        try {
            log.info("抖音来客订单对账同步开始");
            YyChannelSyncResultVo result = runReconcileInternal();
            log.info(
                "抖音来客订单对账同步完成: status={}, total={}, created={}, updated={}, failed={}, logid={}",
                result.getSyncStatus(),
                value(result.getTotal()),
                value(result.getCreated()),
                value(result.getUpdated()),
                value(result.getFailed()),
                firstNotBlank(result.getLastLogId(), "")
            );
        } catch (Exception ex) {
            log.warn("抖音来客订单对账同步失败: {}", ex.getMessage());
            recordFailure(ex.getMessage(), RECONCILE_API_NAME);
        } finally {
            running.set(false);
        }
    }

    public YyChannelSyncResultVo runOnce() {
        if (!isEnabled()) {
            YyChannelSyncResultVo skipped = new YyChannelSyncResultVo();
            skipped.setChannelType(CHANNEL_TYPE);
            skipped.setSyncStatus("SKIPPED");
            skipped.setMessage("抖音来客自动同步未启用");
            return skipped;
        }
        if (!running.compareAndSet(false, true)) {
            YyChannelSyncResultVo skipped = new YyChannelSyncResultVo();
            skipped.setChannelType(CHANNEL_TYPE);
            skipped.setSyncStatus("SKIPPED");
            skipped.setMessage("上一次抖音来客自动同步仍在执行");
            return skipped;
        }
        try {
            return runOnceInternal();
        } catch (Exception ex) {
            recordFailure(ex.getMessage());
            YyChannelSyncResultVo failed = new YyChannelSyncResultVo();
            failed.setChannelType(CHANNEL_TYPE);
            failed.setSyncStatus("FAILED");
            failed.setFailed(1);
            failed.setMessage(firstNotBlank(ex.getMessage(), "抖音来客自动同步失败"));
            return failed;
        } finally {
            running.set(false);
        }
    }

    public YyChannelSyncResultVo runReconcileOnce() {
        if (!isReconcileEnabled()) {
            YyChannelSyncResultVo skipped = new YyChannelSyncResultVo();
            skipped.setChannelType(CHANNEL_TYPE);
            skipped.setSyncStatus("SKIPPED");
            skipped.setMessage("抖音来客订单对账同步未启用");
            return skipped;
        }
        if (!running.compareAndSet(false, true)) {
            YyChannelSyncResultVo skipped = new YyChannelSyncResultVo();
            skipped.setChannelType(CHANNEL_TYPE);
            skipped.setSyncStatus("SKIPPED");
            skipped.setMessage("已有抖音来客订单同步任务仍在执行");
            return skipped;
        }
        try {
            return runReconcileInternal();
        } catch (Exception ex) {
            recordFailure(ex.getMessage(), RECONCILE_API_NAME);
            YyChannelSyncResultVo failed = new YyChannelSyncResultVo();
            failed.setChannelType(CHANNEL_TYPE);
            failed.setSyncStatus("FAILED");
            failed.setFailed(1);
            failed.setMessage(firstNotBlank(ex.getMessage(), "抖音来客订单对账同步失败"));
            return failed;
        } finally {
            running.set(false);
        }
    }

    private YyChannelSyncResultVo runOnceInternal() {
        YyChannelOrderQuery query = buildSyncQuery();
        return runInternal(query, API_NAME);
    }

    private YyChannelSyncResultVo runReconcileInternal() {
        YyChannelOrderQuery query = buildReconcileQuery();
        return runInternal(query, RECONCILE_API_NAME);
    }

    private YyChannelSyncResultVo runInternal(YyChannelOrderQuery query, String apiName) {
        long start = System.nanoTime();
        YyChannelSyncResultVo result = channelAdapterService.syncOrders(CHANNEL_TYPE, query);
        recordResult(result, (System.nanoTime() - start) / 1_000_000L, query, apiName);
        return result;
    }

    private YyChannelOrderQuery buildSyncQuery() {
        int windowMinutes = positiveInt(prop("yy.douyin.life.auto-sync.window-minutes", "30"), 30);
        int overlapMinutes = positiveInt(prop("yy.douyin.life.auto-sync.overlap-minutes", "10"), 10);
        int pageSize = positiveInt(prop("yy.douyin.life.auto-sync.page-size", "50"), 50);
        pageSize = Math.min(pageSize, 100);
        int maxPages = Math.min(positiveInt(prop("yy.douyin.life.auto-sync.max-pages", "2"), 2), 20);
        int maxTotal = Math.min(positiveInt(prop("yy.douyin.life.auto-sync.max-total", "80"), 80), 500);
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusMinutes(windowMinutes + overlapMinutes);

        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setChannelType(CHANNEL_TYPE);
        query.setStartTime(start.format(DATE_TIME_FORMATTER));
        query.setEndTime(end.format(DATE_TIME_FORMATTER));
        query.setPageSize(pageSize);
        query.setPageNum(1);
        query.setMaxPages(maxPages);
        query.setMaxTotal(maxTotal);
        query.setUseTestDataHeader(false);
        return query;
    }

    private YyChannelOrderQuery buildReconcileQuery() {
        int windowHours = Math.min(positiveInt(prop("yy.douyin.life.reconcile.window-hours", "24"), 24), 168);
        int pageSize = Math.min(positiveInt(prop("yy.douyin.life.reconcile.page-size", "100"), 100), 100);
        int maxPages = Math.min(positiveInt(prop("yy.douyin.life.reconcile.max-pages", "3"), 3), 20);
        int maxTotal = Math.min(positiveInt(prop("yy.douyin.life.reconcile.max-total", "300"), 300), 500);
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusHours(windowHours);

        YyChannelOrderQuery query = new YyChannelOrderQuery();
        query.setChannelType(CHANNEL_TYPE);
        query.setStartTime(start.format(DATE_TIME_FORMATTER));
        query.setEndTime(end.format(DATE_TIME_FORMATTER));
        query.setPageSize(pageSize);
        query.setPageNum(1);
        query.setMaxPages(maxPages);
        query.setMaxTotal(maxTotal);
        query.setUseTestDataHeader(false);
        return query;
    }

    private void recordResult(YyChannelSyncResultVo result, long durationMs, YyChannelOrderQuery query, String apiName) {
        YyChannelSyncLog log = new YyChannelSyncLog();
        log.setChannelType(CHANNEL_TYPE);
        log.setApiName(apiName);
        log.setRequestId(firstNotBlank(result.getLastLogId(), ""));
        log.setSuccess("SYNCED".equals(result.getSyncStatus()) ? "1" : "0");
        log.setErrorMessage(limitText("SYNCED".equals(result.getSyncStatus()) ? "" : firstNotBlank(result.getMessage(), "自动同步未完全成功"), 480));
        log.setDurationMs(durationMs);
        log.setRetryable("SYNCED".equals(result.getSyncStatus()) ? "0" : "1");
        log.setRemark(limitText(
            "status=" + firstNotBlank(result.getSyncStatus(), "")
                + ", total=" + value(result.getTotal())
                + ", created=" + value(result.getCreated())
                + ", updated=" + value(result.getUpdated())
                + ", failed=" + value(result.getFailed())
                + ", startTime=" + firstNotBlank(query.getStartTime(), "")
                + ", endTime=" + firstNotBlank(query.getEndTime(), "")
                + ", maxPages=" + value(query.getMaxPages())
                + ", maxTotal=" + value(query.getMaxTotal()),
            480
        ));
        channelSyncLogMapper.insert(log);
    }

    private void recordFailure(String message) {
        recordFailure(message, API_NAME);
    }

    private void recordFailure(String message, String apiName) {
        YyChannelSyncLog log = new YyChannelSyncLog();
        log.setChannelType(CHANNEL_TYPE);
        log.setApiName(apiName);
        log.setRequestId("");
        log.setSuccess("0");
        log.setErrorMessage(limitText(firstNotBlank(message, "抖音来客自动同步失败"), 480));
        log.setDurationMs(0L);
        log.setRetryable("1");
        channelSyncLogMapper.insert(log);
    }

    private boolean isEnabled() {
        return Boolean.parseBoolean(prop("yy.douyin.life.auto-sync.enabled", "true"));
    }

    private boolean isReconcileEnabled() {
        return Boolean.parseBoolean(prop("yy.douyin.life.reconcile.enabled", "true"));
    }

    private String prop(String key, String fallback) {
        String value = environment.getProperty(key, fallback);
        return StringUtils.isBlank(value) ? fallback : value;
    }

    private static int positiveInt(String value, int fallback) {
        try {
            int parsed = Integer.parseInt(value);
            return parsed > 0 ? parsed : fallback;
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private static int value(Integer value) {
        return value == null ? 0 : value;
    }

    private static String firstNotBlank(String... values) {
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

    private static String limitText(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
