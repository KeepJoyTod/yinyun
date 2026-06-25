package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_product_category")
public class YyProductCategory extends TenantEntity {
    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;
    private Long storeId;
    private String categoryCode;
    private String categoryName;
    private Long parentId;
    private Integer sort;
    private String status;
    private String remark;
    @TableLogic
    private String delFlag;
}
