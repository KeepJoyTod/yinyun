package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.List;

@Data
public class YyDashboardProductRankingVo {

    private List<YyDashboardProductRankingRowVo> byOrderCount;

    private List<YyDashboardProductRankingRowVo> byAmount;
}
