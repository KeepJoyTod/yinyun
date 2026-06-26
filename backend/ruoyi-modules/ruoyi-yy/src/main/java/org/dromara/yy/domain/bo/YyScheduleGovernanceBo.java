package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YyScheduleGovernanceBo {

    @NotNull(message = "storeId is required")
    private Long storeId;

    private Long serviceGroupId;

    @NotBlank(message = "beginBizDate is required")
    private String beginBizDate;

    @NotBlank(message = "endBizDate is required")
    private String endBizDate;

    @NotBlank(message = "startTime is required")
    private String startTime;

    @NotBlank(message = "endTime is required")
    private String endTime;

    @NotBlank(message = "actionType is required")
    private String actionType;

    @Min(value = 0, message = "capacity must be greater than or equal to 0")
    private Integer capacity;

    private String reason;
}
