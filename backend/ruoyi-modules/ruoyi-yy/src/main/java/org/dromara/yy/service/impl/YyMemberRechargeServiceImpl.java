package org.dromara.yy.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyMemberAccount;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberRechargeOrder;
import org.dromara.yy.domain.bo.YyMemberRechargeCreateBo;
import org.dromara.yy.domain.vo.YyMemberRechargeOrderVo;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyMemberAccountMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberRechargeOrderMapper;
import org.dromara.yy.service.IYyMemberRechargeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;

@RequiredArgsConstructor
@Service
public class YyMemberRechargeServiceImpl implements IYyMemberRechargeService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final String ACCOUNT_STATUS_ACTIVE = "ACTIVE";
    private static final String DEFAULT_MEMBER_LEVEL = "NORMAL";
    private static final String DEFAULT_CHANNEL_TYPE = "STORE_CASH";
    private static final String ORDER_STATUS_PENDING = "PENDING";
    private static final String ORDER_STATUS_CONFIRMED = "CONFIRMED";
    private static final String LEDGER_CHANGE_TYPE_RECHARGE = "RECHARGE";
    private static final String LEDGER_SOURCE_TYPE_RECHARGE_ORDER = "RECHARGE_ORDER";

    private final YyCustomerMapper customerMapper;
    private final YyMemberAccountMapper memberAccountMapper;
    private final YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;
    private final YyMemberRechargeOrderMapper memberRechargeOrderMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMemberRechargeOrderVo createRechargeOrder(Long customerId, YyMemberRechargeCreateBo bo) {
        YyCustomer customer = requireCustomer(customerId);
        YyMemberAccount account = findLatestAccount(customerId);

        YyMemberRechargeOrder order = new YyMemberRechargeOrder();
        order.setId(IdWorker.getId());
        order.setTenantId(resolveTenantId(customer, account));
        order.setStoreId(resolveStoreId(bo.getStoreId(), account));
        order.setCustomerId(customerId);
        order.setRechargeOrderNo(buildRechargeOrderNo());
        order.setRechargeAmount(normalizeAmount(bo.getRechargeAmount()));
        order.setGiftAmount(normalizeGiftAmount(bo.getGiftAmount()));
        order.setStatus(ORDER_STATUS_PENDING);
        order.setChannelType(StringUtils.defaultIfBlank(StringUtils.trim(bo.getChannelType()), DEFAULT_CHANNEL_TYPE));
        order.setExternalTradeNo(StringUtils.trimToEmpty(bo.getExternalTradeNo()));
        order.setRemark(StringUtils.trimToEmpty(bo.getRemark()));
        memberRechargeOrderMapper.insert(order);

        upsertAccountForPending(customer, account, order.getStoreId());
        return mapRechargeOrder(order, account == null ? ZERO : defaultMoney(account.getBalanceAmount()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMemberRechargeOrderVo confirmRechargeOrder(Long rechargeOrderId) {
        YyMemberRechargeOrder order = requireRechargeOrder(rechargeOrderId);
        if (!StringUtils.equals(order.getStatus(), ORDER_STATUS_PENDING)) {
            throw new ServiceException("充值单不是待确认状态");
        }

        YyCustomer customer = requireCustomer(order.getCustomerId());
        YyMemberAccount account = findLatestAccount(order.getCustomerId());
        BigDecimal creditedAmount = creditedAmount(order);
        Date paidTime = new Date();

        if (account == null) {
            account = buildNewAccount(customer, order.getStoreId());
            account.setPendingRechargeCount(0);
            account.setBalanceAmount(creditedAmount);
            account.setLastTradeTime(paidTime);
            memberAccountMapper.insert(account);
        } else {
            account.setBalanceAmount(defaultMoney(account.getBalanceAmount()).add(creditedAmount));
            account.setPendingRechargeCount(Math.max(defaultInt(account.getPendingRechargeCount()) - 1, 0));
            account.setLastTradeTime(paidTime);
            if (account.getStoreId() == null && order.getStoreId() != null) {
                account.setStoreId(order.getStoreId());
            }
            memberAccountMapper.updateById(account);
        }

        order.setStatus(ORDER_STATUS_CONFIRMED);
        order.setPaidTime(paidTime);
        memberRechargeOrderMapper.updateById(order);

        YyMemberBalanceLedger ledger = new YyMemberBalanceLedger();
        ledger.setId(IdWorker.getId());
        ledger.setTenantId(resolveTenantId(customer, account));
        ledger.setStoreId(order.getStoreId());
        ledger.setCustomerId(order.getCustomerId());
        ledger.setChangeType(LEDGER_CHANGE_TYPE_RECHARGE);
        ledger.setChangeAmount(creditedAmount);
        ledger.setBalanceAfter(defaultMoney(account.getBalanceAmount()));
        ledger.setSourceType(LEDGER_SOURCE_TYPE_RECHARGE_ORDER);
        ledger.setSourceId(order.getId());
        ledger.setHappenedAt(paidTime);
        ledger.setRemark(StringUtils.defaultIfBlank(order.getRemark(), "会员手工充值"));
        memberBalanceLedgerMapper.insert(ledger);

        return mapRechargeOrder(order, defaultMoney(account.getBalanceAmount()));
    }

    private void upsertAccountForPending(YyCustomer customer, YyMemberAccount account, Long storeId) {
        if (account == null) {
            YyMemberAccount created = buildNewAccount(customer, storeId);
            created.setPendingRechargeCount(1);
            created.setBalanceAmount(ZERO);
            memberAccountMapper.insert(created);
            return;
        }
        account.setPendingRechargeCount(defaultInt(account.getPendingRechargeCount()) + 1);
        if (account.getStoreId() == null && storeId != null) {
            account.setStoreId(storeId);
        }
        memberAccountMapper.updateById(account);
    }

    private YyMemberAccount buildNewAccount(YyCustomer customer, Long storeId) {
        YyMemberAccount account = new YyMemberAccount();
        account.setId(IdWorker.getId());
        account.setTenantId(StringUtils.defaultIfBlank(customer.getTenantId(), "000000"));
        account.setStoreId(storeId);
        account.setCustomerId(customer.getId());
        account.setMemberNo("MEM-" + customer.getId());
        account.setCurrentLevel(StringUtils.defaultIfBlank(customer.getMemberLevel(), DEFAULT_MEMBER_LEVEL));
        account.setPointsBalance(0);
        account.setGrowthValue(0);
        account.setBalanceAmount(ZERO);
        account.setPendingRechargeCount(0);
        account.setStatus(ACCOUNT_STATUS_ACTIVE);
        account.setRemark(StringUtils.defaultString(customer.getRemark()));
        return account;
    }

    private YyCustomer requireCustomer(Long customerId) {
        YyCustomer customer = customerMapper.selectById(customerId);
        if (customer == null) {
            throw new ServiceException("客户不存在");
        }
        return customer;
    }

    private YyMemberRechargeOrder requireRechargeOrder(Long rechargeOrderId) {
        YyMemberRechargeOrder order = memberRechargeOrderMapper.selectById(rechargeOrderId);
        if (order == null) {
            throw new ServiceException("充值单不存在");
        }
        return order;
    }

    private YyMemberAccount findLatestAccount(Long customerId) {
        return memberAccountMapper.selectOne(Wrappers.<YyMemberAccount>lambdaQuery()
            .eq(YyMemberAccount::getCustomerId, customerId)
            .orderByDesc(YyMemberAccount::getId)
            .last("limit 1"));
    }

    private String resolveTenantId(YyCustomer customer, YyMemberAccount account) {
        if (account != null && StringUtils.isNotBlank(account.getTenantId())) {
            return account.getTenantId();
        }
        return StringUtils.defaultIfBlank(customer.getTenantId(), "000000");
    }

    private Long resolveStoreId(Long inputStoreId, YyMemberAccount account) {
        if (inputStoreId != null) {
            return inputStoreId;
        }
        return account == null ? null : account.getStoreId();
    }

    private BigDecimal creditedAmount(YyMemberRechargeOrder order) {
        return defaultMoney(order.getRechargeAmount()).add(defaultMoney(order.getGiftAmount()));
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(ZERO) <= 0) {
            throw new ServiceException("充值金额必须大于0");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizeGiftAmount(BigDecimal amount) {
        if (amount == null) {
            return ZERO;
        }
        if (amount.compareTo(ZERO) < 0) {
            throw new ServiceException("赠送金额不能小于0");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private String buildRechargeOrderNo() {
        return "YYMR-" + IdWorker.getIdStr();
    }

    private String formatDateTime(Date value) {
        return value == null ? "" : DateUtil.formatDateTime(value);
    }

    private YyMemberRechargeOrderVo mapRechargeOrder(YyMemberRechargeOrder order, BigDecimal balanceAfter) {
        YyMemberRechargeOrderVo vo = new YyMemberRechargeOrderVo();
        vo.setId(order.getId());
        vo.setCustomerId(order.getCustomerId());
        vo.setRechargeOrderNo(order.getRechargeOrderNo());
        vo.setRechargeAmount(defaultMoney(order.getRechargeAmount()));
        vo.setGiftAmount(defaultMoney(order.getGiftAmount()));
        vo.setCreditedAmount(creditedAmount(order));
        vo.setBalanceAfter(defaultMoney(balanceAfter));
        vo.setStatus(StringUtils.defaultString(order.getStatus()));
        vo.setChannelType(StringUtils.defaultString(order.getChannelType()));
        vo.setPaidTime(formatDateTime(order.getPaidTime()));
        vo.setExternalTradeNo(StringUtils.defaultString(order.getExternalTradeNo()));
        vo.setRemark(StringUtils.defaultString(order.getRemark()));
        return vo;
    }
}
