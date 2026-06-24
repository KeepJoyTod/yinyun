package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyPromotionTrialCandidateVo {

    private String candidateId;

    private String candidateType;

    private String title;

    private Boolean applicable;

    private Integer priority;

    private Long discountAmountCent;

    private Long finalAmountCent;

    private String conflictSource;

    private String reason;
}
