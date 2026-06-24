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
@TableName("yy_member_account")
public class YyMemberAccount extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId("id")
    private Long id;

    private Long storeId;
    private Long customerId;
    private String memberNo;
    private String currentLevel;
    private Integer pointsBalance;
    private Integer growthValue;
    private BigDecimal balanceAmount;
    private Integer pendingRechargeCount;
    private Date lastTradeTime;
    private String status;
    private String remark;

    @TableLogic
    private String delFlag;
}
