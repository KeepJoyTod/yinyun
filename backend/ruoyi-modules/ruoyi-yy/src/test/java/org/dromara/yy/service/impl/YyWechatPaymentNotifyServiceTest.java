package org.dromara.yy.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.service.IYyPaymentService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyWechatPaymentNotifyServiceTest {

    @Mock
    private IYyPaymentService paymentService;

    @Mock
    private YyPaymentRecordMapper paymentRecordMapper;

    private YyWechatPaymentNotifySignaturePolicy signaturePolicy;
    private YyWechatPaymentNotifyPayloadParser payloadParser;
    private YyWechatPaymentNotifyServiceImpl service;

    @BeforeEach
    void setUp() {
        signaturePolicy = new YyWechatPaymentNotifySignaturePolicy();
        payloadParser = new YyWechatPaymentNotifyPayloadParser(new ObjectMapper());
        service = new YyWechatPaymentNotifyServiceImpl(paymentService, paymentRecordMapper, signaturePolicy, payloadParser);
    }

    @Test
    void successPayloadShouldCallMarkPaid() {
        YyPaymentRecord record = paymentRecord();
        when(paymentRecordMapper.selectOne(any())).thenReturn(record);
        when(paymentService.markPaid(any())).thenReturn(new IYyPaymentService.PaymentMarkPaidResult(false, record, new YyOrder(), null));

        Map<String, Object> result = service.handleNotify("""
            {"outTradeNo":"YYPAY-9001-1","platformOrderId":"wx-prepay-1","transactionId":"wx-tx-1","tradeState":"SUCCESS","amountCent":39900,"paidAmountCent":39900,"paidTime":"2026-06-24T10:30:00Z"}
            """, Map.of("X-Wechat-Signature", "pass"), "");

        assertEquals("SUCCESS", result.get("code"));
        ArgumentCaptor<IYyPaymentService.PaymentMarkPaidCommand> captor = ArgumentCaptor.forClass(IYyPaymentService.PaymentMarkPaidCommand.class);
        verify(paymentService).markPaid(captor.capture());
        assertEquals("000000", captor.getValue().tenantId());
        assertEquals("CLIENT_WEB", captor.getValue().channelType());
        assertEquals("YYPAY-9001-1", captor.getValue().outTradeNo());
    }

    @Test
    void duplicateNotifyShouldStillAckSuccess() {
        YyPaymentRecord record = paymentRecord();
        when(paymentRecordMapper.selectOne(any())).thenReturn(record);
        when(paymentService.markPaid(any())).thenReturn(new IYyPaymentService.PaymentMarkPaidResult(true, record, new YyOrder(), null));

        Map<String, Object> result = service.handleNotify("""
            {"outTradeNo":"YYPAY-9001-1","tradeState":"SUCCESS","amountCent":39900}
            """, Map.of("Wechatpay-Signature", "valid"), "");

        assertEquals("SUCCESS", result.get("code"));
        verify(paymentService).markPaid(any());
    }

    @Test
    void invalidSignatureShouldReturnFailWithoutCallingMarkPaid() {
        Map<String, Object> result = service.handleNotify("""
            {"outTradeNo":"YYPAY-9001-1","tradeState":"SUCCESS","amountCent":39900}
            """, Map.of("X-Wechat-Signature", "bad"), "");

        assertEquals("FAIL", result.get("code"));
        verify(paymentService, never()).markPaid(any());
        verify(paymentRecordMapper, never()).selectOne(any());
    }

    @Test
    void unsupportedTradeStateShouldReturnFail() {
        Map<String, Object> result = service.handleNotify("""
            {"outTradeNo":"YYPAY-9001-1","tradeState":"CLOSED","amountCent":39900}
            """, Map.of("X-Wechat-Signature", "pass"), "");

        assertEquals("FAIL", result.get("code"));
        verify(paymentService, never()).markPaid(any());
    }

    @Test
    void amountMismatchShouldReturnFail() {
        when(paymentRecordMapper.selectOne(any())).thenReturn(paymentRecord());
        when(paymentService.markPaid(any())).thenThrow(new ServiceException("支付金额校验失败"));

        Map<String, Object> result = service.handleNotify("""
            {"outTradeNo":"YYPAY-9001-1","tradeState":"SUCCESS","amountCent":29900}
            """, Map.of("x-wechat-signature", "ok"), "");

        assertEquals("FAIL", result.get("code"));
        assertTrue(String.valueOf(result.get("message")).contains("支付金额"));
    }

    private static YyPaymentRecord paymentRecord() {
        YyPaymentRecord record = new YyPaymentRecord();
        record.setId(1L);
        record.setTenantId("000000");
        record.setStoreId(900001L);
        record.setOrderId(9001L);
        record.setChannelType("CLIENT_WEB");
        record.setOutTradeNo("YYPAY-9001-1");
        record.setProvider("WECHAT_MINI_APP");
        record.setAmountCent(39900L);
        record.setPayStatus("PENDING");
        record.setPaidTime(new Date());
        return record;
    }
}
