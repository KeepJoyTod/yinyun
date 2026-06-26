package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyStoredValueConsumeOrderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long storeId;
    private Long customerId;
    private Long orderId;
    private String consumeNo;
    private BigDecimal consumeAmount;
    private BigDecimal balanceSnapshot;
    private String status;
    private String reversalStatus;
    private String executionMode;
    private String confirmedTime;
    private String remark;
}
