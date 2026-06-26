package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YyCompositePaymentCreateBo {

    private Long storeId;

    @NotNull(message = "customerId cannot be null")
    private Long customerId;

    private Long orderId;

    @DecimalMin(value = "0.01", message = "totalAmount must be greater than 0")
    @NotNull(message = "totalAmount cannot be null")
    private BigDecimal totalAmount;

    @DecimalMin(value = "0.00", message = "externalAmount cannot be negative")
    private BigDecimal externalAmount;

    @DecimalMin(value = "0.00", message = "storedValueAmount cannot be negative")
    private BigDecimal storedValueAmount;

    @DecimalMin(value = "0.00", message = "cashAmount cannot be negative")
    private BigDecimal cashAmount;

    @DecimalMin(value = "0.00", message = "discountAmount cannot be negative")
    private BigDecimal discountAmount;

    @DecimalMin(value = "0.00", message = "waiveAmount cannot be negative")
    private BigDecimal waiveAmount;

    private String remark;
}
