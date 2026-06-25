package org.dromara.yy.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyMemberAccount;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberRechargeOrder;
import org.dromara.yy.domain.bo.YyMemberRechargeCreateBo;
import org.dromara.yy.domain.vo.YyMemberRechargeOrderVo;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMemberAccountMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberRechargeOrderMapper;
import org.dromara.yy.service.IYyMemberRechargeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class YyMemberRechargeServiceImpl implements IYyMemberRechargeService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final String ACCOUNT_STATUS_ACTIVE = "ACTIVE";
    private static final String DEFAULT_MEMBER_LEVEL = "NORMAL";
    private static final String DEFAULT_CHANNEL_TYPE = "STORE_CASH";
    private static final String ORDER_STATUS_PENDING = "PENDING";
    private static final String ORDER_STATUS_PENDING_APPROVAL = "PENDING_APPROVAL";
    private static final String ORDER_STATUS_CONFIRMED = "CONFIRMED";
    private static final String LEDGER_CHANGE_TYPE_RECHARGE = "RECHARGE";
    private static final String LEDGER_SOURCE_TYPE_RECHARGE_ORDER = "RECHARGE_ORDER";

    private final YyCustomerMapper customerMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;
    private final YyMemberAccountMapper memberAccountMapper;
    private final YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;
    private final YyMemberRechargeOrderMapper memberRechargeOrderMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMemberRechargeOrderVo createRechargeOrder(Long customerId, YyMemberRechargeCreateBo bo) {
        YyCustomer customer = requireCustomer(customerId);
        YyMemberAccount account = findLatestAccount(customerId);
        Long resolvedStoreId = resolveStoreId(bo.getStoreId(), account);
        requireStoreAccess(resolvedStoreId, "无权为该门店会员发起充值");

        YyMemberRechargeOrder order = new YyMemberRechargeOrder();
        order.setId(IdWorker.getId());
        order.setTenantId(resolveTenantId(customer, account));
        order.setStoreId(resolvedStoreId);
        order.setCustomerId(customerId);
        order.setRechargeOrderNo(buildRechargeOrderNo());
        order.setRechargeAmount(normalizeAmount(bo.getRechargeAmount()));
        order.setGiftAmount(normalizeGiftAmount(bo.getGiftAmount()));
        order.setStatus(requiresApproval(bo) ? ORDER_STATUS_PENDING_APPROVAL : ORDER_STATUS_PENDING);
        order.setChannelType(StringUtils.defaultIfBlank(StringUtils.trim(bo.getChannelType()), DEFAULT_CHANNEL_TYPE));
        order.setExternalTradeNo(StringUtils.trimToEmpty(bo.getExternalTradeNo()));
        order.setRemark(StringUtils.trimToEmpty(bo.getRemark()));
        memberRechargeOrderMapper.insert(order);

        upsertAccountForPending(customer, account, resolvedStoreId);
        return mapRechargeOrder(order, account == null ? ZERO : defaultMoney(account.getBalanceAmount()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMemberRechargeOrderVo confirmRechargeOrder(Long rechargeOrderId) {
        YyMemberRechargeOrder order = requireRechargeOrder(rechargeOrderId);
        requireStoreAccess(order.getStoreId(), "无权确认该门店会员充值");
        if (StringUtils.equals(order.getStatus(), ORDER_STATUS_PENDING_APPROVAL)) {
            throw new ServiceException("充值单待审批，暂不能确认到账");
        }
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

    @Override
    public List<YyMemberRechargeOrderVo> listRechargeOrders(Long customerId, int limit) {
        requireCustomer(customerId);
        requireStoreAccess(resolveMemberStoreId(customerId), "鏃犳潈鏌ョ湅璇ヤ細鍛樺厖鍊煎崟");

        int safeLimit = normalizeLimit(limit);
        List<YyMemberRechargeOrder> orders = memberRechargeOrderMapper.selectList(Wrappers.<YyMemberRechargeOrder>lambdaQuery()
            .eq(YyMemberRechargeOrder::getCustomerId, customerId)
            .orderByDesc(YyMemberRechargeOrder::getCreateTime)
            .orderByDesc(YyMemberRechargeOrder::getId)
            .last("limit " + safeLimit));
        if (orders.isEmpty()) {
            return List.of();
        }

        YyMemberAccount account = findLatestAccount(customerId);
        BigDecimal fallbackBalance = defaultMoney(account == null ? null : account.getBalanceAmount());
        Map<Long, BigDecimal> balanceAfterByOrderId = loadBalanceAfterByOrderId(orders);
        return orders.stream()
            .map(order -> mapRechargeOrder(order, balanceAfterByOrderId.getOrDefault(order.getId(), fallbackBalance)))
            .toList();
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
            throw new ServiceException("会员客户不存在");
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

    private Long resolveMemberStoreId(Long customerId) {
        YyMemberAccount account = findLatestAccount(customerId);
        return account == null ? null : account.getStoreId();
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

    private int normalizeLimit(int limit) {
        return Math.max(1, Math.min(limit, 100));
    }

    private Map<Long, BigDecimal> loadBalanceAfterByOrderId(List<YyMemberRechargeOrder> orders) {
        List<Long> orderIds = orders.stream()
            .map(YyMemberRechargeOrder::getId)
            .filter(Objects::nonNull)
            .toList();
        if (orderIds.isEmpty()) {
            return Map.of();
        }
        List<YyMemberBalanceLedger> ledgers = memberBalanceLedgerMapper.selectList(Wrappers.<YyMemberBalanceLedger>lambdaQuery()
            .eq(YyMemberBalanceLedger::getSourceType, LEDGER_SOURCE_TYPE_RECHARGE_ORDER)
            .in(YyMemberBalanceLedger::getSourceId, orderIds)
            .orderByDesc(YyMemberBalanceLedger::getHappenedAt)
            .orderByDesc(YyMemberBalanceLedger::getId));
        Map<Long, BigDecimal> balanceAfterByOrderId = new LinkedHashMap<>();
        for (YyMemberBalanceLedger ledger : ledgers) {
            if (ledger.getSourceId() == null || balanceAfterByOrderId.containsKey(ledger.getSourceId())) {
                continue;
            }
            balanceAfterByOrderId.put(ledger.getSourceId(), defaultMoney(ledger.getBalanceAfter()));
        }
        return balanceAfterByOrderId;
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(ZERO) <= 0) {
            throw new ServiceException("充值金额必须大于 0");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizeGiftAmount(BigDecimal amount) {
        if (amount == null) {
            return ZERO;
        }
        if (amount.compareTo(ZERO) < 0) {
            throw new ServiceException("赠送金额不能小于 0");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private boolean requiresApproval(YyMemberRechargeCreateBo bo) {
        return normalizeGiftAmount(bo.getGiftAmount()).compareTo(ZERO) > 0;
    }

    private void requireStoreAccess(Long storeId, String message) {
        if (!canAccessStore(storeId)) {
            throw new ServiceException(message);
        }
    }

    private boolean canAccessStore(Long storeId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        return !storeScope.applicable()
            || storeScope.globalScope()
            || (storeId != null && storeScope.storeIds().contains(storeId));
    }

    private StoreScope resolveCurrentStoreScope() {
        if (!LoginHelper.isLogin()) {
            return StoreScope.notApplicable();
        }
        if (LoginHelper.isSuperAdmin() || LoginHelper.isTenantAdmin()) {
            return StoreScope.global();
        }
        if (employeeMapper == null) {
            return StoreScope.empty();
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
        if (employeeStoreMapper != null && employee.getId() != null) {
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

    private record StoreScope(boolean applicable, boolean globalScope, Set<Long> storeIds) {
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
    }
}
