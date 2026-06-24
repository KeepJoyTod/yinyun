package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 影约云员工-门店关联对象 yy_employee_store
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_employee_store")
public class YyEmployeeStore extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 员工ID
     */
    private Long employeeId;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 是否主门店
     */
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

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
