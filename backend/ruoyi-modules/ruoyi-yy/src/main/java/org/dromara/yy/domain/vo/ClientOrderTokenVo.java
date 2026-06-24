package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.Date;
import java.util.List;

/**
 * 客户订单访问令牌。
 */
@Data
public class ClientOrderTokenVo {

    private String clientOrderToken;

    private Long expiresIn;

    private Date expiresAt;

    private String phoneMasked;

    private List<ClientOrderLinkVo> orders;
}
