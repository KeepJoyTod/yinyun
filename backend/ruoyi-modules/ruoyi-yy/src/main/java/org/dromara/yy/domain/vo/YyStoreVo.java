package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyStore;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云门店视图对象 yy_store
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyStore.class)
public class YyStoreVo implements Serializable {

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

    @ExcelProperty(value = "门店编码")
    /**
     * 门店编码
     */
    private String storeCode;

    @ExcelProperty(value = "门店名称")
    /**
     * 门店名称
     */
    private String storeName;

    @ExcelProperty(value = "营业状态")
    /**
     * 营业状态
     */
    private String status;

    @ExcelProperty(value = "联系电话")
    /**
     * 联系电话
     */
    private String phone;

    @ExcelProperty(value = "门店地址")
    /**
     * 门店地址
     */
    private String address;

    @ExcelProperty(value = "营业时间")
    /**
     * 营业时间
     */
    private String businessHours;

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
