package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 小程序平台登录请求
 */
@Data
public class ClientPhotoPlatformLoginRequest {

    @NotBlank(message = "平台不能为空")
    private String platform;

    private String loginCode;

    private String phoneCode;

    private String phone;
}
