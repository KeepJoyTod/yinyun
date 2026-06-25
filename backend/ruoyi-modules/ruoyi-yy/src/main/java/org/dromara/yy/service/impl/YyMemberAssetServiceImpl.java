package org.dromara.yy.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyCouponInstance;
import org.dromara.yy.domain.YyCouponTemplate;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyMemberAccount;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberBenefitLedger;
import org.dromara.yy.domain.YyMemberCardInstance;
import org.dromara.yy.domain.YyMemberGrowthLedger;
import org.dromara.yy.domain.YyMemberPointsLedger;
import org.dromara.yy.domain.vo.YyMemberBalanceLedgerVo;
import org.dromara.yy.domain.vo.YyMemberBenefitLedgerVo;
import org.dromara.yy.domain.vo.YyMemberCardInstanceVo;
import org.dromara.yy.domain.vo.YyMemberCouponVo;
import org.dromara.yy.domain.vo.YyMemberGrowthLedgerVo;
import org.dromara.yy.domain.vo.YyMemberOverviewVo;
import org.dromara.yy.domain.vo.YyMemberPointsLedgerVo;
import org.dromara.yy.mapper.YyCouponInstanceMapper;
import org.dromara.yy.mapper.YyCouponTemplateMapper;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMemberAccountMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberBenefitLedgerMapper;
import org.dromara.yy.mapper.YyMemberCardInstanceMapper;
import org.dromara.yy.mapper.YyMemberGrowthLedgerMapper;
import org.dromara.yy.mapper.YyMemberPointsLedgerMapper;
import org.dromara.yy.service.IYyMemberAssetService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class YyMemberAssetServiceImpl implements IYyMemberAssetService {

    private static final Set<String> ACTIVE_ASSET_STATUSES = Set.of("ACTIVE", "VALID", "UNUSED", "READY");
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final YyCustomerMapper customerMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;
    private final YyMemberAccountMapper memberAccountMapper;
    private final YyMemberCardInstanceMapper memberCardInstanceMapper;
    private final YyMemberBenefitLedgerMapper memberBenefitLedgerMapper;
    private final YyCouponInstanceMapper couponInstanceMapper;
    private final YyCouponTemplateMapper couponTemplateMapper;
    private final YyMemberPointsLedgerMapper memberPointsLedgerMapper;
    private final YyMemberGrowthLedgerMapper memberGrowthLedgerMapper;
    private final YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;

    @Override
    public YyMemberOverviewVo getMemberOverview(Long customerId) {
        YyCustomer customer = requireCustomer(customerId);
        YyMemberAccount account = findLatestAccount(customerId);
        requireStoreAccess(account == null ? null : account.getStoreId(), "无权查看该会员资产");

        int activeCardCount = Math.toIntExact(memberCardInstanceMapper.selectCount(Wrappers.<YyMemberCardInstance>lambdaQuery()
            .eq(YyMemberCardInstance::getCustomerId, customerId)
            .in(YyMemberCardInstance::getStatus, ACTIVE_ASSET_STATUSES)));
        int activeBenefitCount = Math.toIntExact(memberBenefitLedgerMapper.selectCount(Wrappers.<YyMemberBenefitLedger>lambdaQuery()
            .eq(YyMemberBenefitLedger::getCustomerId, customerId)
            .in(YyMemberBenefitLedger::getStatus, ACTIVE_ASSET_STATUSES)));
        int activeCouponCount = Math.toIntExact(couponInstanceMapper.selectCount(Wrappers.<YyCouponInstance>lambdaQuery()
            .eq(YyCouponInstance::getCustomerId, customerId)
            .in(YyCouponInstance::getStatus, ACTIVE_ASSET_STATUSES)));

        YyMemberOverviewVo vo = new YyMemberOverviewVo();
        vo.setCustomerId(customer.getId());
        vo.setCustomerName(customer.getCustomerName());
        vo.setMobile(customer.getMobile());
        vo.setMemberLevel(StringUtils.defaultIfBlank(account == null ? null : account.getCurrentLevel(), customer.getMemberLevel()));
        vo.setTagSummary(StringUtils.defaultString(customer.getTags()));
        vo.setTotalOrderCount(defaultInt(customer.getTotalOrderCount()));
        vo.setTotalSpendAmount(defaultMoney(customer.getTotalSpend()));
        vo.setActiveCardCount(activeCardCount);
        vo.setActiveBenefitCount(activeBenefitCount);
        vo.setActiveCouponCount(activeCouponCount);
        vo.setPointsBalance(account != null && account.getPointsBalance() != null ? account.getPointsBalance() : latestPointsBalance(customerId));
        vo.setGrowthValue(account != null && account.getGrowthValue() != null ? account.getGrowthValue() : latestGrowthBalance(customerId));
        vo.setBalanceAmount(account != null && account.getBalanceAmount() != null ? account.getBalanceAmount() : latestBalanceAmount(customerId));
        vo.setPendingRechargeCount(account != null && account.getPendingRechargeCount() != null ? account.getPendingRechargeCount() : 0);
        vo.setLastTradeTime(formatDateTime(resolveLastTradeTime(customer, account, customerId)));
        vo.setRemark(StringUtils.defaultIfBlank(account == null ? null : account.getRemark(), customer.getRemark()));
        return vo;
    }

    @Override
    public List<YyMemberCardInstanceVo> listMemberCards(Long customerId) {
        requireCustomer(customerId);
        requireStoreAccess(resolveMemberStoreId(customerId), "无权查看该会员卡资产");
        return memberCardInstanceMapper.selectList(Wrappers.<YyMemberCardInstance>lambdaQuery()
                .eq(YyMemberCardInstance::getCustomerId, customerId)
                .orderByDesc(YyMemberCardInstance::getUpdateTime)
                .orderByDesc(YyMemberCardInstance::getId))
            .stream()
            .map(this::mapCard)
            .toList();
    }

    @Override
    public List<YyMemberBenefitLedgerVo> listMemberBenefits(Long customerId) {
        requireCustomer(customerId);
        requireStoreAccess(resolveMemberStoreId(customerId), "无权查看该会员权益资产");
        return memberBenefitLedgerMapper.selectList(Wrappers.<YyMemberBenefitLedger>lambdaQuery()
                .eq(YyMemberBenefitLedger::getCustomerId, customerId)
                .orderByDesc(YyMemberBenefitLedger::getUpdateTime)
                .orderByDesc(YyMemberBenefitLedger::getId))
            .stream()
            .map(this::mapBenefit)
            .toList();
    }

    @Override
    public List<YyMemberCouponVo> listMemberCoupons(Long customerId) {
        requireCustomer(customerId);
        requireStoreAccess(resolveMemberStoreId(customerId), "无权查看该会员券资产");
        List<YyCouponInstance> instances = couponInstanceMapper.selectList(Wrappers.<YyCouponInstance>lambdaQuery()
            .eq(YyCouponInstance::getCustomerId, customerId)
            .orderByDesc(YyCouponInstance::getUpdateTime)
            .orderByDesc(YyCouponInstance::getId));
        if (instances.isEmpty()) {
            return List.of();
        }
        List<Long> templateIds = instances.stream()
            .map(YyCouponInstance::getTemplateId)
            .filter(Objects::nonNull)
            .distinct()
            .toList();
        Map<Long, YyCouponTemplate> templates = templateIds.isEmpty()
            ? Map.of()
            : couponTemplateMapper.selectList(Wrappers.<YyCouponTemplate>lambdaQuery()
                    .in(YyCouponTemplate::getId, templateIds))
                .stream()
                .collect(Collectors.toMap(YyCouponTemplate::getId, Function.identity(), (left, right) -> left));
        return instances.stream()
            .map(instance -> mapCoupon(instance, templates.get(instance.getTemplateId())))
            .toList();
    }

    @Override
    public List<YyMemberPointsLedgerVo> listMemberPointsLedger(Long customerId, int limit) {
        requireCustomer(customerId);
        requireStoreAccess(resolveMemberStoreId(customerId), "无权查看该会员积分流水");
        int safeLimit = normalizeLimit(limit);
        return memberPointsLedgerMapper.selectList(Wrappers.<YyMemberPointsLedger>lambdaQuery()
                .eq(YyMemberPointsLedger::getCustomerId, customerId)
                .orderByDesc(YyMemberPointsLedger::getHappenedAt)
                .orderByDesc(YyMemberPointsLedger::getId)
                .last("limit " + safeLimit))
            .stream()
            .map(this::mapPointsLedger)
            .toList();
    }

    @Override
    public List<YyMemberGrowthLedgerVo> listMemberGrowthLedger(Long customerId, int limit) {
        requireCustomer(customerId);
        requireStoreAccess(resolveMemberStoreId(customerId), "无权查看该会员成长值流水");
        int safeLimit = normalizeLimit(limit);
        return memberGrowthLedgerMapper.selectList(Wrappers.<YyMemberGrowthLedger>lambdaQuery()
                .eq(YyMemberGrowthLedger::getCustomerId, customerId)
                .orderByDesc(YyMemberGrowthLedger::getHappenedAt)
                .orderByDesc(YyMemberGrowthLedger::getId)
                .last("limit " + safeLimit))
            .stream()
            .map(this::mapGrowthLedger)
            .toList();
    }

    @Override
    public List<YyMemberBalanceLedgerVo> listMemberBalanceLedger(Long customerId, int limit) {
        requireCustomer(customerId);
        requireStoreAccess(resolveMemberStoreId(customerId), "无权查看该会员余额流水");
        int safeLimit = normalizeLimit(limit);
        return memberBalanceLedgerMapper.selectList(Wrappers.<YyMemberBalanceLedger>lambdaQuery()
                .eq(YyMemberBalanceLedger::getCustomerId, customerId)
                .orderByDesc(YyMemberBalanceLedger::getHappenedAt)
                .orderByDesc(YyMemberBalanceLedger::getId)
                .last("limit " + safeLimit))
            .stream()
            .map(this::mapBalanceLedger)
            .toList();
    }

    private YyCustomer requireCustomer(Long customerId) {
        YyCustomer customer = customerMapper.selectById(customerId);
        if (customer == null) {
            throw new ServiceException("会员客户不存在");
        }
        return customer;
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

    private int normalizeLimit(int limit) {
        return Math.max(1, Math.min(limit, 100));
    }

    private int latestPointsBalance(Long customerId) {
        YyMemberPointsLedger latest = memberPointsLedgerMapper.selectOne(Wrappers.<YyMemberPointsLedger>lambdaQuery()
            .eq(YyMemberPointsLedger::getCustomerId, customerId)
            .orderByDesc(YyMemberPointsLedger::getHappenedAt)
            .orderByDesc(YyMemberPointsLedger::getId)
            .last("limit 1"));
        return latest == null || latest.getBalanceAfter() == null ? 0 : latest.getBalanceAfter();
    }

    private int latestGrowthBalance(Long customerId) {
        YyMemberGrowthLedger latest = memberGrowthLedgerMapper.selectOne(Wrappers.<YyMemberGrowthLedger>lambdaQuery()
            .eq(YyMemberGrowthLedger::getCustomerId, customerId)
            .orderByDesc(YyMemberGrowthLedger::getHappenedAt)
            .orderByDesc(YyMemberGrowthLedger::getId)
            .last("limit 1"));
        return latest == null || latest.getBalanceAfter() == null ? 0 : latest.getBalanceAfter();
    }

    private BigDecimal latestBalanceAmount(Long customerId) {
        YyMemberBalanceLedger latest = memberBalanceLedgerMapper.selectOne(Wrappers.<YyMemberBalanceLedger>lambdaQuery()
            .eq(YyMemberBalanceLedger::getCustomerId, customerId)
            .orderByDesc(YyMemberBalanceLedger::getHappenedAt)
            .orderByDesc(YyMemberBalanceLedger::getId)
            .last("limit 1"));
        return latest == null || latest.getBalanceAfter() == null ? ZERO : latest.getBalanceAfter();
    }

    private Date resolveLastTradeTime(YyCustomer customer, YyMemberAccount account, Long customerId) {
        Date candidate = account == null ? null : account.getLastTradeTime();
        if (candidate == null) {
            YyMemberBalanceLedger latestBalance = memberBalanceLedgerMapper.selectOne(Wrappers.<YyMemberBalanceLedger>lambdaQuery()
                .eq(YyMemberBalanceLedger::getCustomerId, customerId)
                .orderByDesc(YyMemberBalanceLedger::getHappenedAt)
                .orderByDesc(YyMemberBalanceLedger::getId)
                .last("limit 1"));
            candidate = latestBalance == null ? null : latestBalance.getHappenedAt();
        }
        if (candidate == null) {
            candidate = customer.getLastOrderTime();
        }
        return candidate;
    }

    private YyMemberCardInstanceVo mapCard(YyMemberCardInstance entity) {
        YyMemberCardInstanceVo vo = new YyMemberCardInstanceVo();
        vo.setId(entity.getId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setCardName(entity.getCardName());
        vo.setCardType(entity.getCardType());
        vo.setStatus(entity.getStatus());
        vo.setTotalQuota(defaultMoney(entity.getTotalQuota()));
        vo.setUsedQuota(defaultMoney(entity.getUsedQuota()));
        vo.setRemainingQuota(defaultMoney(entity.getRemainingQuota()));
        vo.setBalanceAmount(defaultMoney(entity.getBalanceAmount()));
        vo.setEffectiveFrom(formatDateTime(entity.getEffectiveFrom()));
        vo.setEffectiveTo(formatDateTime(entity.getEffectiveTo()));
        vo.setSourceOrderId(entity.getOrderId());
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private YyMemberBenefitLedgerVo mapBenefit(YyMemberBenefitLedger entity) {
        YyMemberBenefitLedgerVo vo = new YyMemberBenefitLedgerVo();
        vo.setId(entity.getId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setBenefitName(entity.getBenefitName());
        vo.setBenefitType(entity.getBenefitType());
        vo.setStatus(entity.getStatus());
        vo.setTotalAmount(defaultMoney(entity.getTotalAmount()));
        vo.setUsedAmount(defaultMoney(entity.getUsedAmount()));
        vo.setRemainingAmount(defaultMoney(entity.getRemainingAmount()));
        vo.setSourceType(StringUtils.defaultString(entity.getSourceType()));
        vo.setSourceId(entity.getSourceId());
        vo.setExpireTime(formatDateTime(entity.getExpireTime()));
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private YyMemberCouponVo mapCoupon(YyCouponInstance instance, YyCouponTemplate template) {
        YyMemberCouponVo vo = new YyMemberCouponVo();
        vo.setId(instance.getId());
        vo.setCustomerId(instance.getCustomerId());
        vo.setCouponName(template == null ? instance.getInstanceCode() : template.getTemplateName());
        vo.setCouponType(template == null ? "UNKNOWN" : template.getTemplateType());
        vo.setStatus(instance.getStatus());
        vo.setDiscountAmount(template == null ? ZERO : centsToYuan(template.getFaceValueCent()));
        vo.setThresholdAmount(ZERO);
        vo.setSourceType(instance.getOrderId() != null ? "ORDER" : "MARKETING");
        vo.setSourceId(instance.getOrderId() != null ? instance.getOrderId() : instance.getTemplateId());
        vo.setExpireTime(StringUtils.defaultString(instance.getExpiresAt()));
        vo.setRemark("");
        return vo;
    }

    private YyMemberPointsLedgerVo mapPointsLedger(YyMemberPointsLedger entity) {
        YyMemberPointsLedgerVo vo = new YyMemberPointsLedgerVo();
        vo.setId(entity.getId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setChangeType(entity.getChangeType());
        vo.setChangeAmount(defaultInt(entity.getChangeAmount()));
        vo.setBalanceAfter(defaultInt(entity.getBalanceAfter()));
        vo.setSourceType(StringUtils.defaultString(entity.getSourceType()));
        vo.setSourceId(entity.getSourceId());
        vo.setHappenedAt(formatDateTime(entity.getHappenedAt()));
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private YyMemberGrowthLedgerVo mapGrowthLedger(YyMemberGrowthLedger entity) {
        YyMemberGrowthLedgerVo vo = new YyMemberGrowthLedgerVo();
        vo.setId(entity.getId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setChangeType(entity.getChangeType());
        vo.setChangeAmount(defaultInt(entity.getChangeAmount()));
        vo.setBalanceAfter(defaultInt(entity.getBalanceAfter()));
        vo.setSourceType(StringUtils.defaultString(entity.getSourceType()));
        vo.setSourceId(entity.getSourceId());
        vo.setHappenedAt(formatDateTime(entity.getHappenedAt()));
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private YyMemberBalanceLedgerVo mapBalanceLedger(YyMemberBalanceLedger entity) {
        YyMemberBalanceLedgerVo vo = new YyMemberBalanceLedgerVo();
        vo.setId(entity.getId());
        vo.setCustomerId(entity.getCustomerId());
        vo.setChangeType(entity.getChangeType());
        vo.setChangeAmount(defaultMoney(entity.getChangeAmount()));
        vo.setBalanceAfter(defaultMoney(entity.getBalanceAfter()));
        vo.setSourceType(StringUtils.defaultString(entity.getSourceType()));
        vo.setSourceId(entity.getSourceId());
        vo.setHappenedAt(formatDateTime(entity.getHappenedAt()));
        vo.setRemark(StringUtils.defaultString(entity.getRemark()));
        return vo;
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private BigDecimal centsToYuan(Long centValue) {
        return centValue == null ? ZERO : BigDecimal.valueOf(centValue, 2);
    }

    private String formatDateTime(Date value) {
        return value == null ? "" : DateUtil.formatDateTime(value);
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
