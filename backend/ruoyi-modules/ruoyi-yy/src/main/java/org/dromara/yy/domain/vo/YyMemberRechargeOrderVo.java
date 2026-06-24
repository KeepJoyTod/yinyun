package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyMemberRechargeOrderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long customerId;
    private String rechargeOrderNo;
    private BigDecimal rechargeAmount;
    private BigDecimal giftAmount;
    private BigDecimal creditedAmount;
    private BigDecimal balanceAfter;
    private String status;
    private String channelType;
    private String paidTime;
    private String externalTradeNo;
    private String remark;
}
