package org.dromara.yy.domain.bo;

import lombok.Data;

/**
 * 客户端取消订单请求。
 */
@Data
public class ClientCustomerOrderCancelBo {

    private String reason;
}
