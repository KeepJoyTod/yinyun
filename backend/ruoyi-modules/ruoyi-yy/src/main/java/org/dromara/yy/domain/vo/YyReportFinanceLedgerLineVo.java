package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyReportFinanceLedgerLineVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String ledgerKey;

    private String ledgerLabel;

    private Long recordCount;

    private Long amountCent;

    private Long refundAmountCent;

    private String statusSummary;

    private String sourceTable;
}
