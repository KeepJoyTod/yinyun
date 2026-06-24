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
@TableName("yy_member_balance_ledger")
public class YyMemberBalanceLedger extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;
    private Long customerId;
    private String changeType;
    private BigDecimal changeAmount;
    private BigDecimal balanceAfter;
    private String sourceType;
    private Long sourceId;
    private Date happenedAt;
    private String remark;

    @TableLogic
    private String delFlag;
}
