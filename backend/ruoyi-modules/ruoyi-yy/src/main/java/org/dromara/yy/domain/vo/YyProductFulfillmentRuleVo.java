package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyProductFulfillmentRule;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyProductFulfillmentRule.class)
public class YyProductFulfillmentRuleVo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String tenantId;
    private Long productId;
    private Long collaborationConfigId;
    private String workflowCode;
    private String needPhoto;
    private String needRetouch;
    private String needPickup;
    private Integer deliverWithinHours;
    private String status;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
