package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyEntitlementReservation;
import org.dromara.yy.domain.YyMemberAccount;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberWithdrawOrder;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.YyRiskApproval;
import org.dromara.yy.domain.YyScheduleExceptionRule;
import org.dromara.yy.domain.YyStoredValueConsumeOrder;
import org.dromara.yy.domain.vo.YyBookingSlotInventoryVo;
import org.dromara.yy.mapper.YyEntitlementReservationMapper;
import org.dromara.yy.mapper.YyMemberAccountMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberRechargeOrderMapper;
import org.dromara.yy.mapper.YyMemberWithdrawOrderMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.mapper.YyRiskApprovalMapper;
import org.dromara.yy.mapper.YyScheduleExceptionRuleMapper;
import org.dromara.yy.mapper.YyStoredValueConsumeOrderMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyRiskApprovalService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyRiskApprovalServiceImplTest {

    @Mock
    private YyRiskApprovalMapper riskApprovalMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private YyPaymentRecordMapper paymentRecordMapper;

    @Mock
    private YyMemberRechargeOrderMapper memberRechargeOrderMapper;

    @Mock
    private YyMemberWithdrawOrderMapper memberWithdrawOrderMapper;

    @Mock
    private YyScheduleExceptionRuleMapper scheduleExceptionRuleMapper;

    @Mock
    private YyEntitlementReservationMapper entitlementReservationMapper;

    @Mock
    private YyStoredValueConsumeOrderMapper storedValueConsumeOrderMapper;

    @Mock
    private YyMemberAccountMapper memberAccountMapper;

    @Mock
    private YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;

    @Mock
    private IYyBookingSlotInventoryService bookingSlotInventoryService;

    @InjectMocks
    private YyRiskApprovalServiceImpl service;

    @Test
    void approveOrderRefundShouldUpdateInternalRefundFactAndReleaseFullRefundSlotOnce() {
        YyRiskApproval approval = new YyRiskApproval();
        approval.setId(7001L);
        approval.setBusinessType(IYyRiskApprovalService.BUSINESS_ORDER_REFUND);
        approval.setBusinessId(1001L);
        approval.setStatus(IYyRiskApprovalService.STATUS_PENDING);
        approval.setPayloadJson("{\"refundAmountCent\":10000}");
        when(riskApprovalMapper.selectById(7001L)).thenReturn(approval);

        YyOrder order = new YyOrder();
        order.setId(1001L);
        order.setPayStatus("PAID");
        order.setPaidAmountCent(10000L);
        order.setTotalAmountCent(10000L);
        when(orderMapper.selectById(1001L)).thenReturn(order);

        YyPaymentRecord payment = new YyPaymentRecord();
        payment.setId(9001L);
        payment.setOrderId(1001L);
        payment.setPayStatus("PAID");
        when(paymentRecordMapper.selectList(any())).thenReturn(List.of(payment));
        YyEntitlementReservation reservation = new YyEntitlementReservation();
        reservation.setId(6101L);
        reservation.setOrderId(1001L);
        reservation.setStatus("RESERVED");
        when(entitlementReservationMapper.selectList(any())).thenReturn(List.of(reservation));
        YyStoredValueConsumeOrder consume = new YyStoredValueConsumeOrder();
        consume.setId(7101L);
        consume.setStoreId(1001L);
        consume.setCustomerId(501L);
        consume.setOrderId(1001L);
        consume.setConsumeAmount(new BigDecimal("30.00"));
        consume.setStatus("CONFIRMED");
        when(storedValueConsumeOrderMapper.selectList(any())).thenReturn(List.of(consume));
        YyMemberAccount account = new YyMemberAccount();
        account.setId(801L);
        account.setTenantId("000000");
        account.setCustomerId(501L);
        account.setStoreId(1001L);
        account.setBalanceAmount(new BigDecimal("70.00"));
        when(memberAccountMapper.selectOne(any())).thenReturn(account);

        service.approve(7001L, null);

        ArgumentCaptor<YyOrder> orderCaptor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(orderCaptor.capture());
        assertEquals("REFUNDED", orderCaptor.getValue().getRefundStatus());
        assertEquals(10000L, orderCaptor.getValue().getRefundAmountCent());

        ArgumentCaptor<YyPaymentRecord> paymentCaptor = ArgumentCaptor.forClass(YyPaymentRecord.class);
        verify(paymentRecordMapper).updateById(paymentCaptor.capture());
        assertEquals("REFUNDED", paymentCaptor.getValue().getRefundStatus());
        assertEquals(10000L, paymentCaptor.getValue().getRefundAmountCent());

        verify(bookingSlotInventoryService).releaseConfirmedOrderSlot(order);
        ArgumentCaptor<YyEntitlementReservation> reservationCaptor = ArgumentCaptor.forClass(YyEntitlementReservation.class);
        verify(entitlementReservationMapper).updateById(reservationCaptor.capture());
        assertEquals("RELEASED", reservationCaptor.getValue().getStatus());

        ArgumentCaptor<YyStoredValueConsumeOrder> consumeCaptor = ArgumentCaptor.forClass(YyStoredValueConsumeOrder.class);
        verify(storedValueConsumeOrderMapper).updateById(consumeCaptor.capture());
        assertEquals("REVERSED", consumeCaptor.getValue().getStatus());

        ArgumentCaptor<YyMemberAccount> accountCaptor = ArgumentCaptor.forClass(YyMemberAccount.class);
        verify(memberAccountMapper).updateById(accountCaptor.capture());
        assertEquals(new BigDecimal("100.00"), accountCaptor.getValue().getBalanceAmount());

        ArgumentCaptor<YyMemberBalanceLedger> ledgerCaptor = ArgumentCaptor.forClass(YyMemberBalanceLedger.class);
        verify(memberBalanceLedgerMapper).insert(ledgerCaptor.capture());
        assertEquals("CONSUME_REVERSE", ledgerCaptor.getValue().getChangeType());
        assertEquals(new BigDecimal("30.00"), ledgerCaptor.getValue().getChangeAmount());
        verify(riskApprovalMapper).updateById(any(YyRiskApproval.class));
    }

    @Test
    void approveMemberWithdrawShouldPromotePendingApprovalOrder() {
        YyRiskApproval approval = new YyRiskApproval();
        approval.setId(7002L);
        approval.setBusinessType(IYyRiskApprovalService.BUSINESS_MEMBER_WITHDRAW_APPLY);
        approval.setBusinessId(8101L);
        approval.setStatus(IYyRiskApprovalService.STATUS_PENDING);
        when(riskApprovalMapper.selectById(7002L)).thenReturn(approval);

        YyMemberWithdrawOrder order = new YyMemberWithdrawOrder();
        order.setId(8101L);
        order.setStatus("PENDING_APPROVAL");
        when(memberWithdrawOrderMapper.selectById(8101L)).thenReturn(order);

        service.approve(7002L, null);

        ArgumentCaptor<YyMemberWithdrawOrder> withdrawCaptor = ArgumentCaptor.forClass(YyMemberWithdrawOrder.class);
        verify(memberWithdrawOrderMapper).updateById(withdrawCaptor.capture());
        assertEquals("APPROVED", withdrawCaptor.getValue().getStatus());
        verify(riskApprovalMapper).updateById(any(YyRiskApproval.class));
    }

    @Test
    void approveSlotCloseWithPaidOrderShouldActivateRuleAndApplyInventory() {
        YyRiskApproval approval = new YyRiskApproval();
        approval.setId(7003L);
        approval.setBusinessType(IYyRiskApprovalService.BUSINESS_SLOT_CLOSE_WITH_PAID_ORDER);
        approval.setBusinessId(8201L);
        approval.setStatus(IYyRiskApprovalService.STATUS_PENDING);
        when(riskApprovalMapper.selectById(7003L)).thenReturn(approval);

        YyScheduleExceptionRule rule = new YyScheduleExceptionRule();
        rule.setId(8201L);
        rule.setStoreId(1001L);
        rule.setServiceGroupId(2001L);
        rule.setStartDate("2026-06-25");
        rule.setEndDate("2026-06-25");
        rule.setStartTime("10:00");
        rule.setEndTime("11:00");
        rule.setActionType("CLOSE");
        rule.setReason("holiday close");
        when(scheduleExceptionRuleMapper.selectById(8201L)).thenReturn(rule);

        YyBookingSlotInventoryVo slot = new YyBookingSlotInventoryVo();
        slot.setId(9101L);
        slot.setCapacity(3);
        slot.setStatus("ACTIVE");
        slot.setRemark("original");
        when(bookingSlotInventoryService.queryList(any())).thenReturn(List.of(slot));
        when(bookingSlotInventoryService.updateByBo(any())).thenReturn(Boolean.TRUE);

        service.approve(7003L, null);

        ArgumentCaptor<YyScheduleExceptionRule> ruleCaptor = ArgumentCaptor.forClass(YyScheduleExceptionRule.class);
        verify(scheduleExceptionRuleMapper).updateById(ruleCaptor.capture());
        assertEquals("ACTIVE", ruleCaptor.getValue().getStatus());
        verify(bookingSlotInventoryService).updateByBo(any());

        ArgumentCaptor<YyRiskApproval> approvalCaptor = ArgumentCaptor.forClass(YyRiskApproval.class);
        verify(riskApprovalMapper).updateById(approvalCaptor.capture());
        assertEquals(IYyRiskApprovalService.STATUS_APPROVED, approvalCaptor.getValue().getStatus());
        assertTrue(approvalCaptor.getValue().getResultSummary().contains("已自动应用 1 个时段"));
    }

    @Test
    void rejectSlotCloseWithPaidOrderShouldOnlyRejectRule() {
        YyRiskApproval approval = new YyRiskApproval();
        approval.setId(7004L);
        approval.setBusinessType(IYyRiskApprovalService.BUSINESS_SLOT_CLOSE_WITH_PAID_ORDER);
        approval.setBusinessId(8202L);
        approval.setStatus(IYyRiskApprovalService.STATUS_PENDING);
        when(riskApprovalMapper.selectById(7004L)).thenReturn(approval);

        YyScheduleExceptionRule rule = new YyScheduleExceptionRule();
        rule.setId(8202L);
        when(scheduleExceptionRuleMapper.selectById(8202L)).thenReturn(rule);

        service.reject(7004L, null);

        ArgumentCaptor<YyScheduleExceptionRule> ruleCaptor = ArgumentCaptor.forClass(YyScheduleExceptionRule.class);
        verify(scheduleExceptionRuleMapper).updateById(ruleCaptor.capture());
        assertEquals("REJECTED", ruleCaptor.getValue().getStatus());
        verify(bookingSlotInventoryService, never()).updateByBo(any());

        ArgumentCaptor<YyRiskApproval> approvalCaptor = ArgumentCaptor.forClass(YyRiskApproval.class);
        verify(riskApprovalMapper).updateById(approvalCaptor.capture());
        assertEquals(IYyRiskApprovalService.STATUS_REJECTED, approvalCaptor.getValue().getStatus());
        assertEquals("付费关档审批已驳回", approvalCaptor.getValue().getResultSummary());
    }
}
