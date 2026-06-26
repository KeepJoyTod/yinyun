package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class YyRiskApprovalVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String tenantId;
    private Long storeId;
    private String businessType;
    private Long businessId;
    private String businessNo;
    private String status;
    private String title;
    private String reason;
    private String payloadJson;
    private Long applicantUserId;
    private String applicantName;
    private Long approverUserId;
    private String approverName;
    private Date approveTime;
    private String rejectReason;
    private String resultSummary;
    private Date createTime;
    private Date updateTime;
}
