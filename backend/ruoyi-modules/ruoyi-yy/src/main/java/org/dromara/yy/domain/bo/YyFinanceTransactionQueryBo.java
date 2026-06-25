package org.dromara.yy.domain.bo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyFinanceTransactionQueryBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String accountId;

    private String transactionType;

    private String beginTime;

    private String endTime;
}
