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
@TableName("yy_composite_payment_order")
public class YyCompositePaymentOrder extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;

    private Long customerId;

    private Long orderId;

    private String compositeNo;

    private BigDecimal totalAmount;

    private BigDecimal externalAmount;

    private BigDecimal storedValueAmount;

    private BigDecimal cashAmount;

    private BigDecimal discountAmount;

    private BigDecimal waiveAmount;

    private String status;

    private String settleStatus;

    private String executionMode;

    private String remark;

    @TableLogic
    private String delFlag;
}
