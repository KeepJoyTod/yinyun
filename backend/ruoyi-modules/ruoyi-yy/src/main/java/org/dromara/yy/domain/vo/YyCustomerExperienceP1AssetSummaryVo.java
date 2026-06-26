package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyCustomerExperienceP1AssetSummaryVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Integer cardCount;

    private Integer benefitCount;

    private Integer couponCount;

    private Integer points;

    private Integer growthValue;

    private String balanceLabel;

    private String status;

    private String emptyReason;
}
