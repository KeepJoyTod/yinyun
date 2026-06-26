package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyReportFinanceExportPayloadVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long requestedStoreId;

    private List<Long> scopedStoreIds = new ArrayList<>();

    private String dateFrom;

    private String dateTo;

    private Long creatorUserId;
}
