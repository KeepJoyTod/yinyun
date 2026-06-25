package org.dromara.yy.service.dashboard;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyDashboardExportBo;
import org.dromara.yy.domain.vo.YyDashboardExportVo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("dev")
class YyDashboardExportAssemblerTest {

    private final YyDashboardMetricsAssembler metricsAssembler = new YyDashboardMetricsAssembler();
    private final YyDashboardExportAssembler assembler = new YyDashboardExportAssembler(metricsAssembler);

    @Test
    void parseExportDateRangeShouldRejectInvalidDates() {
        assertThrows(ServiceException.class, () -> assembler.parseExportDateRange(exportBo("", "2026-06-17", null, null)));
        assertThrows(ServiceException.class, () -> assembler.parseExportDateRange(exportBo("2026-06-18", "2026-06-17", null, null)));
        assertThrows(ServiceException.class, () -> assembler.parseExportDateRange(exportBo("2026-06-01", "2026-07-02", null, null)));
        assertThrows(ServiceException.class, () -> assembler.parseExportDateRange(exportBo("2026/06/01", "2026-06-17", null, null)));
    }

    @Test
    void buildRowsShouldIncludeEmptyDatesAndSlotSummaries() {
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

        YyDashboardDomainSupport.SlotStats dayOne = new YyDashboardDomainSupport.SlotStats();
        dayOne.accumulate(10, 4, 1);
        YyDashboardDomainSupport.SlotStats dayTwo = new YyDashboardDomainSupport.SlotStats();
        dayTwo.accumulate(5, 0, 0);
        Map<String, YyDashboardDomainSupport.SlotStats> slotStatsByDate = new HashMap<>();
        slotStatsByDate.put("2026-06-17", dayOne);
        slotStatsByDate.put("2026-06-18", dayTwo);

        List<YyDashboardExportVo> rows = assembler.buildRows(
            new YyDashboardDomainSupport.ExportDateRange(
                java.time.LocalDate.parse("2026-06-17"),
                java.time.LocalDate.parse("2026-06-18")
            ),
            900001L,
            "",
            List.of(first, second, third),
            slotStatsByDate,
            ZoneId.of("Asia/Shanghai")
        );

        assertEquals(2, rows.size());
        YyDashboardExportVo firstDay = rows.get(0);
        assertEquals("2026-06-17", firstDay.getDate());
        assertEquals("900001", firstDay.getStoreId());
        assertEquals(3L, firstDay.getOrderCount());
        assertEquals(new BigDecimal("548.00"), firstDay.getActualIncomeYuan());
        assertEquals(new BigDecimal("897.00"), firstDay.getExpectedIncomeYuan());
        assertEquals(1L, firstDay.getSlotCount());
        assertEquals(10L, firstDay.getCapacityTotal());
        assertEquals(4L, firstDay.getPaidCount());
        assertEquals(6L, firstDay.getRemainCount());
        assertEquals(1L, firstDay.getConflictCount());
        assertTrue(firstDay.getTopProductSummary().contains("P1/S1:2 orders/CNY 498.00"));
        assertTrue(firstDay.getChannel().contains("全部渠道"));

        YyDashboardExportVo secondDay = rows.get(1);
        assertEquals("2026-06-18", secondDay.getDate());
        assertEquals(0L, secondDay.getOrderCount());
        assertEquals(new BigDecimal("0.00"), secondDay.getActualIncomeYuan());
        assertEquals(1L, secondDay.getSlotCount());
        assertEquals(5L, secondDay.getCapacityTotal());
    }

    private static YyDashboardExportBo exportBo(String beginDate, String endDate, Long storeId, String channelType) {
        YyDashboardExportBo bo = new YyDashboardExportBo();
        bo.setBeginDate(beginDate);
        bo.setEndDate(endDate);
        bo.setStoreId(storeId);
        bo.setChannelType(channelType);
        return bo;
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
