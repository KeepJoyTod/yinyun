package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyCampaignParticipationScaffoldVo {

    private String participationId;

    private String campaignId;

    private String campaignName;

    private String customerName;

    private String customerMobile;

    private String channelLabel;

    private String orderId;

    private String stage;

    private Long payableAmountCent;

    private Long finalAmountCent;

    private String nextAction;
}
