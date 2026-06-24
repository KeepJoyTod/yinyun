package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 客户端会员登录请求。
 */
@Data
public class ClientCustomerLoginBo {

    @NotBlank(message = "登录 code 不能为空")
    private String code;
}
