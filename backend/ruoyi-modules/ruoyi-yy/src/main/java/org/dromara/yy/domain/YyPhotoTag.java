package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 璧勬簮鏍囩瀵硅薄 yy_photo_tag
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_photo_tag")
public class YyPhotoTag extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long storeId;

    private String tagName;

    @TableLogic
    private String delFlag;

    private String remark;
}
