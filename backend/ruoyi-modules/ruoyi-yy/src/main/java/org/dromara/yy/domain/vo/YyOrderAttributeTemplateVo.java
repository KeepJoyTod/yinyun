package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyOrderAttributeTemplate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 订单属性模板视图对象 yy_order_attribute_template
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyOrderAttributeTemplate.class)
public class YyOrderAttributeTemplateVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    private String tenantId;

    @ExcelProperty(value = "门店ID")
    private Long storeId;

    @ExcelProperty(value = "字段编码")
    private String fieldCode;

    @ExcelProperty(value = "字段名称")
    private String fieldLabel;

    @ExcelProperty(value = "字段类型")
    private String fieldType;

    @ExcelProperty(value = "是否必填")
    private String required;

    private String optionsJson;

    @ExcelProperty(value = "排序")
    private Integer sort;

    @ExcelProperty(value = "状态")
    private String status;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
