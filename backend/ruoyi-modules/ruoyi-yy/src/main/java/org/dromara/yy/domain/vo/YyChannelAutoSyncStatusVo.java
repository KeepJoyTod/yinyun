package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 渠道自动同步状态摘要。
 */
@Data
public class YyChannelAutoSyncStatusVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelType;
    private String apiName;
    private String syncStatus;
    private Boolean success;
    private String lastLogId;
    private String message;
    private String summary;
    private Date lastSyncTime;
}
