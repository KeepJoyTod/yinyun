package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyMarketingCouponInstanceVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long instanceId;
    private Long templateId;
    private String templateName;
    private Long customerId;
    private String holderName;
    private String status;
    private String restoreStatus;
    private Long orderId;
    private String expiresAt;
}
