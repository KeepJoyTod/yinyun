package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyDashboardConversionVo {

    private String date;

    private Long storeId;

    private Long bookedCount;

    private Long paidCount;

    private Long arrivedCount;

    private Long completedCount;

    private Double paidRate;

    private Double arrivedRate;

    private Double completedRate;
}
