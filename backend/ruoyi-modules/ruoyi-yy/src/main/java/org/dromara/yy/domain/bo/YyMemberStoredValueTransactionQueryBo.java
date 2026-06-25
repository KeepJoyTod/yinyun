package org.dromara.yy.domain.bo;

import lombok.Data;

@Data
public class YyMemberStoredValueTransactionQueryBo {

    private Long customerId;

    private Long storeId;

    private String transactionType;

    private String transactionStatus;

    private Integer limit;
}
