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
@TableName("yy_product_fulfillment_rule")
public class YyProductFulfillmentRule extends TenantEntity {
    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;
    private Long productId;
    private Long collaborationConfigId;
    private String workflowCode;
    private String needPhoto;
    private String needRetouch;
    private String needPickup;
    private Integer deliverWithinHours;
    private String status;
    private String remark;
    @TableLogic
    private String delFlag;
}
