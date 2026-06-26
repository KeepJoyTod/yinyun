package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YyMemberWithdrawCreateBo {

    private Long storeId;

    @NotNull(message = "customerId cannot be null")
    private Long customerId;

    @DecimalMin(value = "0.01", message = "withdrawAmount must be greater than 0")
    @NotNull(message = "withdrawAmount cannot be null")
    private BigDecimal withdrawAmount;

    @NotBlank(message = "accountName cannot be blank")
    private String accountName;

    @NotBlank(message = "accountNo cannot be blank")
    private String accountNo;

    private String channelType;

    private String remark;
}
