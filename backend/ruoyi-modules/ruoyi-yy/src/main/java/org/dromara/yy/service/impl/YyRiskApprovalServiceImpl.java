package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyEntitlementReservation;
import org.dromara.yy.domain.YyMemberAccount;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberWithdrawOrder;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyMemberRechargeOrder;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.YyRiskApproval;
import org.dromara.yy.domain.YyScheduleExceptionRule;
import org.dromara.yy.domain.YyStoredValueConsumeOrder;
import org.dromara.yy.domain.bo.YyBookingSlotInventoryBo;
import org.dromara.yy.domain.bo.YyRiskApprovalDecisionBo;
import org.dromara.yy.domain.bo.YyRiskApprovalQueryBo;
import org.dromara.yy.domain.vo.YyBookingSlotInventoryVo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.List;

@RequiredArgsConstructor
@Service
public class YyRiskApprovalServiceImpl implements IYyRiskApprovalService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String PAY_STATUS_PAID = "PAID";
    private static final String REFUND_STATUS_REFUNDED = "REFUNDED";
    private static final String MEMBER_RECHARGE_PENDING_APPROVAL = "PENDING_APPROVAL";
    private static final String MEMBER_RECHARGE_PENDING = "PENDING";
    private static final String MEMBER_WITHDRAW_PENDING_APPROVAL = "PENDING_APPROVAL";
    private static final String MEMBER_WITHDRAW_APPROVED = "APPROVED";
    private static final String MEMBER_WITHDRAW_REJECTED = "REJECTED";
    private static final String RESERVATION_STATUS_RESERVED = "RESERVED";
    private static final String RESERVATION_STATUS_RELEASED = "RELEASED";
    private static final String STORED_VALUE_STATUS_CONFIRMED = "CONFIRMED";
    private static final String STORED_VALUE_STATUS_REVERSED = "REVERSED";
    private static final String REVERSAL_STATUS_REVERSED = "REVERSED";
    private static final String EXECUTION_MODE_LOCAL_ADAPTER = "LOCAL_ADAPTER";
    private static final String LEDGER_CHANGE_TYPE_CONSUME_REVERSE = "CONSUME_REVERSE";
    private static final String LEDGER_SOURCE_TYPE_STORED_VALUE_CONSUME = "STORED_VALUE_CONSUME";
    private static final String DEFAULT_TENANT_ID = "000000";
    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private final YyRiskApprovalMapper riskApprovalMapper;
    private final YyOrderMapper orderMapper;
    private final YyPaymentRecordMapper paymentRecordMapper;
    private final YyMemberRechargeOrderMapper memberRechargeOrderMapper;
    private final YyMemberWithdrawOrderMapper memberWithdrawOrderMapper;
    private final YyScheduleExceptionRuleMapper scheduleExceptionRuleMapper;
    private final YyEntitlementReservationMapper entitlementReservationMapper;
    private final YyStoredValueConsumeOrderMapper storedValueConsumeOrderMapper;
    private final YyMemberAccountMapper memberAccountMapper;
    private final YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;
    private final IYyBookingSlotInventoryService bookingSlotInventoryService;

    @Override
    public TableDataInfo<YyRiskApprovalVo> queryPageList(YyRiskApprovalQueryBo bo, PageQuery pageQuery) {
        YyRiskApprovalQueryBo query = bo == null ? new YyRiskApprovalQueryBo() : bo;
        Page<YyRiskApprovalVo> result = riskApprovalMapper.selectVoPage(pageQuery.build(), Wrappers.<YyRiskApproval>lambdaQuery()
            .eq(query.getStoreId() != null, YyRiskApproval::getStoreId, query.getStoreId())
            .eq(StringUtils.isNotBlank(query.getBusinessType()), YyRiskApproval::getBusinessType, StringUtils.trim(query.getBusinessType()))
            .eq(query.getBusinessId() != null, YyRiskApproval::getBusinessId, query.getBusinessId())
            .eq(StringUtils.isNotBlank(query.getStatus()), YyRiskApproval::getStatus, StringUtils.trim(query.getStatus()))
            .orderByDesc(YyRiskApproval::getCreateTime)
            .orderByDesc(YyRiskApproval::getId));
        return TableDataInfo.build(result);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyRiskApprovalVo createPending(CreateRiskApprovalCommand command) {
        if (command == null || StringUtils.isBlank(command.businessType())) {
            throw new ServiceException("approval businessType is required");
        }
        YyRiskApproval approval = new YyRiskApproval();
        approval.setStoreId(command.storeId());
        approval.setBusinessType(StringUtils.trim(command.businessType()));
        approval.setBusinessId(command.businessId());
        approval.setBusinessNo(StringUtils.trimToEmpty(command.businessNo()));
        approval.setStatus(STATUS_PENDING);
        approval.setTitle(StringUtils.defaultIfBlank(StringUtils.trim(command.title()), command.businessType()));
        approval.setReason(StringUtils.trimToEmpty(command.reason()));
        approval.setPayloadJson(StringUtils.trimToEmpty(command.payloadJson()));
        LoginUser loginUser = currentLoginUser();
        approval.setApplicantUserId(loginUser == null ? null : loginUser.getUserId());
        approval.setApplicantName(loginUser == null ? "" : StringUtils.defaultString(loginUser.getUsername()));
        riskApprovalMapper.insert(approval);
        return riskApprovalMapper.selectVoById(approval.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyRiskApprovalVo approve(Long id, YyRiskApprovalDecisionBo bo) {
        YyRiskApproval approval = requirePendingApproval(id);
        String resultSummary = switch (StringUtils.trimToEmpty(approval.getBusinessType())) {
            case BUSINESS_ORDER_REFUND -> approveOrderRefund(approval);
            case BUSINESS_MEMBER_RECHARGE_CONFIRM -> approveMemberRecharge(approval);
            case BUSINESS_MEMBER_WITHDRAW_APPLY -> approveMemberWithdraw(approval);
            case BUSINESS_SLOT_CLOSE_WITH_PAID_ORDER -> approveSlotCloseWithPaidOrder(approval);
            default -> "approved";
        };
        YyRiskApproval update = new YyRiskApproval();
        update.setId(approval.getId());
        update.setStatus(STATUS_APPROVED);
        update.setApproveTime(new Date());
        update.setResultSummary(resultSummary);
        LoginUser loginUser = currentLoginUser();
        update.setApproverUserId(loginUser == null ? null : loginUser.getUserId());
        update.setApproverName(loginUser == null ? "" : StringUtils.defaultString(loginUser.getUsername()));
        if (bo != null && StringUtils.isNotBlank(bo.getRemark())) {
            update.setRejectReason(StringUtils.trim(bo.getRemark()));
        }
        riskApprovalMapper.updateById(update);
        return riskApprovalMapper.selectVoById(approval.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyRiskApprovalVo reject(Long id, YyRiskApprovalDecisionBo bo) {
        YyRiskApproval approval = requirePendingApproval(id);
        String resultSummary = switch (StringUtils.trimToEmpty(approval.getBusinessType())) {
            case BUSINESS_MEMBER_WITHDRAW_APPLY -> rejectMemberWithdraw(approval);
            case BUSINESS_SLOT_CLOSE_WITH_PAID_ORDER -> rejectSlotCloseWithPaidOrder(approval);
            default -> "rejected";
        };
        YyRiskApproval update = new YyRiskApproval();
        update.setId(approval.getId());
        update.setStatus(STATUS_REJECTED);
        update.setApproveTime(new Date());
        update.setRejectReason(bo == null ? "" : StringUtils.trimToEmpty(bo.getRemark()));
        LoginUser loginUser = currentLoginUser();
        update.setApproverUserId(loginUser == null ? null : loginUser.getUserId());
        update.setApproverName(loginUser == null ? "" : StringUtils.defaultString(loginUser.getUsername()));
        update.setResultSummary(resultSummary);
        riskApprovalMapper.updateById(update);
        return riskApprovalMapper.selectVoById(approval.getId());
    }

    private String approveOrderRefund(YyRiskApproval approval) {
        YyOrder order = orderMapper.selectById(approval.getBusinessId());
        if (order == null) {
            throw new ServiceException("order not found");
        }
        long refundAmountCent = readLong(approval.getPayloadJson(), "refundAmountCent", 0L);
        if (refundAmountCent <= 0) {
            throw new ServiceException("refund amount is invalid");
        }
        long paidAmountCent = defaultLong(order.getPaidAmountCent(), order.getTotalAmountCent());
        if (!PAY_STATUS_PAID.equalsIgnoreCase(StringUtils.trimToEmpty(order.getPayStatus()))) {
            throw new ServiceException("only paid orders can be refunded");
        }
        if (StringUtils.isNotBlank(order.getRefundStatus()) || defaultLong(order.getRefundAmountCent(), 0L) > 0) {
            throw new ServiceException("order already has refund fact");
        }
        if (refundAmountCent > paidAmountCent) {
            throw new ServiceException("refund amount exceeds paid amount");
        }

        YyOrder orderUpdate = new YyOrder();
        orderUpdate.setId(order.getId());
        orderUpdate.setRefundStatus(REFUND_STATUS_REFUNDED);
        orderUpdate.setRefundAmountCent(refundAmountCent);
        if (refundAmountCent >= paidAmountCent) {
            orderUpdate.setStatus("REFUNDED");
            orderUpdate.setPayStatus(REFUND_STATUS_REFUNDED);
        }
        orderMapper.updateById(orderUpdate);

        List<YyPaymentRecord> records = paymentRecordMapper.selectList(Wrappers.<YyPaymentRecord>lambdaQuery()
            .eq(YyPaymentRecord::getOrderId, order.getId())
            .orderByDesc(YyPaymentRecord::getId));
        for (YyPaymentRecord record : records) {
            if (!PAY_STATUS_PAID.equalsIgnoreCase(StringUtils.trimToEmpty(record.getPayStatus()))) {
                continue;
            }
            YyPaymentRecord paymentUpdate = new YyPaymentRecord();
            paymentUpdate.setId(record.getId());
            paymentUpdate.setRefundStatus(REFUND_STATUS_REFUNDED);
            paymentUpdate.setRefundAmountCent(refundAmountCent);
            paymentRecordMapper.updateById(paymentUpdate);
        }
        if (refundAmountCent >= paidAmountCent) {
            bookingSlotInventoryService.releaseConfirmedOrderSlot(order);
        }
        releaseReservedEntitlements(order.getId());
        reverseStoredValueConsumes(order.getId());
        return "order refund approved: " + refundAmountCent;
    }

    private String approveMemberRecharge(YyRiskApproval approval) {
        YyMemberRechargeOrder order = memberRechargeOrderMapper.selectById(approval.getBusinessId());
        if (order == null) {
            throw new ServiceException("member recharge order not found");
        }
        if (!MEMBER_RECHARGE_PENDING_APPROVAL.equals(StringUtils.trimToEmpty(order.getStatus()))) {
            throw new ServiceException("member recharge order is not pending approval");
        }
        YyMemberRechargeOrder update = new YyMemberRechargeOrder();
        update.setId(order.getId());
        update.setStatus(MEMBER_RECHARGE_PENDING);
        memberRechargeOrderMapper.updateById(update);
        return "member recharge approved";
    }

    private String approveMemberWithdraw(YyRiskApproval approval) {
        YyMemberWithdrawOrder order = memberWithdrawOrderMapper.selectById(approval.getBusinessId());
        if (order == null) {
            throw new ServiceException("member withdraw order not found");
        }
        if (!MEMBER_WITHDRAW_PENDING_APPROVAL.equals(StringUtils.trimToEmpty(order.getStatus()))) {
            throw new ServiceException("member withdraw order is not pending approval");
        }
        YyMemberWithdrawOrder update = new YyMemberWithdrawOrder();
        update.setId(order.getId());
        update.setStatus(MEMBER_WITHDRAW_APPROVED);
        memberWithdrawOrderMapper.updateById(update);
        return "member withdraw approved";
    }

    private String rejectMemberWithdraw(YyRiskApproval approval) {
        YyMemberWithdrawOrder order = memberWithdrawOrderMapper.selectById(approval.getBusinessId());
        if (order == null) {
            throw new ServiceException("member withdraw order not found");
        }
        if (!MEMBER_WITHDRAW_PENDING_APPROVAL.equals(StringUtils.trimToEmpty(order.getStatus()))) {
            throw new ServiceException("member withdraw order is not pending approval");
        }
        YyMemberWithdrawOrder update = new YyMemberWithdrawOrder();
        update.setId(order.getId());
        update.setStatus(MEMBER_WITHDRAW_REJECTED);
        memberWithdrawOrderMapper.updateById(update);
        return "member withdraw rejected";
    }

    private String approveSlotCloseWithPaidOrder(YyRiskApproval approval) {
        YyScheduleExceptionRule rule = scheduleExceptionRuleMapper.selectById(approval.getBusinessId());
        if (rule == null) {
            throw new ServiceException("schedule exception rule not found");
        }
        List<YyBookingSlotInventoryVo> slots = queryRuleSlots(rule);
        int affectedCount = 0;
        for (YyBookingSlotInventoryVo slot : slots) {
            YyBookingSlotInventoryBo update = new YyBookingSlotInventoryBo();
            update.setId(slot.getId());
            update.setCapacity(resolveNextCapacity(rule, slot));
            update.setStatus(resolveNextStatus(rule, slot));
            update.setRemark(StringUtils.defaultIfBlank(rule.getReason(), slot.getRemark()));
            if (Boolean.TRUE.equals(bookingSlotInventoryService.updateByBo(update))) {
                affectedCount++;
            }
        }
        YyScheduleExceptionRule ruleUpdate = new YyScheduleExceptionRule();
        ruleUpdate.setId(rule.getId());
        ruleUpdate.setStatus("ACTIVE");
        scheduleExceptionRuleMapper.updateById(ruleUpdate);
        return "已自动应用 " + affectedCount + " 个时段";
    }

    private String rejectSlotCloseWithPaidOrder(YyRiskApproval approval) {
        YyScheduleExceptionRule rule = scheduleExceptionRuleMapper.selectById(approval.getBusinessId());
        if (rule == null) {
            throw new ServiceException("schedule exception rule not found");
        }
        YyScheduleExceptionRule update = new YyScheduleExceptionRule();
        update.setId(rule.getId());
        update.setStatus("REJECTED");
        scheduleExceptionRuleMapper.updateById(update);
        return "付费关档审批已驳回";
    }

    private void releaseReservedEntitlements(Long orderId) {
        List<YyEntitlementReservation> reservations = entitlementReservationMapper.selectList(Wrappers.<YyEntitlementReservation>lambdaQuery()
            .eq(YyEntitlementReservation::getOrderId, orderId)
            .eq(YyEntitlementReservation::getStatus, RESERVATION_STATUS_RESERVED));
        Date now = new Date();
        for (YyEntitlementReservation reservation : reservations) {
            YyEntitlementReservation update = new YyEntitlementReservation();
            update.setId(reservation.getId());
            update.setStatus(RESERVATION_STATUS_RELEASED);
            update.setReleasedTime(now);
            update.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
            update.setRemark("released by refund approval");
            entitlementReservationMapper.updateById(update);
        }
    }

    private void reverseStoredValueConsumes(Long orderId) {
        List<YyStoredValueConsumeOrder> consumes = storedValueConsumeOrderMapper.selectList(Wrappers.<YyStoredValueConsumeOrder>lambdaQuery()
            .eq(YyStoredValueConsumeOrder::getOrderId, orderId)
            .eq(YyStoredValueConsumeOrder::getStatus, STORED_VALUE_STATUS_CONFIRMED));
        Date now = new Date();
        for (YyStoredValueConsumeOrder consume : consumes) {
            YyMemberAccount account = requireMemberAccount(consume.getCustomerId());
            BigDecimal reverseAmount = normalizeAmount(consume.getConsumeAmount());
            BigDecimal nextBalance = normalizeAmount(account.getBalanceAmount()).add(reverseAmount);
            account.setBalanceAmount(nextBalance);
            account.setLastTradeTime(now);
            memberAccountMapper.updateById(account);

            YyStoredValueConsumeOrder update = new YyStoredValueConsumeOrder();
            update.setId(consume.getId());
            update.setStatus(STORED_VALUE_STATUS_REVERSED);
            update.setReversalStatus(REVERSAL_STATUS_REVERSED);
            update.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
            update.setRemark("reversed by refund approval");
            storedValueConsumeOrderMapper.updateById(update);

            YyMemberBalanceLedger ledger = new YyMemberBalanceLedger();
            ledger.setId(IdWorker.getId());
            ledger.setTenantId(StringUtils.defaultIfBlank(account.getTenantId(), DEFAULT_TENANT_ID));
            ledger.setStoreId(consume.getStoreId());
            ledger.setCustomerId(consume.getCustomerId());
            ledger.setChangeType(LEDGER_CHANGE_TYPE_CONSUME_REVERSE);
            ledger.setChangeAmount(reverseAmount);
            ledger.setBalanceAfter(nextBalance);
            ledger.setSourceType(LEDGER_SOURCE_TYPE_STORED_VALUE_CONSUME);
            ledger.setSourceId(consume.getId());
            ledger.setHappenedAt(now);
            ledger.setRemark("reversed by refund approval");
            memberBalanceLedgerMapper.insert(ledger);
        }
    }

    private YyMemberAccount requireMemberAccount(Long customerId) {
        YyMemberAccount account = memberAccountMapper.selectOne(Wrappers.<YyMemberAccount>lambdaQuery()
            .eq(YyMemberAccount::getCustomerId, customerId)
            .orderByDesc(YyMemberAccount::getId)
            .last("limit 1"));
        if (account == null) {
            throw new ServiceException("member account not found");
        }
        return account;
    }

    private YyRiskApproval requirePendingApproval(Long id) {
        if (id == null) {
            throw new ServiceException("approval id is required");
        }
        YyRiskApproval approval = riskApprovalMapper.selectById(id);
        if (approval == null) {
            throw new ServiceException("approval not found");
        }
        if (!STATUS_PENDING.equals(StringUtils.trimToEmpty(approval.getStatus()))) {
            throw new ServiceException("approval is not pending");
        }
        return approval;
    }

    private static Long readLong(String payloadJson, String fieldName, Long defaultValue) {
        if (StringUtils.isBlank(payloadJson)) {
            return defaultValue;
        }
        try {
            JsonNode node = OBJECT_MAPPER.readTree(payloadJson).get(fieldName);
            return node == null || node.isNull() ? defaultValue : node.asLong(defaultValue);
        } catch (Exception ignored) {
            return defaultValue;
        }
    }

    private static Long defaultLong(Long value, Long fallback) {
        return value == null ? fallback : value;
    }

    private static BigDecimal normalizeAmount(BigDecimal value) {
        return value == null ? ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    private static LoginUser currentLoginUser() {
        return LoginHelper.isLogin() ? LoginHelper.getLoginUser() : null;
    }

    private List<YyBookingSlotInventoryVo> queryRuleSlots(YyScheduleExceptionRule rule) {
        YyBookingSlotInventoryBo query = new YyBookingSlotInventoryBo();
        query.setStoreId(rule.getStoreId());
        query.setServiceGroupId(rule.getServiceGroupId());
        query.setBeginBizDate(rule.getStartDate());
        query.setEndBizDate(rule.getEndDate());
        query.setStartTime(rule.getStartTime());
        query.setEndTime(rule.getEndTime());
        return bookingSlotInventoryService.queryList(query);
    }

    private Integer resolveNextCapacity(YyScheduleExceptionRule rule, YyBookingSlotInventoryVo slot) {
        return "CAPACITY_OVERRIDE".equalsIgnoreCase(StringUtils.trimToEmpty(rule.getActionType()))
            ? rule.getCapacity()
            : slot.getCapacity();
    }

    private String resolveNextStatus(YyScheduleExceptionRule rule, YyBookingSlotInventoryVo slot) {
        return switch (StringUtils.trimToEmpty(rule.getActionType()).toUpperCase()) {
            case "CLOSE" -> "CLOSED";
            case "REOPEN", "CAPACITY_OVERRIDE" -> "ACTIVE";
            default -> StringUtils.defaultIfBlank(slot.getStatus(), "ACTIVE");
        };
    }
}
