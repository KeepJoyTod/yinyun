package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YyCardBatchOrderCreateBo {

    @NotNull(message = "storeId cannot be null")
    private Long storeId;

    private String batchTitle;

    @NotBlank(message = "cardName cannot be blank")
    private String cardName;

    private String cardType;

    @NotNull(message = "batchCount cannot be null")
    @Min(value = 1, message = "batchCount must be greater than 0")
    private Integer batchCount;

    @Min(value = 1, message = "targetCustomerCount must be greater than 0")
    private Integer targetCustomerCount;

    @Min(value = 0, message = "unitPriceCent must be greater than or equal to 0")
    private Long unitPriceCent;

    private String targetAudience;

    private String channelPolicy;

    @NotBlank(message = "reason cannot be blank")
    private String reason;

    private String remark;
}
