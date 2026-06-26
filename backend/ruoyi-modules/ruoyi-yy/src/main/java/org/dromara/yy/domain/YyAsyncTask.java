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
@TableName("yy_async_task")
public class YyAsyncTask extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;

    private String taskNo;

    private String taskType;

    private String taskName;

    private String queueName;

    private String status;

    private String runStatus;

    private String businessType;

    private Long businessId;

    private String dateFrom;

    private String dateTo;

    private String downloadUrl;

    private Date startedTime;

    private Date finishedTime;

    private Date expireTime;

    private String errorMessage;

    private String auditNote;

    private String remark;

    @TableLogic
    private String delFlag;
}
