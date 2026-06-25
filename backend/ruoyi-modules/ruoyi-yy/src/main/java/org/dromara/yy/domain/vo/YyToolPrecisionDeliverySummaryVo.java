package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyToolPrecisionDeliverySummaryVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Integer audienceCount;

    private Integer activeTaskCount;

    private Integer deliveredCount;

    private String status;
}
