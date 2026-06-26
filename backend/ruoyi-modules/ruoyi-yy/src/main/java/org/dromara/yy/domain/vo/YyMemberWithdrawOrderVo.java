package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyMemberWithdrawOrderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long storeId;
    private Long customerId;
    private String withdrawNo;
    private BigDecimal withdrawAmount;
    private BigDecimal balanceSnapshot;
    private Long approvalId;
    private String accountName;
    private String accountNoMasked;
    private String channelType;
    private String status;
    private String executionMode;
    private String paidTime;
    private String remark;
}
