package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyChannelPlugin;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyDashboardExportBo;
import org.dromara.yy.domain.vo.YyDashboardConversionVo;
import org.dromara.yy.domain.vo.YyDashboardExportVo;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardOrderStatusStatVo;
import org.dromara.yy.domain.vo.YyDashboardOverviewVo;
import org.dromara.yy.domain.vo.YyDashboardProductRankingRowVo;
import org.dromara.yy.domain.vo.YyDashboardProductRankingVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridSlotVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridVo;
import org.dromara.yy.domain.vo.YyDashboardTodaySlotVo;
import org.dromara.yy.domain.vo.YyDashboardTrendStatVo;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.mapper.YyChannelPluginMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyDashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return aggregateFinance(targetDate.toString(), storeId, orders, zoneId);
    }

    @Override
    public List<YyDashboardOrderStatusStatVo> orderStatusStats(String date, Long storeId) {
        LocalDate targetDate = parseRequiredDate(date, "首页统计日期");
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return buildOrderStatusStats(filterOrdersByOperationalDate(orders, targetDate.toString(), zoneId));
    }

    @Override
    public List<YyDashboardTrendStatVo> trendStats(String endDate, Integer days, Long storeId) {
        LocalDate targetEndDate = parseRequiredDate(endDate, "首页趋势结束日期");
        int safeDays = normalizePositiveLimit(days, 20, 31, "首页趋势天数不能超过31天");
        LocalDate beginDate = targetEndDate.minusDays(safeDays - 1L);
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = selectOperationalOrders(beginDate, targetEndDate, storeId, null, zoneId);
        return buildTrendStats(targetEndDate, safeDays, orders, zoneId);
    }

    @Override
    public List<YyDashboardTodaySlotVo> todaySlots(String date, Long storeId) {
        LocalDate targetDate = parseRequiredDate(date, "首页排期日期");
        ZoneId zoneId = ZoneId.systemDefault();
        String dateKey = targetDate.toString();
        Map<Long, String> storeNameMap = buildStoreNameMap(storeId);
        List<YyBookingSlotInventory> slots = bookingSlotInventoryMapper.selectList(
            Wrappers.lambdaQuery(YyBookingSlotInventory.class)
                .eq(storeId != null, YyBookingSlotInventory::getStoreId, storeId)
                .eq(YyBookingSlotInventory::getBizDate, dateKey)
                .orderByAsc(YyBookingSlotInventory::getStartTime)
                .orderByAsc(YyBookingSlotInventory::getEndTime)
        );
        Set<String> slotKeys = slots.stream()
            .map(slot -> slotKey(slot.getBizDate(), slot.getStartTime(), slot.getEndTime()))
            .filter(StringUtils::isNotBlank)
            .collect(Collectors.toSet());
        List<YyOrder> orders = selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return orders.stream()
            .filter(this::hasRealSlotRange)
            .filter(order -> dateKey.equals(normalizeText(order.getSlotDate())))
            .filter(order -> slotKeys.isEmpty() || slotKeys.contains(slotKey(order.getSlotDate(), order.getSlotStartTime(), order.getSlotEndTime())))
            .sorted(Comparator
                .comparing((YyOrder order) -> normalizeText(order.getSlotStartTime()))
                .thenComparing(order -> normalizeText(order.getSlotEndTime()))
                .thenComparing(order -> valueOrZero(order.getId())))
            .map(order -> toTodaySlot(order, storeNameMap))
            .toList();
    }

    @Override
    public YyDashboardProductRankingVo productRanking(String date, Long storeId, Integer topN) {
        LocalDate targetDate = parseRequiredDate(date, "首页产品排行日期");
        int safeTopN = normalizePositiveLimit(topN, 10, 20, "首页产品排行TopN不能超过20");
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return buildProductRanking(filterOrdersByOperationalDate(orders, targetDate.toString(), zoneId), safeTopN);
    }

    @Override
    public YyDashboardConversionVo conversion(String date, Long storeId) {
        LocalDate targetDate = parseRequiredDate(date, "首页转化日期");
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return buildConversion(targetDate.toString(), storeId, filterOrdersByOperationalDate(orders, targetDate.toString(), zoneId));
    }

    @Override
    public List<YyDashboardExportVo> exportRows(YyDashboardExportBo bo) {
        ExportDateRange dateRange = parseExportDateRange(bo);
        Long storeId = bo == null ? null : bo.getStoreId();
        String channelType = normalizeText(bo == null ? null : bo.getChannelType());
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = orderMapper.selectList(
            Wrappers.lambdaQuery(YyOrder.class)
                .eq(storeId != null, YyOrder::getStoreId, storeId)
                .eq(StringUtils.isNotBlank(channelType), YyOrder::getChannelType, channelType)
                .and(wrapper -> wrapper
                    .ge(YyOrder::getSlotDate, dateRange.beginKey()).le(YyOrder::getSlotDate, dateRange.endKey())
                    .or(item -> item.ge(YyOrder::getArrivalTime, dateRange.beginTime(zoneId)).lt(YyOrder::getArrivalTime, dateRange.exclusiveEndTime(zoneId)))
                    .or(item -> item.ge(YyOrder::getOrderTime, dateRange.beginTime(zoneId)).lt(YyOrder::getOrderTime, dateRange.exclusiveEndTime(zoneId)))
                )
        );

        Map<String, List<YyOrder>> ordersByDate = orders.stream()
            .filter(order -> storeId == null || Objects.equals(storeId, order.getStoreId()))
            .filter(order -> StringUtils.isBlank(channelType) || Objects.equals(channelType, normalizeText(order.getChannelType())))
            .collect(Collectors.groupingBy(order -> resolveOperationalDate(order, zoneId)));

        Map<String, SlotStats> slotStatsByDate = aggregateSlotStats(dateRange, storeId);
        List<YyDashboardExportVo> rows = new ArrayList<>();
        LocalDate cursor = dateRange.begin();
        while (!cursor.isAfter(dateRange.end())) {
            String dateKey = cursor.toString();
            List<YyOrder> dayOrders = ordersByDate.getOrDefault(dateKey, Collections.emptyList());
            YyDashboardFinanceVo finance = aggregateFinance(dateKey, storeId, dayOrders, zoneId);
            rows.add(toExportRow(finance, dayOrders, slotStatsByDate.getOrDefault(dateKey, SlotStats.empty()), channelType));
            cursor = cursor.plusDays(1);
        }
        return rows;
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

    private List<YyOrder> selectOperationalOrders(LocalDate beginDate, LocalDate endDate, Long storeId, String channelType, ZoneId zoneId) {
        ExportDateRange dateRange = new ExportDateRange(beginDate, endDate);
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

    private Map<String, SlotStats> aggregateSlotStats(ExportDateRange dateRange, Long storeId) {
        List<YyBookingSlotInventory> slots = bookingSlotInventoryMapper.selectList(
            Wrappers.lambdaQuery(YyBookingSlotInventory.class)
                .eq(storeId != null, YyBookingSlotInventory::getStoreId, storeId)
                .ge(YyBookingSlotInventory::getBizDate, dateRange.beginKey())
                .le(YyBookingSlotInventory::getBizDate, dateRange.endKey())
        );

        Map<String, SlotStats> statsByDate = new HashMap<>();
        for (YyBookingSlotInventory slot : slots) {
            String dateKey = normalizeText(slot.getBizDate());
            if (StringUtils.isBlank(dateKey)) {
                continue;
            }
            SlotStats stats = statsByDate.computeIfAbsent(dateKey, key -> new SlotStats());
            int capacity = intOrZero(slot.getCapacity());
            int paid = intOrZero(slot.getPaidCount());
            int conflict = intOrZero(slot.getConflictCount());
            stats.slotCount++;
            stats.capacityTotal += capacity;
            stats.paidCount += paid;
            stats.remainCount += Math.max(0, capacity - paid);
            stats.conflictCount += conflict;
        }
        return statsByDate;
    }

    private static YyDashboardFinanceVo aggregateFinance(String dateKey, Long storeId, List<YyOrder> orders, ZoneId zoneId) {
        YyDashboardFinanceVo finance = emptyFinance(dateKey, storeId);
        for (YyOrder order : orders) {
            if (storeId != null && !Objects.equals(storeId, order.getStoreId())) {
                continue;
            }
            if (!dateKey.equals(resolveOperationalDate(order, zoneId))) {
                continue;
            }
            applyFinanceOrder(finance, order);
        }
        return finance;
    }

    private static YyDashboardFinanceVo emptyFinance(String dateKey, Long storeId) {
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
        return finance;
    }

    private static void applyFinanceOrder(YyDashboardFinanceVo finance, YyOrder order) {
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

    private static YyDashboardExportVo toExportRow(
        YyDashboardFinanceVo finance,
        List<YyOrder> orders,
        SlotStats slotStats,
        String channelType
    ) {
        YyDashboardExportVo row = new YyDashboardExportVo();
        row.setDate(finance.getDate());
        row.setStoreId(finance.getStoreId() == null ? "\u5168\u90e8\u95e8\u5e97" : String.valueOf(finance.getStoreId()));
        row.setChannel(summarizeChannels(orders, channelType));
        row.setActualIncomeYuan(centsToYuan(finance.getActualIncomeCent()));
        row.setExpectedIncomeYuan(centsToYuan(finance.getExpectedIncomeCent()));
        row.setProductAmountYuan(centsToYuan(finance.getProductAmountCent()));
        row.setDiscountAmountYuan(centsToYuan(finance.getDiscountAmountCent()));
        row.setOrderAmountYuan(centsToYuan(finance.getOrderAmountCent()));
        row.setRefundAmountYuan(centsToYuan(finance.getRefundAmountCent()));
        row.setOrderCount(finance.getOrderCount());
        row.setPendingOrderCount(finance.getPendingOrderCount());
        row.setServingOrderCount(finance.getServingOrderCount());
        row.setCompletedOrderCount(finance.getCompletedOrderCount());
        row.setCanceledOrderCount(finance.getCanceledOrderCount());
        row.setSlotCount(slotStats.slotCount);
        row.setCapacityTotal(slotStats.capacityTotal);
        row.setPaidCount(slotStats.paidCount);
        row.setRemainCount(slotStats.remainCount);
        row.setConflictCount(slotStats.conflictCount);
        row.setTopProductSummary(summarizeTopProducts(orders));
        return row;
    }

    private static List<YyOrder> filterOrdersByOperationalDate(List<YyOrder> orders, String dateKey, ZoneId zoneId) {
        return orders.stream()
            .filter(order -> dateKey.equals(resolveOperationalDate(order, zoneId)))
            .toList();
    }

    private static List<YyDashboardOrderStatusStatVo> buildOrderStatusStats(List<YyOrder> orders) {
        return List.of(
            statusStat("待服务", "待服务", orders, order -> !isCanceled(order) && !isRefunded(order) && "PENDING".equals(statusKey(order))),
            statusStat("服务中", "服务中", orders, order -> !isCanceled(order) && !isRefunded(order)
                && List.of("CONFIRMED", "ARRIVED", "SERVING", "SHOOTING", "IN_SERVICE").contains(statusKey(order))),
            statusStat("已完成", "已完成", orders, order -> !isCanceled(order) && !isRefunded(order)
                && List.of("COMPLETED", "FINISHED", "DONE").contains(statusKey(order))),
            statusStat("已取消", "已取消", orders, YyDashboardServiceImpl::isCanceled),
            statusStat("已退款", "已退款", orders, order -> isRefunded(order) && !isCanceled(order))
        );
    }

    private static YyDashboardOrderStatusStatVo statusStat(
        String status,
        String label,
        List<YyOrder> orders,
        java.util.function.Predicate<YyOrder> matcher
    ) {
        List<YyOrder> rows = orders.stream().filter(matcher).toList();
        YyDashboardOrderStatusStatVo vo = new YyDashboardOrderStatusStatVo();
        vo.setStatus(status);
        vo.setLabel(label);
        vo.setCount((long) rows.size());
        vo.setAmountCent(rows.stream()
            .mapToLong(order -> firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L))
            .sum());
        return vo;
    }

    private static List<YyDashboardTrendStatVo> buildTrendStats(
        LocalDate endDate,
        int days,
        List<YyOrder> orders,
        ZoneId zoneId
    ) {
        Map<String, TrendBucket> buckets = new HashMap<>();
        for (YyOrder order : orders) {
            String bookedKey = toDateKey(order.getOrderTime(), zoneId);
            if (StringUtils.isNotBlank(bookedKey)) {
                TrendBucket bucket = buckets.computeIfAbsent(bookedKey, key -> new TrendBucket());
                bucket.bookedCount++;
                bucket.amountCent += firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L);
            }
            String arrivedKey = resolveArrivedTrendDate(order, zoneId);
            if (StringUtils.isNotBlank(arrivedKey)) {
                TrendBucket bucket = buckets.computeIfAbsent(arrivedKey, key -> new TrendBucket());
                bucket.arrivedCount++;
            }
        }

        List<YyDashboardTrendStatVo> rows = new ArrayList<>();
        for (int index = days - 1; index >= 0; index--) {
            LocalDate day = endDate.minusDays(index);
            String dayKey = day.toString();
            TrendBucket bucket = buckets.getOrDefault(dayKey, TrendBucket.empty());
            YyDashboardTrendStatVo vo = new YyDashboardTrendStatVo();
            vo.setDay(dayKey);
            vo.setBookedCount(bucket.bookedCount);
            vo.setArrivedCount(bucket.arrivedCount);
            vo.setAmountCent(bucket.amountCent);
            rows.add(vo);
        }
        return rows;
    }

    private static YyDashboardTodaySlotVo toTodaySlot(YyOrder order, Map<Long, String> storeNameMap) {
        YyDashboardTodaySlotVo vo = new YyDashboardTodaySlotVo();
        vo.setBookingId(order.getId());
        vo.setStoreId(order.getStoreId());
        String storeName = storeNameMap.getOrDefault(order.getStoreId(), "门店 #" + valueOrZero(order.getStoreId()));
        vo.setStoreName(storeName);
        vo.setStudioId(order.getStoreId());
        vo.setStudioName(storeName + " / 默认工位");
        vo.setStartAt(buildSlotDateTime(order.getSlotDate(), order.getSlotStartTime()));
        vo.setEndAt(buildSlotDateTime(order.getSlotDate(), resolveSlotEndTime(order)));
        vo.setBookingStatus(statusLabel(order));
        vo.setOrderId(order.getId());
        vo.setOrderNo(normalizeText(order.getOrderNo()));
        vo.setCustomerName(normalizeText(order.getCustomerName()));
        vo.setCustomerPhone(normalizeText(order.getCustomerPhone()));
        vo.setServiceName(productLabel(order));
        vo.setOrderStatus(statusLabel(order));
        return vo;
    }

    private Map<Long, String> buildStoreNameMap(Long storeId) {
        return storeMapper.selectList(
            Wrappers.lambdaQuery(YyStore.class)
                .eq(storeId != null, YyStore::getId, storeId)
        ).stream().collect(Collectors.toMap(YyStore::getId, store -> normalizeText(store.getStoreName())));
    }

    private static YyDashboardProductRankingVo buildProductRanking(List<YyOrder> orders, int topN) {
        Map<String, ProductStats> statsByProduct = new HashMap<>();
        for (YyOrder order : orders) {
            String label = productLabel(order);
            ProductStats stats = statsByProduct.computeIfAbsent(label, ProductStats::new);
            stats.count++;
            stats.amountCent += firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L);
        }

        List<ProductStats> rankedByCount = statsByProduct.values().stream()
            .sorted(Comparator
                .comparingLong((ProductStats stats) -> stats.count).reversed()
                .thenComparing(Comparator.comparingLong((ProductStats stats) -> stats.amountCent).reversed())
                .thenComparing(stats -> stats.label))
            .limit(topN)
            .toList();
        List<ProductStats> rankedByAmount = statsByProduct.values().stream()
            .sorted(Comparator
                .comparingLong((ProductStats stats) -> stats.amountCent).reversed()
                .thenComparing(Comparator.comparingLong((ProductStats stats) -> stats.count).reversed())
                .thenComparing(stats -> stats.label))
            .limit(topN)
            .toList();

        YyDashboardProductRankingVo vo = new YyDashboardProductRankingVo();
        vo.setByOrderCount(toProductRankingRows(rankedByCount));
        vo.setByAmount(toProductRankingRows(rankedByAmount));
        return vo;
    }

    private static List<YyDashboardProductRankingRowVo> toProductRankingRows(List<ProductStats> rows) {
        List<YyDashboardProductRankingRowVo> result = new ArrayList<>();
        for (int index = 0; index < rows.size(); index++) {
            ProductStats stats = rows.get(index);
            YyDashboardProductRankingRowVo row = new YyDashboardProductRankingRowVo();
            row.setRank(index + 1);
            row.setProductName(stats.label);
            row.setOrderCount(stats.count);
            row.setAmountCent(stats.amountCent);
            result.add(row);
        }
        return result;
    }

    private static YyDashboardConversionVo buildConversion(String dateKey, Long storeId, List<YyOrder> orders) {
        long bookedCount = orders.size();
        long paidCount = orders.stream().filter(YyDashboardServiceImpl::isPaid).count();
        long arrivedCount = orders.stream().filter(YyDashboardServiceImpl::isArrived).count();
        long completedCount = orders.stream().filter(YyDashboardServiceImpl::isCompleted).count();
        YyDashboardConversionVo vo = new YyDashboardConversionVo();
        vo.setDate(dateKey);
        vo.setStoreId(storeId);
        vo.setBookedCount(bookedCount);
        vo.setPaidCount(paidCount);
        vo.setArrivedCount(arrivedCount);
        vo.setCompletedCount(completedCount);
        vo.setPaidRate(ratio(paidCount, bookedCount));
        vo.setArrivedRate(ratio(arrivedCount, paidCount));
        vo.setCompletedRate(ratio(completedCount, arrivedCount));
        return vo;
    }

    private static ExportDateRange parseExportDateRange(YyDashboardExportBo bo) {
        if (bo == null || StringUtils.isBlank(bo.getBeginDate()) || StringUtils.isBlank(bo.getEndDate())) {
            throw new ServiceException("\u5bfc\u51fa\u5f00\u59cb\u65e5\u671f\u548c\u7ed3\u675f\u65e5\u671f\u4e0d\u80fd\u4e3a\u7a7a");
        }
        try {
            LocalDate beginDate = LocalDate.parse(bo.getBeginDate().trim());
            LocalDate endDate = LocalDate.parse(bo.getEndDate().trim());
            if (beginDate.isAfter(endDate)) {
                throw new ServiceException("\u5bfc\u51fa\u5f00\u59cb\u65e5\u671f\u4e0d\u80fd\u665a\u4e8e\u7ed3\u675f\u65e5\u671f");
            }
            if (ChronoUnit.DAYS.between(beginDate, endDate) > 30) {
                throw new ServiceException("\u9996\u9875\u5bfc\u51fa\u65e5\u671f\u8303\u56f4\u4e0d\u80fd\u8d85\u8fc731\u5929");
            }
            return new ExportDateRange(beginDate, endDate);
        } catch (DateTimeParseException ex) {
            throw new ServiceException("\u5bfc\u51fa\u65e5\u671f\u683c\u5f0f\u5fc5\u987b\u4e3a yyyy-MM-dd");
        }
    }

    private static String summarizeChannels(List<YyOrder> orders, String channelType) {
        if (StringUtils.isNotBlank(channelType)) {
            return channelType;
        }
        List<String> channels = orders.stream()
            .map(YyDashboardServiceImpl::orderChannelLabel)
            .filter(StringUtils::isNotBlank)
            .distinct()
            .toList();
        if (channels.isEmpty()) {
            return "\u5168\u90e8\u6e20\u9053";
        }
        if (channels.size() == 1) {
            return channels.get(0);
        }
        String summary = channels.stream().limit(3).collect(Collectors.joining("\u3001"));
        return channels.size() > 3
            ? "\u5168\u90e8\u6e20\u9053(" + summary + "\u7b49)"
            : "\u5168\u90e8\u6e20\u9053(" + summary + ")";
    }

    private static String summarizeTopProducts(List<YyOrder> orders) {
        if (orders.isEmpty()) {
            return "\u65e0\u8ba2\u5355";
        }
        Map<String, ProductStats> statsByProduct = new HashMap<>();
        for (YyOrder order : orders) {
            String label = productLabel(order);
            ProductStats stats = statsByProduct.computeIfAbsent(label, key -> new ProductStats(label));
            stats.count++;
            stats.amountCent += firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L);
        }
        return statsByProduct.values().stream()
            .sorted((left, right) -> {
                int countCompare = Long.compare(right.count, left.count);
                if (countCompare != 0) {
                    return countCompare;
                }
                return Long.compare(right.amountCent, left.amountCent);
            })
            .limit(5)
            .map(stats -> stats.label + ":" + stats.count + " orders/CNY " + centsToYuan(stats.amountCent).toPlainString())
            .collect(Collectors.joining("; "));
    }

    private static String productLabel(YyOrder order) {
        String productId = normalizeText(order.getExternalProductId());
        String skuId = normalizeText(order.getExternalSkuId());
        if (StringUtils.isNotBlank(productId) && StringUtils.isNotBlank(skuId)) {
            return productId + "/" + skuId;
        }
        if (StringUtils.isNotBlank(skuId)) {
            return "SKU " + skuId;
        }
        if (StringUtils.isNotBlank(productId)) {
            return "Product " + productId;
        }
        return "Unknown product";
    }

    private static String orderChannelLabel(YyOrder order) {
        String channel = normalizeText(order.getChannelType());
        if (StringUtils.isNotBlank(channel)) {
            return channel;
        }
        String source = normalizeText(order.getSource());
        return StringUtils.isNotBlank(source) ? source : "UNKNOWN";
    }

    private static String normalizeText(String value) {
        return StringUtils.defaultString(value).trim();
    }

    private static BigDecimal centsToYuan(Long cents) {
        return BigDecimal.valueOf(valueOrZero(cents)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private static int intOrZero(Integer value) {
        return value == null ? 0 : value;
    }

    private static LocalDate parseRequiredDate(String date, String fieldLabel) {
        if (StringUtils.isBlank(date)) {
            throw new ServiceException(fieldLabel + "不能为空");
        }
        try {
            return LocalDate.parse(date.trim());
        } catch (DateTimeParseException ex) {
            throw new ServiceException(fieldLabel + "格式必须为 yyyy-MM-dd");
        }
    }

    private static int normalizePositiveLimit(Integer value, int defaultValue, int maxValue, String overflowMessage) {
        if (value == null || value <= 0) {
            return defaultValue;
        }
        if (value > maxValue) {
            throw new ServiceException(overflowMessage);
        }
        return value;
    }

    private static LocalDate parseFinanceDate(String date) {
        if (StringUtils.isBlank(date)) {
            return LocalDate.now();
        }
        return LocalDate.parse(date.trim());
    }

    private static String toDateKey(Date value, ZoneId zoneId) {
        if (value == null) {
            return "";
        }
        return value.toInstant().atZone(zoneId).toLocalDate().toString();
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

    private static String resolveArrivedTrendDate(YyOrder order, ZoneId zoneId) {
        if (StringUtils.isNotBlank(order.getSlotDate()) && StringUtils.isNotBlank(order.getSlotStartTime())) {
            return order.getSlotDate().trim();
        }
        if (order.getArrivalTime() != null) {
            return toDateKey(order.getArrivalTime(), zoneId);
        }
        return "";
    }

    private static String slotKey(String date, String startTime, String endTime) {
        String day = normalizeText(date);
        String start = normalizeClockText(startTime);
        String end = normalizeClockText(endTime);
        if (StringUtils.isBlank(day) || StringUtils.isBlank(start)) {
            return "";
        }
        return day + "|" + start + "|" + StringUtils.defaultIfBlank(end, start);
    }

    private boolean hasRealSlotRange(YyOrder order) {
        return StringUtils.isNotBlank(normalizeText(order.getSlotDate()))
            && StringUtils.isNotBlank(normalizeClockText(order.getSlotStartTime()));
    }

    private static String buildSlotDateTime(String slotDate, String slotTime) {
        String day = normalizeText(slotDate);
        String clock = normalizeClockText(slotTime);
        if (StringUtils.isBlank(day) || StringUtils.isBlank(clock)) {
            return "";
        }
        return day + " " + clock;
    }

    private static String resolveSlotEndTime(YyOrder order) {
        String endTime = normalizeClockText(order.getSlotEndTime());
        if (StringUtils.isNotBlank(endTime)) {
            return endTime;
        }
        String startTime = normalizeClockText(order.getSlotStartTime());
        if (StringUtils.isBlank(startTime)) {
            return "";
        }
        String[] parts = startTime.split(":");
        int hours = Integer.parseInt(parts[0]);
        int minutes = Integer.parseInt(parts[1]);
        int totalMinutes = hours * 60 + minutes + 60;
        int nextHour = (totalMinutes / 60) % 24;
        int nextMinute = totalMinutes % 60;
        return String.format("%02d:%02d:00", nextHour, nextMinute);
    }

    private static String normalizeClockText(String value) {
        String text = normalizeText(value);
        if (text.matches("^\\d{2}:\\d{2}:\\d{2}$")) {
            return text;
        }
        if (text.matches("^\\d{2}:\\d{2}$")) {
            return text + ":00";
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

    private static boolean isArrived(YyOrder order) {
        return List.of("ARRIVED", "SERVING", "SHOOTING", "IN_SERVICE", "COMPLETED", "FINISHED", "DONE")
            .contains(statusKey(order));
    }

    private static boolean isCompleted(YyOrder order) {
        return List.of("COMPLETED", "FINISHED", "DONE").contains(statusKey(order));
    }

    private static String statusKey(YyOrder order) {
        return StringUtils.defaultString(order == null ? null : order.getStatus()).trim().toUpperCase();
    }

    private static String statusLabel(YyOrder order) {
        return switch (statusKey(order)) {
            case "PENDING" -> "待确认";
            case "CONFIRMED" -> "已确认";
            case "ARRIVED" -> "已到店";
            case "SERVING", "SHOOTING", "IN_SERVICE" -> "服务中";
            case "COMPLETED", "FINISHED", "DONE" -> "已完成";
            case "CANCELED", "CANCELLED", "CLOSED" -> "已取消";
            case "REFUNDED" -> "已退款";
            default -> normalizeText(order == null ? null : order.getStatus());
        };
    }

    private static double ratio(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0D;
        }
        return BigDecimal.valueOf(numerator)
            .divide(BigDecimal.valueOf(denominator), 4, RoundingMode.HALF_UP)
            .doubleValue();
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

    private static final class ExportDateRange {
        private final LocalDate begin;
        private final LocalDate end;

        private ExportDateRange(LocalDate begin, LocalDate end) {
            this.begin = begin;
            this.end = end;
        }

        private LocalDate begin() {
            return begin;
        }

        private LocalDate end() {
            return end;
        }

        private String beginKey() {
            return begin.toString();
        }

        private String endKey() {
            return end.toString();
        }

        private Date beginTime(ZoneId zoneId) {
            return Date.from(begin.atStartOfDay(zoneId).toInstant());
        }

        private Date exclusiveEndTime(ZoneId zoneId) {
            return Date.from(end.plusDays(1).atStartOfDay(zoneId).toInstant());
        }
    }

    private static final class SlotStats {
        private long slotCount;
        private long capacityTotal;
        private long paidCount;
        private long remainCount;
        private long conflictCount;

        private static SlotStats empty() {
            return new SlotStats();
        }
    }

    private static final class TrendBucket {
        private long bookedCount;
        private long arrivedCount;
        private long amountCent;

        private static TrendBucket empty() {
            return new TrendBucket();
        }
    }

    private static final class ProductStats {
        private final String label;
        private long count;
        private long amountCent;

        private ProductStats(String label) {
            this.label = label;
        }
    }
}
