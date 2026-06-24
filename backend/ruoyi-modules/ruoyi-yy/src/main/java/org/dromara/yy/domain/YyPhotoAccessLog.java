package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.encrypt.annotation.EncryptField;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 客户取片访问日志 yy_photo_access_log
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_photo_access_log")
public class YyPhotoAccessLog extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long storeId;

    private Long albumId;

    private Long assetId;

    @EncryptField
    private String customerPhone;

    private String platform;

    private String action;

    private String ip;

    private String success;

    private String remark;

    @TableLogic
    private String delFlag;
}
