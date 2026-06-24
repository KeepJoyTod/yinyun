package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class YyMicroFormFollowBo {

    private Long id;

    @NotBlank(message = "followStatus is required")
    private String followStatus;

    private String followRemark;

    private Long orderId;
}
