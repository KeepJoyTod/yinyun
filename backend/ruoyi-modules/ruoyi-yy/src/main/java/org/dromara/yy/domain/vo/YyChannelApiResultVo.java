package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 渠道开放接口联调结果
 */
@Data
public class YyChannelApiResultVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelType;
    private String apiName;
    private String endpoint;
    private Boolean success;
    private String message;
    private String rawResponse;
    private String requestSummary;
    private String logId;
    private String errorCode;
    private List<String> missingConfig = new ArrayList<>();
}
