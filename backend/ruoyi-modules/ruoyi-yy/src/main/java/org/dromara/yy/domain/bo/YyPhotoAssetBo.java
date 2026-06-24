package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyPhotoAsset;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

/**
 * 褰辩害浜戝簳鐗囦笟鍔″璞?yy_photo_asset
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyPhotoAsset.class, reverseConvertGenerate = false)
public class YyPhotoAssetBo extends BaseEntity {

    @NotNull(message = "涓婚敭涓嶈兘涓虹┖", groups = { EditGroup.class })
    private Long id;

    @NotNull(message = "闂ㄥ簵ID涓嶈兘涓虹┖", groups = { AddGroup.class, EditGroup.class })
    private Long storeId;

    @NotNull(message = "鐩稿唽ID涓嶈兘涓虹┖", groups = { AddGroup.class, EditGroup.class })
    private Long albumId;

    private Long orderId;

    private Long productId;

    @NotBlank(message = "鏂囦欢鍚嶄笉鑳戒负绌?", groups = { AddGroup.class, EditGroup.class })
    private String fileName;

    private String fileUrl;

    @NotBlank(message = "OSS瀵硅薄Key涓嶈兘涓虹┖", groups = { AddGroup.class, EditGroup.class })
    private String objectKey;

    private String thumbnailObjectKey;

    private Integer sort;

    private String isSelected;

    private String visible;

    private String assetType;

    private Integer rating;

    private Long fileSizeBytes;

    private String keyword;

    private Long uploaderId;

    private String uploaderKeyword;

    private String tagIds;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date beginUploadTime;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date endUploadTime;

    private String remark;
}
