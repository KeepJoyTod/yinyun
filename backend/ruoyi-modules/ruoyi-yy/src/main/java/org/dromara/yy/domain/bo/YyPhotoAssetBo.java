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

/**
 * 影约云底片业务对象 yy_photo_asset
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyPhotoAsset.class, reverseConvertGenerate = false)
public class YyPhotoAssetBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    @NotNull(message = "门店ID不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 门店ID
     */
    private Long storeId;

    @NotNull(message = "相册ID不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 相册ID
     */
    private Long albumId;

    @NotBlank(message = "文件名不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件地址
     */
    private String fileUrl;

    /**
     * OSS对象Key
     */
    @NotBlank(message = "OSS对象Key不能为空", groups = { AddGroup.class, EditGroup.class })
    private String objectKey;

    /**
     * 缩略图OSS对象Key
     */
    private String thumbnailObjectKey;

    /**
     * 排序
     */
    private Integer sort;

    /**
     * 是否已选
     */
    private String isSelected;

    /**
     * 客户可见
     */
    private String visible;

    /**
     * 备注
     */
    private String remark;
}
