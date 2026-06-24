package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import cn.idev.excel.annotation.format.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyCustomer;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 影约云客户视图对象 yy_customer
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyCustomer.class)
public class YyCustomerVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    private String tenantId;

    @ExcelProperty(value = "客户姓名")
    private String customerName;

    @ExcelProperty(value = "手机号")
    private String mobile;

    @ExcelProperty(value = "性别")
    private String gender;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat("yyyy-MM-dd")
    @ExcelProperty(value = "生日")
    private Date birthday;

    @ExcelProperty(value = "来源")
    private String source;

    @ExcelProperty(value = "会员等级")
    private String memberLevel;

    @ExcelProperty(value = "订单数")
    private Integer totalOrderCount;

    @ExcelProperty(value = "累计消费")
    private BigDecimal totalSpend;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    @ExcelProperty(value = "最近订单时间")
    private Date lastOrderTime;

    @ExcelProperty(value = "客户标签")
    private String tags;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
