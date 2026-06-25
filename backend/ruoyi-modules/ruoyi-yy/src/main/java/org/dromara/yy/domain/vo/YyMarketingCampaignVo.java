package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class YyMarketingCampaignVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long campaignId;
    private String campaignName;
    private String campaignType;
    private String status;
    private List<Long> storeIds;
    private List<Long> productIds;
    private String storeScopeLabel;
    private String productScopeLabel;
    private String startAt;
    private String endAt;
    private String timeRangeLabel;
    private Integer participantCount;
    private Integer orderCount;
    private Long paidAmountCent;
    private String ruleSummary;
}
