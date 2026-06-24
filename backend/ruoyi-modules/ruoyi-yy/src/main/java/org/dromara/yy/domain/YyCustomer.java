package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 影约云客户对象 yy_customer
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_customer")
public class YyCustomer extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private String customerName;

    private String mobile;

    private String gender;

    private Date birthday;

    private String source;

    private String memberLevel;

    private Integer totalOrderCount;

    private BigDecimal totalSpend;

    private Date lastOrderTime;

    private String tags;

    private String remark;

    @TableLogic
    private String delFlag;
}
