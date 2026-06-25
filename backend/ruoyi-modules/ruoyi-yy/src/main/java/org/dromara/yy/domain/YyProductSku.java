package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_product_sku")
public class YyProductSku extends TenantEntity {
    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;
    private Long productId;
    private String specName;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private Integer workstationCost;
    private String onShow;
    private String status;
    private Integer sort;
    private String remark;
    @TableLogic
    private String delFlag;
}
