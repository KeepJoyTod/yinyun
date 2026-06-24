package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class YyMarketingDashboardVo {

    private String status;

    private String boundary;

    private List<YyMarketingDashboardMetricVo> metrics = new ArrayList<>();

    private List<YyMarketingChannelSummaryVo> channels = new ArrayList<>();
}
