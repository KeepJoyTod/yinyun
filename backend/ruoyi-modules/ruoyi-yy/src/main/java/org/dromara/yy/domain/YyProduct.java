package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;
import java.math.BigDecimal;

/**
 * 影约云产品对象 yy_product
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_product")
public class YyProduct extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 产品类型
     */
    private String productType;

    /**
     * 产品名称
     */
    private String productName;

    /**
     * 销售价
     */
    private BigDecimal price;

    /**
     * 服务时长
     */
    private Integer durationMinutes;

    /**
     * 选片单价
     */
    private BigDecimal selectionPrice;

    /**
     * 入册产品
     */
    private String albumProductName;

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

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
