package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyProductOrderReadinessVo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long productId;
    private Boolean ready;
    private String status;
    private String reason;
}
