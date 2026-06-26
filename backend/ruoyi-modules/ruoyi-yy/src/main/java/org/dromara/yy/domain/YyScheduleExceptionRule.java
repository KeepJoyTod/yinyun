package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_schedule_exception_rule")
public class YyScheduleExceptionRule extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;
    private Long serviceGroupId;
    private String startDate;
    private String endDate;
    private String startTime;
    private String endTime;
    private String actionType;
    private Integer capacity;
    private String reason;
    private String status;
    private Long approvalId;

    @TableLogic
    private String delFlag;
}
