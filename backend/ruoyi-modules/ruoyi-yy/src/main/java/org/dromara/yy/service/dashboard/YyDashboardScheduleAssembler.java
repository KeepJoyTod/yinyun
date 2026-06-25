package org.dromara.yy.service.dashboard;

import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridSlotVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridVo;
import org.dromara.yy.domain.vo.YyDashboardTodaySlotVo;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class YyDashboardScheduleAssembler {

    public List<String> buildScheduleGridDates(LocalDate beginDate, int days) {
        List<String> dates = new ArrayList<>();
        for (int index = 0; index < days; index++) {
            dates.add(beginDate.plusDays(index).toString());
        }
        return dates;
    }

    public List<YyDashboardTodaySlotVo> buildTodaySlots(
        String dateKey,
        List<YyBookingSlotInventory> slots,
        List<YyOrder> orders,
        Map<Long, String> storeNameMap
    ) {
        Set<String> slotKeys = slots.stream()
            .map(slot -> YyDashboardDomainSupport.slotKey(slot.getBizDate(), slot.getStartTime(), slot.getEndTime()))
            .filter(StringUtils::isNotBlank)
            .collect(Collectors.toSet());

        return orders.stream()
            .filter(YyDashboardDomainSupport::hasRealSlotRange)
            .filter(order -> dateKey.equals(YyDashboardDomainSupport.normalizeText(order.getSlotDate())))
            .filter(order -> slotKeys.isEmpty() || slotKeys.contains(
                YyDashboardDomainSupport.slotKey(order.getSlotDate(), order.getSlotStartTime(), order.getSlotEndTime())
            ))
            .sorted(Comparator
                .comparing((YyOrder order) -> YyDashboardDomainSupport.normalizeText(order.getSlotStartTime()))
                .thenComparing(order -> YyDashboardDomainSupport.normalizeText(order.getSlotEndTime()))
                .thenComparing(order -> YyDashboardDomainSupport.valueOrZero(order.getId())))
            .map(order -> toTodaySlot(order, storeNameMap))
            .toList();
    }

    public YyDashboardScheduleGridVo buildScheduleGrid(
        Long storeId,
        List<String> dates,
        List<YyBookingSlotInventory> slots,
        List<YyOrder> orders
    ) {
        Map<String, List<YyOrder>> ordersByDate = orders.stream()
            .filter(order -> StringUtils.isNotBlank(order.getSlotDate()))
            .collect(Collectors.groupingBy(order -> YyDashboardDomainSupport.normalizeText(order.getSlotDate())));

        Map<String, List<YyDashboardScheduleGridSlotVo>> slotsByDate = new LinkedHashMap<>();
        for (String date : dates) {
            slotsByDate.put(date, new ArrayList<>());
        }

        for (YyBookingSlotInventory slot : slots) {
            YyDashboardScheduleGridSlotVo vo = new YyDashboardScheduleGridSlotVo();
            vo.setId(slot.getId());
            vo.setStoreId(slot.getStoreId());
            vo.setBizDate(slot.getBizDate());
            vo.setStartTime(slot.getStartTime());
            vo.setEndTime(slot.getEndTime());
            vo.setCapacity(slot.getCapacity());
            vo.setPaidCount(slot.getPaidCount());
            vo.setConflictCount(slot.getConflictCount());

            int capacity = YyDashboardDomainSupport.intOrZero(slot.getCapacity());
            int paid = YyDashboardDomainSupport.intOrZero(slot.getPaidCount());
            int conflict = YyDashboardDomainSupport.intOrZero(slot.getConflictCount());
            vo.setRemainCount(Math.max(0, capacity - paid));
            vo.setSlotStatus(resolveSlotStatus(capacity, paid, conflict));
            vo.setOrders(buildSlotOrders(slot, ordersByDate.getOrDefault(slot.getBizDate(), Collections.emptyList())));

            slotsByDate.computeIfAbsent(slot.getBizDate(), key -> new ArrayList<>()).add(vo);
        }

        YyDashboardScheduleGridVo grid = new YyDashboardScheduleGridVo();
        grid.setStoreId(storeId);
        grid.setDates(dates);
        grid.setSlotsByDate(slotsByDate);
        return grid;
    }

    private YyDashboardTodaySlotVo toTodaySlot(YyOrder order, Map<Long, String> storeNameMap) {
        YyDashboardTodaySlotVo vo = new YyDashboardTodaySlotVo();
        vo.setBookingId(order.getId());
        vo.setStoreId(order.getStoreId());
        String storeName = storeNameMap.getOrDefault(order.getStoreId(), "门店 #" + YyDashboardDomainSupport.valueOrZero(order.getStoreId()));
        vo.setStoreName(storeName);
        vo.setStudioId(order.getStoreId());
        vo.setStudioName(storeName + " / 默认工位");
        vo.setStartAt(YyDashboardDomainSupport.buildSlotDateTime(order.getSlotDate(), order.getSlotStartTime()));
        vo.setEndAt(YyDashboardDomainSupport.buildSlotDateTime(order.getSlotDate(), YyDashboardDomainSupport.resolveSlotEndTime(order)));
        vo.setBookingStatus(YyDashboardDomainSupport.statusLabel(order));
        vo.setOrderId(order.getId());
        vo.setOrderNo(YyDashboardDomainSupport.normalizeText(order.getOrderNo()));
        vo.setCustomerName(YyDashboardDomainSupport.normalizeText(order.getCustomerName()));
        vo.setCustomerPhone(YyDashboardDomainSupport.normalizeText(order.getCustomerPhone()));
        vo.setServiceName(YyDashboardDomainSupport.productLabel(order));
        vo.setOrderStatus(YyDashboardDomainSupport.statusLabel(order));
        return vo;
    }

    private String resolveSlotStatus(int capacity, int paid, int conflict) {
        if (conflict > 0) {
            return "SLOT_CONFLICT";
        }
        if (paid >= capacity && capacity > 0) {
            return "SLOT_FULL";
        }
        if (paid > 0) {
            return "SLOT_PARTIAL";
        }
        return "SLOT_EMPTY";
    }

    private List<YyDashboardScheduleGridSlotVo.SlotOrderSummary> buildSlotOrders(
        YyBookingSlotInventory slot,
        List<YyOrder> orders
    ) {
        return orders.stream()
            .filter(order -> Objects.equals(slot.getStartTime(), order.getSlotStartTime())
                && Objects.equals(slot.getEndTime(), order.getSlotEndTime()))
            .map(order -> {
                YyDashboardScheduleGridSlotVo.SlotOrderSummary summary =
                    new YyDashboardScheduleGridSlotVo.SlotOrderSummary();
                summary.setOrderId(order.getId());
                summary.setOrderNo(order.getOrderNo());
                summary.setCustomerName(order.getCustomerName());
                summary.setStatus(order.getStatus());
                summary.setPaidAmountCent(order.getPaidAmountCent());
                summary.setSource(order.getSource());
                return summary;
            })
            .toList();
    }
}
