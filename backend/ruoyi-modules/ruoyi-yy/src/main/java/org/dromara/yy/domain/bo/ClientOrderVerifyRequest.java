package org.dromara.yy.domain.bo;

import lombok.Data;

/**
 * 客户订单访问校验请求。
 */
@Data
public class ClientOrderVerifyRequest {

    private Long storeId;

    private String phone;

    private String phoneLast4;
}
