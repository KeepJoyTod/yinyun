package org.dromara.yy.domain.bo;

import lombok.Data;

/**
 * 营销优惠试算请求
 */
@Data
public class YyPromotionTrialBo {

    private String orderId;

    private String storeId;

    private String customerId;

    private String productId;

    private String productName;

    private String orderSource;

    private String customerLevel;

    private Long originalAmountCent;
}
