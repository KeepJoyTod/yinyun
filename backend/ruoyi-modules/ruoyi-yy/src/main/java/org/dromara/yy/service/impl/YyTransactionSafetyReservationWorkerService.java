package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.bo.YyTransactionSafetyActionBo;
import org.dromara.yy.domain.vo.YyEntitlementReservationVo;
import org.dromara.yy.service.IYyTransactionSafetyService;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 交易安全权益预占超时释放 worker。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class YyTransactionSafetyReservationWorkerService {

    private static final int DEFAULT_BATCH_SIZE = 50;

    private final IYyTransactionSafetyService transactionSafetyService;
    private final Environment environment;
    private final AtomicBoolean running = new AtomicBoolean(false);

    @Scheduled(
        initialDelayString = "${yy.transaction-safety.reservation-worker.initial-delay-ms:45000}",
        fixedDelayString = "${yy.transaction-safety.reservation-worker.fixed-delay-ms:45000}"
    )
    public void scheduledRun() {
        if (!isEnabled()) {
            log.debug("交易安全预占释放 worker 跳过: disabled");
            return;
        }
        int released = runOnce();
        if (released > 0) {
            log.info("交易安全预占释放 worker 完成: released={}", released);
        }
    }

    public int runOnce() {
        if (!isEnabled()) {
            return 0;
        }
        if (!running.compareAndSet(false, true)) {
            log.info("交易安全预占释放 worker 跳过: previous run still active");
            return 0;
        }
        try {
            YyTransactionSafetyActionBo action = new YyTransactionSafetyActionBo();
            action.setReason("worker auto release expired reservations");
            action.setLocalAdapterRef("reservation-worker");
            action.setLimit(batchSize());
            List<YyEntitlementReservationVo> released = transactionSafetyService.releaseExpiredEntitlementReservations(action);
            return released == null ? 0 : released.size();
        } finally {
            running.set(false);
        }
    }

    private boolean isEnabled() {
        return Boolean.parseBoolean(prop("yy.transaction-safety.reservation-worker.enabled", "true"));
    }

    private int batchSize() {
        return positiveInt(prop("yy.transaction-safety.reservation-worker.batch-size", String.valueOf(DEFAULT_BATCH_SIZE)), DEFAULT_BATCH_SIZE);
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
}
