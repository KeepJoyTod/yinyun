package org.dromara.yy.service.dashboard;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class YyDashboardOrderQuerySupport {

    private final YyStoreMapper storeMapper;
    private final YyOrderMapper orderMapper;
    private final YyBookingSlotInventoryMapper bookingSlotInventoryMapper;

    public List<YyOrder> selectOperationalOrders(
        LocalDate beginDate,
        LocalDate endDate,
        Long storeId,
        String channelType,
        ZoneId zoneId
    ) {
        YyDashboardDomainSupport.ExportDateRange dateRange =
            new YyDashboardDomainSupport.ExportDateRange(beginDate, endDate);
        return orderMapper.selectList(
            Wrappers.lambdaQuery(YyOrder.class)
                .eq(storeId != null, YyOrder::getStoreId, storeId)
                .eq(StringUtils.isNotBlank(channelType), YyOrder::getChannelType, channelType)
                .and(wrapper -> wrapper
                    .ge(YyOrder::getSlotDate, dateRange.beginKey()).le(YyOrder::getSlotDate, dateRange.endKey())
                    .or(item -> item.ge(YyOrder::getArrivalTime, dateRange.beginTime(zoneId)).lt(YyOrder::getArrivalTime, dateRange.exclusiveEndTime(zoneId)))
                    .or(item -> item.ge(YyOrder::getOrderTime, dateRange.beginTime(zoneId)).lt(YyOrder::getOrderTime, dateRange.exclusiveEndTime(zoneId)))
                )
        );
    }

    public List<YyBookingSlotInventory> selectTodaySlotInventories(String dateKey, Long storeId) {
        return bookingSlotInventoryMapper.selectList(
            Wrappers.lambdaQuery(YyBookingSlotInventory.class)
                .eq(storeId != null, YyBookingSlotInventory::getStoreId, storeId)
                .eq(YyBookingSlotInventory::getBizDate, dateKey)
                .orderByAsc(YyBookingSlotInventory::getStartTime)
                .orderByAsc(YyBookingSlotInventory::getEndTime)
        );
    }

    public List<YyBookingSlotInventory> selectScheduleGridSlots(String startDate, String endDate, Long storeId) {
        return bookingSlotInventoryMapper.selectList(
            Wrappers.lambdaQuery(YyBookingSlotInventory.class)
                .eq(storeId != null, YyBookingSlotInventory::getStoreId, storeId)
                .ge(YyBookingSlotInventory::getBizDate, startDate)
                .le(YyBookingSlotInventory::getBizDate, endDate)
                .orderByAsc(YyBookingSlotInventory::getBizDate)
                .orderByAsc(YyBookingSlotInventory::getStartTime)
        );
    }

    public List<YyOrder> selectScheduleGridOrders(String startDate, String endDate, Long storeId) {
        return orderMapper.selectList(
            Wrappers.lambdaQuery(YyOrder.class)
                .eq(storeId != null, YyOrder::getStoreId, storeId)
                .ge(YyOrder::getSlotDate, startDate)
                .le(YyOrder::getSlotDate, endDate)
                .orderByAsc(YyOrder::getSlotDate)
                .orderByAsc(YyOrder::getSlotStartTime)
        );
    }

    public Map<Long, String> selectStoreNameMap(Long storeId) {
        return storeMapper.selectList(
            Wrappers.lambdaQuery(YyStore.class)
                .eq(storeId != null, YyStore::getId, storeId)
        ).stream().collect(Collectors.toMap(YyStore::getId, store -> YyDashboardDomainSupport.normalizeText(store.getStoreName())));
    }

    public Map<String, YyDashboardDomainSupport.SlotStats> aggregateSlotStats(
        YyDashboardDomainSupport.ExportDateRange dateRange,
        Long storeId
    ) {
        List<YyBookingSlotInventory> slots = bookingSlotInventoryMapper.selectList(
            Wrappers.lambdaQuery(YyBookingSlotInventory.class)
                .eq(storeId != null, YyBookingSlotInventory::getStoreId, storeId)
                .ge(YyBookingSlotInventory::getBizDate, dateRange.beginKey())
                .le(YyBookingSlotInventory::getBizDate, dateRange.endKey())
        );

        Map<String, YyDashboardDomainSupport.SlotStats> statsByDate = new HashMap<>();
        for (YyBookingSlotInventory slot : slots) {
            String dateKey = YyDashboardDomainSupport.normalizeText(slot.getBizDate());
            if (StringUtils.isBlank(dateKey)) {
                continue;
            }
            YyDashboardDomainSupport.SlotStats stats =
                statsByDate.computeIfAbsent(dateKey, key -> new YyDashboardDomainSupport.SlotStats());
            stats.accumulate(slot.getCapacity(), slot.getPaidCount(), slot.getConflictCount());
        }
        return statsByDate;
    }
}
