package org.dromara.yy.domain.bo;

import lombok.Data;

@Data
public class YyCardBatchOrderQueryBo {

    private Long storeId;

    private String status;

    private String keyword;

    private Integer limit;
}
