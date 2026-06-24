package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 渠道 webhook 处理结果
 */
@Data
public class YyChannelWebhookResultVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelType;
    private String eventName;
    private String eventStatus;
    private String externalOrderId;
    private String localStatus;
    private String requiredPermission;
    private Boolean processed;
    private String message;
    private String rawPayload;
}
