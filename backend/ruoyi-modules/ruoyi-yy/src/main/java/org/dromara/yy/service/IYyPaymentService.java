package org.dromara.yy.service;

import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.vo.BookingSlotInventoryDecision;

import java.util.Date;
import java.util.Map;

/**
 * 影约云支付核心服务。
 */
public interface IYyPaymentService {

    CustomerPrepayResult createPrepayForCustomerOrder(CustomerPrepayCommand command);

    PaymentMarkPaidResult markPaid(PaymentMarkPaidCommand command);

    record CustomerPrepayCommand(
        Long orderId,
        String tenantId,
        Long storeId,
        String customerPhone,
        String provider,
        String outTradeNo
    ) {
    }

    record CustomerPrepayResult(
        boolean paymentReady,
        String message,
        String orderId,
        String orderNo,
        Long amountCent,
        String provider,
        String outTradeNo,
        Long paymentRecordId,
        String payStatus,
        Map<String, String> paymentParams
    ) {
    }

    record PaymentMarkPaidCommand(
        Long orderId,
        String tenantId,
        Long storeId,
        String channelType,
        String provider,
        String outTradeNo,
        String platformOrderId,
        String transactionId,
        Long amountCent,
        Long paidAmountCent,
        Date paidTime,
        Date notifyTime,
        String rawPayload,
        String operatorType,
        Long operatorId
    ) {
    }

    record PaymentMarkPaidResult(
        boolean alreadyProcessed,
        YyPaymentRecord paymentRecord,
        YyOrder order,
        BookingSlotInventoryDecision inventoryDecision
    ) {
    }
}
