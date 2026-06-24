package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 渠道同步健康摘要。
 */
@Data
public class YyChannelSyncHealthVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelType;

    private String healthStatus;

    private String message;

    private Long failedEventCount;

    private Long retryableEventCount;

    private Long deadEventCount;

    private String latestLogId;

    private Date latestWebhookTime;

    private Date latestAutoSyncTime;

    private YyChannelEventInboxStatusVo eventInboxStatus;

    private YyChannelAutoSyncStatusVo autoSyncStatus;
}
