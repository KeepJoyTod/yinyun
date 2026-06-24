package org.dromara.yy.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyCollaborationPolicy;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 内部协作策略视图对象。
 */
@Data
@AutoMapper(target = YyCollaborationPolicy.class)
public class YyCollaborationPolicyVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String tenantId;

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

    private Date createTime;

    private Date updateTime;
}
