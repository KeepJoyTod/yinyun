package org.dromara.yy.domain.bo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

@Data
@EqualsAndHashCode(callSuper = true)
public class YyRiskApprovalQueryBo extends BaseEntity {

    private Long storeId;
    private String businessType;
    private Long businessId;
    private String status;
}
