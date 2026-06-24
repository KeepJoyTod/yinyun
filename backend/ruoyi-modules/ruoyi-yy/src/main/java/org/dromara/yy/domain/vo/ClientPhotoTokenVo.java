package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.Date;

/**
 * 客户取片登录结果
 */
@Data
public class ClientPhotoTokenVo {

    private String clientToken;

    private Long expiresIn;

    private Date expiresAt;

    private String phoneMasked;

    private String platform;
}
