package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyEmployee;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云员工视图对象 yy_employee
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyEmployee.class)
public class YyEmployeeVo implements Serializable {

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

    @ExcelProperty(value = "系统用户ID")
    private Long userId;

    @ExcelProperty(value = "员工编号")
    private String employeeNo;

    @ExcelProperty(value = "员工姓名")
    private String employeeName;

    @ExcelProperty(value = "手机号")
    private String mobile;

    @ExcelProperty(value = "岗位类型")
    private String roleType;

    @ExcelProperty(value = "技能标签")
    private String skillTags;

    @ExcelProperty(value = "状态")
    private String status;

    @ExcelProperty(value = "排序")
    private Integer sort;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
