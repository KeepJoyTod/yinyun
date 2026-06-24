package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 工单事件对象 yy_work_order_event
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_work_order_event")
public class YyWorkOrderEvent extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 工单ID
     */
    private Long workOrderId;

    /**
     * 事件类型：CREATE / TRANSITION / COMMENT / ASSIGN / CLOSE
     */
    private String eventType;

    /**
     * 事件详情 JSON
     */
    private String eventDetail;

    /**
     * 操作人ID
     */
    private Long operatorId;

    /**
     * 操作人姓名
     */
    private String operatorName;

    /**
     * 备注
     */
    private String remark;

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
