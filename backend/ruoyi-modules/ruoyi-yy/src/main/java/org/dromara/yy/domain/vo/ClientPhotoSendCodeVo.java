package org.dromara.yy.domain.vo;

import lombok.Data;

/**
 * 客户取片验证码发送结果
 */
@Data
public class ClientPhotoSendCodeVo {

    private Boolean sent;

    private Long expiresIn;

    private String message;
}
