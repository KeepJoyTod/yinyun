package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 褰辩害浜戝簳鐗囧璞?yy_photo_asset
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_photo_asset")
public class YyPhotoAsset extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long storeId;

    private Long albumId;

    private String fileName;

    private String fileUrl;

    private String objectKey;

    private String thumbnailObjectKey;

    private Integer sort;

    private String isSelected;

    private String visible;

    private String assetType;

    private Integer rating;

    private Long fileSizeBytes;

    private String remark;

    @TableLogic
    private String delFlag;
}
