package org.dromara.yy.domain.vo;

import lombok.Data;

/**
 * 首页经营概况财务聚合。
 */
@Data
public class YyDashboardFinanceVo {

    private String date;

    private Long storeId;

    private Long actualIncomeCent;

    private Long expectedIncomeCent;

    private Long productAmountCent;

    private Long discountAmountCent;

    private Long orderAmountCent;

    private Long refundAmountCent;

    private Long orderCount;

    private Long pendingOrderCount;

    private Long servingOrderCount;

    private Long completedOrderCount;

    private Long canceledOrderCount;
}
