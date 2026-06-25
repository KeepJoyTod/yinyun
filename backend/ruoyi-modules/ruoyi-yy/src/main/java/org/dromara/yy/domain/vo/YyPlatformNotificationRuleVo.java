package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class YyPlatformNotificationRuleVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String sceneCode;

    private String sceneName;

    private List<String> channelTypes = new ArrayList<>();

    private String enabled;

    private String status;

    private String latestSendStatus;

    private Date latestSentTime;

    private List<YyPlatformEvidenceVo> evidence = new ArrayList<>();

    private List<YyPlatformActionHintVo> nextActions = new ArrayList<>();
}
