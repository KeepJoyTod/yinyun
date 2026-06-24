package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 客户取片验证码发送请求
 */
@Data
public class ClientPhotoSendCodeRequest {

    @NotBlank(message = "手机号不能为空")
    private String phone;

    private String platform;
}
