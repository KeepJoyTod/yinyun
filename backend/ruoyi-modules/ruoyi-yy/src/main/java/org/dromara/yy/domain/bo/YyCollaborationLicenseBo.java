package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class YyCollaborationLicenseBo {

    private Long id;

    @NotBlank(message = "licenseKey不能为空")
    private String licenseKey;

    private String licenseName;

    private String authStatus;

    private String enabled;

    private String validFrom;

    private String validTo;

    private Integer seatCount;

    private String remark;
}
