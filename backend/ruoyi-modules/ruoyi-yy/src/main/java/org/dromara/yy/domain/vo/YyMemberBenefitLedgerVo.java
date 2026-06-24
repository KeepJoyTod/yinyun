package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyMemberBenefitLedgerVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long customerId;
    private String benefitName;
    private String benefitType;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal usedAmount;
    private BigDecimal remainingAmount;
    private String sourceType;
    private Long sourceId;
    private String expireTime;
    private String remark;
}
