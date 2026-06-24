package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 客户相册详情
 */
@Data
public class ClientPhotoAlbumDetailVo {

    private String albumId;

    private String title;

    private Date expireTime;

    private String selectionStatus;

    private Integer selectedCount;

    private Date lastSelectionSubmitTime;

    private List<ClientPhotoAssetVo> assets = new ArrayList<>();
}
