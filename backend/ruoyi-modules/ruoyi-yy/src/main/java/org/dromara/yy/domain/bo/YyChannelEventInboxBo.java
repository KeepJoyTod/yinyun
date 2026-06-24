package org.dromara.yy.domain.bo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

/**
 * 渠道事件收件箱查询对象。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class YyChannelEventInboxBo extends BaseEntity {

    private Long id;

    private String channelType;

    private String eventType;

    private String eventId;

    private String externalOrderId;

    private String requestId;

    private String signatureValid;

    private String processStatus;
}
