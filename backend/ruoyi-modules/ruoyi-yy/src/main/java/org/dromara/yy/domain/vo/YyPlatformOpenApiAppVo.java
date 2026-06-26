package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyPlatformOpenApiAppVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String appCode;

    private String appName;

    private String authMode;

    private String rateLimitLabel;

    private String sandboxBaseUrl;

    private String status;

    private List<YyPlatformEvidenceVo> evidence = new ArrayList<>();

    private List<YyPlatformActionHintVo> nextActions = new ArrayList<>();
}
