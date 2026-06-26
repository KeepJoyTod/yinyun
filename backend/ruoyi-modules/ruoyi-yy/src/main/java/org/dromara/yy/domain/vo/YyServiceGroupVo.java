package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyServiceGroup;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云服务组视图对象 yy_service_group
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyServiceGroup.class)
public class YyServiceGroupVo implements Serializable {

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

    @ExcelProperty(value = "服务组编码")
    private String groupCode;

    @ExcelProperty(value = "服务组名称")
    private String groupName;

    @ExcelProperty(value = "可预约容量")
    private Integer capacity;

    @ExcelProperty(value = "服务时长")
    private Integer durationMinutes;

    @ExcelProperty(value = "服务模式")
    private String serviceMode;

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
