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
@TableName("yy_member_card_instance")
public class YyMemberCardInstance extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;
    private Long customerId;
    private Long orderId;
    private String cardName;
    private String cardType;
    private String status;
    private BigDecimal totalQuota;
    private BigDecimal usedQuota;
    private BigDecimal remainingQuota;
    private BigDecimal balanceAmount;
    private Date effectiveFrom;
    private Date effectiveTo;
    private String remark;

    @TableLogic
    private String delFlag;
}
