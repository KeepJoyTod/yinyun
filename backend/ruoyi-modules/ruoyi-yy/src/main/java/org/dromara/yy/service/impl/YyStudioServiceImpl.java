package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.vo.YyStudioBootstrapVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyStudioService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 门店工作台启动服务实现。
 */
@RequiredArgsConstructor
@Service
public class YyStudioServiceImpl implements IYyStudioService {

    private static final Map<String, String> FEATURE_STATUSES = featureStatuses();

    private final YyEmployeeMapper employeeMapper;
    private final YyStoreMapper storeMapper;
    private final YyOrderMapper orderMapper;
    private final YyPhotoAlbumMapper photoAlbumMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Override
    public YyStudioBootstrapVo bootstrap(LoginUser loginUser, boolean globalStoreScope) {
        YyEmployee employee = findEmployee(loginUser.getUserId());
        List<YyEmployeeStore> employeeStores = queryEmployeeStores(employee);
        List<Long> storeIds = resolveStoreIds(employee, employeeStores, globalStoreScope);
        List<YyStore> stores = queryStores(storeIds, globalStoreScope);

        YyStudioBootstrapVo result = new YyStudioBootstrapVo();
        result.setIdentity(toIdentity(loginUser, employee));
        result.setGlobalStoreScope(globalStoreScope);
        result.setStores(buildStoreScopes(stores, employeeStores, employee, globalStoreScope));
        result.setMenuPermissions(orEmpty(loginUser.getMenuPermission()));
        result.setRolePermissions(orEmpty(loginUser.getRolePermission()));
        result.setFeatureStatuses(FEATURE_STATUSES);
        result.setPending(queryPending(storeIds, globalStoreScope));
        return result;
    }

    private YyEmployee findEmployee(Long userId) {
        if (userId == null) {
            return null;
        }
        return employeeMapper.selectOne(Wrappers.lambdaQuery(YyEmployee.class)
            .eq(YyEmployee::getUserId, userId)
            .eq(YyEmployee::getStatus, "0")
            .last("limit 1"));
    }

    private List<YyEmployeeStore> queryEmployeeStores(YyEmployee employee) {
        if (employee == null || employee.getId() == null || employeeStoreMapper == null) {
            return Collections.emptyList();
        }
        return employeeStoreMapper.selectList(
            Wrappers.<YyEmployeeStore>lambdaQuery()
                .eq(YyEmployeeStore::getEmployeeId, employee.getId())
                .eq(YyEmployeeStore::getDelFlag, "0")
                .orderByAsc(YyEmployeeStore::getSort)
                .orderByAsc(YyEmployeeStore::getId)
        );
    }

    private List<Long> resolveStoreIds(YyEmployee employee, List<YyEmployeeStore> employeeStores, boolean globalStoreScope) {
        if (globalStoreScope) {
            return Collections.emptyList();
        }
        List<Long> scopedStoreIds = employeeStores.stream()
            .map(YyEmployeeStore::getStoreId)
            .filter(java.util.Objects::nonNull)
            .distinct()
            .toList();
        if (!scopedStoreIds.isEmpty()) {
            return scopedStoreIds;
        }
        if (employee == null || employee.getStoreId() == null) {
            return List.of();
        }
        return List.of(employee.getStoreId());
    }

    private List<YyStore> queryStores(List<Long> storeIds, boolean globalStoreScope) {
        if (!globalStoreScope && storeIds.isEmpty()) {
            return List.of();
        }
        LambdaQueryWrapper<YyStore> query = Wrappers.lambdaQuery(YyStore.class)
            .orderByAsc(YyStore::getSort)
            .orderByAsc(YyStore::getId);
        if (!globalStoreScope) {
            query.in(YyStore::getId, storeIds);
        }
        return storeMapper.selectList(query);
    }

    private YyStudioBootstrapVo.Identity toIdentity(LoginUser loginUser, YyEmployee employee) {
        YyStudioBootstrapVo.Identity identity = new YyStudioBootstrapVo.Identity();
        identity.setUserId(stringId(loginUser.getUserId()));
        identity.setUsername(loginUser.getUsername());
        identity.setNickname(loginUser.getNickname());
        if (employee != null) {
            identity.setEmployeeId(stringId(employee.getId()));
            identity.setEmployeeNo(employee.getEmployeeNo());
            identity.setEmployeeName(employee.getEmployeeName());
            identity.setRoleType(employee.getRoleType());
            identity.setStoreId(stringId(employee.getStoreId()));
        }
        return identity;
    }

    private YyStudioBootstrapVo.StoreScope toStoreScope(YyStore store) {
        YyStudioBootstrapVo.StoreScope scope = new YyStudioBootstrapVo.StoreScope();
        scope.setStoreId(stringId(store.getId()));
        scope.setStoreCode(store.getStoreCode());
        scope.setStoreName(store.getStoreName());
        scope.setStatus(store.getStatus());
        return scope;
    }

    private List<YyStudioBootstrapVo.StoreScope> buildStoreScopes(List<YyStore> stores,
            List<YyEmployeeStore> empStores, YyEmployee employee, boolean globalStoreScope) {

        Map<Long, YyEmployeeStore> empStoreMap = empStores.stream()
            .collect(Collectors.toMap(YyEmployeeStore::getStoreId, s -> s, (a, b) -> a));

        Long primaryStoreId = null;
        String primaryRoleType = null;
        if (employee != null) {
            primaryStoreId = employee.getStoreId();
        }

        List<YyStudioBootstrapVo.StoreScope> result = new ArrayList<>();
        for (YyStore store : stores) {
            YyStudioBootstrapVo.StoreScope scope = toStoreScopeWithEmployeeInfo(store, empStoreMap, primaryStoreId, primaryRoleType);
            result.add(scope);
        }
        return result;
    }

    private YyStudioBootstrapVo.StoreScope toStoreScopeWithEmployeeInfo(YyStore store,
            Map<Long, YyEmployeeStore> empStoreMap, Long primaryStoreId, String primaryRoleType) {
        YyStudioBootstrapVo.StoreScope scope = new YyStudioBootstrapVo.StoreScope();
        scope.setStoreId(stringId(store.getId()));
        scope.setStoreCode(store.getStoreCode());
        scope.setStoreName(store.getStoreName());
        scope.setStatus(store.getStatus());

        YyEmployeeStore empStore = empStoreMap.get(store.getId());
        if (empStore != null) {
            scope.setRoleType(empStore.getRoleType());
            scope.setPrimary(empStore.getIsPrimary() != null && "1".equals(empStore.getIsPrimary()));
        } else {
            scope.setRoleType(null);
            scope.setPrimary(null);
        }
        return scope;
    }

    private YyStudioBootstrapVo.Pending queryPending(List<Long> storeIds, boolean globalStoreScope) {
        YyStudioBootstrapVo.Pending pending = new YyStudioBootstrapVo.Pending();
        if (!globalStoreScope && storeIds.isEmpty()) {
            pending.setPendingOrders(0L);
            pending.setTodayArrivals(0L);
            pending.setInventoryConflicts(0L);
            pending.setActiveSelections(0L);
            return pending;
        }

        LocalDate today = LocalDate.now();
        ZoneId zoneId = ZoneId.systemDefault();
        Date start = Date.from(today.atStartOfDay(zoneId).toInstant());
        Date end = Date.from(today.plusDays(1).atStartOfDay(zoneId).toInstant());

        LambdaQueryWrapper<YyOrder> pendingOrders = scopedOrderQuery(storeIds, globalStoreScope)
            .eq(YyOrder::getStatus, "PENDING");
        LambdaQueryWrapper<YyOrder> todayArrivals = scopedOrderQuery(storeIds, globalStoreScope)
            .ge(YyOrder::getArrivalTime, start)
            .lt(YyOrder::getArrivalTime, end);
        LambdaQueryWrapper<YyOrder> inventoryConflicts = scopedOrderQuery(storeIds, globalStoreScope)
            .eq(YyOrder::getInventoryStatus, "CONFLICT");
        LambdaQueryWrapper<YyPhotoAlbum> activeSelections = Wrappers.lambdaQuery(YyPhotoAlbum.class)
            .eq(YyPhotoAlbum::getStatus, "ACTIVE");
        if (!globalStoreScope) {
            activeSelections.in(YyPhotoAlbum::getStoreId, storeIds);
        }

        pending.setPendingOrders(orderMapper.selectCount(pendingOrders));
        pending.setTodayArrivals(orderMapper.selectCount(todayArrivals));
        pending.setInventoryConflicts(orderMapper.selectCount(inventoryConflicts));
        pending.setActiveSelections(photoAlbumMapper.selectCount(activeSelections));
        return pending;
    }

    private LambdaQueryWrapper<YyOrder> scopedOrderQuery(List<Long> storeIds, boolean globalStoreScope) {
        LambdaQueryWrapper<YyOrder> query = Wrappers.lambdaQuery(YyOrder.class);
        if (!globalStoreScope) {
            query.in(YyOrder::getStoreId, storeIds);
        }
        return query;
    }

    private static Set<String> orEmpty(Set<String> values) {
        return values == null ? Set.of() : Set.copyOf(values);
    }

    private static String stringId(Long value) {
        return value == null ? null : value.toString();
    }

    private static Map<String, String> featureStatuses() {
        Map<String, String> statuses = new LinkedHashMap<>();
        statuses.put("dashboard-overview", "ready");
        statuses.put("dashboard-today", "ready");
        statuses.put("dashboard-tasks", "ready");
        statuses.put("merchant-store", "ready");
        statuses.put("product-service", "ready");
        statuses.put("order-appointment", "ready");
        statuses.put("service-selection", "ready");
        statuses.put("service-photos", "ready");
        statuses.put("service-retouch-center", "ready");
        statuses.put("service-retouch-providers", "ready");
        statuses.put("settings-workbench", "ready");
        statuses.put("collaboration-work-orders", "ready");
        return Collections.unmodifiableMap(statuses);
    }
}
