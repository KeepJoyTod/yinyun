package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.math.BigDecimal;

/**
 * 内部协作策略对象 yy_collaboration_policy
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_collaboration_policy")
public class YyCollaborationPolicy extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private String policyCode;

    private String reviewFlowEnabled;

    private String productInfoMaskMode;

    private String enabledStoreIds;

    private String fallbackAction;

    private String transferEnabled;

    private String autoDispatchMode;

    private String genderMakeupEnabled;

    private BigDecimal femaleMakeupRatio;

    private String remark;

    @TableLogic
    private String delFlag;
}
