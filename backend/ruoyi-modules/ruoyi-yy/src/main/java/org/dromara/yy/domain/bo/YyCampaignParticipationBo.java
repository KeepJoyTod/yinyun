package org.dromara.yy.domain.bo;

import lombok.Data;

@Data
public class YyCampaignParticipationBo {

    private Long campaignId;

    private String customerName;

    private Long orderId;

    private String participationStatus;

    private String conversionStatus;

    private String refundStatus;
}
