package org.dromara.yy.domain.bo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyTransactionSafetyActionBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String reason;

    private String localAdapterRef;

    private Integer limit;
}
