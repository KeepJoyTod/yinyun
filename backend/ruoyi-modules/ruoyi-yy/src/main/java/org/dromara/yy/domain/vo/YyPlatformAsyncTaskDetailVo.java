package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyPlatformAsyncTaskDetailVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String taskType;

    private String taskName;

    private String queueName;

    private String latestRunStatus;

    private String retentionPolicy;

    private String status;

    private List<YyPlatformEvidenceVo> evidence = new ArrayList<>();

    private List<YyPlatformAsyncTaskRunVo> runs = new ArrayList<>();
}
