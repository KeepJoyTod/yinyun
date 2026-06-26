package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 订单属性模板对象 yy_order_attribute_template
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_order_attribute_template")
public class YyOrderAttributeTemplate extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long storeId;

    private String fieldCode;

    private String fieldLabel;

    private String fieldType;

    private String required;

    private String optionsJson;

    private Integer sort;

    private String status;

    private String remark;

    @TableLogic
    private String delFlag;
}
