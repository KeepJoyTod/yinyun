package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YyProductCollaborationConfigBo {

    private Long id;

    @NotNull(message = "productId不能为空")
    private Long productId;

    private String workflowJson;

    private Boolean needMakeup;

    private Boolean needPhotography;

    private Boolean needRetouch;

    private Boolean needReview;

    private Boolean needSelectionReview;

    private Boolean needPickup;

    private Integer makeupCount;

    private Integer deliverWithinHours;

    private String status;

    private String remark;
}
