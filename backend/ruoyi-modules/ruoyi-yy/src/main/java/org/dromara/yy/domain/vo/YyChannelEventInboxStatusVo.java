package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 渠道事件收件箱状态摘要。
 */
@Data
public class YyChannelEventInboxStatusVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelType;

    private Long totalCount;

    private Long receivedCount;

    private Long processedCount;

    private Long failedCount;

    private Long deadCount;

    private Long retryableCount;

    private String latestEventId;

    private String latestEventType;

    private String latestExternalOrderId;

    private String latestRequestId;

    private String latestProcessStatus;

    private String latestErrorMessage;

    private Date latestEventTime;

    private Date latestProcessedTime;
}
