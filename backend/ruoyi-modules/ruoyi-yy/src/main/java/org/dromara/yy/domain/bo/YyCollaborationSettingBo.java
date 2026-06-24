package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class YyCollaborationSettingBo {

    private Long id;

    @NotBlank(message = "settingType不能为空")
    private String settingType;

    private String status;

    private String configJson;

    private String remark;
}
