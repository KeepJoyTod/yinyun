package org.dromara.yy.service.dashboard;

import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.vo.YyDashboardConversionVo;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardOrderStatusStatVo;
import org.dromara.yy.domain.vo.YyDashboardProductRankingVo;
import org.dromara.yy.domain.vo.YyDashboardTrendStatVo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@Tag("dev")
class YyDashboardMetricsAssemblerTest {

    private final YyDashboardMetricsAssembler assembler = new YyDashboardMetricsAssembler();

    @Test
    void aggregateFinanceShouldMatchOperationalDateAndStore() {
        List<YyOrder> orders = List.of(
            order(1L, 900001L, "2026-06-17", null, null, "CONFIRMED", "PAID", 19900L, 19900L, 0L),
            order(2L, 900001L, null, new Date(1781629200000L), null, "SERVING", "UNPAID", 29900L, 0L, 0L),
            order(3L, 900001L, null, null, new Date(1781632800000L), "COMPLETED", "PAID", 39900L, 39900L, 5000L),
            order(4L, 900002L, "2026-06-17", null, null, "CONFIRMED", "PAID", 59900L, 59900L, 0L)
        );

        YyDashboardFinanceVo finance = assembler.aggregateFinance(
            "2026-06-17",
            900001L,
            orders,
            java.time.ZoneId.of("Asia/Shanghai")
        );

        assertEquals("2026-06-17", finance.getDate());
        assertEquals(900001L, finance.getStoreId());
        assertEquals(3L, finance.getOrderCount());
        assertEquals(89700L, finance.getOrderAmountCent());
        assertEquals(54800L, finance.getActualIncomeCent());
        assertEquals(89700L, finance.getExpectedIncomeCent());
        assertEquals(1L, finance.getPendingOrderCount());
        assertEquals(1L, finance.getServingOrderCount());
        assertEquals(1L, finance.getCompletedOrderCount());
        assertEquals(0L, finance.getCanceledOrderCount());
    }

    @Test
    void buildOrderStatusStatsAndConversionShouldMatchDashboardBuckets() {
        List<YyOrder> orders = List.of(
            order(1L, 900001L, "2026-06-17", null, null, "PENDING", "UNPAID", 19900L, 0L, 0L),
            order(2L, 900001L, "2026-06-17", null, null, "SERVING", "PAID", 29900L, 29900L, 0L),
            order(3L, 900001L, "2026-06-17", null, null, "COMPLETED", "PAID", 39900L, 39900L, 0L),
            order(4L, 900001L, "2026-06-17", null, null, "CANCELLED", "UNPAID", 9900L, 0L, 0L),
            order(5L, 900001L, "2026-06-17", null, null, "REFUNDED", "REFUNDED", 15900L, 15900L, 15900L)
        );

        List<YyDashboardOrderStatusStatVo> stats = assembler.buildOrderStatusStats(orders);
        YyDashboardConversionVo conversion = assembler.buildConversion("2026-06-17", 900001L, orders);

        assertEquals(5, stats.size());
        assertEquals("待服务", stats.get(0).getLabel());
        assertEquals(1L, stats.get(0).getCount());
        assertEquals("服务中", stats.get(1).getLabel());
        assertEquals(1L, stats.get(1).getCount());
        assertEquals("已完成", stats.get(2).getLabel());
        assertEquals(1L, stats.get(2).getCount());
        assertEquals("已取消", stats.get(3).getLabel());
        assertEquals(1L, stats.get(3).getCount());
        assertEquals("已退款", stats.get(4).getLabel());
        assertEquals(1L, stats.get(4).getCount());
        assertEquals(15900L, stats.get(4).getAmountCent());

        assertEquals(5L, conversion.getBookedCount());
        assertEquals(2L, conversion.getPaidCount());
        assertEquals(2L, conversion.getArrivedCount());
        assertEquals(1L, conversion.getCompletedCount());
        assertEquals(0.4D, conversion.getPaidRate());
        assertEquals(1D, conversion.getArrivedRate());
        assertEquals(0.5D, conversion.getCompletedRate());
    }

    @Test
    void buildTrendStatsAndProductRankingShouldProduceStableRows() {
        YyOrder first = order(1L, 900001L, "2026-06-17", null, new Date(1781542800000L), "CONFIRMED", "PAID", 19900L, 19900L, 0L);
        first.setSlotStartTime("10:00");
        first.setExternalProductId("P1");
        first.setExternalSkuId("S1");
        YyOrder second = order(2L, 900001L, "2026-06-18", null, new Date(1781629200000L), "COMPLETED", "PAID", 29900L, 29900L, 0L);
        second.setSlotStartTime("11:00");
        second.setExternalProductId("P1");
        second.setExternalSkuId("S1");
        YyOrder third = order(3L, 900001L, "2026-06-17", null, null, "COMPLETED", "PAID", 39900L, 39900L, 0L);
        third.setExternalProductId("P2");
        third.setExternalSkuId("S2");

        List<YyDashboardTrendStatVo> trendStats = assembler.buildTrendStats(
            java.time.LocalDate.parse("2026-06-18"),
            3,
            List.of(first, second),
            java.time.ZoneId.of("Asia/Shanghai")
        );
        YyDashboardProductRankingVo ranking = assembler.buildProductRanking(List.of(first, second, third), 5);

        assertEquals(3, trendStats.size());
        assertEquals("2026-06-16", trendStats.get(0).getDay());
        assertEquals(1L, trendStats.get(0).getBookedCount());
        assertEquals(0L, trendStats.get(0).getArrivedCount());
        assertEquals("2026-06-17", trendStats.get(1).getDay());
        assertEquals(1L, trendStats.get(1).getBookedCount());
        assertEquals(1L, trendStats.get(1).getArrivedCount());
        assertEquals("2026-06-18", trendStats.get(2).getDay());
        assertEquals(0L, trendStats.get(2).getBookedCount());
        assertEquals(1L, trendStats.get(2).getArrivedCount());

        assertEquals("P1/S1", ranking.getByOrderCount().get(0).getProductName());
        assertEquals(2L, ranking.getByOrderCount().get(0).getOrderCount());
        assertEquals(49800L, ranking.getByOrderCount().get(0).getAmountCent());
        assertEquals("P1/S1", ranking.getByAmount().get(0).getProductName());
        assertEquals(49800L, ranking.getByAmount().get(0).getAmountCent());
        assertEquals("P2/S2", ranking.getByAmount().get(1).getProductName());
        assertEquals(39900L, ranking.getByAmount().get(1).getAmountCent());
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
}
