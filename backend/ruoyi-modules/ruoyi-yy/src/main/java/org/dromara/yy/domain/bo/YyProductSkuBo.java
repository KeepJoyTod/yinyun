package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyProductSku;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyProductSku.class, reverseConvertGenerate = false)
public class YyProductSkuBo extends BaseEntity {
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;
    @NotNull(message = "产品ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long productId;
    @NotBlank(message = "规格名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String specName;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private Integer workstationCost;
    private String onShow;
    private String status;
    private Integer sort;
    private String remark;
}
