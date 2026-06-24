package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 渠道订单视图对象
 */
@Data
public class YyChannelOrderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelType;
    private String externalOrderId;
    private String externalStatus;
    private String customerName;
    private String customerPhone;
    private BigDecimal amount;
    private Long localOrderId;
    private String syncStatus;
    private String rawPayload;
}
