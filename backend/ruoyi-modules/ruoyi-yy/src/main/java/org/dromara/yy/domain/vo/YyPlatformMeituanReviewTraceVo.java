package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class YyPlatformMeituanReviewTraceVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String pluginCode;

    private String pluginName;

    private String reviewChannel;

    private String traceStatus;

    private Date latestSyncTime;

    private String status;

    private List<YyPlatformEvidenceVo> evidence = new ArrayList<>();

    private List<YyPlatformActionHintVo> nextActions = new ArrayList<>();
}
