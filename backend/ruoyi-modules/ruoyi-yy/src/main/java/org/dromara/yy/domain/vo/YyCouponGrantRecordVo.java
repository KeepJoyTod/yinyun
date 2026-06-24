package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyCouponGrantRecordVo {

    private String grantId;

    private String templateId;

    private String templateName;

    private String targetCustomer;

    private String targetMobile;

    private String grantSource;

    private String status;
}
