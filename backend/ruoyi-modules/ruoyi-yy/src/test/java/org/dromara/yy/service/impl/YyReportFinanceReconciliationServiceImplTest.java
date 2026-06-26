package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyCompositePaymentOrder;
import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.YyEntitlementReservation;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberWithdrawOrder;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.YyStoredValueConsumeOrder;
import org.dromara.yy.domain.vo.YyReportFinanceExportTaskVo;
import org.dromara.yy.domain.vo.YyReportFinanceReconciliationVo;
import org.dromara.yy.mapper.YyCompositePaymentOrderMapper;
import org.dromara.yy.mapper.YyAsyncTaskMapper;
import org.dromara.yy.mapper.YyEntitlementReservationMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberWithdrawOrderMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.mapper.YyStoredValueConsumeOrderMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyReportFinanceReconciliationServiceImplTest {

    @Mock
    private YyOrderMapper yyOrderMapper;
    @Mock
    private YyPaymentRecordMapper yyPaymentRecordMapper;
    @Mock
    private YyCompositePaymentOrderMapper compositePaymentOrderMapper;
    @Mock
    private YyStoredValueConsumeOrderMapper storedValueConsumeOrderMapper;
    @Mock
    private YyMemberWithdrawOrderMapper memberWithdrawOrderMapper;
    @Mock
    private YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;
    @Mock
    private YyEntitlementReservationMapper entitlementReservationMapper;
    @Mock
    private YyAsyncTaskMapper asyncTaskMapper;

    @InjectMocks
    private YyReportFinanceReconciliationServiceImpl service;

    @Test
    void queryOverviewShouldReconcileOrdersPaymentsStoredValueWithdrawAndDiscount() {
        when(yyOrderMapper.selectList(any())).thenReturn(List.of(order(1001L, "PAID", 12900L, 9900L, 0L)));
        when(yyPaymentRecordMapper.selectList(any())).thenReturn(List.of(payment(1001L, "SUCCESS", 9900L, 1000L)));
        when(compositePaymentOrderMapper.selectList(any())).thenReturn(List.of(composite("100.00", "10.00", "5.00")));
        when(storedValueConsumeOrderMapper.selectList(any())).thenReturn(List.of(storedValue("CONFIRMED", "20.00")));
        when(memberWithdrawOrderMapper.selectList(any())).thenReturn(List.of(withdraw("PAID", "80.00")));
        when(memberBalanceLedgerMapper.selectList(any())).thenReturn(List.of(balanceLedger("REVERSAL", "50.00")));
        when(entitlementReservationMapper.selectList(any())).thenReturn(List.of(entitlement("RESERVED", "30.00")));

        YyReportFinanceReconciliationVo result = service.queryOverview(1L, "2026-06-01", "2026-06-30");

        assertEquals(12900L, result.getOverview().getOrderAmountCent());
        assertEquals(9900L, result.getOverview().getPaidAmountCent());
        assertEquals(1000L, result.getOverview().getRefundAmountCent());
        assertEquals(2000L, result.getOverview().getStoredValueConsumeCent());
        assertEquals(5000L, result.getOverview().getStoredValueReversalCent());
        assertEquals(8000L, result.getOverview().getWithdrawPaidCent());
        assertEquals(1000L, result.getOverview().getDiscountAmountCent());
        assertEquals(500L, result.getOverview().getWaiveAmountCent());
        assertEquals(2L, result.getOverview().getAttentionCount());
        assertEquals(3, result.getOrderLedgers().size());
        assertEquals(4, result.getFundLedgers().size());
        assertTrue(result.getDifferences().stream().anyMatch(item -> "reserved_entitlements".equals(item.getDifferenceKey())));
    }

    @Test
    void createExportTaskShouldExposeCompletedAsyncTaskSkeleton() {
        YyReportFinanceExportTaskVo task = service.createExportTask(null, "2026-06-01", "2026-06-30");

        assertEquals("REPORT_FINANCE_RECONCILIATION_EXPORT", task.getTaskType());
        assertEquals("COMPLETED", task.getStatus());
        assertEquals("2026-06-01", task.getDateFrom());
        assertEquals("2026-06-30", task.getDateTo());
        assertTrue(task.getDownloadUrl().contains(task.getTaskId()));
        assertEquals(1, service.listExportTasks(null, "2026-06-01", "2026-06-30").size());
        verify(asyncTaskMapper).insert(any(YyAsyncTask.class));
    }

    private static YyOrder order(Long id, String payStatus, Long totalAmountCent, Long paidAmountCent, Long refundAmountCent) {
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setStoreId(1L);
        order.setPayStatus(payStatus);
        order.setStatus("CONFIRMED");
        order.setTotalAmountCent(totalAmountCent);
        order.setPaidAmountCent(paidAmountCent);
        order.setRefundAmountCent(refundAmountCent);
        order.setOrderTime(date("2026-06-14T10:00:00"));
        return order;
    }

    private static YyPaymentRecord payment(Long orderId, String payStatus, Long paidAmountCent, Long refundAmountCent) {
        YyPaymentRecord record = new YyPaymentRecord();
        record.setStoreId(1L);
        record.setOrderId(orderId);
        record.setPayStatus(payStatus);
        record.setPaidAmountCent(paidAmountCent);
        record.setAmountCent(paidAmountCent);
        record.setRefundAmountCent(refundAmountCent);
        record.setPaidTime(date("2026-06-14T10:05:00"));
        return record;
    }

    private static YyCompositePaymentOrder composite(String total, String discount, String waive) {
        YyCompositePaymentOrder order = new YyCompositePaymentOrder();
        order.setStoreId(1L);
        order.setTotalAmount(new BigDecimal(total));
        order.setDiscountAmount(new BigDecimal(discount));
        order.setWaiveAmount(new BigDecimal(waive));
        order.setStatus("CONFIRMED");
        return order;
    }

    private static YyStoredValueConsumeOrder storedValue(String status, String amount) {
        YyStoredValueConsumeOrder order = new YyStoredValueConsumeOrder();
        order.setStoreId(1L);
        order.setStatus(status);
        order.setConsumeAmount(new BigDecimal(amount));
        order.setConfirmedTime(date("2026-06-14T10:10:00"));
        return order;
    }

    private static YyMemberWithdrawOrder withdraw(String status, String amount) {
        YyMemberWithdrawOrder order = new YyMemberWithdrawOrder();
        order.setStoreId(1L);
        order.setStatus(status);
        order.setWithdrawAmount(new BigDecimal(amount));
        order.setPaidTime(date("2026-06-14T10:15:00"));
        return order;
    }

    private static YyMemberBalanceLedger balanceLedger(String changeType, String amount) {
        YyMemberBalanceLedger ledger = new YyMemberBalanceLedger();
        ledger.setStoreId(1L);
        ledger.setChangeType(changeType);
        ledger.setChangeAmount(new BigDecimal(amount));
        ledger.setHappenedAt(date("2026-06-14T10:20:00"));
        return ledger;
    }

    private static YyEntitlementReservation entitlement(String status, String amount) {
        YyEntitlementReservation reservation = new YyEntitlementReservation();
        reservation.setStoreId(1L);
        reservation.setStatus(status);
        reservation.setReservationAmount(new BigDecimal(amount));
        return reservation;
    }

    private static Date date(String value) {
        return Date.from(LocalDateTime.parse(value).atZone(ZoneId.systemDefault()).toInstant());
    }
}
