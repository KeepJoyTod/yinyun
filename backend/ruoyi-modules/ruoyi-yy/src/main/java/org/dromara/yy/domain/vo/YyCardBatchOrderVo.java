package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyCardBatchOrderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long storeId;
    private String batchNo;
    private String title;
    private String status;
    private String reason;
    private String cardName;
    private String cardType;
    private Integer batchCount;
    private Integer targetCustomerCount;
    private Long unitPriceCent;
    private Long estimatedTotalCent;
    private String targetAudience;
    private String channelPolicy;
    private String remark;
    private String payloadJson;
    private String applicantName;
    private String approverName;
    private String approveTime;
    private String resultSummary;
    private String createTime;
    private String executionMode;
}
