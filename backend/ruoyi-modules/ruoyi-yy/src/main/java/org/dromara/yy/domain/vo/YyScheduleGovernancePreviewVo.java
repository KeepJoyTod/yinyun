package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class YyScheduleGovernancePreviewVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Integer affectedSlotCount;
    private Integer paidSlotCount;
    private Integer conflictSlotCount;
    private Boolean approvalRequired;
    private String message;
    private YyRiskApprovalVo approval;
    private List<YyBookingSlotInventoryVo> slots;
}
