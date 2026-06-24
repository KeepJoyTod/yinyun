package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.Date;

/**
 * 客户可访问相册
 */
@Data
public class ClientPhotoAlbumVo {

    private String albumId;

    private String title;

    private Integer assetCount;

    private String coverAssetId;

    private String customerName;

    private String channelType;

    private String status;

    private String selectionStatus;

    private Date expireTime;
}
