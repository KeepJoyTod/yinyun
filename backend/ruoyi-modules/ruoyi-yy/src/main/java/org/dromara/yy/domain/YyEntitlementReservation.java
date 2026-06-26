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

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_entitlement_reservation")
public class YyEntitlementReservation extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;

    private Long customerId;

    private Long orderId;

    private String reservationNo;

    private String reservationType;

    private String targetType;

    private String targetSnapshot;

    private BigDecimal quantity;

    private BigDecimal reservationAmount;

    private String status;

    private String idempotencyKey;

    private Date expireTime;

    private Date releasedTime;

    private String executionMode;

    private String remark;

    @TableLogic
    private String delFlag;
}
