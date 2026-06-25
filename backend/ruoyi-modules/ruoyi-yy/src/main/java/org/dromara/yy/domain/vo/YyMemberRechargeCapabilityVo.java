package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyMemberRechargeCapabilityVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String capabilityCode;
    private String capabilityName;
    private Boolean enabled;
    private String status;
    private String scopeLabel;
    private String gateCopy;
    private String permissionCode;
    private Boolean requiresApproval;
    private String pluginState;
    private String licenseState;
    private String expiresAt;
}
