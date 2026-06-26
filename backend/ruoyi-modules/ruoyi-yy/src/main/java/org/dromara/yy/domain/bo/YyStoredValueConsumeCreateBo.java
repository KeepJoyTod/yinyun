package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YyStoredValueConsumeCreateBo {

    private Long storeId;

    @NotNull(message = "customerId cannot be null")
    private Long customerId;

    private Long orderId;

    @DecimalMin(value = "0.01", message = "consumeAmount must be greater than 0")
    @NotNull(message = "consumeAmount cannot be null")
    private BigDecimal consumeAmount;

    private String remark;
}
