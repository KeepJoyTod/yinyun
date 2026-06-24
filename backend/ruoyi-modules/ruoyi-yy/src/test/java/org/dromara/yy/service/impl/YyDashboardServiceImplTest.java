package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.mapper.YyChannelPluginMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

    @InjectMocks
    private YyDashboardServiceImpl service;

    @Tag("dev")
    @Test
    void financeShouldAggregateByOperationalDateAndStore() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
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

    private static void assertContainsAny(String actual, String... expectedItems) {
        for (String expected : expectedItems) {
            if (actual.contains(expected)) {
                return;
            }
        }
        assertTrue(false, () -> "SQL segment should contain one of " + List.of(expectedItems) + ", actual: " + actual);
    }
}
