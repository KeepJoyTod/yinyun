package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyScheduleRule;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云预约规则视图对象 yy_schedule_rule
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyScheduleRule.class)
public class YyScheduleRuleVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "门店ID")
    private Long storeId;

    @ExcelProperty(value = "服务组ID")
    private Long serviceGroupId;

    @ExcelProperty(value = "星期")
    private Integer weekday;

    @ExcelProperty(value = "开始时间")
    private String startTime;

    @ExcelProperty(value = "结束时间")
    private String endTime;

    @ExcelProperty(value = "可预约容量")
    private Integer capacity;

    @ExcelProperty(value = "是否启用")
    private String enabled;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
