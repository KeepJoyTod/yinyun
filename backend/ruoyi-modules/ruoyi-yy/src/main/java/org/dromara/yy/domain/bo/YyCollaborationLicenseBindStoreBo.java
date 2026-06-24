package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YyCollaborationLicenseBindStoreBo {

    @NotNull(message = "storeId不能为空")
    private Long storeId;

    private String remark;
}
