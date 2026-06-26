package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyOrderAnalysisChannelVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String channelKey;

    private String channelLabel;

    private Long orderCount;

    private Long paidAmountCent;

    private Long refundAmountCent;

    private Long pendingCount;
}
