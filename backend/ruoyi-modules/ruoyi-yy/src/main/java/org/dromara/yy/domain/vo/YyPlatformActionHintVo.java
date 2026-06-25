package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyPlatformActionHintVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String actionKey;

    private String label;

    private Boolean enabled;

    private String reason;
}
