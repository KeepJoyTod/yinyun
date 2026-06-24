package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyMemberCardInstanceVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long customerId;
    private String cardName;
    private String cardType;
    private String status;
    private BigDecimal totalQuota;
    private BigDecimal usedQuota;
    private BigDecimal remainingQuota;
    private BigDecimal balanceAmount;
    private String effectiveFrom;
    private String effectiveTo;
    private Long sourceOrderId;
    private String remark;
}
