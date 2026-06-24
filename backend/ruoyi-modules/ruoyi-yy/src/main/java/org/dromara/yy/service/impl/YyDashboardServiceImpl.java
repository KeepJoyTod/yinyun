package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyChannelPlugin;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardOverviewVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridSlotVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridVo;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.mapper.YyChannelPluginMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyDashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 影约云首页概况Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyDashboardServiceImpl implements IYyDashboardService {

    private final YyStoreMapper storeMapper;
    private final YyOrderMapper orderMapper;
    private final YyPhotoAlbumMapper photoAlbumMapper;
    private final YyPhotoAssetMapper photoAssetMapper;
    private final YyChannelPluginMapper channelPluginMapper;
    private final YyBookingSlotInventoryMapper bookingSlotInventoryMapper;

    @Override
    public YyDashboardOverviewVo overview() {
        YyDashboardOverviewVo overview = new YyDashboardOverviewVo();
        overview.setStoreTotal(storeMapper.selectCount(Wrappers.lambdaQuery(YyStore.class)));
        overview.setBusinessStoreTotal(storeMapper.selectCount(
            Wrappers.lambdaQuery(YyStore.class).eq(YyStore::getStatus, "0")));
        overview.setOrderTotal(orderMapper.selectCount(Wrappers.lambdaQuery(YyOrder.class)));
        overview.setPendingOrderTotal(orderMapper.selectCount(
            Wrappers.lambdaQuery(YyOrder.class).eq(YyOrder::getStatus, "PENDING")));
        overview.setArrivedOrderTotal(orderMapper.selectCount(
            Wrappers.lambdaQuery(YyOrder.class).eq(YyOrder::getStatus, "ARRIVED")));
        overview.setCompletedOrderTotal(orderMapper.selectCount(
            Wrappers.lambdaQuery(YyOrder.class).eq(YyOrder::getStatus, "COMPLETED")));
        overview.setAlbumTotal(photoAlbumMapper.selectCount(Wrappers.lambdaQuery()));
        overview.setSelectedAssetTotal(photoAssetMapper.selectCount(
            Wrappers.lambdaQuery(YyPhotoAsset.class).eq(YyPhotoAsset::getIsSelected, "1")));
        overview.setChannelPluginTotal(channelPluginMapper.selectCount(Wrappers.lambdaQuery(YyChannelPlugin.class)));
        overview.setUnopenedChannelPluginTotal(channelPluginMapper.selectCount(
            Wrappers.lambdaQuery(YyChannelPlugin.class).eq(YyChannelPlugin::getAuthStatus, "UNOPENED")));
        return overview;
    }

    @Override
    public YyDashboardFinanceVo finance(String date, Long storeId) {
        LocalDate targetDate = parseFinanceDate(date);
        String dateKey = targetDate.toString();
        ZoneId zoneId = ZoneId.systemDefault();
        Date dayStart = Date.from(targetDate.atStartOfDay(zoneId).toInstant());
        Date nextDayStart = Date.from(targetDate.plusDays(1).atStartOfDay(zoneId).toInstant());

        List<YyOrder> orders = orderMapper.selectList(
            Wrappers.lambdaQuery(YyOrder.class)
                .eq(storeId != null, YyOrder::getStoreId, storeId)
                .and(wrapper -> wrapper
                    .eq(YyOrder::getSlotDate, dateKey)
                    .or(item -> item.ge(YyOrder::getArrivalTime, dayStart).lt(YyOrder::getArrivalTime, nextDayStart))
                    .or(item -> item.ge(YyOrder::getOrderTime, dayStart).lt(YyOrder::getOrderTime, nextDayStart))
                )
        );

        YyDashboardFinanceVo finance = new YyDashboardFinanceVo();
        finance.setDate(dateKey);
        finance.setStoreId(storeId);
        finance.setActualIncomeCent(0L);
        finance.setExpectedIncomeCent(0L);
        finance.setProductAmountCent(0L);
        finance.setDiscountAmountCent(0L);
        finance.setOrderAmountCent(0L);
        finance.setRefundAmountCent(0L);
        finance.setOrderCount(0L);
        finance.setPendingOrderCount(0L);
        finance.setServingOrderCount(0L);
        finance.setCompletedOrderCount(0L);
        finance.setCanceledOrderCount(0L);

        for (YyOrder order : orders) {
            if (storeId != null && !Objects.equals(storeId, order.getStoreId())) {
                continue;
            }
            if (!dateKey.equals(resolveOperationalDate(order, zoneId))) {
                continue;
            }

            long orderAmountCent = firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L);
            long paidAmountCent = paidAmountCent(order, orderAmountCent);
            long refundAmountCent = Math.max(0L, valueOrZero(order.getRefundAmountCent()));

            finance.setOrderCount(finance.getOrderCount() + 1);
            finance.setOrderAmountCent(finance.getOrderAmountCent() + orderAmountCent);
            finance.setProductAmountCent(finance.getProductAmountCent() + orderAmountCent);
            finance.setRefundAmountCent(finance.getRefundAmountCent() + refundAmountCent);
            finance.setActualIncomeCent(finance.getActualIncomeCent() + Math.max(0L, paidAmountCent - refundAmountCent));
            if (!isCanceled(order) && !isRefunded(order)) {
                finance.setExpectedIncomeCent(finance.getExpectedIncomeCent() + orderAmountCent);
            }
            applyStatusCount(finance, order);
        }

        return finance;
    }

    @Override
    public YyDashboardScheduleGridVo scheduleGrid(Long storeId) {
        LocalDate today = LocalDate.now();
        List<String> dates = new ArrayList<>();
        for (int i = 0; i < 14; i++) {
            dates.add(today.plusDays(i).toString());
        }

        String startDate = dates.get(0);
        String endDate = dates.get(dates.size() - 1);

        List<YyBookingSlotInventory> slots = bookingSlotInventoryMapper.selectList(
            Wrappers.lambdaQuery(YyBookingSlotInventory.class)
                .eq(storeId != null, YyBookingSlotInventory::getStoreId, storeId)
                .ge(YyBookingSlotInventory::getBizDate, startDate)
                .le(YyBookingSlotInventory::getBizDate, endDate)
                .orderByAsc(YyBookingSlotInventory::getBizDate)
                .orderByAsc(YyBookingSlotInventory::getStartTime)
        );

        List<YyOrder> orders = orderMapper.selectList(
            Wrappers.lambdaQuery(YyOrder.class)
                .eq(storeId != null, YyOrder::getStoreId, storeId)
                .ge(YyOrder::getSlotDate, startDate)
                .le(YyOrder::getSlotDate, endDate)
                .orderByAsc(YyOrder::getSlotDate)
                .orderByAsc(YyOrder::getSlotStartTime)
        );

        Map<String, List<YyOrder>> ordersByDate = orders.stream()
            .filter(o -> StringUtils.isNotBlank(o.getSlotDate()))
            .collect(Collectors.groupingBy(o -> StringUtils.defaultString(o.getSlotDate()).trim()));

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

            int capacity = slot.getCapacity() != null ? slot.getCapacity() : 0;
            int paid = slot.getPaidCount() != null ? slot.getPaidCount() : 0;
            int conflict = slot.getConflictCount() != null ? slot.getConflictCount() : 0;
            vo.setRemainCount(Math.max(0, capacity - paid));

            if (conflict > 0) {
                vo.setSlotStatus("SLOT_CONFLICT");
            } else if (paid >= capacity && capacity > 0) {
                vo.setSlotStatus("SLOT_FULL");
            } else if (paid > 0) {
                vo.setSlotStatus("SLOT_PARTIAL");
            } else {
                vo.setSlotStatus("SLOT_EMPTY");
            }

            List<YyDashboardScheduleGridSlotVo.SlotOrderSummary> slotOrders = ordersByDate
                .getOrDefault(slot.getBizDate(), Collections.emptyList())
                .stream()
                .filter(o -> Objects.equals(slot.getStartTime(), o.getSlotStartTime())
                    && Objects.equals(slot.getEndTime(), o.getSlotEndTime()))
                .map(o -> {
                    YyDashboardScheduleGridSlotVo.SlotOrderSummary summary =
                        new YyDashboardScheduleGridSlotVo.SlotOrderSummary();
                    summary.setOrderId(o.getId());
                    summary.setOrderNo(o.getOrderNo());
                    summary.setCustomerName(o.getCustomerName());
                    summary.setStatus(o.getStatus());
                    summary.setPaidAmountCent(o.getPaidAmountCent());
                    summary.setSource(o.getSource());
                    return summary;
                })
                .toList();
            vo.setOrders(slotOrders);

            slotsByDate.computeIfAbsent(slot.getBizDate(), key -> new ArrayList<>()).add(vo);
        }

        YyDashboardScheduleGridVo grid = new YyDashboardScheduleGridVo();
        grid.setStoreId(storeId);
        grid.setDates(dates);
        grid.setSlotsByDate(slotsByDate);
        return grid;
    }

    private static LocalDate parseFinanceDate(String date) {
        if (StringUtils.isBlank(date)) {
            return LocalDate.now();
        }
        return LocalDate.parse(date.trim());
    }

    private static String resolveOperationalDate(YyOrder order, ZoneId zoneId) {
        if (order == null) {
            return "";
        }
        if (StringUtils.isNotBlank(order.getSlotDate())) {
            return order.getSlotDate().trim();
        }
        if (order.getArrivalTime() != null) {
            return order.getArrivalTime().toInstant().atZone(zoneId).toLocalDate().toString();
        }
        if (order.getOrderTime() != null) {
            return order.getOrderTime().toInstant().atZone(zoneId).toLocalDate().toString();
        }
        return "";
    }

    private static long paidAmountCent(YyOrder order, long fallbackAmountCent) {
        if (order == null || !isPaid(order)) {
            return 0L;
        }
        long paidAmountCent = valueOrZero(order.getPaidAmountCent());
        return paidAmountCent > 0 ? paidAmountCent : fallbackAmountCent;
    }

    private static long firstPositive(Long first, Long second, Long fallback) {
        if (first != null && first > 0) {
            return first;
        }
        if (second != null && second > 0) {
            return second;
        }
        return valueOrZero(fallback);
    }

    private static long valueOrZero(Long value) {
        return value == null ? 0L : value;
    }

    private static boolean isPaid(YyOrder order) {
        String payStatus = StringUtils.defaultString(order.getPayStatus()).trim().toUpperCase();
        return "PAID".equals(payStatus) || "PARTIAL_REFUNDED".equals(payStatus);
    }

    private static boolean isRefunded(YyOrder order) {
        String status = StringUtils.defaultString(order.getStatus()).trim().toUpperCase();
        String payStatus = StringUtils.defaultString(order.getPayStatus()).trim().toUpperCase();
        String refundStatus = StringUtils.defaultString(order.getRefundStatus()).trim().toUpperCase();
        return "REFUNDED".equals(status)
            || "REFUNDED".equals(payStatus)
            || "FULL_REFUNDED".equals(refundStatus);
    }

    private static boolean isCanceled(YyOrder order) {
        String status = StringUtils.defaultString(order.getStatus()).trim().toUpperCase();
        return "CANCELED".equals(status) || "CANCELLED".equals(status) || "CLOSED".equals(status);
    }

    private static void applyStatusCount(YyDashboardFinanceVo finance, YyOrder order) {
        String status = StringUtils.defaultString(order.getStatus()).trim().toUpperCase();
        if (isCanceled(order) || isRefunded(order)) {
            finance.setCanceledOrderCount(finance.getCanceledOrderCount() + 1);
            return;
        }
        if ("COMPLETED".equals(status) || "FINISHED".equals(status) || "DONE".equals(status)) {
            finance.setCompletedOrderCount(finance.getCompletedOrderCount() + 1);
            return;
        }
        if ("SERVING".equals(status) || "SHOOTING".equals(status) || "IN_SERVICE".equals(status)) {
            finance.setServingOrderCount(finance.getServingOrderCount() + 1);
            return;
        }
        finance.setPendingOrderCount(finance.getPendingOrderCount() + 1);
    }
}
