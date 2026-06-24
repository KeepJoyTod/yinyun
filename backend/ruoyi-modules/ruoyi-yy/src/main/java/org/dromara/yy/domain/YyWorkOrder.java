package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 工单对象 yy_work_order
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_work_order")
public class YyWorkOrder extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 工单编号
     */
    private String orderNo;

    /**
     * 关联订单ID
     */
    private Long orderId;

    /**
     * 工单类型：PHOTO_UPLOAD / SELECTION / RETOUCH / DELIVERY / OTHER
     */
    private String orderType;

    /**
     * 工单状态：PENDING / IN_PROGRESS / COMPLETED / CANCELLED
     */
    private String status;

    /**
     * 优先级：LOW / MEDIUM / HIGH / URGENT
     */
    private String priority;

    /**
     * 处理人ID
     */
    private Long handlerId;

    /**
     * 处理人姓名
     */
    private String handlerName;

    /**
     * 描述
     */
    private String description;

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
