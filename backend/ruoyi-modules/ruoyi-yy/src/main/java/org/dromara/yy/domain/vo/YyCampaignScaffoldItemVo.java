package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyCampaignScaffoldItemVo {

    private String campaignId;

    private String campaignName;

    private String campaignType;

    private String status;

    private String storeScopeLabel;

    private String productScopeLabel;

    private String timeRangeLabel;

    private Integer participantCount;

    private Integer orderCount;

    private Long paidAmountCent;
}
