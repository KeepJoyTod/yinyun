package org.dromara.yy.domain.bo;

import lombok.Data;

import java.util.Date;

/**
 * 三方修图任务动作请求。
 */
@Data
public class YyRetouchTaskActionBo {

    private Long providerId;

    private String status;

    private String acceptanceStatus;

    private Long quoteAmountCent;

    private Date dueTime;

    private String blockReason;

    private String remark;
}
