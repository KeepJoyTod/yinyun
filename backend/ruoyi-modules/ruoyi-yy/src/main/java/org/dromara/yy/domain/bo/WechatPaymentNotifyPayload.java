package org.dromara.yy.domain.bo;

import lombok.Data;

import java.util.Date;

/**
 * 规范化微信支付回调载荷。
 */
@Data
public class WechatPaymentNotifyPayload {

    private String outTradeNo;

    private String platformOrderId;

    private String transactionId;

    private String tradeState;

    private Long amountCent;

    private Long paidAmountCent;

    private Date paidTime;

    private String rawPayload;
}
