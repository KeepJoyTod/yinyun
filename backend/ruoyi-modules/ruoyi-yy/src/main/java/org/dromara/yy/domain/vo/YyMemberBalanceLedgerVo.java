package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyMemberBalanceLedgerVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long customerId;
    private String changeType;
    private BigDecimal changeAmount;
    private BigDecimal balanceAfter;
    private String sourceType;
    private Long sourceId;
    private String happenedAt;
    private String remark;
}
