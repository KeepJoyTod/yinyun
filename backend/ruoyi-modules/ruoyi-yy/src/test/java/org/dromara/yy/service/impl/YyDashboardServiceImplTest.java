package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyDashboardExportBo;
import org.dromara.yy.domain.vo.YyDashboardConversionVo;
import org.dromara.yy.domain.vo.YyDashboardExportVo;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardOrderStatusStatVo;
import org.dromara.yy.domain.vo.YyDashboardProductRankingVo;
import org.dromara.yy.domain.vo.YyDashboardTodaySlotVo;
import org.dromara.yy.domain.vo.YyDashboardTrendStatVo;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.mapper.YyChannelPluginMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.dashboard.YyDashboardExportAssembler;
import org.dromara.yy.service.dashboard.YyDashboardMetricsAssembler;
import org.dromara.yy.service.dashboard.YyDashboardOrderQuerySupport;
import org.dromara.yy.service.dashboard.YyDashboardScheduleAssembler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyDashboardServiceImplTest {

    @Mock
    private YyStoreMapper storeMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private YyPhotoAlbumMapper photoAlbumMapper;

    @Mock
    private YyPhotoAssetMapper photoAssetMapper;

    @Mock
    private YyChannelPluginMapper channelPluginMapper;

    @Mock
    private YyBookingSlotInventoryMapper bookingSlotInventoryMapper;

    private YyDashboardServiceImpl service;

    @BeforeEach
    void setUp() {
        YyDashboardMetricsAssembler metricsAssembler = new YyDashboardMetricsAssembler();
        YyDashboardOrderQuerySupport orderQuerySupport =
            new YyDashboardOrderQuerySupport(storeMapper, orderMapper, bookingSlotInventoryMapper);
        YyDashboardScheduleAssembler scheduleAssembler = new YyDashboardScheduleAssembler();
        YyDashboardExportAssembler exportAssembler = new YyDashboardExportAssembler(metricsAssembler);
        service = new YyDashboardServiceImpl(
            storeMapper,
            orderMapper,
            photoAlbumMapper,
            photoAssetMapper,
            channelPluginMapper,
            orderQuerySupport,
            metricsAssembler,
            scheduleAssembler,
            exportAssembler
        );
    }

    @Tag("dev")
    @Test
    void financeShouldAggregateByOperationalDateAndStore() {
        initTableInfo(YyOrder.class);
        when(orderMapper.selectList(any())).thenReturn(List.of(
            order(1L, 900001L, "2026-06-17", null, null, "CONFIRMED", "PAID", 19900L, 19900L, 0L),
            order(2L, 900001L, null, new Date(1781629200000L), null, "SERVING", "UNPAID", 29900L, 0L, 0L),
            order(3L, 900001L, null, null, new Date(1781632800000L), "COMPLETED", "PAID", 39900L, 39900L, 5000L),
            order(4L, 900001L, "2026-06-16", new Date(1781629200000L), null, "CONFIRMED", "PAID", 49900L, 49900L, 0L),
            order(5L, 900002L, "2026-06-17", null, null, "CONFIRMED", "PAID", 59900L, 59900L, 0L)
        ));

        YyDashboardFinanceVo finance = service.finance("2026-06-17", 900001L);

        assertEquals("2026-06-17", finance.getDate());
        assertEquals(900001L, finance.getStoreId());
        assertEquals(3L, finance.getOrderCount());
        assertEquals(89700L, finance.getOrderAmountCent());
        assertEquals(89700L, finance.getProductAmountCent());
        assertEquals(0L, finance.getDiscountAmountCent());
        assertEquals(5000L, finance.getRefundAmountCent());
        assertEquals(54800L, finance.getActualIncomeCent());
        assertEquals(89700L, finance.getExpectedIncomeCent());
        assertEquals(1L, finance.getPendingOrderCount());
        assertEquals(1L, finance.getServingOrderCount());
        assertEquals(1L, finance.getCompletedOrderCount());
        assertEquals(0L, finance.getCanceledOrderCount());

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertContainsAny(sqlSegment, "slot_date", "slotDate");
        assertContainsAny(sqlSegment, "arrival_time", "arrivalTime");
        assertContainsAny(sqlSegment, "order_time", "orderTime");
    }

    @Tag("dev")
    @Test
    void exportRowsShouldAggregateFinanceAndSlotsForEachDate() {
        initTableInfo(YyOrder.class);
        initTableInfo(YyBookingSlotInventory.class);
        YyOrder first = order(1L, 900001L, "2026-06-17", null, null, "CONFIRMED", "PAID", 19900L, 19900L, 0L);
        first.setChannelType("DOUYIN_LIFE");
        first.setExternalProductId("P1");
        first.setExternalSkuId("S1");
        YyOrder second = order(2L, 900001L, null, new Date(1781629200000L), null, "SERVING", "UNPAID", 29900L, 0L, 0L);
        second.setChannelType("DOUYIN_LIFE");
        second.setExternalProductId("P1");
        second.setExternalSkuId("S1");
        YyOrder third = order(3L, 900001L, null, null, new Date(1781632800000L), "COMPLETED", "PAID", 39900L, 39900L, 5000L);
        third.setChannelType("WECHAT");
        third.setExternalProductId("P2");
        third.setExternalSkuId("S2");
        when(orderMapper.selectList(any())).thenReturn(List.of(first, second, third));
        when(bookingSlotInventoryMapper.selectList(any())).thenReturn(List.of(
            slot(11L, 900001L, "2026-06-17", 10, 4, 1),
            slot(12L, 900001L, "2026-06-18", 5, 0, 0)
        ));

        List<YyDashboardExportVo> rows = service.exportRows(exportBo("2026-06-17", "2026-06-18", 900001L, null));

        assertEquals(2, rows.size());
        YyDashboardExportVo firstDay = rows.get(0);
        assertEquals("2026-06-17", firstDay.getDate());
        assertEquals("900001", firstDay.getStoreId());
        assertEquals(3L, firstDay.getOrderCount());
        assertEquals(new BigDecimal("548.00"), firstDay.getActualIncomeYuan());
        assertEquals(new BigDecimal("897.00"), firstDay.getExpectedIncomeYuan());
        assertEquals(new BigDecimal("897.00"), firstDay.getOrderAmountYuan());
        assertEquals(new BigDecimal("50.00"), firstDay.getRefundAmountYuan());
        assertEquals(1L, firstDay.getPendingOrderCount());
        assertEquals(1L, firstDay.getServingOrderCount());
        assertEquals(1L, firstDay.getCompletedOrderCount());
        assertEquals(1L, firstDay.getSlotCount());
        assertEquals(10L, firstDay.getCapacityTotal());
        assertEquals(4L, firstDay.getPaidCount());
        assertEquals(6L, firstDay.getRemainCount());
        assertEquals(1L, firstDay.getConflictCount());
        assertTrue(firstDay.getTopProductSummary().contains("P1/S1:2 orders/CNY 498.00"));

        YyDashboardExportVo secondDay = rows.get(1);
        assertEquals("2026-06-18", secondDay.getDate());
        assertEquals(0L, secondDay.getOrderCount());
        assertEquals(new BigDecimal("0.00"), secondDay.getActualIncomeYuan());
        assertEquals(1L, secondDay.getSlotCount());
        assertEquals(5L, secondDay.getCapacityTotal());
    }

    @Tag("dev")
    @Test
    void exportRowsShouldApplyStoreAndChannelFilters() {
        initTableInfo(YyOrder.class);
        initTableInfo(YyBookingSlotInventory.class);
        YyOrder matched = order(1L, 900001L, "2026-06-17", null, null, "CONFIRMED", "PAID", 19900L, 19900L, 0L);
        matched.setChannelType("DOUYIN_LIFE");
        YyOrder otherStore = order(2L, 900002L, "2026-06-17", null, null, "CONFIRMED", "PAID", 29900L, 29900L, 0L);
        otherStore.setChannelType("DOUYIN_LIFE");
        YyOrder otherChannel = order(3L, 900001L, "2026-06-17", null, null, "CONFIRMED", "PAID", 39900L, 39900L, 0L);
        otherChannel.setChannelType("WECHAT");
        when(orderMapper.selectList(any())).thenReturn(List.of(matched, otherStore, otherChannel));
        when(bookingSlotInventoryMapper.selectList(any())).thenReturn(List.of());

        List<YyDashboardExportVo> rows = service.exportRows(exportBo("2026-06-17", "2026-06-17", 900001L, "DOUYIN_LIFE"));

        assertEquals(1, rows.size());
        assertEquals(1L, rows.get(0).getOrderCount());
        assertEquals("DOUYIN_LIFE", rows.get(0).getChannel());
        assertEquals(new BigDecimal("199.00"), rows.get(0).getActualIncomeYuan());

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertContainsAny(sqlSegment, "channel_type", "channelType");
    }

    @Tag("dev")
    @Test
    void exportRowsShouldRejectInvalidDates() {
        assertThrows(ServiceException.class, () -> service.exportRows(exportBo("", "2026-06-17", null, null)));
        assertThrows(ServiceException.class, () -> service.exportRows(exportBo("2026-06-18", "2026-06-17", null, null)));
        assertThrows(ServiceException.class, () -> service.exportRows(exportBo("2026-06-01", "2026-07-02", null, null)));
        assertThrows(ServiceException.class, () -> service.exportRows(exportBo("2026/06/01", "2026-06-17", null, null)));
    }

    @Tag("dev")
    @Test
    void orderStatusStatsShouldGroupOrdersIntoDashboardBuckets() {
        initTableInfo(YyOrder.class);
        YyOrder pending = order(1L, 900001L, "2026-06-17", null, null, "PENDING", "UNPAID", 19900L, 0L, 0L);
        YyOrder serving = order(2L, 900001L, "2026-06-17", null, null, "SERVING", "PAID", 29900L, 29900L, 0L);
        YyOrder completed = order(3L, 900001L, "2026-06-17", null, null, "COMPLETED", "PAID", 39900L, 39900L, 0L);
        YyOrder cancelled = order(4L, 900001L, "2026-06-17", null, null, "CANCELLED", "UNPAID", 9900L, 0L, 0L);
        YyOrder refunded = order(5L, 900001L, "2026-06-17", null, null, "REFUNDED", "REFUNDED", 15900L, 15900L, 15900L);
        when(orderMapper.selectList(any())).thenReturn(List.of(pending, serving, completed, cancelled, refunded));

        List<YyDashboardOrderStatusStatVo> rows = service.orderStatusStats("2026-06-17", 900001L);

        assertEquals(5, rows.size());
        assertEquals("待服务", rows.get(0).getLabel());
        assertEquals(1L, rows.get(0).getCount());
        assertEquals(19900L, rows.get(0).getAmountCent());
        assertEquals("服务中", rows.get(1).getLabel());
        assertEquals(1L, rows.get(1).getCount());
        assertEquals("已完成", rows.get(2).getLabel());
        assertEquals(1L, rows.get(2).getCount());
        assertEquals("已取消", rows.get(3).getLabel());
        assertEquals(1L, rows.get(3).getCount());
        assertEquals("已退款", rows.get(4).getLabel());
        assertEquals(1L, rows.get(4).getCount());
        assertEquals(15900L, rows.get(4).getAmountCent());
    }

    @Tag("dev")
    @Test
    void trendStatsShouldFillDateRangeAndSeparateBookedAndArrivedDates() {
        initTableInfo(YyOrder.class);
        YyOrder first = order(1L, 900001L, "2026-06-17", null, new Date(1781542800000L), "CONFIRMED", "PAID", 19900L, 19900L, 0L);
        first.setSlotStartTime("10:00");
        YyOrder second = order(2L, 900001L, "2026-06-18", null, new Date(1781629200000L), "COMPLETED", "PAID", 29900L, 29900L, 0L);
        second.setSlotStartTime("11:00");
        when(orderMapper.selectList(any())).thenReturn(List.of(first, second));

        List<YyDashboardTrendStatVo> rows = service.trendStats("2026-06-18", 3, 900001L);

        assertEquals(3, rows.size());
        assertEquals("2026-06-16", rows.get(0).getDay());
        assertEquals(1L, rows.get(0).getBookedCount());
        assertEquals(0L, rows.get(0).getArrivedCount());
        assertEquals(19900L, rows.get(0).getAmountCent());
        assertEquals("2026-06-17", rows.get(1).getDay());
        assertEquals(1L, rows.get(1).getBookedCount());
        assertEquals(1L, rows.get(1).getArrivedCount());
        assertEquals("2026-06-18", rows.get(2).getDay());
        assertEquals(0L, rows.get(2).getBookedCount());
        assertEquals(1L, rows.get(2).getArrivedCount());
    }

    @Tag("dev")
    @Test
    void todaySlotsShouldOnlyReturnOrdersWithRealSlotRange() {
        initTableInfo(YyOrder.class);
        initTableInfo(YyBookingSlotInventory.class);
        YyOrder valid = order(1L, 900001L, "2026-06-17", null, null, "CONFIRMED", "PAID", 19900L, 19900L, 0L);
        valid.setOrderNo("YY001");
        valid.setCustomerName("Alice");
        valid.setCustomerPhone("13800000000");
        valid.setSlotStartTime("10:00");
        valid.setSlotEndTime("11:00");
        valid.setExternalProductId("P1");
        valid.setExternalSkuId("S1");
        YyOrder invalid = order(2L, 900001L, "2026-06-17", null, null, "CONFIRMED", "PAID", 29900L, 29900L, 0L);
        when(orderMapper.selectList(any())).thenReturn(List.of(valid, invalid));
        when(bookingSlotInventoryMapper.selectList(any())).thenReturn(List.of(slot(11L, 900001L, "2026-06-17", 8, 1, 0)));
        when(storeMapper.selectList(any())).thenReturn(List.of(store(900001L, "深圳总店")));

        List<YyDashboardTodaySlotVo> rows = service.todaySlots("2026-06-17", 900001L);

        assertEquals(1, rows.size());
        assertEquals(1L, rows.get(0).getOrderId());
        assertEquals("深圳总店", rows.get(0).getStoreName());
        assertEquals("2026-06-17 10:00:00", rows.get(0).getStartAt());
        assertEquals("2026-06-17 11:00:00", rows.get(0).getEndAt());
        assertEquals("P1/S1", rows.get(0).getServiceName());
    }

    @Tag("dev")
    @Test
    void productRankingAndConversionShouldReuseOperationalOrders() {
        initTableInfo(YyOrder.class);
        YyOrder first = order(1L, 900001L, "2026-06-17", null, null, "CONFIRMED", "PAID", 19900L, 19900L, 0L);
        first.setExternalProductId("P1");
        first.setExternalSkuId("S1");
        YyOrder second = order(2L, 900001L, "2026-06-17", null, null, "ARRIVED", "PAID", 29900L, 29900L, 0L);
        second.setExternalProductId("P1");
        second.setExternalSkuId("S1");
        YyOrder third = order(3L, 900001L, "2026-06-17", null, null, "COMPLETED", "PAID", 39900L, 39900L, 0L);
        third.setExternalProductId("P2");
        third.setExternalSkuId("S2");
        when(orderMapper.selectList(any())).thenReturn(List.of(first, second, third));

        YyDashboardProductRankingVo ranking = service.productRanking("2026-06-17", 900001L, 5);
        YyDashboardConversionVo conversion = service.conversion("2026-06-17", 900001L);

        assertEquals("P1/S1", ranking.getByOrderCount().get(0).getProductName());
        assertEquals(2L, ranking.getByOrderCount().get(0).getOrderCount());
        assertEquals(49800L, ranking.getByOrderCount().get(0).getAmountCent());
        assertEquals("P1/S1", ranking.getByAmount().get(0).getProductName());
        assertEquals(49800L, ranking.getByAmount().get(0).getAmountCent());
        assertEquals("P2/S2", ranking.getByAmount().get(1).getProductName());
        assertEquals(39900L, ranking.getByAmount().get(1).getAmountCent());

        assertEquals("2026-06-17", conversion.getDate());
        assertEquals(3L, conversion.getBookedCount());
        assertEquals(3L, conversion.getPaidCount());
        assertEquals(2L, conversion.getArrivedCount());
        assertEquals(1L, conversion.getCompletedCount());
        assertEquals(1D, conversion.getPaidRate());
        assertEquals(0.6667D, conversion.getArrivedRate());
        assertEquals(0.5D, conversion.getCompletedRate());
    }

    private static YyOrder order(
        Long id,
        Long storeId,
        String slotDate,
        Date arrivalTime,
        Date orderTime,
        String status,
        String payStatus,
        Long totalAmountCent,
        Long paidAmountCent,
        Long refundAmountCent
    ) {
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setStoreId(storeId);
        order.setSlotDate(slotDate);
        order.setArrivalTime(arrivalTime);
        order.setOrderTime(orderTime);
        order.setStatus(status);
        order.setPayStatus(payStatus);
        order.setTotalAmountCent(totalAmountCent);
        order.setPaidAmountCent(paidAmountCent);
        order.setRefundAmountCent(refundAmountCent);
        return order;
    }

    private static YyBookingSlotInventory slot(
        Long id,
        Long storeId,
        String bizDate,
        Integer capacity,
        Integer paidCount,
        Integer conflictCount
    ) {
        YyBookingSlotInventory slot = new YyBookingSlotInventory();
        slot.setId(id);
        slot.setStoreId(storeId);
        slot.setBizDate(bizDate);
        slot.setCapacity(capacity);
        slot.setPaidCount(paidCount);
        slot.setConflictCount(conflictCount);
        return slot;
    }

    private static YyDashboardExportBo exportBo(String beginDate, String endDate, Long storeId, String channelType) {
        YyDashboardExportBo bo = new YyDashboardExportBo();
        bo.setBeginDate(beginDate);
        bo.setEndDate(endDate);
        bo.setStoreId(storeId);
        bo.setChannelType(channelType);
        return bo;
    }

    private static YyStore store(Long id, String storeName) {
        YyStore store = new YyStore();
        store.setId(id);
        store.setStoreName(storeName);
        return store;
    }

    private static void initTableInfo(Class<?> entityType) {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), entityType);
    }

    private static void assertContainsAny(String actual, String... expectedItems) {
        for (String expected : expectedItems) {
            if (actual.contains(expected)) {
                return;
            }
        }
        assertTrue(false, () -> "SQL segment should contain one of " + List.of(expectedItems) + ", actual: " + actual);
    }
}
