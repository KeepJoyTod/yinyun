package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyOrderAnalysisFunnelStageVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String stageKey;

    private String stageLabel;

    private Long orderCount;

    private Long amountCent;

    private Double conversionRate;
}
