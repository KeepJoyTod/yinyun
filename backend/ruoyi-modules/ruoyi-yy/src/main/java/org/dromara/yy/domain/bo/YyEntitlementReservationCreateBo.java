package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YyEntitlementReservationCreateBo {

    private Long storeId;

    @NotNull(message = "customerId cannot be null")
    private Long customerId;

    private Long orderId;

    private String reservationType;

    private String targetType;

    private String targetSnapshot;

    @DecimalMin(value = "0.01", message = "quantity must be greater than 0")
    private BigDecimal quantity;

    @DecimalMin(value = "0.00", message = "reservationAmount cannot be negative")
    private BigDecimal reservationAmount;

    private Integer expireMinutes;

    private String idempotencyKey;

    private String remark;
}
