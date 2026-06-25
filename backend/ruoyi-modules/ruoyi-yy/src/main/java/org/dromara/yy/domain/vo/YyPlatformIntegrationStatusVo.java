package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class YyPlatformIntegrationStatusVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelType;

    private String channelName;

    private String accountName;

    private String appId;

    private String webhookUrl;

    private String spiBaseUrl;

    private String status;

    private String latestLogId;

    private Date latestSyncTime;

    private List<YyPlatformEvidenceVo> evidence = new ArrayList<>();

    private List<YyPlatformActionHintVo> nextActions = new ArrayList<>();
}
