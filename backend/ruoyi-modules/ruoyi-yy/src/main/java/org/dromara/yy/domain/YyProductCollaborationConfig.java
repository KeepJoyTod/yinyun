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
@TableName("yy_product_collaboration_config")
public class YyProductCollaborationConfig extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long productId;

    private Long storeId;

    private String workflowJson;

    private String needMakeup;

    private String needPhotography;

    private String needRetouch;

    private String needReview;

    private String needSelectionReview;

    private String needPickup;

    private Integer makeupCount;

    private Integer deliverWithinHours;

    private String status;

    private String remark;

    @TableLogic
    private String delFlag;
}
