package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class YyMarketingCouponTemplateVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long templateId;
    private String templateName;
    private String templateType;
    private String status;
    private List<Long> storeIds;
    private List<Long> productIds;
    private String storeScopeLabel;
    private String productScopeLabel;
    private Long faceValueCent;
    private Long minSpendCent;
    private String stackPolicy;
    private Boolean restoreOnRefund;
    private Integer issuedCount;
    private Integer writeoffCount;
    private String startAt;
    private String endAt;
}
