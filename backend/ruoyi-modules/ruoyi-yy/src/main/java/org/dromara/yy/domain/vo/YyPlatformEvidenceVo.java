package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class YyPlatformEvidenceVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String sourceType;

    private String sourceKey;

    private String status;

    private String message;

    private String requestId;

    private Date eventTime;
}
