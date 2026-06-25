package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyProductBookingRule;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyProductBookingRule.class)
public class YyProductBookingRuleVo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String tenantId;
    private Long productId;
    private Long storeId;
    private String serviceGroupIds;
    private Integer durationMinutes;
    private String prepayMode;
    private String bookingLimit;
    private String inventoryBindingStatus;
    private String benefitBindingStatus;
    private String status;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
