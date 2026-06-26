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
@TableName("yy_stored_value_consume_order")
public class YyStoredValueConsumeOrder extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;

    private Long customerId;

    private Long orderId;

    private String consumeNo;

    private BigDecimal consumeAmount;

    private BigDecimal balanceSnapshot;

    private String status;

    private String reversalStatus;

    private String executionMode;

    private Date confirmedTime;

    private String remark;

    @TableLogic
    private String delFlag;
}
