package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.util.Date;

/**
 * 渠道事件收件箱 yy_channel_event_inbox。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_channel_event_inbox")
public class YyChannelEventInbox extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private String channelType;

    private String eventType;

    private String eventId;

    private String externalOrderId;

    private String requestId;

    private String signatureValid;

    private String processStatus;

    private Integer retryCount;

    private Date nextRetryTime;

    private String rawPayload;

    private String errorMessage;

    private Date processedTime;

    private String remark;

    @TableLogic
    private String delFlag;
}
