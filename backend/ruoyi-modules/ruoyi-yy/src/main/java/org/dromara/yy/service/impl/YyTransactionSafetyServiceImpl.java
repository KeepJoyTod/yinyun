package org.dromara.yy.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
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
import org.dromara.yy.domain.bo.YyEntitlementReservationCreateBo;
import org.dromara.yy.domain.bo.YyMemberWithdrawCreateBo;
import org.dromara.yy.domain.bo.YyStoredValueConsumeCreateBo;
import org.dromara.yy.domain.bo.YyTransactionSafetyActionBo;
import org.dromara.yy.domain.bo.YyTransactionSafetyQueryBo;
import org.dromara.yy.domain.vo.YyCompositePaymentOrderVo;
import org.dromara.yy.domain.vo.YyEntitlementReservationVo;
import org.dromara.yy.domain.vo.YyMemberWithdrawOrderVo;
import org.dromara.yy.domain.vo.YyStoredValueConsumeOrderVo;
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
import org.dromara.yy.service.IYyTransactionSafetyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@RequiredArgsConstructor
@Service
public class YyTransactionSafetyServiceImpl implements IYyTransactionSafetyService {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    private static final String DEFAULT_TENANT_ID = "000000";
    private static final String EXECUTION_MODE_SCAFFOLD = "SCAFFOLD";
    private static final String EXECUTION_MODE_LOCAL_ADAPTER = "LOCAL_ADAPTER";
    private static final String RESERVATION_STATUS_RESERVED = "RESERVED";
    private static final String RESERVATION_STATUS_RELEASED = "RELEASED";
    private static final String RESERVATION_STATUS_FULFILLED = "FULFILLED";
    private static final String COMPOSITE_STATUS_DRAFT = "DRAFT";
    private static final String COMPOSITE_STATUS_CONFIRMED = "CONFIRMED";
    private static final String COMPOSITE_STATUS_FAILED = "FAILED";
    private static final String SETTLE_STATUS_PENDING = "PENDING";
    private static final String SETTLE_STATUS_SETTLED = "SETTLED";
    private static final String SETTLE_STATUS_FAILED = "FAILED";
    private static final String STORED_VALUE_STATUS_FROZEN = "FROZEN";
    private static final String STORED_VALUE_STATUS_CONFIRMED = "CONFIRMED";
    private static final String STORED_VALUE_STATUS_REVERSED = "REVERSED";
    private static final String REVERSAL_STATUS_NONE = "NONE";
    private static final String REVERSAL_STATUS_REVERSED = "REVERSED";
    private static final String WITHDRAW_STATUS_PENDING_APPROVAL = "PENDING_APPROVAL";
    private static final String WITHDRAW_STATUS_APPROVED = "APPROVED";
    private static final String WITHDRAW_STATUS_PAID = "PAID";
    private static final String LEDGER_CHANGE_TYPE_CONSUME = "CONSUME";
    private static final String LEDGER_CHANGE_TYPE_CONSUME_REVERSE = "CONSUME_REVERSE";
    private static final String LEDGER_CHANGE_TYPE_WITHDRAW = "WITHDRAW";
    private static final String LEDGER_SOURCE_TYPE_STORED_VALUE_CONSUME = "STORED_VALUE_CONSUME";
    private static final String LEDGER_SOURCE_TYPE_MEMBER_WITHDRAW = "MEMBER_WITHDRAW";
    private static final String PAY_STATUS_PAID = "PAID";
    private static final String ORDER_STATUS_PENDING_PAYMENT = "PENDING_PAYMENT";
    private static final String ORDER_STATUS_PENDING_SERVICE = "PENDING_SERVICE";
    private static final String PAYMENT_CHANNEL_LOCAL_COMPOSITE = "LOCAL_COMPOSITE";
    private static final String PAYMENT_PROVIDER_LOCAL_ADAPTER = "LOCAL_ADAPTER";
    private static final int DEFAULT_EXPIRED_RELEASE_LIMIT = 50;

    private final YyCustomerMapper customerMapper;
    private final YyOrderMapper orderMapper;
    private final YyMemberAccountMapper memberAccountMapper;
    private final YyEntitlementReservationMapper entitlementReservationMapper;
    private final YyCompositePaymentOrderMapper compositePaymentOrderMapper;
    private final YyStoredValueConsumeOrderMapper storedValueConsumeOrderMapper;
    private final YyMemberWithdrawOrderMapper memberWithdrawOrderMapper;
    private final YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;
    private final YyPaymentRecordMapper paymentRecordMapper;
    private final IYyRiskApprovalService riskApprovalService;

    @Override
    public List<YyEntitlementReservationVo> listEntitlementReservations(YyTransactionSafetyQueryBo bo) {
        YyTransactionSafetyQueryBo query = safeQuery(bo);
        return entitlementReservationMapper.selectList(Wrappers.<YyEntitlementReservation>lambdaQuery()
                .eq(query.getStoreId() != null, YyEntitlementReservation::getStoreId, query.getStoreId())
                .eq(query.getCustomerId() != null, YyEntitlementReservation::getCustomerId, query.getCustomerId())
                .eq(query.getOrderId() != null, YyEntitlementReservation::getOrderId, query.getOrderId())
                .eq(StringUtils.isNotBlank(query.getStatus()), YyEntitlementReservation::getStatus, StringUtils.trim(query.getStatus()))
                .orderByDesc(YyEntitlementReservation::getCreateTime)
                .orderByDesc(YyEntitlementReservation::getId)
                .last("limit " + normalizeLimit(query.getLimit())))
            .stream()
            .map(this::mapReservation)
            .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyEntitlementReservationVo createEntitlementReservation(YyEntitlementReservationCreateBo bo) {
        YyCustomer customer = requireCustomer(bo.getCustomerId());
        YyOrder order = requireOrderIfPresent(bo.getOrderId());
        YyEntitlementReservation entity = new YyEntitlementReservation();
        entity.setId(IdWorker.getId());
        entity.setTenantId(resolveTenantId(customer, order, null));
        entity.setStoreId(resolveStoreId(bo.getStoreId(), order, null));
        entity.setCustomerId(customer.getId());
        entity.setOrderId(order == null ? null : order.getId());
        entity.setReservationNo(buildNo("RSV"));
        entity.setReservationType(StringUtils.defaultIfBlank(StringUtils.trim(bo.getReservationType()), "BENEFIT"));
        entity.setTargetType(StringUtils.defaultIfBlank(StringUtils.trim(bo.getTargetType()), "MEMBER_ASSET"));
        entity.setTargetSnapshot(StringUtils.trimToEmpty(bo.getTargetSnapshot()));
        entity.setQuantity(normalizeAmount(bo.getQuantity() == null ? BigDecimal.ONE : bo.getQuantity()));
        entity.setReservationAmount(normalizeAmount(bo.getReservationAmount()));
        entity.setStatus(RESERVATION_STATUS_RESERVED);
        entity.setIdempotencyKey(StringUtils.defaultIfBlank(StringUtils.trim(bo.getIdempotencyKey()), buildNo("IDEMP")));
        entity.setExpireTime(DateUtil.offsetMinute(new Date(), normalizeExpireMinutes(bo.getExpireMinutes())));
        entity.setExecutionMode(EXECUTION_MODE_SCAFFOLD);
        entity.setRemark(StringUtils.defaultIfBlank(StringUtils.trim(bo.getRemark()), "仅创建权益预占脚手架记录，尚未写入真实权益账本"));
        entitlementReservationMapper.insert(entity);
        return mapReservation(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyEntitlementReservationVo releaseEntitlementReservation(Long id, YyTransactionSafetyActionBo bo) {
        YyEntitlementReservation entity = requireReservation(id);
        if (!RESERVATION_STATUS_RESERVED.equals(StringUtils.trimToEmpty(entity.getStatus()))) {
            throw new ServiceException("only reserved entitlement can be released");
        }
        entity.setStatus(RESERVATION_STATUS_RELEASED);
        entity.setReleasedTime(new Date());
        entity.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
        entity.setRemark(actionRemark(bo, "local entitlement reservation released"));
        entitlementReservationMapper.updateById(entity);
        return mapReservation(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyEntitlementReservationVo fulfillEntitlementReservation(Long id, YyTransactionSafetyActionBo bo) {
        YyEntitlementReservation entity = requireReservation(id);
        if (!RESERVATION_STATUS_RESERVED.equals(StringUtils.trimToEmpty(entity.getStatus()))) {
            throw new ServiceException("only reserved entitlement can be fulfilled");
        }
        entity.setStatus(RESERVATION_STATUS_FULFILLED);
        entity.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
        entity.setRemark(actionRemark(bo, "local entitlement reservation fulfilled"));
        entitlementReservationMapper.updateById(entity);
        return mapReservation(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<YyEntitlementReservationVo> releaseExpiredEntitlementReservations(YyTransactionSafetyActionBo bo) {
        Date now = new Date();
        List<YyEntitlementReservation> expiredReservations = entitlementReservationMapper.selectList(Wrappers.<YyEntitlementReservation>lambdaQuery()
            .eq(YyEntitlementReservation::getStatus, RESERVATION_STATUS_RESERVED)
            .isNotNull(YyEntitlementReservation::getExpireTime)
            .le(YyEntitlementReservation::getExpireTime, now)
            .orderByAsc(YyEntitlementReservation::getExpireTime)
            .orderByAsc(YyEntitlementReservation::getId)
            .last("limit " + normalizeExpiredReleaseLimit(bo == null ? null : bo.getLimit())));
        List<YyEntitlementReservationVo> released = new ArrayList<>();
        for (YyEntitlementReservation entity : expiredReservations) {
            entity.setStatus(RESERVATION_STATUS_RELEASED);
            entity.setReleasedTime(now);
            entity.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
            entity.setRemark(actionRemark(bo, "local entitlement reservation auto released by expire time"));
            entitlementReservationMapper.updateById(entity);
            released.add(mapReservation(entity));
        }
        return released;
    }

    @Override
    public List<YyCompositePaymentOrderVo> listCompositePayments(YyTransactionSafetyQueryBo bo) {
        YyTransactionSafetyQueryBo query = safeQuery(bo);
        return compositePaymentOrderMapper.selectList(Wrappers.<YyCompositePaymentOrder>lambdaQuery()
                .eq(query.getStoreId() != null, YyCompositePaymentOrder::getStoreId, query.getStoreId())
                .eq(query.getCustomerId() != null, YyCompositePaymentOrder::getCustomerId, query.getCustomerId())
                .eq(query.getOrderId() != null, YyCompositePaymentOrder::getOrderId, query.getOrderId())
                .eq(StringUtils.isNotBlank(query.getStatus()), YyCompositePaymentOrder::getStatus, StringUtils.trim(query.getStatus()))
                .orderByDesc(YyCompositePaymentOrder::getCreateTime)
                .orderByDesc(YyCompositePaymentOrder::getId)
                .last("limit " + normalizeLimit(query.getLimit())))
            .stream()
            .map(this::mapCompositePayment)
            .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyCompositePaymentOrderVo createCompositePayment(YyCompositePaymentCreateBo bo) {
        YyCustomer customer = requireCustomer(bo.getCustomerId());
        YyOrder order = requireOrderIfPresent(bo.getOrderId());
        BigDecimal totalAmount = normalizeAmount(bo.getTotalAmount());
        BigDecimal externalAmount = normalizeAmount(bo.getExternalAmount());
        BigDecimal storedValueAmount = normalizeAmount(bo.getStoredValueAmount());
        BigDecimal cashAmount = normalizeAmount(bo.getCashAmount());
        BigDecimal discountAmount = normalizeAmount(bo.getDiscountAmount());
        BigDecimal waiveAmount = normalizeAmount(bo.getWaiveAmount());
        BigDecimal splitTotal = externalAmount.add(storedValueAmount).add(cashAmount).add(discountAmount).add(waiveAmount);
        if (splitTotal.compareTo(totalAmount) != 0) {
            throw new ServiceException("组合支付拆账金额之和必须等于总金额");
        }

        YyCompositePaymentOrder entity = new YyCompositePaymentOrder();
        entity.setId(IdWorker.getId());
        entity.setTenantId(resolveTenantId(customer, order, null));
        entity.setStoreId(resolveStoreId(bo.getStoreId(), order, null));
        entity.setCustomerId(customer.getId());
        entity.setOrderId(order == null ? null : order.getId());
        entity.setCompositeNo(buildNo("CMP"));
        entity.setTotalAmount(totalAmount);
        entity.setExternalAmount(externalAmount);
        entity.setStoredValueAmount(storedValueAmount);
        entity.setCashAmount(cashAmount);
        entity.setDiscountAmount(discountAmount);
        entity.setWaiveAmount(waiveAmount);
        entity.setStatus(COMPOSITE_STATUS_DRAFT);
        entity.setSettleStatus(SETTLE_STATUS_PENDING);
        entity.setExecutionMode(EXECUTION_MODE_SCAFFOLD);
        entity.setRemark(StringUtils.defaultIfBlank(StringUtils.trim(bo.getRemark()), "仅创建组合支付拆账草稿，尚未接入真实支付渠道回调"));
        compositePaymentOrderMapper.insert(entity);
        return mapCompositePayment(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyCompositePaymentOrderVo confirmCompositePayment(Long id, YyTransactionSafetyActionBo bo) {
        YyCompositePaymentOrder entity = requireCompositePayment(id);
        if (!COMPOSITE_STATUS_DRAFT.equals(StringUtils.trimToEmpty(entity.getStatus()))) {
            throw new ServiceException("only draft composite payment can be confirmed");
        }
        entity.setStatus(COMPOSITE_STATUS_CONFIRMED);
        entity.setSettleStatus(SETTLE_STATUS_SETTLED);
        entity.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
        entity.setRemark(actionRemark(bo, "local composite payment confirmed"));
        compositePaymentOrderMapper.updateById(entity);
        markOrderPaidIfPresent(entity, bo);
        fulfillReservedEntitlements(entity.getOrderId(), entity.getRemark());
        return mapCompositePayment(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyCompositePaymentOrderVo failCompositePayment(Long id, YyTransactionSafetyActionBo bo) {
        YyCompositePaymentOrder entity = requireCompositePayment(id);
        if (!COMPOSITE_STATUS_DRAFT.equals(StringUtils.trimToEmpty(entity.getStatus()))) {
            throw new ServiceException("only draft composite payment can be failed");
        }
        entity.setStatus(COMPOSITE_STATUS_FAILED);
        entity.setSettleStatus(SETTLE_STATUS_FAILED);
        entity.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
        entity.setRemark(actionRemark(bo, "local composite payment failed"));
        compositePaymentOrderMapper.updateById(entity);
        releaseReservedEntitlements(entity.getOrderId(), entity.getRemark());
        return mapCompositePayment(entity);
    }

    @Override
    public List<YyStoredValueConsumeOrderVo> listStoredValueConsumes(YyTransactionSafetyQueryBo bo) {
        YyTransactionSafetyQueryBo query = safeQuery(bo);
        return storedValueConsumeOrderMapper.selectList(Wrappers.<YyStoredValueConsumeOrder>lambdaQuery()
                .eq(query.getStoreId() != null, YyStoredValueConsumeOrder::getStoreId, query.getStoreId())
                .eq(query.getCustomerId() != null, YyStoredValueConsumeOrder::getCustomerId, query.getCustomerId())
                .eq(query.getOrderId() != null, YyStoredValueConsumeOrder::getOrderId, query.getOrderId())
                .eq(StringUtils.isNotBlank(query.getStatus()), YyStoredValueConsumeOrder::getStatus, StringUtils.trim(query.getStatus()))
                .orderByDesc(YyStoredValueConsumeOrder::getCreateTime)
                .orderByDesc(YyStoredValueConsumeOrder::getId)
                .last("limit " + normalizeLimit(query.getLimit())))
            .stream()
            .map(this::mapStoredValueConsume)
            .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyStoredValueConsumeOrderVo createStoredValueConsume(YyStoredValueConsumeCreateBo bo) {
        YyCustomer customer = requireCustomer(bo.getCustomerId());
        YyOrder order = requireOrderIfPresent(bo.getOrderId());
        YyMemberAccount account = requireMemberAccount(bo.getCustomerId());
        BigDecimal consumeAmount = normalizeAmount(bo.getConsumeAmount());
        BigDecimal balance = normalizeAmount(account.getBalanceAmount());
        if (consumeAmount.compareTo(balance) > 0) {
            throw new ServiceException("储值消费金额不能超过会员余额");
        }

        YyStoredValueConsumeOrder entity = new YyStoredValueConsumeOrder();
        entity.setId(IdWorker.getId());
        entity.setTenantId(resolveTenantId(customer, order, account));
        entity.setStoreId(resolveStoreId(bo.getStoreId(), order, account));
        entity.setCustomerId(customer.getId());
        entity.setOrderId(order == null ? null : order.getId());
        entity.setConsumeNo(buildNo("SVC"));
        entity.setConsumeAmount(consumeAmount);
        entity.setBalanceSnapshot(balance);
        entity.setStatus(STORED_VALUE_STATUS_FROZEN);
        entity.setReversalStatus(REVERSAL_STATUS_NONE);
        entity.setExecutionMode(EXECUTION_MODE_SCAFFOLD);
        entity.setRemark(StringUtils.defaultIfBlank(StringUtils.trim(bo.getRemark()), "仅创建储值消费冻结记录，尚未写入真实余额账本"));
        storedValueConsumeOrderMapper.insert(entity);
        return mapStoredValueConsume(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyStoredValueConsumeOrderVo confirmStoredValueConsume(Long id, YyTransactionSafetyActionBo bo) {
        YyStoredValueConsumeOrder entity = requireStoredValueConsume(id);
        if (!STORED_VALUE_STATUS_FROZEN.equals(StringUtils.trimToEmpty(entity.getStatus()))) {
            throw new ServiceException("only frozen stored-value consume can be confirmed");
        }
        YyMemberAccount account = requireMemberAccount(entity.getCustomerId());
        BigDecimal balance = normalizeAmount(account.getBalanceAmount());
        BigDecimal consumeAmount = normalizeAmount(entity.getConsumeAmount());
        if (consumeAmount.compareTo(balance) > 0) {
            throw new ServiceException("stored-value consume amount exceeds current balance");
        }
        BigDecimal nextBalance = balance.subtract(consumeAmount);
        Date now = new Date();
        account.setBalanceAmount(nextBalance);
        account.setLastTradeTime(now);
        memberAccountMapper.updateById(account);

        entity.setStatus(STORED_VALUE_STATUS_CONFIRMED);
        entity.setConfirmedTime(now);
        entity.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
        entity.setRemark(actionRemark(bo, "local stored-value consume confirmed"));
        storedValueConsumeOrderMapper.updateById(entity);
        insertBalanceLedger(account, entity.getStoreId(), entity.getCustomerId(), LEDGER_CHANGE_TYPE_CONSUME,
            consumeAmount.negate(), nextBalance, LEDGER_SOURCE_TYPE_STORED_VALUE_CONSUME, entity.getId(), entity.getRemark(), now);
        return mapStoredValueConsume(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyStoredValueConsumeOrderVo reverseStoredValueConsume(Long id, YyTransactionSafetyActionBo bo) {
        YyStoredValueConsumeOrder entity = requireStoredValueConsume(id);
        String status = StringUtils.trimToEmpty(entity.getStatus());
        if (!STORED_VALUE_STATUS_CONFIRMED.equals(status) && !STORED_VALUE_STATUS_FROZEN.equals(status)) {
            throw new ServiceException("only frozen or confirmed stored-value consume can be reversed");
        }
        YyMemberAccount account = requireMemberAccount(entity.getCustomerId());
        BigDecimal reverseAmount = STORED_VALUE_STATUS_CONFIRMED.equals(status) ? normalizeAmount(entity.getConsumeAmount()) : ZERO;
        BigDecimal nextBalance = normalizeAmount(account.getBalanceAmount()).add(reverseAmount);
        Date now = new Date();
        if (reverseAmount.compareTo(ZERO) > 0) {
            account.setBalanceAmount(nextBalance);
            account.setLastTradeTime(now);
            memberAccountMapper.updateById(account);
            insertBalanceLedger(account, entity.getStoreId(), entity.getCustomerId(), LEDGER_CHANGE_TYPE_CONSUME_REVERSE,
                reverseAmount, nextBalance, LEDGER_SOURCE_TYPE_STORED_VALUE_CONSUME, entity.getId(), actionRemark(bo, "local stored-value consume reversed"), now);
        }

        entity.setStatus(STORED_VALUE_STATUS_REVERSED);
        entity.setReversalStatus(REVERSAL_STATUS_REVERSED);
        entity.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
        entity.setRemark(actionRemark(bo, "local stored-value consume reversed"));
        storedValueConsumeOrderMapper.updateById(entity);
        return mapStoredValueConsume(entity);
    }

    @Override
    public List<YyMemberWithdrawOrderVo> listMemberWithdrawOrders(YyTransactionSafetyQueryBo bo) {
        YyTransactionSafetyQueryBo query = safeQuery(bo);
        return memberWithdrawOrderMapper.selectList(Wrappers.<YyMemberWithdrawOrder>lambdaQuery()
                .eq(query.getStoreId() != null, YyMemberWithdrawOrder::getStoreId, query.getStoreId())
                .eq(query.getCustomerId() != null, YyMemberWithdrawOrder::getCustomerId, query.getCustomerId())
                .eq(StringUtils.isNotBlank(query.getStatus()), YyMemberWithdrawOrder::getStatus, StringUtils.trim(query.getStatus()))
                .orderByDesc(YyMemberWithdrawOrder::getCreateTime)
                .orderByDesc(YyMemberWithdrawOrder::getId)
                .last("limit " + normalizeLimit(query.getLimit())))
            .stream()
            .map(this::mapWithdrawOrder)
            .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMemberWithdrawOrderVo createMemberWithdrawOrder(YyMemberWithdrawCreateBo bo) {
        YyCustomer customer = requireCustomer(bo.getCustomerId());
        YyMemberAccount account = requireMemberAccount(bo.getCustomerId());
        BigDecimal withdrawAmount = normalizeAmount(bo.getWithdrawAmount());
        BigDecimal balance = normalizeAmount(account.getBalanceAmount());
        if (withdrawAmount.compareTo(balance) > 0) {
            throw new ServiceException("提现金额不能超过会员余额");
        }

        YyMemberWithdrawOrder entity = new YyMemberWithdrawOrder();
        entity.setId(IdWorker.getId());
        entity.setTenantId(resolveTenantId(customer, null, account));
        entity.setStoreId(resolveStoreId(bo.getStoreId(), null, account));
        entity.setCustomerId(customer.getId());
        entity.setWithdrawNo(buildNo("WD"));
        entity.setWithdrawAmount(withdrawAmount);
        entity.setBalanceSnapshot(balance);
        entity.setAccountName(StringUtils.trim(bo.getAccountName()));
        entity.setAccountNoMasked(maskAccountNo(bo.getAccountNo()));
        entity.setChannelType(StringUtils.defaultIfBlank(StringUtils.trim(bo.getChannelType()), "BANK_TRANSFER"));
        entity.setStatus(WITHDRAW_STATUS_PENDING_APPROVAL);
        entity.setExecutionMode(EXECUTION_MODE_SCAFFOLD);
        entity.setRemark(StringUtils.defaultIfBlank(StringUtils.trim(bo.getRemark()), "仅创建提现申请与审批记录，尚未接入真实出款适配器"));
        memberWithdrawOrderMapper.insert(entity);

        Long approvalId = createWithdrawApproval(entity);
        YyMemberWithdrawOrder update = new YyMemberWithdrawOrder();
        update.setId(entity.getId());
        update.setApprovalId(approvalId);
        memberWithdrawOrderMapper.updateById(update);
        entity.setApprovalId(approvalId);
        return mapWithdrawOrder(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMemberWithdrawOrderVo markWithdrawPaid(Long id, YyTransactionSafetyActionBo bo) {
        YyMemberWithdrawOrder entity = requireWithdrawOrder(id);
        if (!WITHDRAW_STATUS_APPROVED.equals(StringUtils.trimToEmpty(entity.getStatus()))) {
            throw new ServiceException("only approved withdraw order can be marked paid");
        }
        YyMemberAccount account = requireMemberAccount(entity.getCustomerId());
        BigDecimal balance = normalizeAmount(account.getBalanceAmount());
        BigDecimal withdrawAmount = normalizeAmount(entity.getWithdrawAmount());
        if (withdrawAmount.compareTo(balance) > 0) {
            throw new ServiceException("withdraw amount exceeds current balance");
        }
        BigDecimal nextBalance = balance.subtract(withdrawAmount);
        Date now = new Date();
        account.setBalanceAmount(nextBalance);
        account.setLastTradeTime(now);
        memberAccountMapper.updateById(account);

        entity.setStatus(WITHDRAW_STATUS_PAID);
        entity.setPaidTime(now);
        entity.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
        entity.setRemark(actionRemark(bo, "local withdraw paid"));
        memberWithdrawOrderMapper.updateById(entity);
        insertBalanceLedger(account, entity.getStoreId(), entity.getCustomerId(), LEDGER_CHANGE_TYPE_WITHDRAW,
            withdrawAmount.negate(), nextBalance, LEDGER_SOURCE_TYPE_MEMBER_WITHDRAW, entity.getId(), entity.getRemark(), now);
        return mapWithdrawOrder(entity);
    }

    private Long createWithdrawApproval(YyMemberWithdrawOrder order) {
        return riskApprovalService.createPending(new IYyRiskApprovalService.CreateRiskApprovalCommand(
            order.getStoreId(),
            IYyRiskApprovalService.BUSINESS_MEMBER_WITHDRAW_APPLY,
            order.getId(),
            order.getWithdrawNo(),
            "会员提现需要审批",
            StringUtils.defaultIfBlank(order.getRemark(), "会员提现需要审批"),
            "{\"withdrawAmount\":\"" + order.getWithdrawAmount().toPlainString() + "\"}"
        )).getId();
    }

    private YyCustomer requireCustomer(Long customerId) {
        YyCustomer customer = customerMapper.selectById(customerId);
        if (customer == null) {
            throw new ServiceException("未找到会员信息");
        }
        return customer;
    }

    private YyOrder requireOrderIfPresent(Long orderId) {
        if (orderId == null) {
            return null;
        }
        YyOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new ServiceException("未找到订单");
        }
        return order;
    }

    private YyMemberAccount requireMemberAccount(Long customerId) {
        YyMemberAccount account = memberAccountMapper.selectOne(Wrappers.<YyMemberAccount>lambdaQuery()
            .eq(YyMemberAccount::getCustomerId, customerId)
            .orderByDesc(YyMemberAccount::getId)
            .last("limit 1"));
        if (account == null) {
            throw new ServiceException("未找到会员账户");
        }
        return account;
    }

    private YyEntitlementReservation requireReservation(Long id) {
        if (id == null) {
            throw new ServiceException("reservation id is required");
        }
        YyEntitlementReservation entity = entitlementReservationMapper.selectById(id);
        if (entity == null) {
            throw new ServiceException("entitlement reservation not found");
        }
        return entity;
    }

    private YyCompositePaymentOrder requireCompositePayment(Long id) {
        if (id == null) {
            throw new ServiceException("composite payment id is required");
        }
        YyCompositePaymentOrder entity = compositePaymentOrderMapper.selectById(id);
        if (entity == null) {
            throw new ServiceException("composite payment not found");
        }
        return entity;
    }

    private YyStoredValueConsumeOrder requireStoredValueConsume(Long id) {
        if (id == null) {
            throw new ServiceException("stored-value consume id is required");
        }
        YyStoredValueConsumeOrder entity = storedValueConsumeOrderMapper.selectById(id);
        if (entity == null) {
            throw new ServiceException("stored-value consume not found");
        }
        return entity;
    }

    private YyMemberWithdrawOrder requireWithdrawOrder(Long id) {
        if (id == null) {
            throw new ServiceException("withdraw order id is required");
        }
        YyMemberWithdrawOrder entity = memberWithdrawOrderMapper.selectById(id);
        if (entity == null) {
            throw new ServiceException("withdraw order not found");
        }
        return entity;
    }

    private void markOrderPaidIfPresent(YyCompositePaymentOrder payment, YyTransactionSafetyActionBo bo) {
        if (payment.getOrderId() == null) {
            return;
        }
        YyOrder order = requireOrderIfPresent(payment.getOrderId());
        Date now = new Date();
        Long paidAmountCent = toCent(payment.getTotalAmount());
        YyOrder update = new YyOrder();
        update.setId(order.getId());
        update.setPayStatus(PAY_STATUS_PAID);
        update.setPaidAmountCent(paidAmountCent);
        update.setPaidTime(now);
        String orderStatus = StringUtils.trimToEmpty(order.getStatus());
        if (StringUtils.isBlank(orderStatus) || ORDER_STATUS_PENDING_PAYMENT.equals(orderStatus)) {
            update.setStatus(ORDER_STATUS_PENDING_SERVICE);
        }
        orderMapper.updateById(update);

        YyPaymentRecord record = new YyPaymentRecord();
        record.setId(IdWorker.getId());
        record.setTenantId(StringUtils.defaultIfBlank(order.getTenantId(), payment.getTenantId()));
        record.setStoreId(payment.getStoreId());
        record.setOrderId(order.getId());
        record.setChannelType(PAYMENT_CHANNEL_LOCAL_COMPOSITE);
        record.setProvider(PAYMENT_PROVIDER_LOCAL_ADAPTER);
        record.setOutTradeNo(payment.getCompositeNo());
        record.setPlatformOrderId(actionLocalAdapterRef(bo, payment.getCompositeNo()));
        record.setTransactionId(actionLocalAdapterRef(bo, payment.getCompositeNo()));
        record.setAmountCent(paidAmountCent);
        record.setPaidAmountCent(paidAmountCent);
        record.setCurrency("CNY");
        record.setPayStatus(PAY_STATUS_PAID);
        record.setPaidTime(now);
        record.setNotifyTime(now);
        record.setRemark(actionRemark(bo, "local composite payment record"));
        paymentRecordMapper.insert(record);
    }

    private void fulfillReservedEntitlements(Long orderId, String remark) {
        updateReservedEntitlements(orderId, RESERVATION_STATUS_FULFILLED, null, remark);
    }

    private void releaseReservedEntitlements(Long orderId, String remark) {
        updateReservedEntitlements(orderId, RESERVATION_STATUS_RELEASED, new Date(), remark);
    }

    private void updateReservedEntitlements(Long orderId, String nextStatus, Date releasedTime, String remark) {
        if (orderId == null) {
            return;
        }
        List<YyEntitlementReservation> reservations = entitlementReservationMapper.selectList(Wrappers.<YyEntitlementReservation>lambdaQuery()
            .eq(YyEntitlementReservation::getOrderId, orderId)
            .eq(YyEntitlementReservation::getStatus, RESERVATION_STATUS_RESERVED));
        for (YyEntitlementReservation reservation : reservations) {
            YyEntitlementReservation update = new YyEntitlementReservation();
            update.setId(reservation.getId());
            update.setStatus(nextStatus);
            update.setReleasedTime(releasedTime);
            update.setExecutionMode(EXECUTION_MODE_LOCAL_ADAPTER);
            update.setRemark(StringUtils.defaultIfBlank(remark, "local entitlement reservation " + nextStatus.toLowerCase()));
            entitlementReservationMapper.updateById(update);
        }
    }

    private void insertBalanceLedger(YyMemberAccount account, Long storeId, Long customerId, String changeType,
                                     BigDecimal changeAmount, BigDecimal balanceAfter, String sourceType,
                                     Long sourceId, String remark, Date happenedAt) {
        YyMemberBalanceLedger ledger = new YyMemberBalanceLedger();
        ledger.setId(IdWorker.getId());
        ledger.setTenantId(StringUtils.defaultIfBlank(account.getTenantId(), DEFAULT_TENANT_ID));
        ledger.setStoreId(storeId);
        ledger.setCustomerId(customerId);
        ledger.setChangeType(changeType);
        ledger.setChangeAmount(normalizeAmount(changeAmount));
        ledger.setBalanceAfter(normalizeAmount(balanceAfter));
        ledger.setSourceType(sourceType);
        ledger.setSourceId(sourceId);
        ledger.setHappenedAt(happenedAt == null ? new Date() : happenedAt);
        ledger.setRemark(StringUtils.defaultString(remark));
        memberBalanceLedgerMapper.insert(ledger);
    }

    private static String actionRemark(YyTransactionSafetyActionBo bo, String fallback) {
        if (bo == null) {
            return fallback;
        }
        return StringUtils.defaultIfBlank(StringUtils.trim(bo.getReason()), fallback);
    }

    private static String actionLocalAdapterRef(YyTransactionSafetyActionBo bo, String fallback) {
        if (bo == null) {
            return fallback;
        }
        return StringUtils.defaultIfBlank(StringUtils.trim(bo.getLocalAdapterRef()), fallback);
    }

    private static Long toCent(BigDecimal amount) {
        return normalizeAmount(amount).movePointRight(2).longValue();
    }

    private static String resolveTenantId(YyCustomer customer, YyOrder order, YyMemberAccount account) {
        if (account != null && StringUtils.isNotBlank(account.getTenantId())) {
            return account.getTenantId();
        }
        if (customer != null && StringUtils.isNotBlank(customer.getTenantId())) {
            return customer.getTenantId();
        }
        if (order != null && StringUtils.isNotBlank(order.getTenantId())) {
            return order.getTenantId();
        }
        return DEFAULT_TENANT_ID;
    }

    private static Long resolveStoreId(Long inputStoreId, YyOrder order, YyMemberAccount account) {
        if (inputStoreId != null) {
            return inputStoreId;
        }
        if (order != null && order.getStoreId() != null) {
            return order.getStoreId();
        }
        return account == null ? null : account.getStoreId();
    }

    private static BigDecimal normalizeAmount(BigDecimal value) {
        return value == null ? ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    private static int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return 20;
        }
        return Math.min(limit, 100);
    }

    private static int normalizeExpireMinutes(Integer expireMinutes) {
        if (expireMinutes == null || expireMinutes <= 0) {
            return 30;
        }
        return Math.min(expireMinutes, 240);
    }

    private static int normalizeExpiredReleaseLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_EXPIRED_RELEASE_LIMIT;
        }
        return Math.min(limit, 200);
    }

    private static String buildNo(String prefix) {
        return prefix + "-" + DateUtil.format(new Date(), "yyyyMMddHHmmss") + "-" + IdWorker.getIdStr();
    }

    private static String maskAccountNo(String raw) {
        String value = StringUtils.trimToEmpty(raw);
        if (value.length() <= 8) {
            return value;
        }
        return value.substring(0, 4) + "****" + value.substring(value.length() - 4);
    }

    private YyEntitlementReservationVo mapReservation(YyEntitlementReservation entity) {
        YyEntitlementReservationVo vo = new YyEntitlementReservationVo();
        vo.setId(entity.getId());
        vo.setStoreId(entity.getStoreId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setOrderId(entity.getOrderId());
        vo.setReservationNo(entity.getReservationNo());
        vo.setReservationType(entity.getReservationType());
        vo.setTargetType(entity.getTargetType());
        vo.setTargetSnapshot(StringUtils.defaultString(entity.getTargetSnapshot()));
        vo.setQuantity(normalizeAmount(entity.getQuantity()));
        vo.setReservationAmount(normalizeAmount(entity.getReservationAmount()));
        vo.setStatus(StringUtils.defaultString(entity.getStatus()));
        vo.setIdempotencyKey(StringUtils.defaultString(entity.getIdempotencyKey()));
        vo.setExpireTime(formatDateTime(entity.getExpireTime()));
        vo.setReleasedTime(formatDateTime(entity.getReleasedTime()));
        vo.setExecutionMode(StringUtils.defaultString(entity.getExecutionMode()));
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private YyCompositePaymentOrderVo mapCompositePayment(YyCompositePaymentOrder entity) {
        YyCompositePaymentOrderVo vo = new YyCompositePaymentOrderVo();
        vo.setId(entity.getId());
        vo.setStoreId(entity.getStoreId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setOrderId(entity.getOrderId());
        vo.setCompositeNo(entity.getCompositeNo());
        vo.setTotalAmount(normalizeAmount(entity.getTotalAmount()));
        vo.setExternalAmount(normalizeAmount(entity.getExternalAmount()));
        vo.setStoredValueAmount(normalizeAmount(entity.getStoredValueAmount()));
        vo.setCashAmount(normalizeAmount(entity.getCashAmount()));
        vo.setDiscountAmount(normalizeAmount(entity.getDiscountAmount()));
        vo.setWaiveAmount(normalizeAmount(entity.getWaiveAmount()));
        vo.setStatus(StringUtils.defaultString(entity.getStatus()));
        vo.setSettleStatus(StringUtils.defaultString(entity.getSettleStatus()));
        vo.setExecutionMode(StringUtils.defaultString(entity.getExecutionMode()));
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private YyStoredValueConsumeOrderVo mapStoredValueConsume(YyStoredValueConsumeOrder entity) {
        YyStoredValueConsumeOrderVo vo = new YyStoredValueConsumeOrderVo();
        vo.setId(entity.getId());
        vo.setStoreId(entity.getStoreId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setOrderId(entity.getOrderId());
        vo.setConsumeNo(entity.getConsumeNo());
        vo.setConsumeAmount(normalizeAmount(entity.getConsumeAmount()));
        vo.setBalanceSnapshot(normalizeAmount(entity.getBalanceSnapshot()));
        vo.setStatus(StringUtils.defaultString(entity.getStatus()));
        vo.setReversalStatus(StringUtils.defaultString(entity.getReversalStatus()));
        vo.setExecutionMode(StringUtils.defaultString(entity.getExecutionMode()));
        vo.setConfirmedTime(formatDateTime(entity.getConfirmedTime()));
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private YyMemberWithdrawOrderVo mapWithdrawOrder(YyMemberWithdrawOrder entity) {
        YyMemberWithdrawOrderVo vo = new YyMemberWithdrawOrderVo();
        vo.setId(entity.getId());
        vo.setStoreId(entity.getStoreId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setWithdrawNo(entity.getWithdrawNo());
        vo.setWithdrawAmount(normalizeAmount(entity.getWithdrawAmount()));
        vo.setBalanceSnapshot(normalizeAmount(entity.getBalanceSnapshot()));
        vo.setApprovalId(entity.getApprovalId());
        vo.setAccountName(StringUtils.defaultString(entity.getAccountName()));
        vo.setAccountNoMasked(StringUtils.defaultString(entity.getAccountNoMasked()));
        vo.setChannelType(StringUtils.defaultString(entity.getChannelType()));
        vo.setStatus(StringUtils.defaultString(entity.getStatus()));
        vo.setExecutionMode(StringUtils.defaultString(entity.getExecutionMode()));
        vo.setPaidTime(formatDateTime(entity.getPaidTime()));
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private static String formatDateTime(Date value) {
        return value == null ? "" : DateUtil.formatDateTime(value);
    }

    private static YyTransactionSafetyQueryBo safeQuery(YyTransactionSafetyQueryBo bo) {
        return bo == null ? new YyTransactionSafetyQueryBo() : bo;
    }
}
