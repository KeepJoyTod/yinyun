package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyOrderAnalysisScaffoldVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private YyOrderAnalysisOverviewVo overview;

    private List<YyOrderAnalysisFunnelStageVo> funnel = new ArrayList<>();

    private List<YyOrderAnalysisChannelVo> channels = new ArrayList<>();

    private List<YyOrderAnalysisRefundVo> refunds = new ArrayList<>();
}
