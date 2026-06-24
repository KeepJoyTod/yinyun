package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyEmployeeStore;

/**
 * 影约云员工-门店关联业务对象 yy_employee_store
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyEmployeeStore.class, reverseConvertGenerate = false)
public class YyEmployeeStoreBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 员工ID
     */
    @NotNull(message = "员工不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long employeeId;

    /**
     * 门店ID
     */
    @NotNull(message = "门店不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long storeId;

    /**
     * 是否主门店
     */
    @NotBlank(message = "是否主门店不能为空", groups = { AddGroup.class, EditGroup.class })
    private String isPrimary;

    /**
     * 角色类型
     */
    private String roleType;

    /**
     * 状态
     */
    private String status;

    /**
     * 排序
     */
    private Integer sort;
}
