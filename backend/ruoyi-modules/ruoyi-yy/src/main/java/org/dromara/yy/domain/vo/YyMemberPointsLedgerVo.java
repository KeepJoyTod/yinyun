package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyMemberPointsLedgerVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long customerId;
    private String changeType;
    private Integer changeAmount;
    private Integer balanceAfter;
    private String sourceType;
    private Long sourceId;
    private String happenedAt;
    private String remark;
}
