package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class YyPromotionTrialResultVo {

    private String status;

    private String appliedRuleCode;

    private Long originalAmountCent;

    private Long finalAmountCent;

    private Long discountAmountCent;

    private String conflictSource;

    private String restorePolicy;

    private List<String> blockedReasons = new ArrayList<>();

    private List<YyPromotionTrialCandidateVo> candidates = new ArrayList<>();
}
