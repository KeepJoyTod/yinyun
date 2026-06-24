package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyCollaborationPolicy;

import java.math.BigDecimal;

/**
 * 内部协作策略业务对象。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyCollaborationPolicy.class, reverseConvertGenerate = false)
public class YyCollaborationPolicyBo extends BaseEntity {

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
}
