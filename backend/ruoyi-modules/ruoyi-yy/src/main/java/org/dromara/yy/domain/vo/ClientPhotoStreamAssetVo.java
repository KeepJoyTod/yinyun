package org.dromara.yy.domain.vo;

import lombok.Data;

/**
 * 客户照片流式访问元数据。
 */
@Data
public class ClientPhotoStreamAssetVo {

    private String assetId;

    private String fileName;

    private String contentType;
}
