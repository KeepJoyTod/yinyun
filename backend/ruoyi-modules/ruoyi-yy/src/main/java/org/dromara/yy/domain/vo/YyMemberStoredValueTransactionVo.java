package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class YyMemberStoredValueTransactionVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String transactionNo;
    private Long customerId;
    private String customerName;
    private String transactionType;
    private String transactionStatus;
    private String direction;
    private String sourceType;
    private Long sourceId;
    private Long sourceOrderId;
    private String sourceOrderNo;
    private Long rechargeOrderId;
    private String rechargeOrderNo;
    private Long storeId;
    private String storeName;
    private Long operatorId;
    private String operatorName;
    private String channelType;
    private String tradeTime;
    private SummaryVo summary;
    private String remark;
    private List<String> tags;

    @Data
    public static class SummaryVo implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private BigDecimal balanceBefore;
        private BigDecimal changeAmount;
        private BigDecimal giftAmount;
        private BigDecimal principalAmount;
        private BigDecimal balanceAfter;
    }
}
