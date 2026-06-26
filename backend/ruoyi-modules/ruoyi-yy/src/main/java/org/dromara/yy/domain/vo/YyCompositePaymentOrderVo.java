package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyCompositePaymentOrderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long storeId;
    private Long customerId;
    private Long orderId;
    private String compositeNo;
    private BigDecimal totalAmount;
    private BigDecimal externalAmount;
    private BigDecimal storedValueAmount;
    private BigDecimal cashAmount;
    private BigDecimal discountAmount;
    private BigDecimal waiveAmount;
    private String status;
    private String settleStatus;
    private String executionMode;
    private String remark;
}
