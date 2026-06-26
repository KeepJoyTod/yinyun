package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyServiceGroup;

/**
 * 影约云服务组业务对象 yy_service_group
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyServiceGroup.class, reverseConvertGenerate = false)
public class YyServiceGroupBo extends BaseEntity {

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
     * 服务组编码
     */
    @NotBlank(message = "服务组编码不能为空", groups = { AddGroup.class, EditGroup.class })
    private String groupCode;

    /**
     * 服务组名称
     */
    @NotBlank(message = "服务组名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String groupName;

    /**
     * 可预约容量
     */
    private Integer capacity;

    /**
     * 服务时长
     */
    private Integer durationMinutes;

    /**
     * 服务模式
     */
    private String serviceMode;

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
