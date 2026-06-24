package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 渠道订单同步结果。
 */
@Data
public class YyChannelSyncResultVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelType;
    private String syncStatus;
    private Integer total = 0;
    private Integer created = 0;
    private Integer updated = 0;
    private Integer failed = 0;
    private String lastLogId;
    private String message;
}
