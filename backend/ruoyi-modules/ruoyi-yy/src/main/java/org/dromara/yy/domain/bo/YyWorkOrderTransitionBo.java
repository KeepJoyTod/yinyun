package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工单状态流转请求。
 */
@Data
public class YyWorkOrderTransitionBo {

    /**
     * 前端看到的当前状态，用于防止并发覆盖。
     */
    @NotBlank(message = "当前状态不能为空")
    private String expectedStatus;

    /**
     * 目标状态。
     */
    @NotBlank(message = "目标状态不能为空")
    private String targetStatus;

    /**
     * 操作备注。
     */
    private String remark;
}
