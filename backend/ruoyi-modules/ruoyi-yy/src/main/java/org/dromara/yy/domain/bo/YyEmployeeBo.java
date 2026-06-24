package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyEmployee;

/**
 * 影约云员工业务对象 yy_employee
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyEmployee.class, reverseConvertGenerate = false)
public class YyEmployeeBo extends BaseEntity {

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
     * 系统用户ID
     */
    private Long userId;

    /**
     * 员工编号
     */
    @NotBlank(message = "员工编号不能为空", groups = { AddGroup.class, EditGroup.class })
    private String employeeNo;

    /**
     * 员工姓名
     */
    @NotBlank(message = "员工姓名不能为空", groups = { AddGroup.class, EditGroup.class })
    private String employeeName;

    /**
     * 手机号
     */
    private String mobile;

    /**
     * 岗位类型
     */
    private String roleType;

    /**
     * 技能标签
     */
    private String skillTags;

    /**
     * 状态
     */
    private String status;

    /**
     * 排序
     */
    private Integer sort;

    /**
     * 备注
     */
    private String remark;
}
