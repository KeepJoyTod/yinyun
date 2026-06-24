package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 璧勬簮鏍囩鍏宠仈瀵硅薄 yy_photo_asset_tag
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_photo_asset_tag")
public class YyPhotoAssetTag extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long assetId;

    private Long tagId;

    private Long storeId;

    @TableLogic
    private String delFlag;

    private String remark;
}
