package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class YyMemberRechargeCreateBo {

    private Long storeId;

    @NotNull(message = "充值金额不能为空")
    @DecimalMin(value = "0.01", message = "充值金额必须大于0")
    private BigDecimal rechargeAmount;

    @DecimalMin(value = "0.00", message = "赠送金额不能小于0")
    private BigDecimal giftAmount;

    private String channelType;

    private String externalTradeNo;

    private String remark;
}
