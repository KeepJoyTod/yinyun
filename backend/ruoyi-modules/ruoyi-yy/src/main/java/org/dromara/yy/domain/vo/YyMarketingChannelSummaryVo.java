package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyMarketingChannelSummaryVo {

    private String sourceLabel;

    private Integer orderCount;

    private Integer paidOrderCount;

    private Integer pendingCount;

    private Long paidAmountCent;
}
