package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 工作台确认收款请求。
 */
@Data
public class YyOrderPaymentConfirmBo {

    @NotNull(message = "支付金额不能为空")
    private Long amountCent;

    private String remark;
}
