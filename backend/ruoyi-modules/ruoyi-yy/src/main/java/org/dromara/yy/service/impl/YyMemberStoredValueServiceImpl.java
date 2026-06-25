package org.dromara.yy.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberRechargeOrder;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyMemberStoredValueTransactionQueryBo;
import org.dromara.yy.domain.vo.YyMemberRechargeCapabilityVo;
import org.dromara.yy.domain.vo.YyMemberRechargeSettingVo;
import org.dromara.yy.domain.vo.YyMemberStoredValueTransactionVo;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberRechargeOrderMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyMemberStoredValueService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class YyMemberStoredValueServiceImpl implements IYyMemberStoredValueService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal MIN_RECHARGE_AMOUNT = new BigDecimal("0.01");
    private static final String STATUS_SCAFFOLD = "scaffold";
    private static final String DEFAULT_CHANNEL_TYPE = "STORE_CASH";
    private static final String PERMISSION_CODE = "yy:customer:list";
    private static final String LEDGER_CHANGE_TYPE_RECHARGE = "RECHARGE";
    private static final String LEDGER_SOURCE_TYPE_RECHARGE_ORDER = "RECHARGE_ORDER";
    private static final String TRANSACTION_STATUS_CONFIRMED = "CONFIRMED";
    private static final String TRANSACTION_STATUS_PENDING = "PENDING";

    private final YyCustomerMapper customerMapper;
    private final YyStoreMapper storeMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;
    private final YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;
    private final YyMemberRechargeOrderMapper memberRechargeOrderMapper;

    @Override
    public YyMemberRechargeSettingVo getRechargeSetting() {
        YyMemberRechargeSettingVo vo = new YyMemberRechargeSettingVo();
        vo.setStatus(STATUS_SCAFFOLD);
        vo.setEnabled(false);
        vo.setScopeLabel("品牌级");
        vo.setGateCopy("会员储值读取接口已接入，在线支付、提现和余额消费扣减尚未开通。");
        vo.setAllowManualRecharge(true);
        vo.setAllowGiftAmount(true);
        vo.setAllowCrossStore(false);
        vo.setSupportedChannels(List.of(DEFAULT_CHANNEL_TYPE, "BANK_TRANSFER", "OTHER"));
        vo.setDefaultChannelType(DEFAULT_CHANNEL_TYPE);
        vo.setMinRechargeAmount(MIN_RECHARGE_AMOUNT);
        vo.setMaxRechargeAmount(null);
        vo.setNotice("当前仅开放门店手工充值读取与余额流水查询，第三方支付、提现和消费扣减保持关闭。");
        vo.setUpdatedAt("");
        vo.setGiftRules(List.of());
        return vo;
    }

    @Override
    public YyMemberRechargeCapabilityVo getRechargeCapability() {
        YyMemberRechargeCapabilityVo vo = new YyMemberRechargeCapabilityVo();
        vo.setCapabilityCode("MEMBER_RECHARGE");
        vo.setCapabilityName("会员储值");
        vo.setEnabled(false);
        vo.setStatus(STATUS_SCAFFOLD);
        vo.setScopeLabel("品牌级");
        vo.setGateCopy("会员储值正式能力保持保守开关，当前只读展示账本事实。");
        vo.setPermissionCode(PERMISSION_CODE);
        vo.setRequiresApproval(true);
        vo.setPluginState("disabled");
        vo.setLicenseState("missing");
        vo.setExpiresAt(null);
        return vo;
    }

    @Override
    public List<YyMemberStoredValueTransactionVo> listStoredValueTransactions(YyMemberStoredValueTransactionQueryBo bo) {
        YyMemberStoredValueTransactionQueryBo query = bo == null ? new YyMemberStoredValueTransactionQueryBo() : bo;
        StoreScope storeScope = resolveCurrentStoreScope();

        LambdaQueryWrapper<YyMemberBalanceLedger> wrapper = Wrappers.<YyMemberBalanceLedger>lambdaQuery()
            .eq(query.getCustomerId() != null, YyMemberBalanceLedger::getCustomerId, query.getCustomerId())
            .eq(StringUtils.isNotBlank(query.getTransactionType()), YyMemberBalanceLedger::getChangeType, normalizeTransactionType(query.getTransactionType()))
            .orderByDesc(YyMemberBalanceLedger::getHappenedAt)
            .orderByDesc(YyMemberBalanceLedger::getId)
            .last("limit " + normalizeLimit(query.getLimit()));

        Long requestedStoreId = query.getStoreId();
        if (requestedStoreId != null) {
            requireStoreAccess(storeScope, requestedStoreId, "无权查看该门店会员储值流水");
            wrapper.eq(YyMemberBalanceLedger::getStoreId, requestedStoreId);
        } else if (storeScope.applicable() && !storeScope.globalScope()) {
            if (storeScope.storeIds().isEmpty()) {
                return List.of();
            }
            wrapper.in(YyMemberBalanceLedger::getStoreId, storeScope.storeIds());
        }

        return memberBalanceLedgerMapper.selectList(wrapper)
            .stream()
            .map(this::mapTransaction)
            .filter(item -> matchesTransactionStatus(item, query.getTransactionStatus()))
            .toList();
    }

    private YyMemberStoredValueTransactionVo mapTransaction(YyMemberBalanceLedger ledger) {
        YyMemberRechargeOrder rechargeOrder = resolveRechargeOrder(ledger);
        BigDecimal changeAmount = defaultMoney(ledger.getChangeAmount());
        BigDecimal balanceAfter = defaultMoney(ledger.getBalanceAfter());

        YyMemberStoredValueTransactionVo vo = new YyMemberStoredValueTransactionVo();
        vo.setId(ledger.getId());
        vo.setTransactionNo("BAL-" + StringUtils.defaultString(ledger.getId() == null ? null : String.valueOf(ledger.getId())));
        vo.setCustomerId(ledger.getCustomerId());
        vo.setCustomerName(resolveCustomerName(ledger.getCustomerId()));
        vo.setTransactionType(mapTransactionType(ledger.getChangeType()));
        vo.setTransactionStatus(mapTransactionStatus(rechargeOrder));
        vo.setDirection(changeAmount.compareTo(ZERO) < 0 ? "OUT" : "IN");
        vo.setSourceType(mapSourceType(ledger.getSourceType()));
        vo.setSourceId(ledger.getSourceId());
        vo.setSourceOrderId(resolveSourceOrderId(vo.getSourceType(), ledger.getSourceId()));
        vo.setSourceOrderNo("");
        vo.setRechargeOrderId(rechargeOrder == null ? null : rechargeOrder.getId());
        vo.setRechargeOrderNo(rechargeOrder == null ? "" : StringUtils.defaultString(rechargeOrder.getRechargeOrderNo()));
        vo.setStoreId(ledger.getStoreId());
        vo.setStoreName(resolveStoreName(ledger.getStoreId()));
        vo.setOperatorId(null);
        vo.setOperatorName("");
        vo.setChannelType(rechargeOrder == null ? "" : StringUtils.defaultIfBlank(rechargeOrder.getChannelType(), DEFAULT_CHANNEL_TYPE));
        vo.setTradeTime(formatDateTime(ledger.getHappenedAt()));
        vo.setSummary(buildSummary(changeAmount, balanceAfter, rechargeOrder));
        vo.setRemark(StringUtils.defaultString(ledger.getRemark()));
        vo.setTags(buildTags(vo.getSourceType(), vo.getTransactionType()));
        return vo;
    }

    private YyMemberStoredValueTransactionVo.SummaryVo buildSummary(
        BigDecimal changeAmount,
        BigDecimal balanceAfter,
        YyMemberRechargeOrder rechargeOrder
    ) {
        YyMemberStoredValueTransactionVo.SummaryVo summary = new YyMemberStoredValueTransactionVo.SummaryVo();
        summary.setChangeAmount(changeAmount);
        summary.setBalanceAfter(balanceAfter);
        summary.setGiftAmount(rechargeOrder == null ? ZERO : defaultMoney(rechargeOrder.getGiftAmount()));
        summary.setPrincipalAmount(rechargeOrder == null ? changeAmount.abs() : defaultMoney(rechargeOrder.getRechargeAmount()));
        summary.setBalanceBefore(balanceAfter.subtract(changeAmount));
        return summary;
    }

    private YyMemberRechargeOrder resolveRechargeOrder(YyMemberBalanceLedger ledger) {
        if (!StringUtils.equals(LEDGER_SOURCE_TYPE_RECHARGE_ORDER, ledger.getSourceType()) || ledger.getSourceId() == null) {
            return null;
        }
        return memberRechargeOrderMapper.selectById(ledger.getSourceId());
    }

    private Long resolveSourceOrderId(String sourceType, Long sourceId) {
        return StringUtils.equals("ORDER", sourceType) ? sourceId : null;
    }

    private String resolveCustomerName(Long customerId) {
        if (customerId == null) {
            return "";
        }
        YyCustomer customer = customerMapper.selectById(customerId);
        return customer == null ? "" : StringUtils.defaultString(customer.getCustomerName());
    }

    private String resolveStoreName(Long storeId) {
        if (storeId == null) {
            return "";
        }
        YyStore store = storeMapper.selectById(storeId);
        return store == null ? "" : StringUtils.defaultString(store.getStoreName());
    }

    private boolean matchesTransactionStatus(YyMemberStoredValueTransactionVo vo, String transactionStatus) {
        return StringUtils.isBlank(transactionStatus) || StringUtils.equals(transactionStatus, vo.getTransactionStatus());
    }

    private String normalizeTransactionType(String transactionType) {
        String normalized = StringUtils.upperCase(StringUtils.trimToEmpty(transactionType));
        return switch (normalized) {
            case "RECHARGE", "CONSUME", "REFUND", "EXPIRE", "WITHDRAW", "ADJUST" -> normalized;
            default -> "ADJUST";
        };
    }

    private String mapTransactionType(String changeType) {
        return normalizeTransactionType(changeType);
    }

    private String mapTransactionStatus(YyMemberRechargeOrder rechargeOrder) {
        if (rechargeOrder == null) {
            return TRANSACTION_STATUS_CONFIRMED;
        }
        String status = StringUtils.upperCase(StringUtils.trimToEmpty(rechargeOrder.getStatus()));
        return switch (status) {
            case "PENDING", "PENDING_APPROVAL" -> TRANSACTION_STATUS_PENDING;
            case "CANCELLED", "FAILED", "REVERSED" -> status;
            default -> TRANSACTION_STATUS_CONFIRMED;
        };
    }

    private String mapSourceType(String sourceType) {
        String normalized = StringUtils.upperCase(StringUtils.trimToEmpty(sourceType));
        return switch (normalized) {
            case "RECHARGE_ORDER", "ORDER", "MANUAL_ADJUST", "REFUND_ORDER", "WITHDRAW_APPLY" -> normalized;
            default -> "UNKNOWN";
        };
    }

    private List<String> buildTags(String sourceType, String transactionType) {
        if (StringUtils.equals(LEDGER_SOURCE_TYPE_RECHARGE_ORDER, sourceType) || StringUtils.equals(LEDGER_CHANGE_TYPE_RECHARGE, transactionType)) {
            return List.of("ledger", "recharge");
        }
        return List.of("ledger");
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return 20;
        }
        return Math.max(1, Math.min(limit, 100));
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private String formatDateTime(java.util.Date value) {
        return value == null ? "" : DateUtil.formatDateTime(value);
    }

    private void requireStoreAccess(StoreScope storeScope, Long storeId, String message) {
        if (storeScope.applicable() && !storeScope.globalScope() && (storeId == null || !storeScope.storeIds().contains(storeId))) {
            throw new ServiceException(message);
        }
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
