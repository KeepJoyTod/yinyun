package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyCompositePaymentOrder;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyEntitlementReservation;
import org.dromara.yy.domain.YyMemberAccount;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberWithdrawOrder;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.YyStoredValueConsumeOrder;
import org.dromara.yy.domain.bo.YyCompositePaymentCreateBo;
import org.dromara.yy.domain.bo.YyMemberWithdrawCreateBo;
import org.dromara.yy.domain.bo.YyStoredValueConsumeCreateBo;
import org.dromara.yy.domain.bo.YyTransactionSafetyActionBo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
import org.dromara.yy.mapper.YyCompositePaymentOrderMapper;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyEntitlementReservationMapper;
import org.dromara.yy.mapper.YyMemberAccountMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberWithdrawOrderMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.mapper.YyStoredValueConsumeOrderMapper;
import org.dromara.yy.service.IYyRiskApprovalService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyTransactionSafetyServiceImplTest {

    @Mock
    private YyCustomerMapper customerMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private YyMemberAccountMapper memberAccountMapper;

    @Mock
    private YyEntitlementReservationMapper entitlementReservationMapper;

    @Mock
    private YyCompositePaymentOrderMapper compositePaymentOrderMapper;

    @Mock
    private YyStoredValueConsumeOrderMapper storedValueConsumeOrderMapper;

    @Mock
    private YyMemberWithdrawOrderMapper memberWithdrawOrderMapper;

    @Mock
    private YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;

    @Mock
    private YyPaymentRecordMapper paymentRecordMapper;

    @Mock
    private IYyRiskApprovalService riskApprovalService;

    @InjectMocks
    private YyTransactionSafetyServiceImpl service;

    @Test
    void createCompositePaymentShouldRejectUnbalancedSplit() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));

        YyCompositePaymentCreateBo bo = new YyCompositePaymentCreateBo();
        bo.setCustomerId(101L);
        bo.setTotalAmount(new BigDecimal("100.00"));
        bo.setExternalAmount(new BigDecimal("50.00"));
        bo.setStoredValueAmount(new BigDecimal("20.00"));

        assertThrows(ServiceException.class, () -> service.createCompositePayment(bo));
    }

    @Test
    void createCompositePaymentShouldPersistDraftWhenSplitMatches() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(orderMapper.selectById(9001L)).thenReturn(order(9001L));

        YyCompositePaymentCreateBo bo = new YyCompositePaymentCreateBo();
        bo.setCustomerId(101L);
        bo.setOrderId(9001L);
        bo.setTotalAmount(new BigDecimal("100.00"));
        bo.setExternalAmount(new BigDecimal("50.00"));
        bo.setStoredValueAmount(new BigDecimal("30.00"));
        bo.setDiscountAmount(new BigDecimal("20.00"));

        service.createCompositePayment(bo);

        ArgumentCaptor<YyCompositePaymentOrder> captor = ArgumentCaptor.forClass(YyCompositePaymentOrder.class);
        verify(compositePaymentOrderMapper).insert(captor.capture());
        assertEquals("DRAFT", captor.getValue().getStatus());
        assertEquals("PENDING", captor.getValue().getSettleStatus());
        assertEquals("SCAFFOLD", captor.getValue().getExecutionMode());
    }

    @Test
    void createStoredValueConsumeShouldRejectAmountAboveBalance() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, "20.00"));

        YyStoredValueConsumeCreateBo bo = new YyStoredValueConsumeCreateBo();
        bo.setCustomerId(101L);
        bo.setConsumeAmount(new BigDecimal("21.00"));

        assertThrows(ServiceException.class, () -> service.createStoredValueConsume(bo));
    }

    @Test
    void createStoredValueConsumeShouldPersistFrozenScaffoldRow() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, "200.00"));
        when(orderMapper.selectById(9001L)).thenReturn(order(9001L));

        YyStoredValueConsumeCreateBo bo = new YyStoredValueConsumeCreateBo();
        bo.setCustomerId(101L);
        bo.setOrderId(9001L);
        bo.setConsumeAmount(new BigDecimal("80.00"));

        service.createStoredValueConsume(bo);

        ArgumentCaptor<YyStoredValueConsumeOrder> captor = ArgumentCaptor.forClass(YyStoredValueConsumeOrder.class);
        verify(storedValueConsumeOrderMapper).insert(captor.capture());
        assertEquals("FROZEN", captor.getValue().getStatus());
        assertEquals(new BigDecimal("200.00"), captor.getValue().getBalanceSnapshot());
    }

    @Test
    void createMemberWithdrawShouldCreatePendingApprovalAndApprovalRecord() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, "200.00"));
        YyRiskApprovalVo approval = new YyRiskApprovalVo();
        approval.setId(7001L);
        when(riskApprovalService.createPending(any())).thenReturn(approval);

        YyMemberWithdrawCreateBo bo = new YyMemberWithdrawCreateBo();
        bo.setCustomerId(101L);
        bo.setWithdrawAmount(new BigDecimal("80.00"));
        bo.setAccountName("tester");
        bo.setAccountNo("6222021234567890");

        service.createMemberWithdrawOrder(bo);

        ArgumentCaptor<YyMemberWithdrawOrder> insertCaptor = ArgumentCaptor.forClass(YyMemberWithdrawOrder.class);
        verify(memberWithdrawOrderMapper).insert(insertCaptor.capture());
        assertEquals("PENDING_APPROVAL", insertCaptor.getValue().getStatus());
        assertEquals("6222****7890", insertCaptor.getValue().getAccountNoMasked());
        verify(riskApprovalService).createPending(any());
        verify(memberWithdrawOrderMapper).updateById(any(YyMemberWithdrawOrder.class));
    }

    @Test
    void confirmCompositePaymentShouldSettleOrderPaymentAndFulfillEntitlements() {
        when(compositePaymentOrderMapper.selectById(5001L)).thenReturn(compositePayment(5001L));
        when(orderMapper.selectById(9001L)).thenReturn(order(9001L));
        when(entitlementReservationMapper.selectList(any())).thenReturn(List.of(reservation(6001L)));

        service.confirmCompositePayment(5001L, actionBo());

        ArgumentCaptor<YyCompositePaymentOrder> paymentCaptor = ArgumentCaptor.forClass(YyCompositePaymentOrder.class);
        verify(compositePaymentOrderMapper).updateById(paymentCaptor.capture());
        assertEquals("CONFIRMED", paymentCaptor.getValue().getStatus());
        assertEquals("SETTLED", paymentCaptor.getValue().getSettleStatus());

        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        assertEquals("PAID", orderCaptor.getValue().getPayStatus());
        assertEquals(10000L, orderCaptor.getValue().getPaidAmountCent());

        ArgumentCaptor<YyPaymentRecord> recordCaptor = ArgumentCaptor.forClass(YyPaymentRecord.class);
        verify(paymentRecordMapper).insert(recordCaptor.capture());
        assertEquals("LOCAL_COMPOSITE", recordCaptor.getValue().getChannelType());
        assertEquals("LOCAL-001", recordCaptor.getValue().getTransactionId());

        ArgumentCaptor<YyEntitlementReservation> reservationCaptor = ArgumentCaptor.forClass(YyEntitlementReservation.class);
        verify(entitlementReservationMapper).updateById(reservationCaptor.capture());
        assertEquals("FULFILLED", reservationCaptor.getValue().getStatus());
    }

    @Test
    void failCompositePaymentShouldReleaseReservedEntitlements() {
        when(compositePaymentOrderMapper.selectById(5001L)).thenReturn(compositePayment(5001L));
        when(entitlementReservationMapper.selectList(any())).thenReturn(List.of(reservation(6001L)));

        service.failCompositePayment(5001L, actionBo());

        ArgumentCaptor<YyCompositePaymentOrder> paymentCaptor = ArgumentCaptor.forClass(YyCompositePaymentOrder.class);
        verify(compositePaymentOrderMapper).updateById(paymentCaptor.capture());
        assertEquals("FAILED", paymentCaptor.getValue().getStatus());

        ArgumentCaptor<YyEntitlementReservation> reservationCaptor = ArgumentCaptor.forClass(YyEntitlementReservation.class);
        verify(entitlementReservationMapper).updateById(reservationCaptor.capture());
        assertEquals("RELEASED", reservationCaptor.getValue().getStatus());
    }

    @Test
    void releaseExpiredEntitlementReservationsShouldReleaseOnlyExpiredReservedRows() {
        YyEntitlementReservation expired = reservation(6001L);
        expired.setExpireTime(new Date(System.currentTimeMillis() - 60_000));
        when(entitlementReservationMapper.selectList(any())).thenReturn(List.of(expired));

        YyTransactionSafetyActionBo bo = actionBo();
        bo.setLimit(20);

        List<?> released = service.releaseExpiredEntitlementReservations(bo);

        assertEquals(1, released.size());
        ArgumentCaptor<YyEntitlementReservation> reservationCaptor = ArgumentCaptor.forClass(YyEntitlementReservation.class);
        verify(entitlementReservationMapper).updateById(reservationCaptor.capture());
        assertEquals("RELEASED", reservationCaptor.getValue().getStatus());
        assertEquals("local action", reservationCaptor.getValue().getRemark());
    }

    @Test
    void confirmStoredValueConsumeShouldDebitBalanceAndInsertLedger() {
        when(storedValueConsumeOrderMapper.selectById(7101L)).thenReturn(storedValueConsume(7101L, "FROZEN"));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, "200.00"));

        service.confirmStoredValueConsume(7101L, actionBo());

        ArgumentCaptor<YyMemberAccount> accountCaptor = ArgumentCaptor.forClass(YyMemberAccount.class);
        verify(memberAccountMapper).updateById(accountCaptor.capture());
        assertEquals(new BigDecimal("150.00"), accountCaptor.getValue().getBalanceAmount());

        ArgumentCaptor<YyStoredValueConsumeOrder> consumeCaptor = ArgumentCaptor.forClass(YyStoredValueConsumeOrder.class);
        verify(storedValueConsumeOrderMapper).updateById(consumeCaptor.capture());
        assertEquals("CONFIRMED", consumeCaptor.getValue().getStatus());

        ArgumentCaptor<YyMemberBalanceLedger> ledgerCaptor = ArgumentCaptor.forClass(YyMemberBalanceLedger.class);
        verify(memberBalanceLedgerMapper).insert(ledgerCaptor.capture());
        assertEquals("CONSUME", ledgerCaptor.getValue().getChangeType());
        assertEquals(new BigDecimal("-50.00"), ledgerCaptor.getValue().getChangeAmount());
    }

    @Test
    void reverseStoredValueConsumeShouldRestoreConfirmedBalanceAndInsertLedger() {
        when(storedValueConsumeOrderMapper.selectById(7101L)).thenReturn(storedValueConsume(7101L, "CONFIRMED"));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, "150.00"));

        service.reverseStoredValueConsume(7101L, actionBo());

        ArgumentCaptor<YyMemberAccount> accountCaptor = ArgumentCaptor.forClass(YyMemberAccount.class);
        verify(memberAccountMapper).updateById(accountCaptor.capture());
        assertEquals(new BigDecimal("200.00"), accountCaptor.getValue().getBalanceAmount());

        ArgumentCaptor<YyStoredValueConsumeOrder> consumeCaptor = ArgumentCaptor.forClass(YyStoredValueConsumeOrder.class);
        verify(storedValueConsumeOrderMapper).updateById(consumeCaptor.capture());
        assertEquals("REVERSED", consumeCaptor.getValue().getStatus());

        ArgumentCaptor<YyMemberBalanceLedger> ledgerCaptor = ArgumentCaptor.forClass(YyMemberBalanceLedger.class);
        verify(memberBalanceLedgerMapper).insert(ledgerCaptor.capture());
        assertEquals("CONSUME_REVERSE", ledgerCaptor.getValue().getChangeType());
        assertEquals(new BigDecimal("50.00"), ledgerCaptor.getValue().getChangeAmount());
    }

    @Test
    void markWithdrawPaidShouldDebitApprovedWithdrawAndInsertLedger() {
        YyMemberWithdrawOrder withdraw = new YyMemberWithdrawOrder();
        withdraw.setId(8101L);
        withdraw.setStoreId(9001L);
        withdraw.setCustomerId(101L);
        withdraw.setWithdrawAmount(new BigDecimal("80.00"));
        withdraw.setStatus("APPROVED");
        when(memberWithdrawOrderMapper.selectById(8101L)).thenReturn(withdraw);
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, "200.00"));

        service.markWithdrawPaid(8101L, actionBo());

        ArgumentCaptor<YyMemberAccount> accountCaptor = ArgumentCaptor.forClass(YyMemberAccount.class);
        verify(memberAccountMapper).updateById(accountCaptor.capture());
        assertEquals(new BigDecimal("120.00"), accountCaptor.getValue().getBalanceAmount());

        ArgumentCaptor<YyMemberWithdrawOrder> withdrawCaptor = ArgumentCaptor.forClass(YyMemberWithdrawOrder.class);
        verify(memberWithdrawOrderMapper).updateById(withdrawCaptor.capture());
        assertEquals("PAID", withdrawCaptor.getValue().getStatus());

        ArgumentCaptor<YyMemberBalanceLedger> ledgerCaptor = ArgumentCaptor.forClass(YyMemberBalanceLedger.class);
        verify(memberBalanceLedgerMapper).insert(ledgerCaptor.capture());
        assertEquals("WITHDRAW", ledgerCaptor.getValue().getChangeType());
        assertEquals(new BigDecimal("-80.00"), ledgerCaptor.getValue().getChangeAmount());
    }

    private static YyCustomer customer(Long id) {
        YyCustomer customer = new YyCustomer();
        customer.setId(id);
        customer.setTenantId("000000");
        return customer;
    }

    private static YyOrder order(Long id) {
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setStoreId(9001L);
        order.setTenantId("000000");
        order.setStatus("PENDING_PAYMENT");
        return order;
    }

    private static YyMemberAccount account(Long customerId, String balanceAmount) {
        YyMemberAccount account = new YyMemberAccount();
        account.setId(3001L);
        account.setCustomerId(customerId);
        account.setStoreId(9001L);
        account.setTenantId("000000");
        account.setBalanceAmount(new BigDecimal(balanceAmount));
        return account;
    }

    private static YyCompositePaymentOrder compositePayment(Long id) {
        YyCompositePaymentOrder payment = new YyCompositePaymentOrder();
        payment.setId(id);
        payment.setTenantId("000000");
        payment.setStoreId(9001L);
        payment.setCustomerId(101L);
        payment.setOrderId(9001L);
        payment.setCompositeNo("CMP-001");
        payment.setTotalAmount(new BigDecimal("100.00"));
        payment.setStatus("DRAFT");
        payment.setSettleStatus("PENDING");
        return payment;
    }

    private static YyEntitlementReservation reservation(Long id) {
        YyEntitlementReservation reservation = new YyEntitlementReservation();
        reservation.setId(id);
        reservation.setOrderId(9001L);
        reservation.setStatus("RESERVED");
        return reservation;
    }

    private static YyStoredValueConsumeOrder storedValueConsume(Long id, String status) {
        YyStoredValueConsumeOrder consume = new YyStoredValueConsumeOrder();
        consume.setId(id);
        consume.setStoreId(9001L);
        consume.setCustomerId(101L);
        consume.setOrderId(9001L);
        consume.setConsumeAmount(new BigDecimal("50.00"));
        consume.setStatus(status);
        return consume;
    }

    private static YyTransactionSafetyActionBo actionBo() {
        YyTransactionSafetyActionBo bo = new YyTransactionSafetyActionBo();
        bo.setReason("local action");
        bo.setLocalAdapterRef("LOCAL-001");
        return bo;
    }
}
