package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.Date;

/**
 * 客户照片短期签名链接
 */
@Data
public class ClientPhotoSignedUrlVo {

    private String assetId;

    private String url;

    private Long expiresIn;

    private Date expiresAt;

    private String fileName;

    private String contentType;
}
