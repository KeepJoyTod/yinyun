package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class YyMarketingCouponWriteoffVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long writeoffId;
    private Long instanceId;
    private String templateName;
    private Long orderId;
    private Long writeoffAmountCent;
    private String restoreStatus;
    private String restoreReason;
    private Date createTime;
}
