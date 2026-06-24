package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class YyCampaignScaffoldVo {

    private String status;

    private String boundary;

    private List<YyCampaignScaffoldItemVo> campaigns = new ArrayList<>();

    private List<YyMarketingChannelSummaryVo> sources = new ArrayList<>();
}
