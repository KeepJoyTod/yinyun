package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YyOrderRefundRequestBo {

    @NotNull(message = "refundAmountCent is required")
    @Min(value = 1, message = "refundAmountCent must be greater than 0")
    private Long refundAmountCent;

    private String reason;
}
