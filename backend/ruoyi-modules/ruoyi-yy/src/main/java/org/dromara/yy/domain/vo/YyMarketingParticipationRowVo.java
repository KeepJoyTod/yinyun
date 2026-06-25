package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyMarketingParticipationRowVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long participationId;
    private Long campaignId;
    private String campaignName;
    private Long customerId;
    private String customerName;
    private Long orderId;
    private String participationStatus;
    private String conversionStatus;
    private String refundStatus;
    private String invalidReason;
    private String participatedAt;
    private Long payableAmountCent;
    private Long finalAmountCent;
}
