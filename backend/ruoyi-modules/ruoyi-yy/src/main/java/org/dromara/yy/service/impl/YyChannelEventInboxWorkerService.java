package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.vo.YyChannelEventInboxVo;
import org.dromara.yy.domain.vo.YyChannelWebhookResultVo;
import org.dromara.yy.service.IYyChannelEventInboxService;
import org.dromara.yy.service.YyChannelAdapterService;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 渠道事件收件箱后台处理器。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class YyChannelEventInboxWorkerService {

    public static final String CHANNEL_TYPE = "DOUYIN_LIFE";

    private static final int DEFAULT_BATCH_SIZE = 10;
    private static final int DEFAULT_MAX_RETRIES = 5;
    private static final int DEFAULT_RETRY_DELAY_SECONDS = 60;

    private final IYyChannelEventInboxService eventInboxService;
    private final YyChannelAdapterService channelAdapterService;
    private final Environment environment;
    private final AtomicBoolean running = new AtomicBoolean(false);

    @Scheduled(
        initialDelayString = "${yy.douyin.life.event-inbox-worker.initial-delay-ms:30000}",
        fixedDelayString = "${yy.douyin.life.event-inbox-worker.fixed-delay-ms:30000}"
    )
    public void scheduledRun() {
        if (!isEnabled()) {
            log.debug("抖音来客事件收件箱 worker 跳过: disabled");
            return;
        }
        int processed = runOnce();
        if (processed > 0) {
            log.info("抖音来客事件收件箱 worker 完成: processed={}", processed);
        }
    }

    public int runOnce() {
        if (!isEnabled()) {
            return 0;
        }
        if (!running.compareAndSet(false, true)) {
            log.info("抖音来客事件收件箱 worker 跳过: previous run still active");
            return 0;
        }
        try {
            List<YyChannelEventInboxVo> events = eventInboxService.claimPendingEvents(CHANNEL_TYPE, batchSize());
            for (YyChannelEventInboxVo event : events) {
                processOne(event);
            }
            return events.size();
        } finally {
            running.set(false);
        }
    }

    private void processOne(YyChannelEventInboxVo event) {
        if (event == null || event.getId() == null) {
            return;
        }
        try {
            YyChannelWebhookResultVo result = channelAdapterService.handleWebhook(CHANNEL_TYPE, event.getRawPayload());
            if (Boolean.TRUE.equals(result == null ? null : result.getProcessed())) {
                eventInboxService.markDone(event.getId(), "processed by inbox worker");
                return;
            }
            String message = result == null ? "webhook result is empty" : firstNotBlank(result.getMessage(), "webhook not processed");
            retryOrDead(event, message);
        } catch (Exception ex) {
            retryOrDead(event, firstNotBlank(ex.getMessage(), ex.getClass().getSimpleName()));
        }
    }

    private void retryOrDead(YyChannelEventInboxVo event, String message) {
        int retryCount = event.getRetryCount() == null ? 0 : event.getRetryCount();
        if (retryCount >= maxRetries()) {
            eventInboxService.markDead(event.getId(), message);
            return;
        }
        eventInboxService.markRetry(event.getId(), message, nextRetryTime());
    }

    private Date nextRetryTime() {
        return new Date(System.currentTimeMillis() + retryDelaySeconds() * 1000L);
    }

    private boolean isEnabled() {
        return Boolean.parseBoolean(prop("yy.douyin.life.event-inbox-worker.enabled", "true"));
    }

    private int batchSize() {
        return positiveInt(prop("yy.douyin.life.event-inbox-worker.batch-size", String.valueOf(DEFAULT_BATCH_SIZE)), DEFAULT_BATCH_SIZE);
    }

    private int maxRetries() {
        return positiveInt(prop("yy.douyin.life.event-inbox-worker.max-retries", String.valueOf(DEFAULT_MAX_RETRIES)), DEFAULT_MAX_RETRIES);
    }

    private int retryDelaySeconds() {
        return positiveInt(prop("yy.douyin.life.event-inbox-worker.retry-delay-seconds", String.valueOf(DEFAULT_RETRY_DELAY_SECONDS)), DEFAULT_RETRY_DELAY_SECONDS);
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
}
