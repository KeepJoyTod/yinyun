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
@TableName("yy_promotion_trial_snapshot")
public class YyPromotionTrialSnapshot extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private String orderIdSnapshot;
    private String requestPayload;
    private String appliedRuleCode;
    private Long originalAmountCent;
    private Long finalAmountCent;
    private Long discountAmountCent;

    @TableLogic
    private String delFlag;
}
