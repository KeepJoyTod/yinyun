package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 客户端改期请求。
 */
@Data
public class ClientCustomerOrderRescheduleBo {

    @NotBlank(message = "新日期不能为空")
    private String newDate;

    @NotBlank(message = "新时段不能为空")
    private String newTimeSlot;

    private String reason;
}
