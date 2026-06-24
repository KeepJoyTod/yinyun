package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 相册工作流动作响应。
 */
@Data
public class YyPhotoAlbumActionResultVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long albumId;

    private String action;

    private String status;

    private String selectionStatus;

    /**
     * SUCCESS / FALLBACK_LOGGED
     */
    private String auditStatus;

    private Boolean fallback;

    private String notificationChannel;

    private String notificationSendStatus;

    private String requestId;

    private String message;
}
