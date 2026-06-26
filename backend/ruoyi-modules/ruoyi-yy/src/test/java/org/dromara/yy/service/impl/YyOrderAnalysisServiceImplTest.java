package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.vo.YyOrderAnalysisScaffoldVo;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyOrderAnalysisServiceImplTest {

    @Mock
    private YyOrderMapper yyOrderMapper;

    @Mock
    private YyPaymentRecordMapper yyPaymentRecordMapper;

    @InjectMocks
    private YyOrderAnalysisServiceImpl service;

    @Test
    void queryOverviewShouldFallbackToOrderLedgerWhenPaymentRecordsMissing() {
        YyOrder order = order(1001L, "DOUYIN_LIFE", "PAID", "CONFIRMED", 12900L, 9900L, "", 0L);
        when(yyOrderMapper.selectList(any())).thenReturn(List.of(order));
        when(yyPaymentRecordMapper.selectList(any())).thenReturn(List.of());

        YyOrderAnalysisScaffoldVo result = service.queryOverview(null, "2026-06-01", "2026-06-30");

        assertEquals(1L, result.getOverview().getOrderedCount());
        assertEquals(1L, result.getOverview().getPaidOrderCount());
        assertEquals(9900L, result.getOverview().getPaidAmountCent());
        assertEquals(0L, result.getOverview().getRefundAmountCent());
        assertEquals(4, result.getFunnel().size());
        assertEquals("订购分析优先读取 yy_payment_record；无支付流水时回退 yy_order.paidAmountCent/refundAmountCent，不写第二套统计账本。", result.getOverview().getBoundaryNote());
    }

    @Test
    void queryOverviewShouldAggregateChannelAndRefundFromPaymentLedger() {
        YyOrder paidOrder = order(2001L, "WECHAT", "PAID", "CONFIRMED", 18800L, 0L, "", 0L);
        YyOrder refundOrder = order(2002L, "", "UNPAID", "PENDING", 9900L, 0L, "REFUNDING", 0L);
        YyPaymentRecord paidRecord = paymentRecord(3001L, 2001L, "WECHAT", "PAID", 18800L, 0L, "");
        YyPaymentRecord refundRecord = paymentRecord(3002L, 2002L, "DOUYIN_LIFE", "SUCCESS", 9900L, 5000L, "REFUNDING");
        when(yyOrderMapper.selectList(any())).thenReturn(List.of(paidOrder, refundOrder));
        when(yyPaymentRecordMapper.selectList(any())).thenReturn(List.of(paidRecord, refundRecord));

        YyOrderAnalysisScaffoldVo result = service.queryOverview(1L, "2026-06-01", "2026-06-30");

        assertEquals(2L, result.getOverview().getOrderedCount());
        assertEquals(2L, result.getOverview().getPaidOrderCount());
        assertEquals(28700L, result.getOverview().getPaidAmountCent());
        assertEquals(1L, result.getOverview().getRefundOrderCount());
        assertEquals(5000L, result.getOverview().getRefundAmountCent());
        assertEquals(2, result.getChannels().size());
        assertEquals("WECHAT", result.getChannels().get(0).getChannelLabel());
        assertEquals("DOUYIN_LIFE", result.getChannels().get(1).getChannelLabel());
        assertEquals("REFUNDING", result.getRefunds().get(0).getRefundStatus());
        assertEquals(1L, result.getRefunds().get(0).getOrderCount());
    }

    @Test
    void queryOverviewShouldReturnEmptyScaffoldWhenNoOrdersExist() {
        when(yyOrderMapper.selectList(any())).thenReturn(List.of());

        YyOrderAnalysisScaffoldVo result = service.queryOverview(null, "2026-06-01", "2026-06-30");

        assertEquals(0L, result.getOverview().getOrderedCount());
        assertEquals(0, result.getChannels().size());
        assertEquals(0, result.getRefunds().size());
    }

    private static YyOrder order(Long id, String channelType, String payStatus, String status, Long totalAmountCent, Long paidAmountCent, String refundStatus, Long refundAmountCent) {
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setStoreId(1L);
        order.setChannelType(channelType);
        order.setSource("抖音来客");
        order.setPayStatus(payStatus);
        order.setStatus(status);
        order.setTotalAmountCent(totalAmountCent);
        order.setPaidAmountCent(paidAmountCent);
        order.setRefundStatus(refundStatus);
        order.setRefundAmountCent(refundAmountCent);
        order.setOrderTime(date("2026-06-14T10:00:00"));
        return order;
    }

    private static YyPaymentRecord paymentRecord(Long id, Long orderId, String channelType, String payStatus, Long paidAmountCent, Long refundAmountCent, String refundStatus) {
        YyPaymentRecord record = new YyPaymentRecord();
        record.setId(id);
        record.setOrderId(orderId);
        record.setChannelType(channelType);
        record.setPayStatus(payStatus);
        record.setPaidAmountCent(paidAmountCent);
        record.setAmountCent(paidAmountCent);
        record.setRefundAmountCent(refundAmountCent);
        record.setRefundStatus(refundStatus);
        record.setPaidTime(date("2026-06-14T10:05:00"));
        return record;
    }

    private static Date date(String value) {
        return Date.from(LocalDateTime.parse(value).atZone(ZoneId.systemDefault()).toInstant());
    }
}
