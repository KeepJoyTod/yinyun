package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyCouponTemplateScaffoldVo {

    private String templateId;

    private String templateName;

    private String templateType;

    private String status;

    private String storeScopeLabel;

    private String productScopeLabel;

    private Long faceValueCent;

    private Integer discountRate;

    private String stackedWith;

    private Boolean restoreOnRefund;

    private Integer issuedCount;

    private Integer writeoffCount;

    private String expiresAt;
}
