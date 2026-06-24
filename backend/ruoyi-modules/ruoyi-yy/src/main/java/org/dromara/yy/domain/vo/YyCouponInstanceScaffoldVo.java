package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyCouponInstanceScaffoldVo {

    private String instanceId;

    private String templateId;

    private String templateName;

    private String holderName;

    private String status;

    private String orderId;

    private String expiresAt;
}
