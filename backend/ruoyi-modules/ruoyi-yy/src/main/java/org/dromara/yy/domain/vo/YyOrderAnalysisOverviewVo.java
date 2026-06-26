package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyOrderAnalysisOverviewVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long orderedCount;

    private Long paidOrderCount;

    private Long paidAmountCent;

    private Long refundOrderCount;

    private Long refundAmountCent;

    private Long pendingAttentionCount;

    private String boundaryNote;
}
