package org.dromara.yy.domain.vo;

import lombok.Data;

/**
 * 客户相册照片
 */
@Data
public class ClientPhotoAssetVo {

    private String assetId;

    private String fileName;

    private Integer sort;

    private String selected;
}
