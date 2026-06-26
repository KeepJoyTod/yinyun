package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyCompositePaymentOrder;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyEntitlementReservation;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberWithdrawOrder;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.YyStoredValueConsumeOrder;
import org.dromara.yy.domain.vo.YyReportFinanceDifferenceVo;
import org.dromara.yy.domain.vo.YyReportFinanceExportPayloadVo;
import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;
import org.dromara.yy.domain.vo.YyReportFinanceLedgerLineVo;
import org.dromara.yy.domain.vo.YyReportFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;
import org.dromara.yy.mapper.YyCompositePaymentOrderMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyEntitlementReservationMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberWithdrawOrderMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.mapper.YyStoredValueConsumeOrderMapper;
import org.dromara.yy.service.IYyAsyncTaskService;
import org.dromara.yy.service.IYyReportFinanceReconciliationService;
import org.dromara.yy.service.dashboard.YyDashboardDomainSupport;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class YyReportFinanceReconciliationServiceImpl implements IYyReportFinanceReconciliationService {

    private static final String BOUNDARY_NOTE = "report-finance reconciles existing yy_order, yy_payment_record, stored-value, withdraw, composite-payment and entitlement ledgers; it does not create a second financial ledger or call external payment platforms.";
    private static final Set<String> PAID_PAYMENT_STATUSES = Set.of("PAID", "SUCCESS", "DONE", "PARTIAL_REFUNDED", "REFUNDED", "FULL_REFUNDED");
    private static final Set<String> REFUND_STATUSES = Set.of("REFUNDING", "REFUNDED", "FULL_REFUNDED", "PARTIAL_REFUNDED");
    private static final Set<String> CONFIRMED_STATUSES = Set.of("CONFIRMED", "PAID", "SUCCESS", "DONE", "SETTLED");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final YyOrderMapper yyOrderMapper;
    private final YyPaymentRecordMapper yyPaymentRecordMapper;
    private final YyCompositePaymentOrderMapper compositePaymentOrderMapper;
    private final YyStoredValueConsumeOrderMapper storedValueConsumeOrderMapper;
    private final YyMemberWithdrawOrderMapper memberWithdrawOrderMapper;
    private final YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;
    private final YyEntitlementReservationMapper entitlementReservationMapper;
    private final IYyAsyncTaskService asyncTaskService;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    public YyReportFinanceReconciliationServiceImpl(
        YyOrderMapper yyOrderMapper,
        YyPaymentRecordMapper yyPaymentRecordMapper,
        YyCompositePaymentOrderMapper compositePaymentOrderMapper,
        YyStoredValueConsumeOrderMapper storedValueConsumeOrderMapper,
        YyMemberWithdrawOrderMapper memberWithdrawOrderMapper,
        YyMemberBalanceLedgerMapper memberBalanceLedgerMapper,
        YyEntitlementReservationMapper entitlementReservationMapper,
        IYyAsyncTaskService asyncTaskService,
        YyEmployeeMapper employeeMapper,
        YyEmployeeStoreMapper employeeStoreMapper
    ) {
        this.yyOrderMapper = yyOrderMapper;
        this.yyPaymentRecordMapper = yyPaymentRecordMapper;
        this.compositePaymentOrderMapper = compositePaymentOrderMapper;
        this.storedValueConsumeOrderMapper = storedValueConsumeOrderMapper;
        this.memberWithdrawOrderMapper = memberWithdrawOrderMapper;
        this.memberBalanceLedgerMapper = memberBalanceLedgerMapper;
        this.entitlementReservationMapper = entitlementReservationMapper;
        this.asyncTaskService = asyncTaskService;
        this.employeeMapper = employeeMapper;
        this.employeeStoreMapper = employeeStoreMapper;
    }

    @Override
    public YyReportFinanceReconciliationVo queryOverview(Long storeId, String dateFrom, String dateTo) {
        DateRange range = normalizeDateRange(dateFrom, dateTo);
        FinanceRows rows = loadRows(resolveStoreSelection(storeId), range);
        return buildReconciliation(rows, range.dateFrom(), range.dateTo(), storeId);
    }

    @Override
    public YyReportFinanceReconciliationVo queryOverviewForExportTask(YyReportFinanceExportPayloadVo payload) {
        if (payload == null) {
            throw new ServiceException("export payload cannot be empty");
        }
        DateRange range = normalizeDateRange(payload.getDateFrom(), payload.getDateTo());
        FinanceRows rows = loadRows(resolvePayloadSelection(payload), range);
        return buildReconciliation(rows, range.dateFrom(), range.dateTo(), payload.getRequestedStoreId());
    }

    private YyReportFinanceReconciliationVo buildReconciliation(FinanceRows rows, String dateFrom, String dateTo, Long storeId) {

        long orderAmountCent = rows.orders().stream().mapToLong(order -> valueOrZero(order.getTotalAmountCent())).sum();
        long orderPaidCent = rows.orders().stream().mapToLong(order -> paidAmountFromOrder(order)).sum();
        long paymentPaidCent = rows.payments().stream().filter(this::isPaidPayment).mapToLong(this::paidAmountFromPayment).sum();
        long refundCent = rows.payments().stream().mapToLong(record -> valueOrZero(record.getRefundAmountCent())).sum()
            + rows.orders().stream().mapToLong(order -> valueOrZero(order.getRefundAmountCent())).sum();
        long storedValueConsumeCent = rows.storedValueConsumes().stream()
            .filter(item -> isConfirmedStatus(item.getStatus()))
            .mapToLong(item -> amountToCent(item.getConsumeAmount()))
            .sum();
        long storedValueReversalCent = rows.balanceLedgers().stream()
            .filter(item -> containsText(item.getChangeType(), "REVERS") || containsText(item.getSourceType(), "REVERS") || positiveAmount(item.getChangeAmount()))
            .mapToLong(item -> Math.abs(amountToCent(item.getChangeAmount())))
            .sum();
        long withdrawPaidCent = rows.withdrawOrders().stream()
            .filter(item -> isConfirmedStatus(item.getStatus()) || item.getPaidTime() != null)
            .mapToLong(item -> amountToCent(item.getWithdrawAmount()))
            .sum();
        long discountCent = rows.compositePayments().stream().mapToLong(item -> amountToCent(item.getDiscountAmount())).sum();
        long waiveCent = rows.compositePayments().stream().mapToLong(item -> amountToCent(item.getWaiveAmount())).sum();

        long collectedCent = paymentPaidCent > 0 ? paymentPaidCent : orderPaidCent;
        long diffCent = orderPaidCent - collectedCent;
        long attentionCount = rows.orders().stream().filter(order -> !YyDashboardDomainSupport.isPaid(order)).count()
            + rows.payments().stream().filter(this::isRefundAttention).count()
            + rows.entitlementReservations().stream().filter(item -> "RESERVED".equals(normalizeText(item.getStatus()))).count();

        YyReportFinanceReconciliationVo vo = new YyReportFinanceReconciliationVo();
        vo.setOverview(buildOverview(orderAmountCent, collectedCent, refundCent, storedValueConsumeCent, storedValueReversalCent, withdrawPaidCent, discountCent, waiveCent, diffCent, attentionCount));
        vo.setOrderLedgers(buildOrderLedgers(rows, orderAmountCent, orderPaidCent, refundCent));
        vo.setFundLedgers(buildFundLedgers(rows, paymentPaidCent, storedValueConsumeCent, storedValueReversalCent, withdrawPaidCent, discountCent, waiveCent));
        vo.setDifferences(buildDifferences(diffCent, rows));
        vo.setExportTasks(asyncTaskService.listFinanceExportTasks(storeId, dateFrom, dateTo));
        return vo;
    }

    @Override
    public YyReportFinanceExportTaskVo createExportTask(Long storeId, String dateFrom, String dateTo) {
        DateRange range = normalizeDateRange(dateFrom, dateTo);
        StoreSelection selection = resolveStoreSelection(storeId);
        if (selection.restricted() && selection.scopedStoreIds().isEmpty()) {
            throw new ServiceException("当前账号没有可导出的门店范围");
        }
        YyReportFinanceExportPayloadVo payload = new YyReportFinanceExportPayloadVo();
        payload.setRequestedStoreId(storeId);
        payload.setScopedStoreIds(selection.scopedStoreIds().stream().sorted().toList());
        payload.setDateFrom(range.dateFrom());
        payload.setDateTo(range.dateTo());
        payload.setCreatorUserId(LoginHelper.getUserId());
        return asyncTaskService.enqueueFinanceExportTask(payload);
    }

    @Override
    public List<YyReportFinanceExportTaskVo> listExportTasks(Long storeId, String dateFrom, String dateTo) {
        DateRange range = normalizeDateRange(dateFrom, dateTo);
        return asyncTaskService.listFinanceExportTasks(storeId, range.dateFrom(), range.dateTo());
    }

    private FinanceRows loadRows(StoreSelection selection, DateRange range) {
        List<YyOrder> orders = nullSafe(yyOrderMapper.selectList(Wrappers.<YyOrder>lambdaQuery()
            .eq(selection.useExactStore(), YyOrder::getStoreId, selection.requestedStoreId())
            .in(selection.useScopedStores(), YyOrder::getStoreId, selection.scopedStoreIds())
            .apply(selection.alwaysEmpty(), "1 = 0")
            .ge(YyOrder::getOrderTime, range.start())
            .le(YyOrder::getOrderTime, range.end())));
        List<YyPaymentRecord> payments = nullSafe(yyPaymentRecordMapper.selectList(Wrappers.<YyPaymentRecord>lambdaQuery()
            .eq(selection.useExactStore(), YyPaymentRecord::getStoreId, selection.requestedStoreId())
            .in(selection.useScopedStores(), YyPaymentRecord::getStoreId, selection.scopedStoreIds())
            .apply(selection.alwaysEmpty(), "1 = 0")
            .ge(YyPaymentRecord::getPaidTime, range.start())
            .le(YyPaymentRecord::getPaidTime, range.end())));
        List<YyCompositePaymentOrder> compositePayments = nullSafe(compositePaymentOrderMapper.selectList(Wrappers.<YyCompositePaymentOrder>lambdaQuery()
            .eq(selection.useExactStore(), YyCompositePaymentOrder::getStoreId, selection.requestedStoreId())
            .in(selection.useScopedStores(), YyCompositePaymentOrder::getStoreId, selection.scopedStoreIds())
            .apply(selection.alwaysEmpty(), "1 = 0")
            .ge(YyCompositePaymentOrder::getCreateTime, range.start())
            .le(YyCompositePaymentOrder::getCreateTime, range.end())));
        List<YyStoredValueConsumeOrder> storedValueConsumes = nullSafe(storedValueConsumeOrderMapper.selectList(Wrappers.<YyStoredValueConsumeOrder>lambdaQuery()
            .eq(selection.useExactStore(), YyStoredValueConsumeOrder::getStoreId, selection.requestedStoreId())
            .in(selection.useScopedStores(), YyStoredValueConsumeOrder::getStoreId, selection.scopedStoreIds())
            .apply(selection.alwaysEmpty(), "1 = 0")
            .ge(YyStoredValueConsumeOrder::getConfirmedTime, range.start())
            .le(YyStoredValueConsumeOrder::getConfirmedTime, range.end())));
        List<YyMemberWithdrawOrder> withdrawOrders = nullSafe(memberWithdrawOrderMapper.selectList(Wrappers.<YyMemberWithdrawOrder>lambdaQuery()
            .eq(selection.useExactStore(), YyMemberWithdrawOrder::getStoreId, selection.requestedStoreId())
            .in(selection.useScopedStores(), YyMemberWithdrawOrder::getStoreId, selection.scopedStoreIds())
            .apply(selection.alwaysEmpty(), "1 = 0")
            .ge(YyMemberWithdrawOrder::getPaidTime, range.start())
            .le(YyMemberWithdrawOrder::getPaidTime, range.end())));
        List<YyMemberBalanceLedger> balanceLedgers = nullSafe(memberBalanceLedgerMapper.selectList(Wrappers.<YyMemberBalanceLedger>lambdaQuery()
            .eq(selection.useExactStore(), YyMemberBalanceLedger::getStoreId, selection.requestedStoreId())
            .in(selection.useScopedStores(), YyMemberBalanceLedger::getStoreId, selection.scopedStoreIds())
            .apply(selection.alwaysEmpty(), "1 = 0")
            .ge(YyMemberBalanceLedger::getHappenedAt, range.start())
            .le(YyMemberBalanceLedger::getHappenedAt, range.end())));
        List<YyEntitlementReservation> entitlementReservations = nullSafe(entitlementReservationMapper.selectList(Wrappers.<YyEntitlementReservation>lambdaQuery()
            .eq(selection.useExactStore(), YyEntitlementReservation::getStoreId, selection.requestedStoreId())
            .in(selection.useScopedStores(), YyEntitlementReservation::getStoreId, selection.scopedStoreIds())
            .apply(selection.alwaysEmpty(), "1 = 0")
            .ge(YyEntitlementReservation::getCreateTime, range.start())
            .le(YyEntitlementReservation::getCreateTime, range.end())));
        return new FinanceRows(orders, payments, compositePayments, storedValueConsumes, withdrawOrders, balanceLedgers, entitlementReservations);
    }

    private StoreSelection resolvePayloadSelection(YyReportFinanceExportPayloadVo payload) {
        Set<Long> scopedStoreIds = sanitizeStoreIds(payload.getScopedStoreIds());
        Long requestedStoreId = payload.getRequestedStoreId();
        if (requestedStoreId != null && !scopedStoreIds.isEmpty() && !scopedStoreIds.contains(requestedStoreId)) {
            throw new ServiceException("export payload store scope is invalid");
        }
        if (requestedStoreId != null) {
            return StoreSelection.exact(requestedStoreId);
        }
        if (scopedStoreIds.isEmpty()) {
            return StoreSelection.unrestricted();
        }
        return StoreSelection.scoped(scopedStoreIds);
    }

    private StoreSelection resolveStoreSelection(Long requestedStoreId) {
        StoreScope scope = resolveCurrentStoreScope();
        if (!scope.applicable() || scope.globalScope()) {
            return requestedStoreId == null ? StoreSelection.unrestricted() : StoreSelection.exact(requestedStoreId);
        }
        if (scope.storeIds().isEmpty()) {
            return StoreSelection.empty();
        }
        if (requestedStoreId == null) {
            return StoreSelection.scoped(scope.storeIds());
        }
        if (scope.storeIds().contains(requestedStoreId)) {
            return StoreSelection.exact(requestedStoreId);
        }
        return StoreSelection.empty();
    }

    private StoreScope resolveCurrentStoreScope() {
        if (!LoginHelper.isLogin()) {
            return StoreScope.notApplicable();
        }
        if (LoginHelper.isSuperAdmin() || LoginHelper.isTenantAdmin()) {
            return StoreScope.global();
        }
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            return StoreScope.empty();
        }
        YyEmployee employee = employeeMapper.selectOne(Wrappers.lambdaQuery(YyEmployee.class)
            .eq(YyEmployee::getUserId, loginUser.getUserId())
            .eq(YyEmployee::getStatus, "0")
            .last("limit 1"));
        if (employee == null) {
            return StoreScope.empty();
        }
        LinkedHashSet<Long> storeIds = new LinkedHashSet<>();
        if (employee.getId() != null) {
            List<YyEmployeeStore> employeeStores = employeeStoreMapper.selectList(
                Wrappers.<YyEmployeeStore>lambdaQuery()
                    .eq(YyEmployeeStore::getEmployeeId, employee.getId())
                    .eq(YyEmployeeStore::getDelFlag, "0")
                    .orderByAsc(YyEmployeeStore::getSort)
                    .orderByAsc(YyEmployeeStore::getId));
            employeeStores.stream()
                .map(YyEmployeeStore::getStoreId)
                .filter(Objects::nonNull)
                .forEach(storeIds::add);
        }
        if (storeIds.isEmpty() && employee.getStoreId() != null) {
            storeIds.add(employee.getStoreId());
        }
        return StoreScope.limited(storeIds);
    }

    private Set<Long> sanitizeStoreIds(Collection<Long> storeIds) {
        if (storeIds == null) {
            return Set.of();
        }
        return storeIds.stream()
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private YyReportFinanceOverviewVo buildOverview(long orderAmountCent, long paidAmountCent, long refundAmountCent, long storedValueConsumeCent, long storedValueReversalCent, long withdrawPaidCent, long discountAmountCent, long waiveAmountCent, long reconciliationDiffCent, long attentionCount) {
        YyReportFinanceOverviewVo overview = new YyReportFinanceOverviewVo();
        overview.setOrderAmountCent(orderAmountCent);
        overview.setPaidAmountCent(paidAmountCent);
        overview.setRefundAmountCent(refundAmountCent);
        overview.setStoredValueConsumeCent(storedValueConsumeCent);
        overview.setStoredValueReversalCent(storedValueReversalCent);
        overview.setWithdrawPaidCent(withdrawPaidCent);
        overview.setDiscountAmountCent(discountAmountCent);
        overview.setWaiveAmountCent(waiveAmountCent);
        overview.setReconciliationDiffCent(reconciliationDiffCent);
        overview.setAttentionCount(attentionCount);
        overview.setBoundaryNote(BOUNDARY_NOTE);
        return overview;
    }

    private List<YyReportFinanceLedgerLineVo> buildOrderLedgers(FinanceRows rows, long orderAmountCent, long orderPaidCent, long refundCent) {
        return List.of(
            ledger("order_total", "Order gross amount", rows.orders().size(), orderAmountCent, 0L, "yy_order.totalAmountCent", "yy_order"),
            ledger("order_paid", "Order paid amount", rows.orders().stream().filter(YyDashboardDomainSupport::isPaid).count(), orderPaidCent, 0L, "yy_order.paidAmountCent fallback", "yy_order"),
            ledger("order_refund", "Order refund amount", rows.orders().stream().filter(item -> valueOrZero(item.getRefundAmountCent()) > 0).count(), 0L, refundCent, "yy_order refund status/amount", "yy_order")
        );
    }

    private List<YyReportFinanceLedgerLineVo> buildFundLedgers(FinanceRows rows, long paymentPaidCent, long storedValueConsumeCent, long storedValueReversalCent, long withdrawPaidCent, long discountCent, long waiveCent) {
        return List.of(
            ledger("payment_record", "Payment records", rows.payments().size(), paymentPaidCent, rows.payments().stream().mapToLong(item -> valueOrZero(item.getRefundAmountCent())).sum(), "yy_payment_record.payStatus/refundStatus", "yy_payment_record"),
            ledger("stored_value_consume", "Stored-value consumption", rows.storedValueConsumes().size(), storedValueConsumeCent, storedValueReversalCent, "yy_stored_value_consume_order + yy_member_balance_ledger", "yy_stored_value_consume_order"),
            ledger("member_withdraw", "Member withdraw payout", rows.withdrawOrders().size(), withdrawPaidCent, 0L, "yy_member_withdraw_order.paidTime/status", "yy_member_withdraw_order"),
            ledger("composite_discount", "Discount and waive", rows.compositePayments().size(), discountCent + waiveCent, 0L, "yy_composite_payment_order.discountAmount/waiveAmount", "yy_composite_payment_order")
        );
    }

    private List<YyReportFinanceDifferenceVo> buildDifferences(long diffCent, FinanceRows rows) {
        List<YyReportFinanceDifferenceVo> differences = new ArrayList<>();
        if (diffCent != 0) {
            differences.add(difference("order_payment_diff", "Order paid amount differs from payment records", diffCent, rows.orders().size(), "HIGH", "Compare yy_order.paidAmountCent with yy_payment_record paid amount before closing finance."));
        }
        long pendingPaymentCount = rows.orders().stream().filter(order -> !YyDashboardDomainSupport.isPaid(order)).count();
        if (pendingPaymentCount > 0) {
            differences.add(difference("pending_payment_orders", "Unpaid orders in selected range", 0L, pendingPaymentCount, "MEDIUM", "These orders remain in order ledger but should not be treated as collected cash."));
        }
        long reservedEntitlements = rows.entitlementReservations().stream().filter(item -> "RESERVED".equals(normalizeText(item.getStatus()))).count();
        if (reservedEntitlements > 0) {
            long amountCent = rows.entitlementReservations().stream()
                .filter(item -> "RESERVED".equals(normalizeText(item.getStatus())))
                .mapToLong(item -> amountToCent(item.getReservationAmount()))
                .sum();
            differences.add(difference("reserved_entitlements", "Reserved entitlements not consumed/released", amountCent, reservedEntitlements, "MEDIUM", "Reserved entitlements need consume/release confirmation before final reconciliation."));
        }
        if (differences.isEmpty()) {
            differences.add(difference("no_blocking_difference", "No blocking reconciliation difference", 0L, 0L, "LOW", "Current ledgers have no blocking difference under local read-side rules."));
        }
        return differences;
    }

    private YyReportFinanceLedgerLineVo ledger(String key, String label, long count, long amountCent, long refundAmountCent, String statusSummary, String sourceTable) {
        YyReportFinanceLedgerLineVo vo = new YyReportFinanceLedgerLineVo();
        vo.setLedgerKey(key);
        vo.setLedgerLabel(label);
        vo.setRecordCount(count);
        vo.setAmountCent(amountCent);
        vo.setRefundAmountCent(refundAmountCent);
        vo.setStatusSummary(statusSummary);
        vo.setSourceTable(sourceTable);
        return vo;
    }

    private YyReportFinanceDifferenceVo difference(String key, String label, long amountCent, long recordCount, String severity, String note) {
        YyReportFinanceDifferenceVo vo = new YyReportFinanceDifferenceVo();
        vo.setDifferenceKey(key);
        vo.setDifferenceLabel(label);
        vo.setAmountCent(amountCent);
        vo.setRecordCount(recordCount);
        vo.setSeverity(severity);
        vo.setNote(note);
        return vo;
    }

    private DateRange normalizeDateRange(String dateFrom, String dateTo) {
        LocalDate from = StringUtils.isBlank(dateFrom) ? LocalDate.now().withDayOfMonth(1) : parseDate(dateFrom, "dateFrom must be yyyy-MM-dd");
        LocalDate to = StringUtils.isBlank(dateTo) ? LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()) : parseDate(dateTo, "dateTo must be yyyy-MM-dd");
        if (from.isAfter(to)) {
            throw new ServiceException("dateFrom cannot be later than dateTo");
        }
        ZoneId zoneId = ZoneId.systemDefault();
        return new DateRange(
            Date.from(from.atStartOfDay(zoneId).toInstant()),
            Date.from(to.atTime(LocalTime.MAX).atZone(zoneId).toInstant()),
            from.toString(),
            to.toString()
        );
    }

    private LocalDate parseDate(String value, String message) {
        try {
            return LocalDate.parse(StringUtils.trim(value));
        } catch (Exception ex) {
            throw new ServiceException(message);
        }
    }

    private boolean isPaidPayment(YyPaymentRecord record) {
        return PAID_PAYMENT_STATUSES.contains(normalizeText(record.getPayStatus()))
            || paidAmountFromPayment(record) > 0;
    }

    private boolean isRefundAttention(YyPaymentRecord record) {
        return REFUND_STATUSES.contains(normalizeText(record.getRefundStatus()))
            || valueOrZero(record.getRefundAmountCent()) > 0;
    }

    private boolean isConfirmedStatus(String status) {
        return CONFIRMED_STATUSES.contains(normalizeText(status));
    }

    private long paidAmountFromOrder(YyOrder order) {
        return YyDashboardDomainSupport.paidAmountCent(order, valueOrZero(order.getTotalAmountCent()));
    }

    private long paidAmountFromPayment(YyPaymentRecord record) {
        return YyDashboardDomainSupport.firstPositive(record.getPaidAmountCent(), record.getAmountCent(), 0L);
    }

    private long valueOrZero(Long value) {
        return value == null ? 0L : value;
    }

    private long amountToCent(BigDecimal amount) {
        if (amount == null) {
            return 0L;
        }
        return amount.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValue();
    }

    private boolean positiveAmount(BigDecimal amount) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }

    private boolean containsText(String value, String fragment) {
        return normalizeText(value).contains(fragment);
    }

    private String normalizeText(String value) {
        return StringUtils.defaultString(value).trim().toUpperCase(Locale.ROOT);
    }

    private String format(LocalDateTime value) {
        return DATE_TIME_FORMATTER.format(value);
    }

    private String format(Date value) {
        if (value == null) {
            return "";
        }
        return DATE_TIME_FORMATTER.format(LocalDateTime.ofInstant(value.toInstant(), ZoneId.systemDefault()));
    }

    private <T> List<T> nullSafe(List<T> rows) {
        return rows == null ? List.of() : rows;
    }

    private static final class StoreSelection {
        private final Long requestedStoreId;
        private final Set<Long> scopedStoreIds;
        private final boolean unrestricted;
        private final boolean restrictedEmpty;

        private StoreSelection(Long requestedStoreId, Set<Long> scopedStoreIds, boolean unrestricted, boolean restrictedEmpty) {
            this.requestedStoreId = requestedStoreId;
            this.scopedStoreIds = scopedStoreIds;
            this.unrestricted = unrestricted;
            this.restrictedEmpty = restrictedEmpty;
        }

        private static StoreSelection unrestricted() {
            return new StoreSelection(null, Set.of(), true, false);
        }

        private static StoreSelection exact(Long storeId) {
            return new StoreSelection(storeId, Set.of(), false, false);
        }

        private static StoreSelection scoped(Set<Long> storeIds) {
            return new StoreSelection(null, Set.copyOf(storeIds), false, false);
        }

        private static StoreSelection empty() {
            return new StoreSelection(null, Set.of(), false, true);
        }

        private Long requestedStoreId() {
            return requestedStoreId;
        }

        private Set<Long> scopedStoreIds() {
            return scopedStoreIds;
        }

        private boolean useExactStore() {
            return requestedStoreId != null;
        }

        private boolean useScopedStores() {
            return requestedStoreId == null && !unrestricted && !restrictedEmpty && !scopedStoreIds.isEmpty();
        }

        private boolean alwaysEmpty() {
            return restrictedEmpty;
        }

        private boolean restricted() {
            return !unrestricted;
        }
    }

    private static final class StoreScope {
        private final boolean applicable;
        private final boolean globalScope;
        private final Set<Long> storeIds;

        private StoreScope(boolean applicable, boolean globalScope, Set<Long> storeIds) {
            this.applicable = applicable;
            this.globalScope = globalScope;
            this.storeIds = storeIds;
        }

        private static StoreScope notApplicable() {
            return new StoreScope(false, false, Set.of());
        }

        private static StoreScope global() {
            return new StoreScope(true, true, Set.of());
        }

        private static StoreScope empty() {
            return new StoreScope(true, false, Set.of());
        }

        private static StoreScope limited(Collection<Long> storeIds) {
            return new StoreScope(true, false, Set.copyOf(storeIds));
        }

        private boolean applicable() {
            return applicable;
        }

        private boolean globalScope() {
            return globalScope;
        }

        private Set<Long> storeIds() {
            return storeIds;
        }
    }

    private record DateRange(Date start, Date end, String dateFrom, String dateTo) {
    }

    private record FinanceRows(
        List<YyOrder> orders,
        List<YyPaymentRecord> payments,
        List<YyCompositePaymentOrder> compositePayments,
        List<YyStoredValueConsumeOrder> storedValueConsumes,
        List<YyMemberWithdrawOrder> withdrawOrders,
        List<YyMemberBalanceLedger> balanceLedgers,
        List<YyEntitlementReservation> entitlementReservations
    ) {
    }
}
