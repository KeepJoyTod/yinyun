package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyDashboardTrendStatVo {

    private String day;

    private Long bookedCount;

    private Long arrivedCount;

    private Long amountCent;
}
