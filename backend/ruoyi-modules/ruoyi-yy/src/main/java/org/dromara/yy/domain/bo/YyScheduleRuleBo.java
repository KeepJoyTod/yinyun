package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyScheduleRule;

/**
 * 影约云预约规则业务对象 yy_schedule_rule
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyScheduleRule.class, reverseConvertGenerate = false)
public class YyScheduleRuleBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    @NotNull(message = "门店不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long storeId;

    /**
     * 服务组ID
     */
    @NotNull(message = "服务组不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long serviceGroupId;

    /**
     * 星期，1-7
     */
    @NotNull(message = "星期不能为空", groups = { AddGroup.class, EditGroup.class })
    private Integer weekday;

    /**
     * 开始时间
     */
    @NotBlank(message = "开始时间不能为空", groups = { AddGroup.class, EditGroup.class })
    private String startTime;

    /**
     * 结束时间
     */
    @NotBlank(message = "结束时间不能为空", groups = { AddGroup.class, EditGroup.class })
    private String endTime;

    /**
     * 可预约容量
     */
    private Integer capacity;

    /**
     * 是否启用
     */
    private String enabled;

    /**
     * 备注
     */
    private String remark;
}
