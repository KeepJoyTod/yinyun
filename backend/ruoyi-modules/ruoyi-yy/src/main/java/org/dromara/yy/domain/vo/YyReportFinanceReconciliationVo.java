package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyReportFinanceReconciliationVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private YyReportFinanceOverviewVo overview;

    private List<YyReportFinanceLedgerLineVo> orderLedgers = new ArrayList<>();

    private List<YyReportFinanceLedgerLineVo> fundLedgers = new ArrayList<>();

    private List<YyReportFinanceDifferenceVo> differences = new ArrayList<>();

    private List<YyReportFinanceExportTaskVo> exportTasks = new ArrayList<>();
}
