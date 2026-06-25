package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class YyMarketingCouponGrantRecordVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long grantId;
    private Long templateId;
    private String templateName;
    private Long customerId;
    private String customerName;
    private String customerMobile;
    private String issueSource;
    private Integer issueCount;
    private String status;
    private String remark;
    private Date createTime;
}
