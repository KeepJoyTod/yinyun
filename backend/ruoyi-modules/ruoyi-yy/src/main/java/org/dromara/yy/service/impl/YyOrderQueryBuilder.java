package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyOrderBo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

final class YyOrderQueryBuilder {

    private YyOrderQueryBuilder() {
    }

    static LambdaQueryWrapper<YyOrder> build(YyOrderBo bo, YyEmployeeMapper employeeMapper,
                                             YyEmployeeStoreMapper employeeStoreMapper) {
        String slotDate = StringUtils.trimToEmpty(bo.getSlotDate());
        String slotStartTime = StringUtils.trimToEmpty(bo.getSlotStartTime());
        String slotEndTime = StringUtils.trimToEmpty(bo.getSlotEndTime());
        String inventoryStatus = StringUtils.trimToEmpty(bo.getInventoryStatus());
        String externalStatus = StringUtils.trimToEmpty(bo.getExternalStatus());
        String syncStatus = StringUtils.trimToEmpty(bo.getSyncStatus());
        String photoDeliveryIssueOnly = StringUtils.trimToEmpty(bo.getPhotoDeliveryIssueOnly());
        LambdaQueryWrapper<YyOrder> lqw = Wrappers.lambdaQuery();
        lqw.and(StringUtils.isNotBlank(bo.getKeyword()), wrapper -> wrapper
            .like(YyOrder::getOrderNo, bo.getKeyword())
            .or()
            .like(YyOrder::getCustomerName, bo.getKeyword())
            .or()
            .like(YyOrder::getCustomerPhone, bo.getKeyword())
            .or()
            .like(YyOrder::getExternalOrderId, bo.getKeyword()));
        applyStoreScope(lqw, bo.getStoreId(), employeeMapper, employeeStoreMapper);
        lqw.like(StringUtils.isNotBlank(bo.getOrderNo()), YyOrder::getOrderNo, bo.getOrderNo());
        lqw.like(StringUtils.isNotBlank(bo.getCustomerName()), YyOrder::getCustomerName, bo.getCustomerName());
        lqw.like(StringUtils.isNotBlank(bo.getCustomerPhone()), YyOrder::getCustomerPhone, bo.getCustomerPhone());
        lqw.eq(StringUtils.isNotBlank(bo.getSource()), YyOrder::getSource, bo.getSource());
        lqw.eq(StringUtils.isNotBlank(bo.getBookingMethod()), YyOrder::getBookingMethod, bo.getBookingMethod());
        lqw.ge(bo.getBeginOrderTime() != null, YyOrder::getOrderTime, bo.getBeginOrderTime());
        lqw.le(bo.getEndOrderTime() != null, YyOrder::getOrderTime, bo.getEndOrderTime());
        lqw.ge(bo.getBeginArrivalTime() != null, YyOrder::getArrivalTime, bo.getBeginArrivalTime());
        lqw.le(bo.getEndArrivalTime() != null, YyOrder::getArrivalTime, bo.getEndArrivalTime());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyOrder::getStatus, bo.getStatus());
        lqw.like(StringUtils.isNotBlank(bo.getExternalOrderId()), YyOrder::getExternalOrderId, bo.getExternalOrderId());
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyOrder::getChannelType, bo.getChannelType());
        lqw.eq(StringUtils.isNotBlank(bo.getPayStatus()), YyOrder::getPayStatus, bo.getPayStatus());
        lqw.eq(StringUtils.isNotBlank(bo.getExternalProductId()), YyOrder::getExternalProductId, bo.getExternalProductId());
        lqw.eq(StringUtils.isNotBlank(bo.getExternalSkuId()), YyOrder::getExternalSkuId, bo.getExternalSkuId());
        lqw.eq(StringUtils.isNotBlank(bo.getExternalPoiId()), YyOrder::getExternalPoiId, bo.getExternalPoiId());
        lqw.eq(bo.getServiceGroupId() != null, YyOrder::getServiceGroupId, bo.getServiceGroupId());
        lqw.eq(bo.getInventorySlotId() != null, YyOrder::getInventorySlotId, bo.getInventorySlotId());
        lqw.eq(StringUtils.isNotBlank(slotDate), YyOrder::getSlotDate, slotDate);
        lqw.eq(StringUtils.isNotBlank(slotStartTime), YyOrder::getSlotStartTime, slotStartTime);
        lqw.eq(StringUtils.isNotBlank(slotEndTime), YyOrder::getSlotEndTime, slotEndTime);
        lqw.eq(StringUtils.isNotBlank(inventoryStatus), YyOrder::getInventoryStatus, inventoryStatus);
        applyChannelMappingStatusFilter(lqw, externalStatus, syncStatus);
        applyPhotoDeliveryIssueFilter(lqw, photoDeliveryIssueOnly);
        lqw.orderByDesc(YyOrder::getArrivalTime);
        lqw.orderByDesc(YyOrder::getId);
        return lqw;
    }

    private static void applyStoreScope(LambdaQueryWrapper<YyOrder> lqw, Long requestedStoreId,
                                        YyEmployeeMapper employeeMapper,
                                        YyEmployeeStoreMapper employeeStoreMapper) {
        StoreScope storeScope = resolveCurrentStoreScope(employeeMapper, employeeStoreMapper);
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyOrder::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyOrder::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyOrder::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private static StoreScope resolveCurrentStoreScope(YyEmployeeMapper employeeMapper,
                                                       YyEmployeeStoreMapper employeeStoreMapper) {
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

    private static void applyChannelMappingStatusFilter(LambdaQueryWrapper<YyOrder> lqw, String externalStatus, String syncStatus) {
        if (StringUtils.isNotBlank(externalStatus)) {
            lqw.exists("""
                select 1
                from yy_channel_order_mapping mapping
                where mapping.del_flag = '0'
                  and mapping.channel_type = yy_order.source
                  and mapping.external_order_id = yy_order.external_order_id
                  and mapping.external_status = {0}
                  and not exists (
                    select 1
                    from yy_channel_order_mapping newer
                    where newer.del_flag = '0'
                      and newer.channel_type = mapping.channel_type
                      and newer.external_order_id = mapping.external_order_id
                      and newer.id > mapping.id
                  )
                """, externalStatus);
        }
        if (StringUtils.isNotBlank(syncStatus)) {
            lqw.exists("""
                select 1
                from yy_channel_order_mapping mapping
                where mapping.del_flag = '0'
                  and mapping.channel_type = yy_order.source
                  and mapping.external_order_id = yy_order.external_order_id
                  and mapping.sync_status = {0}
                  and not exists (
                    select 1
                    from yy_channel_order_mapping newer
                    where newer.del_flag = '0'
                      and newer.channel_type = mapping.channel_type
                      and newer.external_order_id = mapping.external_order_id
                      and newer.id > mapping.id
                  )
                """, syncStatus);
        }
    }

    private static void applyPhotoDeliveryIssueFilter(LambdaQueryWrapper<YyOrder> lqw, String photoDeliveryIssueOnly) {
        if (!"1".equals(photoDeliveryIssueOnly)) {
            return;
        }
        lqw.and(wrapper -> wrapper
            .isNull(YyOrder::getCustomerPhone)
            .or()
            .eq(YyOrder::getCustomerPhone, "")
            .or()
            .notExists("select 1 from yy_photo_album album where album.del_flag = '0' and album.order_id = yy_order.id")
            .or()
            .notExists("""
                select 1
                from yy_photo_album album
                join yy_photo_asset asset on asset.album_id = album.id and asset.del_flag = '0'
                where album.del_flag = '0'
                  and album.order_id = yy_order.id
                  and asset.visible = '1'
                """)
            .or()
            .exists("""
                select 1
                from yy_photo_album album
                join yy_photo_asset asset on asset.album_id = album.id and asset.del_flag = '0'
                where album.del_flag = '0'
                  and album.order_id = yy_order.id
                  and asset.visible = '1'
                  and trim(coalesce(asset.object_key, '')) = ''
                """));
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
