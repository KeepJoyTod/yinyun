package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.encrypt.annotation.EncryptField;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.util.Date;

/**
 * 客户取片验证码 yy_photo_verify_code
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_photo_verify_code")
public class YyPhotoVerifyCode extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    @EncryptField
    private String phone;

    @EncryptField
    private String verifyCode;

    private String scene;

    private String platform;

    private Date expireTime;

    private Date usedTime;

    private String status;

    private String ip;

    private String remark;

    @TableLogic
    private String delFlag;
}
