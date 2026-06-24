package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 抖音开放平台验收用例 logid 聚合视图。
 */
@Data
public class YyChannelAcceptanceCaseVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String caseKey;

    private String label;

    private String apiName;

    private String publicUrl;

    private String endpoint;

    private String logidSource;

    private String status;

    private String statusText;

    private String requestId;

    private String success;

    private String errorMessage;

    private Date createTime;

    private String hint;
}
