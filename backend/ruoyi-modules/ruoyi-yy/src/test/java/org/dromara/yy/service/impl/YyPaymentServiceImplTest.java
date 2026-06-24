package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.vo.BookingSlotInventoryDecision;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyPaymentService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyPaymentServiceImplTest {

    @Mock
    private YyPaymentRecordMapper paymentRecordMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private IYyBookingSlotInventoryService bookingSlotInventoryService;

    @InjectMocks
    private YyPaymentServiceImpl service;

    @Test
    void createPrepayForCustomerOrderShouldCreatePendingRecordOnFirstPayment() {
        YyOrder order = localOrder(9001L);
        when(orderMapper.selectById(9001L)).thenReturn(order);
        when(paymentRecordMapper.selectOne(any())).thenReturn(null);
        when(paymentRecordMapper.insert(any(YyPaymentRecord.class))).thenReturn(1);

        IYyPaymentService.CustomerPrepayResult result = service.createPrepayForCustomerOrder(
            new IYyPaymentService.CustomerPrepayCommand(9001L, "000000", order.getStoreId(), order.getCustomerPhone(), "WECHAT_MINI_APP", ""));

        assertTrue(result.paymentReady());
        assertEquals("9001", result.orderId());
        assertEquals("YY-CUST-9001", result.orderNo());
        assertEquals(39900L, result.amountCent());
        assertEquals("WECHAT_MINI_APP", result.provider());
        assertTrue(result.outTradeNo().startsWith("YYPAY-9001-"));
        assertEquals("UNPAID", result.payStatus());

        ArgumentCaptor<YyPaymentRecord> captor = ArgumentCaptor.forClass(YyPaymentRecord.class);
        verify(paymentRecordMapper).insert(captor.capture());
        assertEquals(order.getId(), captor.getValue().getOrderId());
        assertEquals(order.getTenantId(), captor.getValue().getTenantId());
        assertEquals("CLIENT_WEB", captor.getValue().getChannelType());
        assertEquals("WECHAT_MINI_APP", captor.getValue().getProvider());
        assertEquals("PENDING", captor.getValue().getPayStatus());
        assertEquals(39900L, captor.getValue().getAmountCent());
    }

    @Test
    void markPaidShouldUpdateOrderAndConfirmInventoryOnFirstSuccess() {
        YyPaymentRecord record = pendingRecord(990001L, 9001L, "YYPAY-9001-1");
        YyOrder order = localOrder(9001L);
        when(paymentRecordMapper.selectOne(any())).thenReturn(record);
        when(orderMapper.selectById(9001L)).thenReturn(order);
        when(paymentRecordMapper.updateById(any(YyPaymentRecord.class))).thenReturn(1);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(bookingSlotInventoryService.confirmPaidOrderSlot(any(YyOrder.class)))
            .thenReturn(BookingSlotInventoryDecision.confirmed(880001L, true));

        Date paidTime = new Date(1781234400000L);
        IYyPaymentService.PaymentMarkPaidResult result = service.markPaid(
            new IYyPaymentService.PaymentMarkPaidCommand(
                9001L,
                "000000",
                order.getStoreId(),
                "CLIENT_WEB",
                "WECHAT_MINI_APP",
                "YYPAY-9001-1",
                "wx-prepay-1",
                "wx-tx-1",
                39900L,
                39900L,
                paidTime,
                paidTime,
                "{\"tradeState\":\"SUCCESS\"}",
                "SYSTEM",
                1L
            ));

        assertFalse(result.alreadyProcessed());
        assertNotNull(result.inventoryDecision());
        assertEquals("CONFIRMED", result.inventoryDecision().getInventoryStatus());
        assertEquals("PAID", result.paymentRecord().getPayStatus());
        assertEquals("PAID", result.order().getPayStatus());
        assertEquals(39900L, result.order().getPaidAmountCent());
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Test
    void markPaidShouldReturnAlreadyProcessedWithoutInventorySideEffectOnDuplicateCallback() {
        YyPaymentRecord record = pendingRecord(990001L, 9001L, "YYPAY-9001-1");
        record.setPayStatus("PAID");
        record.setPaidAmountCent(39900L);
        YyOrder order = localOrder(9001L);
        order.setPayStatus("PAID");
        order.setPaidAmountCent(39900L);
        when(paymentRecordMapper.selectOne(any())).thenReturn(record);
        when(orderMapper.selectById(9001L)).thenReturn(order);

        IYyPaymentService.PaymentMarkPaidResult result = service.markPaid(
            new IYyPaymentService.PaymentMarkPaidCommand(
                9001L,
                "000000",
                order.getStoreId(),
                "CLIENT_WEB",
                "WECHAT_MINI_APP",
                "YYPAY-9001-1",
                "wx-prepay-1",
                "wx-tx-1",
                39900L,
                39900L,
                new Date(),
                new Date(),
                "{}",
                "SYSTEM",
                1L
            ));

        assertTrue(result.alreadyProcessed());
        verify(paymentRecordMapper, never()).updateById(any(YyPaymentRecord.class));
        verify(orderMapper, never()).updateById(any(YyOrder.class));
        verify(bookingSlotInventoryService, never()).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Test
    void markPaidShouldRejectAmountMismatch() {
        YyPaymentRecord record = pendingRecord(990001L, 9001L, "YYPAY-9001-1");
        YyOrder order = localOrder(9001L);
        when(paymentRecordMapper.selectOne(any())).thenReturn(record);
        when(orderMapper.selectById(9001L)).thenReturn(order);

        ServiceException exception = assertThrows(ServiceException.class, () -> service.markPaid(
            new IYyPaymentService.PaymentMarkPaidCommand(
                9001L,
                "000000",
                order.getStoreId(),
                "CLIENT_WEB",
                "WECHAT_MINI_APP",
                "YYPAY-9001-1",
                "wx-prepay-1",
                "wx-tx-1",
                39900L,
                29900L,
                new Date(),
                new Date(),
                "{}",
                "SYSTEM",
                1L
            )));

        assertEquals("支付金额校验失败", exception.getMessage());
        verify(paymentRecordMapper, never()).updateById(any(YyPaymentRecord.class));
        verify(orderMapper, never()).updateById(any(YyOrder.class));
        verify(bookingSlotInventoryService, never()).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Test
    void markPaidShouldRejectCancelledOrder() {
        YyPaymentRecord record = pendingRecord(990001L, 9001L, "YYPAY-9001-1");
        YyOrder order = localOrder(9001L);
        order.setStatus("CANCELLED");
        when(paymentRecordMapper.selectOne(any())).thenReturn(record);
        when(orderMapper.selectById(9001L)).thenReturn(order);

        ServiceException exception = assertThrows(ServiceException.class, () -> service.markPaid(
            new IYyPaymentService.PaymentMarkPaidCommand(
                9001L,
                "000000",
                order.getStoreId(),
                "CLIENT_WEB",
                "WECHAT_MINI_APP",
                "YYPAY-9001-1",
                "wx-prepay-1",
                "wx-tx-1",
                39900L,
                39900L,
                new Date(),
                new Date(),
                "{}",
                "SYSTEM",
                1L
            )));

        assertEquals("当前订单状态不可支付", exception.getMessage());
        verify(paymentRecordMapper, never()).updateById(any(YyPaymentRecord.class));
        verify(orderMapper, never()).updateById(any(YyOrder.class));
        verify(bookingSlotInventoryService, never()).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Test
    void markPaidShouldKeepPaidFactWhenInventoryIsFull() {
        YyPaymentRecord record = pendingRecord(990001L, 9001L, "YYPAY-9001-1");
        YyOrder order = localOrder(9001L);
        when(paymentRecordMapper.selectOne(any())).thenReturn(record);
        when(orderMapper.selectById(9001L)).thenReturn(order);
        when(paymentRecordMapper.updateById(any(YyPaymentRecord.class))).thenReturn(1);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        when(bookingSlotInventoryService.confirmPaidOrderSlot(any(YyOrder.class)))
            .thenReturn(BookingSlotInventoryDecision.conflict(880001L, "库存已满，需人工改期"));

        IYyPaymentService.PaymentMarkPaidResult result = service.markPaid(
            new IYyPaymentService.PaymentMarkPaidCommand(
                9001L,
                "000000",
                order.getStoreId(),
                "CLIENT_WEB",
                "WECHAT_MINI_APP",
                "YYPAY-9001-1",
                "wx-prepay-1",
                "wx-tx-1",
                39900L,
                39900L,
                new Date(),
                new Date(),
                "{}",
                "SYSTEM",
                1L
            ));

        assertFalse(result.alreadyProcessed());
        assertNotNull(result.inventoryDecision());
        assertEquals("CONFLICT", result.inventoryDecision().getInventoryStatus());
        assertEquals("PAID", result.paymentRecord().getPayStatus());
        assertEquals("PAID", result.order().getPayStatus());
        verify(paymentRecordMapper).updateById(any(YyPaymentRecord.class));
        verify(orderMapper).updateById(any(YyOrder.class));
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(any(YyOrder.class));
    }

    private static YyOrder localOrder(Long id) {
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setTenantId("000000");
        order.setStoreId(900001L);
        order.setOrderNo("YY-CUST-" + id);
        order.setCustomerPhone("13800000000");
        order.setChannelType("CLIENT_WEB");
        order.setSource("CLIENT_PUBLIC");
        order.setStatus("PENDING");
        order.setPayStatus("UNPAID");
        order.setTotalAmountCent(39900L);
        order.setSlotDate("2026-06-24");
        order.setSlotStartTime("10:00");
        order.setSlotEndTime("10:30");
        return order;
    }

    private static YyPaymentRecord pendingRecord(Long id, Long orderId, String outTradeNo) {
        YyPaymentRecord record = new YyPaymentRecord();
        record.setId(id);
        record.setTenantId("000000");
        record.setStoreId(900001L);
        record.setOrderId(orderId);
        record.setChannelType("CLIENT_WEB");
        record.setProvider("WECHAT_MINI_APP");
        record.setOutTradeNo(outTradeNo);
        record.setAmountCent(39900L);
        record.setPaidAmountCent(0L);
        record.setCurrency("CNY");
        record.setPayStatus("PENDING");
        return record;
    }
}
