package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyPlatformAsyncTaskRunVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String taskId;

    private String status;

    private String runStatus;

    private String createdTime;

    private String startedTime;

    private String finishedTime;

    private String expireTime;

    private String downloadUrl;

    private String fileName;

    private String contentType;

    private String errorMessage;

    private String auditNote;
}
