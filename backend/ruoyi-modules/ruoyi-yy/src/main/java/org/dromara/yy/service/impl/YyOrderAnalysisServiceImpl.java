package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.vo.YyOrderAnalysisChannelVo;
import org.dromara.yy.domain.vo.YyOrderAnalysisFunnelStageVo;
import org.dromara.yy.domain.vo.YyOrderAnalysisOverviewVo;
import org.dromara.yy.domain.vo.YyOrderAnalysisRefundVo;
import org.dromara.yy.domain.vo.YyOrderAnalysisScaffoldVo;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.service.IYyOrderAnalysisService;
import org.dromara.yy.service.dashboard.YyDashboardDomainSupport;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class YyOrderAnalysisServiceImpl implements IYyOrderAnalysisService {

    private static final String BOUNDARY_NOTE = "订购分析优先读取 yy_payment_record；无支付流水时回退 yy_order.paidAmountCent/refundAmountCent，不写第二套统计账本。";
    private static final Set<String> PENDING_CONFIRM_STATUSES = Set.of("", "PENDING", "待确认");
    private static final Set<String> REFUND_ATTENTION_STATUSES = Set.of("REFUNDING", "REFUNDED", "FULL_REFUNDED", "PARTIAL_REFUNDED");

    private final YyOrderMapper yyOrderMapper;
    private final YyPaymentRecordMapper yyPaymentRecordMapper;

    public YyOrderAnalysisServiceImpl(YyOrderMapper yyOrderMapper, YyPaymentRecordMapper yyPaymentRecordMapper) {
        this.yyOrderMapper = yyOrderMapper;
        this.yyPaymentRecordMapper = yyPaymentRecordMapper;
    }

    @Override
    public YyOrderAnalysisScaffoldVo queryOverview(Long storeId, String dateFrom, String dateTo) {
        DateRange range = normalizeDateRange(dateFrom, dateTo);
        List<YyOrder> orders = loadOrders(storeId, range);
        if (orders.isEmpty()) {
            return emptyScaffold();
        }

        Map<Long, PaymentAggregate> paymentByOrderId = aggregatePayments(orders);
        YyOrderAnalysisScaffoldVo scaffold = new YyOrderAnalysisScaffoldVo();
        scaffold.setOverview(buildOverview(orders, paymentByOrderId));
        scaffold.setFunnel(buildFunnel(orders, paymentByOrderId));
        scaffold.setChannels(buildChannels(orders, paymentByOrderId));
        scaffold.setRefunds(buildRefunds(orders, paymentByOrderId));
        return scaffold;
    }

    private List<YyOrder> loadOrders(Long storeId, DateRange range) {
        List<YyOrder> rows = yyOrderMapper.selectList(Wrappers.<YyOrder>lambdaQuery()
            .eq(storeId != null, YyOrder::getStoreId, storeId)
            .ge(YyOrder::getOrderTime, range.start())
            .le(YyOrder::getOrderTime, range.end())
            .orderByDesc(YyOrder::getOrderTime)
            .orderByDesc(YyOrder::getId));
        return rows == null ? List.of() : rows;
    }

    private Map<Long, PaymentAggregate> aggregatePayments(List<YyOrder> orders) {
        List<Long> orderIds = orders.stream().map(YyOrder::getId).filter(id -> id != null && id > 0).distinct().toList();
        if (orderIds.isEmpty()) {
            return Map.of();
        }
        List<YyPaymentRecord> rows = yyPaymentRecordMapper.selectList(Wrappers.<YyPaymentRecord>lambdaQuery()
            .in(YyPaymentRecord::getOrderId, orderIds)
            .orderByDesc(YyPaymentRecord::getId));
        if (rows == null || rows.isEmpty()) {
            return Map.of();
        }
        Map<Long, PaymentAggregate> result = new LinkedHashMap<>();
        for (YyPaymentRecord record : rows) {
            Long orderId = record.getOrderId();
            if (orderId == null) {
                continue;
            }
            PaymentAggregate current = result.getOrDefault(orderId, PaymentAggregate.empty());
            long paidAmount = isPaidRecord(record)
                ? YyDashboardDomainSupport.firstPositive(record.getPaidAmountCent(), record.getAmountCent(), 0L)
                : 0L;
            long refundAmount = YyDashboardDomainSupport.firstPositive(record.getRefundAmountCent(), 0L, 0L);
            boolean paid = current.paid() || isPaidRecord(record);
            boolean refundAttention = current.refundAttention() || isRefundAttentionRecord(record);
            String refundStatus = StringUtils.isNotBlank(current.refundStatus())
                ? current.refundStatus()
                : normalizeText(record.getRefundStatus());
            String channelType = StringUtils.isNotBlank(current.channelType())
                ? current.channelType()
                : normalizeText(record.getChannelType());
            result.put(orderId, new PaymentAggregate(
                current.paidAmountCent() + paidAmount,
                current.refundAmountCent() + refundAmount,
                paid,
                refundAttention,
                refundStatus,
                channelType
            ));
        }
        return result;
    }

    private YyOrderAnalysisOverviewVo buildOverview(List<YyOrder> orders, Map<Long, PaymentAggregate> paymentByOrderId) {
        long paidOrderCount = orders.stream().filter(order -> isPaid(order, paymentByOrderId)).count();
        long paidAmountCent = orders.stream().mapToLong(order -> paidAmountCent(order, paymentByOrderId)).sum();
        long refundOrderCount = orders.stream().filter(order -> isRefundAttention(order, paymentByOrderId)).count();
        long refundAmountCent = orders.stream().mapToLong(order -> refundAmountCent(order, paymentByOrderId)).sum();
        long pendingAttentionCount = orders.stream().filter(order -> !isPaid(order, paymentByOrderId) || isRefundAttention(order, paymentByOrderId)).count();

        YyOrderAnalysisOverviewVo overview = new YyOrderAnalysisOverviewVo();
        overview.setOrderedCount((long) orders.size());
        overview.setPaidOrderCount(paidOrderCount);
        overview.setPaidAmountCent(paidAmountCent);
        overview.setRefundOrderCount(refundOrderCount);
        overview.setRefundAmountCent(refundAmountCent);
        overview.setPendingAttentionCount(pendingAttentionCount);
        overview.setBoundaryNote(BOUNDARY_NOTE);
        return overview;
    }

    private List<YyOrderAnalysisFunnelStageVo> buildFunnel(List<YyOrder> orders, Map<Long, PaymentAggregate> paymentByOrderId) {
        long orderedCount = orders.size();
        long orderedAmount = orders.stream().mapToLong(this::orderAmountCent).sum();
        long paidCount = orders.stream().filter(order -> isPaid(order, paymentByOrderId)).count();
        long paidAmount = orders.stream().mapToLong(order -> paidAmountCent(order, paymentByOrderId)).sum();
        long confirmedCount = orders.stream().filter(order -> isConfirmedService(order)).count();
        long confirmedAmount = orders.stream()
            .filter(this::isConfirmedService)
            .mapToLong(order -> paidAmountCent(order, paymentByOrderId) > 0 ? paidAmountCent(order, paymentByOrderId) : orderAmountCent(order))
            .sum();
        long refundCount = orders.stream().filter(order -> isRefundAttention(order, paymentByOrderId)).count();
        long refundAmount = orders.stream().mapToLong(order -> refundAmountCent(order, paymentByOrderId)).sum();

        return List.of(
            stage("ordered", "已下单", orderedCount, orderedAmount, 1D),
            stage("paid", "已支付", paidCount, paidAmount, YyDashboardDomainSupport.ratio(paidCount, orderedCount)),
            stage("confirmed", "已确认服务", confirmedCount, confirmedAmount, YyDashboardDomainSupport.ratio(confirmedCount, paidCount)),
            stage("refund_attention", "已退款/退款中关注", refundCount, refundAmount, YyDashboardDomainSupport.ratio(refundCount, confirmedCount == 0 ? orderedCount : confirmedCount))
        );
    }

    private List<YyOrderAnalysisChannelVo> buildChannels(List<YyOrder> orders, Map<Long, PaymentAggregate> paymentByOrderId) {
        Map<String, List<YyOrder>> groups = orders.stream()
            .collect(Collectors.groupingBy(order -> channelLabel(order, paymentByOrderId), LinkedHashMap::new, Collectors.toList()));

        return groups.entrySet().stream().map(entry -> {
            List<YyOrder> grouped = entry.getValue();
            YyOrderAnalysisChannelVo vo = new YyOrderAnalysisChannelVo();
            vo.setChannelKey(entry.getKey());
            vo.setChannelLabel(entry.getKey());
            vo.setOrderCount((long) grouped.size());
            vo.setPaidAmountCent(grouped.stream().mapToLong(order -> paidAmountCent(order, paymentByOrderId)).sum());
            vo.setRefundAmountCent(grouped.stream().mapToLong(order -> refundAmountCent(order, paymentByOrderId)).sum());
            vo.setPendingCount(grouped.stream().filter(order -> !isPaid(order, paymentByOrderId) || isRefundAttention(order, paymentByOrderId)).count());
            return vo;
        }).toList();
    }

    private List<YyOrderAnalysisRefundVo> buildRefunds(List<YyOrder> orders, Map<Long, PaymentAggregate> paymentByOrderId) {
        Map<String, List<YyOrder>> groups = orders.stream()
            .filter(order -> isRefundAttention(order, paymentByOrderId))
            .collect(Collectors.groupingBy(order -> refundStatusLabel(order, paymentByOrderId), LinkedHashMap::new, Collectors.toList()));

        return groups.entrySet().stream().map(entry -> {
            List<YyOrder> grouped = entry.getValue();
            YyOrderAnalysisRefundVo vo = new YyOrderAnalysisRefundVo();
            vo.setRefundStatus(entry.getKey());
            vo.setOrderCount((long) grouped.size());
            vo.setRefundAmountCent(grouped.stream().mapToLong(order -> refundAmountCent(order, paymentByOrderId)).sum());
            vo.setNote(refundStatusNote(entry.getKey()));
            return vo;
        }).toList();
    }

    private boolean isConfirmedService(YyOrder order) {
        return !PENDING_CONFIRM_STATUSES.contains(normalizeText(order.getStatus()));
    }

    private String channelLabel(YyOrder order, Map<Long, PaymentAggregate> paymentByOrderId) {
        String channelType = normalizeText(order.getChannelType());
        if (StringUtils.isNotBlank(channelType)) {
            return channelType;
        }
        PaymentAggregate aggregate = paymentByOrderId.get(order.getId());
        if (aggregate != null && StringUtils.isNotBlank(aggregate.channelType())) {
            return aggregate.channelType();
        }
        String source = normalizeText(order.getSource());
        return StringUtils.isNotBlank(source) ? source : "未标记来源";
    }

    private String refundStatusLabel(YyOrder order, Map<Long, PaymentAggregate> paymentByOrderId) {
        String refundStatus = normalizeText(order.getRefundStatus());
        if (StringUtils.isNotBlank(refundStatus)) {
            return refundStatus;
        }
        PaymentAggregate aggregate = paymentByOrderId.get(order.getId());
        if (aggregate != null && StringUtils.isNotBlank(aggregate.refundStatus())) {
            return aggregate.refundStatus();
        }
        return refundAmountCent(order, paymentByOrderId) > 0 ? "REFUND_AMOUNT_ONLY" : "REFUNDING";
    }

    private String refundStatusNote(String refundStatus) {
        return switch (normalizeText(refundStatus)) {
            case "REFUNDED", "FULL_REFUNDED" -> "退款金额已回写账本，仍需与财务和渠道流水核对。";
            case "PARTIAL_REFUNDED" -> "订单发生部分退款，后续需补齐剩余履约和对账说明。";
            case "REFUNDING" -> "退款申请已进入关注范围，仍需核对渠道处理结果。";
            case "REFUND_AMOUNT_ONLY" -> "账本已有退款金额，但退款状态未明确，需要人工复核。";
            default -> "退款状态来自现有账本字段，后续仍需接真实退款闭环。";
        };
    }

    private boolean isPaid(YyOrder order, Map<Long, PaymentAggregate> paymentByOrderId) {
        PaymentAggregate aggregate = paymentByOrderId.get(order.getId());
        if (aggregate != null && aggregate.paid()) {
            return true;
        }
        return YyDashboardDomainSupport.isPaid(order);
    }

    private long paidAmountCent(YyOrder order, Map<Long, PaymentAggregate> paymentByOrderId) {
        PaymentAggregate aggregate = paymentByOrderId.get(order.getId());
        if (aggregate != null && aggregate.paidAmountCent() > 0) {
            return aggregate.paidAmountCent();
        }
        return YyDashboardDomainSupport.paidAmountCent(order, orderAmountCent(order));
    }

    private boolean isRefundAttention(YyOrder order, Map<Long, PaymentAggregate> paymentByOrderId) {
        PaymentAggregate aggregate = paymentByOrderId.get(order.getId());
        if (aggregate != null && aggregate.refundAttention()) {
            return true;
        }
        String refundStatus = normalizeText(order.getRefundStatus());
        return REFUND_ATTENTION_STATUSES.contains(refundStatus)
            || YyDashboardDomainSupport.isRefunded(order)
            || YyDashboardDomainSupport.valueOrZero(order.getRefundAmountCent()) > 0;
    }

    private long refundAmountCent(YyOrder order, Map<Long, PaymentAggregate> paymentByOrderId) {
        PaymentAggregate aggregate = paymentByOrderId.get(order.getId());
        if (aggregate != null && aggregate.refundAmountCent() > 0) {
            return aggregate.refundAmountCent();
        }
        return YyDashboardDomainSupport.valueOrZero(order.getRefundAmountCent());
    }

    private boolean isPaidRecord(YyPaymentRecord record) {
        String payStatus = normalizeText(record.getPayStatus());
        return List.of("PAID", "SUCCESS", "DONE", "PARTIAL_REFUNDED").contains(payStatus)
            || YyDashboardDomainSupport.firstPositive(record.getPaidAmountCent(), record.getAmountCent(), 0L) > 0;
    }

    private boolean isRefundAttentionRecord(YyPaymentRecord record) {
        String refundStatus = normalizeText(record.getRefundStatus());
        return REFUND_ATTENTION_STATUSES.contains(refundStatus)
            || YyDashboardDomainSupport.firstPositive(record.getRefundAmountCent(), 0L, 0L) > 0;
    }

    private long orderAmountCent(YyOrder order) {
        return YyDashboardDomainSupport.valueOrZero(order.getTotalAmountCent());
    }

    private YyOrderAnalysisFunnelStageVo stage(String key, String label, long orderCount, long amountCent, double conversionRate) {
        YyOrderAnalysisFunnelStageVo vo = new YyOrderAnalysisFunnelStageVo();
        vo.setStageKey(key);
        vo.setStageLabel(label);
        vo.setOrderCount(orderCount);
        vo.setAmountCent(amountCent);
        vo.setConversionRate(conversionRate);
        return vo;
    }

    private YyOrderAnalysisScaffoldVo emptyScaffold() {
        YyOrderAnalysisScaffoldVo scaffold = new YyOrderAnalysisScaffoldVo();
        YyOrderAnalysisOverviewVo overview = new YyOrderAnalysisOverviewVo();
        overview.setOrderedCount(0L);
        overview.setPaidOrderCount(0L);
        overview.setPaidAmountCent(0L);
        overview.setRefundOrderCount(0L);
        overview.setRefundAmountCent(0L);
        overview.setPendingAttentionCount(0L);
        overview.setBoundaryNote(BOUNDARY_NOTE);
        scaffold.setOverview(overview);
        return scaffold;
    }

    private DateRange normalizeDateRange(String dateFrom, String dateTo) {
        LocalDate from = StringUtils.isBlank(dateFrom) ? LocalDate.now().withDayOfMonth(1) : parseDate(dateFrom, "开始日期格式错误，应为 yyyy-MM-dd");
        LocalDate to = StringUtils.isBlank(dateTo) ? LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()) : parseDate(dateTo, "结束日期格式错误，应为 yyyy-MM-dd");
        if (from.isAfter(to)) {
            throw new ServiceException("开始日期不能晚于结束日期");
        }
        ZoneId zoneId = ZoneId.systemDefault();
        Date start = Date.from(from.atStartOfDay(zoneId).toInstant());
        Date end = Date.from(to.atTime(LocalTime.MAX).atZone(zoneId).toInstant());
        return new DateRange(start, end);
    }

    private LocalDate parseDate(String value, String message) {
        try {
            return LocalDate.parse(StringUtils.trim(value));
        } catch (Exception ex) {
            throw new ServiceException(message);
        }
    }

    private String normalizeText(String value) {
        return StringUtils.defaultString(value).trim().toUpperCase(Locale.ROOT);
    }

    private record DateRange(Date start, Date end) {
    }

    private record PaymentAggregate(
        long paidAmountCent,
        long refundAmountCent,
        boolean paid,
        boolean refundAttention,
        String refundStatus,
        String channelType
    ) {
        private static PaymentAggregate empty() {
            return new PaymentAggregate(0L, 0L, false, false, "", "");
        }
    }
}
