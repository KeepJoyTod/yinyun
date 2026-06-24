package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.util.Date;

/**
 * 三方修图任务对象 yy_retouch_task
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_retouch_task")
public class YyRetouchTask extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long storeId;

    private Long orderId;

    private Long albumId;

    private Long providerId;

    private String providerName;

    private String taskNo;

    private String status;

    private String acceptanceStatus;

    private Long quoteAmountCent;

    private Date dueTime;

    private Date submittedTime;

    private Date completedTime;

    private String sourceStage;

    private String customerName;

    private String serviceName;

    private String blockReason;

    private String remark;

    @TableLogic
    private String delFlag;
}
