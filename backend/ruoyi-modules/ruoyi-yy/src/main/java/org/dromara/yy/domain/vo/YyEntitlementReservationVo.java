package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyEntitlementReservationVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long storeId;
    private Long customerId;
    private Long orderId;
    private String reservationNo;
    private String reservationType;
    private String targetType;
    private String targetSnapshot;
    private BigDecimal quantity;
    private BigDecimal reservationAmount;
    private String status;
    private String idempotencyKey;
    private String expireTime;
    private String releasedTime;
    private String executionMode;
    private String remark;
}
