package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyReportFinanceExportTaskVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String taskId;

    private String taskType;

    private String status;

    private Long storeId;

    private String dateFrom;

    private String dateTo;

    private String createdTime;

    private String finishedTime;

    private String expireTime;

    private String downloadUrl;

    private String auditNote;
}
