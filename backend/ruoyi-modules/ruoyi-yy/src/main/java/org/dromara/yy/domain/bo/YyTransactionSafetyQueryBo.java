package org.dromara.yy.domain.bo;

import lombok.Data;

@Data
public class YyTransactionSafetyQueryBo {

    private Long storeId;

    private Long customerId;

    private Long orderId;

    private String status;

    private Integer limit;
}
