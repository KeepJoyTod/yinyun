package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyReportFinanceOverviewVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long orderAmountCent;

    private Long paidAmountCent;

    private Long refundAmountCent;

    private Long storedValueConsumeCent;

    private Long storedValueReversalCent;

    private Long withdrawPaidCent;

    private Long discountAmountCent;

    private Long waiveAmountCent;

    private Long reconciliationDiffCent;

    private Long attentionCount;

    private String boundaryNote;
}
