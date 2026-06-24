package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;

/**
 * 影约云底片对象 yy_photo_asset
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_photo_asset")
public class YyPhotoAsset extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 相册ID
     */
    private Long albumId;

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

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
