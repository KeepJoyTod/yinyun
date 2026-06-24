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
@TableName("yy_coupon_template")
public class YyCouponTemplate extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private String templateCode;
    private String templateName;
    private String templateType;
    private Long storeId;
    private String storeScope;
    private String productScope;
    private Long faceValueCent;
    private Integer discountRate;
    private String stackedRule;
    private String restoreOnRefund;
    private String status;

    @TableLogic
    private String delFlag;
}
