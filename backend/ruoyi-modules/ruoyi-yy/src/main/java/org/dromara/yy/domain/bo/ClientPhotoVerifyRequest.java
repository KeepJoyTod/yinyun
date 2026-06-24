package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 客户取片登录请求
 */
@Data
public class ClientPhotoVerifyRequest {

    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "验证码或取片码不能为空")
    private String code;

    private String platform;
}
