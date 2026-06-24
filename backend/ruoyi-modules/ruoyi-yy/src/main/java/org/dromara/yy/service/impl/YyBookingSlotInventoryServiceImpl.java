package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyScheduleRule;
import org.dromara.yy.domain.YyServiceGroup;
import org.dromara.yy.domain.bo.YyBookingSlotInventoryBo;
import org.dromara.yy.domain.vo.BookingSlotInventoryDecision;
import org.dromara.yy.domain.vo.YyBookingSlotInventoryVo;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyScheduleRuleMapper;
import org.dromara.yy.mapper.YyServiceGroupMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 影约云统一预约时段库存Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyBookingSlotInventoryServiceImpl implements IYyBookingSlotInventoryService {

    private static final String INVENTORY_CONFIRMED = "CONFIRMED";
    private static final String INVENTORY_CONFLICT = "CONFLICT";
    private static final String INVENTORY_RELEASED = "RELEASED";
    private static final String CONFLICT_REASON_FULL = "库存已满，需人工改期";

    private final YyBookingSlotInventoryMapper inventoryMapper;
    private final YyOrderMapper orderMapper;
    private final YyScheduleRuleMapper scheduleRuleMapper;
    private final YyServiceGroupMapper serviceGroupMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Value("${yy.booking.inventory.default-capacity:1}")
    private Integer defaultSlotCapacity = 1;

    @Override
    public YyBookingSlotInventoryVo queryById(Long id) {
        YyBookingSlotInventoryVo vo = inventoryMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getStoreId())) {
            return null;
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyBookingSlotInventoryVo> queryPageList(YyBookingSlotInventoryBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyBookingSlotInventory> lqw = buildQueryWrapper(bo);
        Page<YyBookingSlotInventoryVo> result = inventoryMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyBookingSlotInventoryVo> queryList(YyBookingSlotInventoryBo bo) {
        return inventoryMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateByBo(YyBookingSlotInventoryBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("库存时段不能为空");
        }
        YyBookingSlotInventory existing = inventoryMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("库存时段不存在");
        }
        if (!canAccessStore(existing.getStoreId())) {
            throw new ServiceException("无权操作该门店库存");
        }
        Integer nextCapacity = bo.getCapacity() == null ? existing.getCapacity() : bo.getCapacity();
        int paidCount = Objects.requireNonNullElse(existing.getPaidCount(), 0);
        if (nextCapacity != null && nextCapacity < paidCount) {
            throw new ServiceException("容量不能小于已确认订单数");
        }

        YyBookingSlotInventory update = new YyBookingSlotInventory();
        update.setId(bo.getId());
        update.setCapacity(nextCapacity);
        update.setStatus(StringUtils.defaultIfBlank(bo.getStatus(), existing.getStatus()));
        update.setRemark(bo.getRemark());
        return inventoryMapper.updateById(update) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BookingSlotInventoryDecision confirmPaidOrderSlot(YyOrder order) {
        if (order == null || order.getId() == null) {
            throw new ServiceException("订单不能为空");
        }
        if (INVENTORY_CONFIRMED.equals(order.getInventoryStatus())) {
            return BookingSlotInventoryDecision.confirmed(order.getInventorySlotId(), false);
        }

        YyBookingSlotInventory slot = resolveInventorySlot(order);
        if (slot == null || slot.getId() == null) {
            BookingSlotInventoryDecision decision = BookingSlotInventoryDecision.skipped("订单缺少完整预约时段，未参与库存扣减");
            persistOrderInventoryStatus(order, decision);
            return decision;
        }

        int affected = inventoryMapper.incrementPaidCountIfAvailable(slot.getId());
        BookingSlotInventoryDecision decision;
        if (affected > 0) {
            decision = BookingSlotInventoryDecision.confirmed(slot.getId(), true);
        } else {
            inventoryMapper.incrementConflictCount(slot.getId());
            decision = BookingSlotInventoryDecision.conflict(slot.getId(), CONFLICT_REASON_FULL);
        }
        persistOrderInventoryStatus(order, decision);
        return decision;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseConfirmedOrderSlot(YyOrder order) {
        if (order == null || order.getId() == null || order.getInventorySlotId() == null) {
            return;
        }
        if (!INVENTORY_CONFIRMED.equals(order.getInventoryStatus())) {
            return;
        }
        inventoryMapper.decrementPaidCount(order.getInventorySlotId());
        YyOrder update = new YyOrder();
        update.setId(order.getId());
        update.setInventoryStatus(INVENTORY_RELEASED);
        update.setConflictReason("");
        orderMapper.updateById(update);
        order.setInventoryStatus(INVENTORY_RELEASED);
        order.setConflictReason("");
    }

    private YyBookingSlotInventory resolveInventorySlot(YyOrder order) {
        if (order.getInventorySlotId() != null) {
            YyBookingSlotInventory slot = inventoryMapper.selectById(order.getInventorySlotId());
            if (slot != null) {
                return slot;
            }
            YyBookingSlotInventory fallback = new YyBookingSlotInventory();
            fallback.setId(order.getInventorySlotId());
            return fallback;
        }
        if (!hasSlotIdentity(order)) {
            return null;
        }

        YyBookingSlotInventory existing = findInventorySlot(order);
        if (existing != null) {
            return existing;
        }

        YyBookingSlotInventory created = new YyBookingSlotInventory();
        created.setId(IdWorker.getId());
        created.setTenantId(StringUtils.defaultIfBlank(order.getTenantId(), "000000"));
        created.setStoreId(order.getStoreId());
        created.setServiceGroupId(order.getServiceGroupId());
        created.setExternalSkuId(StringUtils.defaultIfBlank(order.getExternalSkuId(), ""));
        created.setBizDate(order.getSlotDate());
        created.setStartTime(order.getSlotStartTime());
        created.setEndTime(order.getSlotEndTime());
        created.setCapacity(resolveCapacity(order));
        created.setPaidCount(0);
        created.setConflictCount(0);
        created.setStatus("ACTIVE");
        created.setVersion(0);
        created.setDelFlag("0");
        try {
            inventoryMapper.insert(created);
        } catch (DuplicateKeyException ex) {
            YyBookingSlotInventory concurrentCreated = findInventorySlot(order);
            if (concurrentCreated != null) {
                return concurrentCreated;
            }
            throw ex;
        }
        return created;
    }

    private YyBookingSlotInventory findInventorySlot(YyOrder order) {
        return inventoryMapper.selectOne(Wrappers.<YyBookingSlotInventory>lambdaQuery()
            .eq(StringUtils.isNotBlank(order.getTenantId()), YyBookingSlotInventory::getTenantId, order.getTenantId())
            .eq(YyBookingSlotInventory::getStoreId, order.getStoreId())
            .eq(order.getServiceGroupId() != null, YyBookingSlotInventory::getServiceGroupId, order.getServiceGroupId())
            .eq(StringUtils.isNotBlank(order.getExternalSkuId()), YyBookingSlotInventory::getExternalSkuId, order.getExternalSkuId())
            .eq(YyBookingSlotInventory::getBizDate, order.getSlotDate())
            .eq(YyBookingSlotInventory::getStartTime, order.getSlotStartTime())
            .eq(YyBookingSlotInventory::getEndTime, order.getSlotEndTime())
            .eq(YyBookingSlotInventory::getDelFlag, "0")
            .last("limit 1"));
    }

    private boolean hasSlotIdentity(YyOrder order) {
        return order.getStoreId() != null
            && (order.getServiceGroupId() != null || StringUtils.isNotBlank(order.getExternalSkuId()))
            && StringUtils.isNotBlank(order.getSlotDate())
            && StringUtils.isNotBlank(order.getSlotStartTime())
            && StringUtils.isNotBlank(order.getSlotEndTime());
    }

    private Integer resolveCapacity(YyOrder order) {
        Integer scheduleCapacity = resolveScheduleCapacity(order);
        if (scheduleCapacity != null && scheduleCapacity > 0) {
            return scheduleCapacity;
        }
        if (order.getServiceGroupId() != null) {
            YyServiceGroup group = serviceGroupMapper.selectById(order.getServiceGroupId());
            if (group != null && group.getCapacity() != null && group.getCapacity() > 0) {
                return group.getCapacity();
            }
        }
        return Math.max(Objects.requireNonNullElse(defaultSlotCapacity, 1), 1);
    }

    private Integer resolveScheduleCapacity(YyOrder order) {
        if (order.getStoreId() == null || order.getServiceGroupId() == null
            || StringUtils.isBlank(order.getSlotDate())
            || StringUtils.isBlank(order.getSlotStartTime())
            || StringUtils.isBlank(order.getSlotEndTime())) {
            return null;
        }
        try {
            int weekday = LocalDate.parse(order.getSlotDate()).getDayOfWeek().getValue();
            YyScheduleRule rule = scheduleRuleMapper.selectOne(Wrappers.<YyScheduleRule>lambdaQuery()
                .eq(StringUtils.isNotBlank(order.getTenantId()), YyScheduleRule::getTenantId, order.getTenantId())
                .eq(YyScheduleRule::getStoreId, order.getStoreId())
                .eq(YyScheduleRule::getServiceGroupId, order.getServiceGroupId())
                .eq(YyScheduleRule::getWeekday, weekday)
                .eq(YyScheduleRule::getStartTime, order.getSlotStartTime())
                .eq(YyScheduleRule::getEndTime, order.getSlotEndTime())
                .eq(YyScheduleRule::getEnabled, "1")
                .last("limit 1"));
            return rule == null ? null : rule.getCapacity();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private void persistOrderInventoryStatus(YyOrder order, BookingSlotInventoryDecision decision) {
        YyOrder update = new YyOrder();
        update.setId(order.getId());
        update.setInventorySlotId(decision.getInventorySlotId());
        update.setInventoryStatus(decision.getInventoryStatus());
        update.setConflictReason(decision.getMessage());
        if (INVENTORY_CONFLICT.equals(decision.getInventoryStatus())) {
            update.setStatus("STOCK_CONFLICT");
            order.setStatus("STOCK_CONFLICT");
        }
        orderMapper.updateById(update);

        order.setInventorySlotId(decision.getInventorySlotId());
        order.setInventoryStatus(decision.getInventoryStatus());
        order.setConflictReason(decision.getMessage());
    }

    private LambdaQueryWrapper<YyBookingSlotInventory> buildQueryWrapper(YyBookingSlotInventoryBo bo) {
        LambdaQueryWrapper<YyBookingSlotInventory> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            lqw.orderByAsc(YyBookingSlotInventory::getBizDate);
            lqw.orderByAsc(YyBookingSlotInventory::getStartTime);
            lqw.orderByAsc(YyBookingSlotInventory::getId);
            return lqw;
        }
        lqw.eq(bo.getStoreId() != null, YyBookingSlotInventory::getStoreId, bo.getStoreId());
        lqw.eq(bo.getServiceGroupId() != null, YyBookingSlotInventory::getServiceGroupId, bo.getServiceGroupId());
        lqw.eq(StringUtils.isNotBlank(bo.getExternalSkuId()), YyBookingSlotInventory::getExternalSkuId, bo.getExternalSkuId());
        lqw.eq(StringUtils.isNotBlank(bo.getBizDate()), YyBookingSlotInventory::getBizDate, bo.getBizDate());
        lqw.ge(StringUtils.isNotBlank(bo.getBeginBizDate()), YyBookingSlotInventory::getBizDate, bo.getBeginBizDate());
        lqw.le(StringUtils.isNotBlank(bo.getEndBizDate()), YyBookingSlotInventory::getBizDate, bo.getEndBizDate());
        lqw.eq(StringUtils.isNotBlank(bo.getStartTime()), YyBookingSlotInventory::getStartTime, bo.getStartTime());
        lqw.eq(StringUtils.isNotBlank(bo.getEndTime()), YyBookingSlotInventory::getEndTime, bo.getEndTime());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyBookingSlotInventory::getStatus, bo.getStatus());
        lqw.gt("1".equals(bo.getConflictOnly()), YyBookingSlotInventory::getConflictCount, 0);
        applyStoreScope(lqw, bo.getStoreId());
        lqw.orderByAsc(YyBookingSlotInventory::getBizDate);
        lqw.orderByAsc(YyBookingSlotInventory::getStartTime);
        lqw.orderByAsc(YyBookingSlotInventory::getId);
        return lqw;
    }

    private void applyStoreScope(LambdaQueryWrapper<YyBookingSlotInventory> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyBookingSlotInventory::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyBookingSlotInventory::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyBookingSlotInventory::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
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
