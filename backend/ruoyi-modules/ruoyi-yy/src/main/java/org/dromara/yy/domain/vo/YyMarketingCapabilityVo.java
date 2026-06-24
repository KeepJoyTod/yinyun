package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyMarketingCapabilityVo {

    private String capabilityCode;

    private String capabilityName;

    private Boolean enabled;

    private String status;

    private String scopeLabel;

    private String gateCopy;

    private String expiresAt;
}
