package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyDashboardOrderStatusStatVo {

    private String status;

    private String label;

    private Long count;

    private Long amountCent;
}
