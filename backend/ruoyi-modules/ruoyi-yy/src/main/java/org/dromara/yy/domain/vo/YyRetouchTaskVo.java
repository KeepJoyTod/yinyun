package org.dromara.yy.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyRetouchTask;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 三方修图任务视图对象。
 */
@Data
@AutoMapper(target = YyRetouchTask.class)
public class YyRetouchTaskVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String tenantId;

    private Long storeId;

    private String storeName;

    private Long orderId;

    private String orderNo;

    private Long albumId;

    private String albumName;

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

    private Date createTime;

    private Date updateTime;
}
