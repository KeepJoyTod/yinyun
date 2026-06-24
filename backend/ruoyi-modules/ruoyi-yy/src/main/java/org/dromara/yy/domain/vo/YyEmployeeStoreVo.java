package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyEmployeeStore;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云员工-门店关联视图对象 yy_employee_store
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyEmployeeStore.class)
public class YyEmployeeStoreVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "员工ID")
    private Long employeeId;

    @ExcelProperty(value = "门店ID")
    private Long storeId;

    @ExcelProperty(value = "是否主门店")
    private String isPrimary;

    @ExcelProperty(value = "角色类型")
    private String roleType;

    @ExcelProperty(value = "状态")
    private String status;

    @ExcelProperty(value = "排序")
    private Integer sort;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
