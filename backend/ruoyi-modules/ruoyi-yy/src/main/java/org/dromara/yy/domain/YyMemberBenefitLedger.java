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
@TableName("yy_member_benefit_ledger")
public class YyMemberBenefitLedger extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;
    private Long customerId;
    private String benefitName;
    private String benefitType;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal usedAmount;
    private BigDecimal remainingAmount;
    private String sourceType;
    private Long sourceId;
    private Date expireTime;
    private String remark;

    @TableLogic
    private String delFlag;
}
