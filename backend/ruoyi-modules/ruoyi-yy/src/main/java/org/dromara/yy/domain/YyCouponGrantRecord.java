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
@TableName("yy_coupon_grant_record")
public class YyCouponGrantRecord extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long templateId;
    private Long customerId;
    private String grantBatchCode;
    private String grantSource;
    private String status;
    private String remark;

    @TableLogic
    private String delFlag;
}
