package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyProduct;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 影约云产品视图对象 yy_product
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyProduct.class)
public class YyProductVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "门店ID")
    /**
     * 门店ID
     */
    private Long storeId;

    @ExcelProperty(value = "产品类型")
    /**
     * 产品类型
     */
    private String productType;

    @ExcelProperty(value = "产品名称")
    /**
     * 产品名称
     */
    private String productName;

    @ExcelProperty(value = "销售价")
    /**
     * 销售价
     */
    private BigDecimal price;

    @ExcelProperty(value = "服务时长")
    /**
     * 服务时长
     */
    private Integer durationMinutes;

    @ExcelProperty(value = "选片单价")
    /**
     * 选片单价
     */
    private BigDecimal selectionPrice;

    @ExcelProperty(value = "入册产品")
    /**
     * 入册产品
     */
    private String albumProductName;

    @ExcelProperty(value = "状态")
    /**
     * 状态
     */
    private String status;

    @ExcelProperty(value = "排序")
    /**
     * 排序
     */
    private Integer sort;

    @ExcelProperty(value = "备注")
    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private Date createTime;

    /**
     * 更新时间
     */
    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
