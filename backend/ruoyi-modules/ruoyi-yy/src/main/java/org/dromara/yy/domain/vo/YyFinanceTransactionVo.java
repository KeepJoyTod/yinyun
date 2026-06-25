package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyFinanceTransactionVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String transactionId;

    private String transactionType;

    private String transactionItem;

    private Long amountCent;

    private Long balanceAfterCent;

    private String occurredAt;

    private String status;
}
