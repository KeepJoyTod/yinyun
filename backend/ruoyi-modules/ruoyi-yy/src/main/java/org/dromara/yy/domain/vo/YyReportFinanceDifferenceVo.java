package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyReportFinanceDifferenceVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String differenceKey;

    private String differenceLabel;

    private Long amountCent;

    private Long recordCount;

    private String severity;

    private String note;
}
