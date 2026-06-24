package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyProduct;
import java.math.BigDecimal;

/**
 * 影约云产品业务对象 yy_product
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyProduct.class, reverseConvertGenerate = false)
public class YyProductBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    @NotBlank(message = "产品类型不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 产品类型
     */
    private String productType;

    @NotBlank(message = "产品名称不能为空", groups = { AddGroup.class, EditGroup.class })
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
}
