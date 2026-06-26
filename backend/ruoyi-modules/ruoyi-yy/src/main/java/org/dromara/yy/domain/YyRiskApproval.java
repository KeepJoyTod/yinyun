package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_risk_approval")
public class YyRiskApproval extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

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

    @TableLogic
    private String delFlag;
}
