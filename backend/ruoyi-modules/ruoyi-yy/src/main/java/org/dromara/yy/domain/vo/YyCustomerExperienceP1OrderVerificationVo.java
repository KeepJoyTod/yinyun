package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyCustomerExperienceP1OrderVerificationVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String orderId;

    private String status;

    private String channel;

    private Boolean canDisplayCode;

    private String codeLabel;

    private String reason;

    private String nextAction;
}
