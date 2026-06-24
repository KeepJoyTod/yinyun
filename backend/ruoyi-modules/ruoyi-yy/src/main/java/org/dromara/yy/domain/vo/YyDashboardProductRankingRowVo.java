package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyDashboardProductRankingRowVo {

    private Integer rank;

    private String productName;

    private Long orderCount;

    private Long amountCent;
}
