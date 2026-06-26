package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyOrderAnalysisRefundVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String refundStatus;

    private Long orderCount;

    private Long refundAmountCent;

    private String note;
}
