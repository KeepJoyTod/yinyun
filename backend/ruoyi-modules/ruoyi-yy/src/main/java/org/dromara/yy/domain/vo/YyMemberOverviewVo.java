package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyMemberOverviewVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long customerId;
    private String customerName;
    private String mobile;
    private String memberLevel;
    private String tagSummary;
    private Integer totalOrderCount;
    private BigDecimal totalSpendAmount;
    private Integer activeCardCount;
    private Integer activeCouponCount;
    private Integer activeBenefitCount;
    private Integer pointsBalance;
    private Integer growthValue;
    private BigDecimal balanceAmount;
    private Integer pendingRechargeCount;
    private String lastTradeTime;
    private String remark;
}
