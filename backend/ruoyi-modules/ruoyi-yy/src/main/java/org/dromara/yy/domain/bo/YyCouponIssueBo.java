package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class YyCouponIssueBo {

    @NotNull(message = "券模板ID不能为空")
    private Long templateId;

    @NotEmpty(message = "发券客户不能为空")
    private List<Long> customerIds;

    @NotBlank(message = "发券来源不能为空")
    private String issueSource;

    @NotNull(message = "发券数量不能为空")
    private Integer issueCount;

    private String remark;
}
