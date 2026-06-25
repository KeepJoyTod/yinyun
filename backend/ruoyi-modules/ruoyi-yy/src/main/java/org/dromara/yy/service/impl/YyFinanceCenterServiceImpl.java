package org.dromara.yy.service.impl;

import org.apache.commons.lang3.StringUtils;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.bo.YyFinanceTransactionQueryBo;
import org.dromara.yy.domain.vo.YyFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyFinanceTransactionVo;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.service.IYyFinanceCenterService;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class YyFinanceCenterServiceImpl implements IYyFinanceCenterService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final YyPaymentRecordMapper yyPaymentRecordMapper;

    public YyFinanceCenterServiceImpl(YyPaymentRecordMapper yyPaymentRecordMapper) {
        this.yyPaymentRecordMapper = yyPaymentRecordMapper;
    }

    @Override
    public YyFinanceOverviewVo getOverview() {
        List<YyPaymentRecord> records = paymentRecords();
        long paid = records.stream()
            .filter(this::isPaid)
            .mapToLong(record -> firstPositive(record.getPaidAmountCent(), record.getAmountCent(), 0L))
            .sum();
        long refund = records.stream()
            .mapToLong(record -> firstPositive(record.getRefundAmountCent(), 0L))
            .sum();

        YyFinanceOverviewVo vo = new YyFinanceOverviewVo();
        vo.setAccountId("yy-payment-record");
        vo.setAvailableBalanceCent(Math.max(paid - refund, 0L));
        vo.setPrepaidBalanceCent(paid);
        vo.setDebtBalanceCent(0L);
        vo.setStatus(records.isEmpty() ? "scaffold" : "ready");
        return vo;
    }

    @Override
    public List<YyFinanceTransactionVo> listTransactions(YyFinanceTransactionQueryBo bo) {
        String transactionType = StringUtils.defaultString(bo == null ? null : bo.getTransactionType()).trim();
        List<YyPaymentRecord> records = paymentRecords().stream()
            .filter(record -> StringUtils.isBlank(transactionType) || StringUtils.equalsIgnoreCase(record.getPayStatus(), transactionType))
            .sorted(Comparator.comparing(this::occurredAt, Comparator.nullsLast(Comparator.naturalOrder())))
            .toList();
        if (records.isEmpty()) {
            return List.of(scaffoldTransaction());
        }

        AtomicLong balance = new AtomicLong(0L);
        return records.stream()
            .map(record -> transaction(record, balance.addAndGet(transactionAmount(record))))
            .sorted(Comparator.comparing(YyFinanceTransactionVo::getOccurredAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();
    }

    private List<YyPaymentRecord> paymentRecords() {
        List<YyPaymentRecord> rows = yyPaymentRecordMapper.selectList(null);
        return rows == null ? List.of() : rows;
    }

    private YyFinanceTransactionVo transaction(YyPaymentRecord record, long balanceAfter) {
        YyFinanceTransactionVo vo = new YyFinanceTransactionVo();
        vo.setTransactionId(String.valueOf(record.getId()));
        vo.setTransactionType(StringUtils.defaultIfBlank(record.getPayStatus(), "UNKNOWN"));
        vo.setTransactionItem(firstNotBlank(record.getProvider(), record.getChannelType(), "payment"));
        vo.setAmountCent(transactionAmount(record));
        vo.setBalanceAfterCent(balanceAfter);
        vo.setOccurredAt(formatDate(occurredAt(record)));
        vo.setStatus("ready");
        return vo;
    }

    private YyFinanceTransactionVo scaffoldTransaction() {
        YyFinanceTransactionVo vo = new YyFinanceTransactionVo();
        vo.setTransactionId("finance-empty");
        vo.setTransactionType("SCAFFOLD");
        vo.setTransactionItem("No payment ledger rows");
        vo.setAmountCent(0L);
        vo.setBalanceAfterCent(0L);
        vo.setOccurredAt("");
        vo.setStatus("scaffold");
        return vo;
    }

    private long transactionAmount(YyPaymentRecord record) {
        long paid = firstPositive(record.getPaidAmountCent(), record.getAmountCent(), 0L);
        long refund = firstPositive(record.getRefundAmountCent(), 0L);
        return paid - refund;
    }

    private boolean isPaid(YyPaymentRecord record) {
        String status = StringUtils.defaultString(record.getPayStatus()).trim().toUpperCase(Locale.ROOT);
        return "PAID".equals(status) || "SUCCESS".equals(status) || "DONE".equals(status);
    }

    private Date occurredAt(YyPaymentRecord record) {
        if (record.getPaidTime() != null) return record.getPaidTime();
        if (record.getNotifyTime() != null) return record.getNotifyTime();
        return record.getCreateTime();
    }

    private static Long firstPositive(Long first, Long second) {
        return firstPositive(first, second, 0L);
    }

    private static Long firstPositive(Long first, Long second, Long fallback) {
        if (first != null && first > 0) return first;
        if (second != null && second > 0) return second;
        return fallback;
    }

    private static String firstNotBlank(String first, String second, String fallback) {
        if (StringUtils.isNotBlank(first)) return first;
        if (StringUtils.isNotBlank(second)) return second;
        return fallback;
    }

    private static String formatDate(Date date) {
        if (date == null) {
            return "";
        }
        return DATE_TIME_FORMATTER.format(date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
    }
}
